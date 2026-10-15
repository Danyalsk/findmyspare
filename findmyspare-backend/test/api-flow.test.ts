// End-to-end API journey against a running dev server with seeded data:
//   DEMO_LOGIN=1 bun run dev   (in another terminal)
//   bun test --env-file=.env test/api-flow.test.ts
// Covers: marketplace checkout + mock payment + fulfilment + review/fit,
// garage job card + consent + quotes + estimate approval + invoice + verify + pay,
// passport + share link, admin metrics.
import { beforeAll, describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { invoices } from "../src/db/schema";

const BASE = process.env.API_URL || "http://localhost:8000";
const ORIGIN = "http://localhost:3000";

async function login(email: string): Promise<string> {
  const h = { "content-type": "application/json", origin: ORIGIN };
  await fetch(`${BASE}/api/auth/email-otp/send-verification-otp`, { method: "POST", headers: h, body: JSON.stringify({ email, type: "sign-in" }) });
  const r = await fetch(`${BASE}/api/auth/sign-in/email-otp`, { method: "POST", headers: h, body: JSON.stringify({ email, otp: "123456" }) });
  const tok = r.headers.get("set-auth-token") ?? (await r.json()).token;
  if (!tok) throw new Error(`login failed for ${email}: ${r.status}`);
  return tok;
}

function client(token?: string) {
  return async <T = any>(method: string, path: string, body?: unknown): Promise<{ status: number; data: T }> => {
    const r = await fetch(`${BASE}${path}`, {
      method,
      headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await r.text();
    return { status: r.status, data: text ? JSON.parse(text) : null };
  };
}

let owner: ReturnType<typeof client>, garage: ReturnType<typeof client>, raza: ReturnType<typeof client>, admin: ReturnType<typeof client>;
const anon = client();
const REG = `MH14ZZ${String(Date.now()).slice(-4)}`; // fresh plate per run

beforeAll(async () => {
  const health = await fetch(`${BASE}/health`).then((r) => r.ok).catch(() => false);
  if (!health) throw new Error(`API not reachable at ${BASE}. Start it with DEMO_LOGIN=1 bun run dev`);
  [owner, garage, raza, admin] = (await Promise.all(["buyer1@findmyspare.test", "garage@findmyspare.test", "raza@findmyspare.test", "admin@findmyspare.test"].map(login))).map(client);
});

describe("marketplace: browse → multi-seller checkout → pay → deliver → review", () => {
  let checkoutId = "", orderIds: string[] = [];

  test("fitment filter returns parts for a Swift, with ratings", async () => {
    const r = await anon("GET", `/products?make=${encodeURIComponent("Maruti Suzuki")}&model=Swift&limit=50`);
    expect(r.status).toBe(200);
    expect(r.data.products.length).toBeGreaterThan(5);
    expect(r.data.products.every((p: any) => p.compatibleVehicles.some((v: any) => v.model === "Swift") || p.fitConfirmations > 0)).toBe(true);
    const bosch = r.data.products.find((p: any) => p.partNumber === "0986AB1234");
    expect(Number(bosch.rating)).toBeGreaterThan(0);
  });

  test("cart from two sellers is split with per-seller delivery fee", async () => {
    const byPart = async (pn: string) => (await anon("GET", `/products?search=${pn}`)).data.products.find((p: any) => p.partNumber === pn);
    const a = await byPart("F002H23415"); // raza ₹245 → below free-delivery
    const b = await byPart("CUK1919"); // ayman ₹610
    const items = [{ productId: a.id, quantity: 2 }, { productId: b.id, quantity: 1 }];
    const prev = await owner("POST", "/checkout/preview", { items });
    expect(prev.status).toBe(200);
    expect(prev.data.sellers).toHaveLength(2);
    expect(prev.data.deliveryTotal).toBe("98.00");
    const c = await owner("POST", "/checkout", { items });
    expect(c.status).toBe(201);
    checkoutId = c.data.checkoutId;
  });

  test("seller cannot see the order before payment", async () => {
    const r = await raza("GET", "/orders?limit=50");
    const d = await owner("GET", `/checkout/${checkoutId}`);
    orderIds = d.data.orders.map((o: any) => o.id);
    expect(r.data.orders.some((o: any) => orderIds.includes(o.id))).toBe(false);
  });

  test("failed then successful mock payment marks orders paid", async () => {
    const p1 = await owner("POST", "/payments", { checkoutId });
    const f = await owner("POST", `/payments/${p1.data.payment.id}/complete`, { method: "card", outcome: "failure" });
    expect(f.data.payment.status).toBe("failed");
    const p2 = await owner("POST", "/payments", { checkoutId });
    const s = await owner("POST", `/payments/${p2.data.payment.id}/complete`, { method: "upi", outcome: "success" });
    expect(s.data.payment.status).toBe("succeeded");
    const d = await owner("GET", `/checkout/${checkoutId}`);
    expect(d.data.orders.every((o: any) => o.paymentStatus === "paid")).toBe(true);
    expect((await owner("POST", "/payments", { checkoutId })).status).toBe(409);
  });

  test("seller fulfils; buyer reviews and confirms fit", async () => {
    const mine = (await raza("GET", "/orders?limit=50")).data.orders.find((o: any) => orderIds.includes(o.id));
    expect(mine).toBeTruthy();
    for (const status of ["confirmed", "shipped", "in_transit", "delivered"]) {
      const r = await raza("PATCH", `/orders/${mine.id}/status`, { status });
      expect(r.status).toBe(200);
    }
    const detail = await owner("GET", `/orders/${mine.id}`);
    expect(detail.data.order?.trackingNumber ?? detail.data.trackingNumber).toBeTruthy();
    const v = (await owner("GET", "/vehicles/mine")).data.vehicles.find((x: any) => x.regNo === "MH12AB3456");
    const rv = await owner("POST", `/orders/${mine.id}/review`, { rating: 5, comment: "Fits perfectly", fitConfirmed: true, vehicleId: v.id });
    expect(rv.status).toBe(201);
    const after = await owner("GET", `/orders/${mine.id}`);
    expect((after.data.order ?? after.data).status).toBe("completed");
  });
});

describe("garage OS + passport", () => {
  let jobId = "", partItemId = "", estimateToken = "", invoice: any, vehicleId = "";

  test("owner adds a vehicle via mock RC lookup", async () => {
    const l = await owner("GET", `/vehicles/lookup?regNo=${REG}`);
    expect(l.status).toBe(200);
    expect(l.data.vehicle.source).toBe("mock-rc");
    const a = await owner("POST", "/vehicles", { regNo: REG, nickname: "Test car" });
    expect(a.status).toBe(201);
    vehicleId = a.data.vehicle.id;
    expect((await garage("POST", "/vehicles", { regNo: REG })).status).toBe(409);
  });

  test("garage opens a job card → owner gets a consent request and grants it", async () => {
    const j = await garage("POST", "/garage/jobs", { regNo: REG.toLowerCase(), customerName: "Arjun Kumar", customerPhone: "+919123456789", odometerKm: 48500, complaint: "Brake noise, AC weak" });
    expect(j.status).toBe(201);
    jobId = j.data.job.id;
    const mine = (await owner("GET", "/vehicles/mine")).data.vehicles.find((v: any) => v.id === vehicleId);
    expect(mine.pendingAccess).toHaveLength(1);
    const g = await owner("POST", `/vehicles/access/${mine.pendingAccess[0].id}`, { grant: true });
    expect(g.data.access.status).toBe("granted");
  });

  test("garage builds the estimate and sources a part via quotes", async () => {
    await garage("POST", `/garage/jobs/${jobId}/items`, { kind: "labour", name: "Brake service", unitPrice: "450", gstRate: 18 });
    const p = await garage("POST", `/garage/jobs/${jobId}/items`, { kind: "part", name: "Front brake pads", unitPrice: "1500", gstRate: 28, warrantyMonths: 6 });
    partItemId = p.data.item.id;
    const q = await garage("POST", `/garage/jobs/${jobId}/items/${partItemId}/request-quotes`, { note: "Need today" });
    expect(q.status).toBe(201);
    const bid = await raza("POST", `/inquiries/${q.data.inquiryId}/bids`, { price: "1100", condition: "oes", brand: "Bosch", partNumber: "0986AB1234", warrantyMonths: 6, etaDays: 1 });
    expect(bid.status).toBe(201);
    const bidId = bid.data.bid?.id ?? bid.data.id;
    const acc = await garage("POST", `/bids/${bidId}/accept`);
    expect(acc.status).toBe(201);
    const pay = await garage("POST", "/payments", { checkoutId: acc.data.checkoutId });
    await garage("POST", `/payments/${pay.data.payment.id}/complete`, { method: "upi", outcome: "success" });
    const job = await garage("GET", `/garage/jobs/${jobId}`);
    const line = job.data.items.find((i: any) => i.id === partItemId);
    expect(line.sellerName).toBe("Raza Auto Parts");
    expect(line.order.paymentStatus).toBe("paid");
    expect(line.brand).toBe("Bosch");
  });

  test("invoice is blocked until the owner approves the estimate", async () => {
    expect((await garage("POST", `/garage/jobs/${jobId}/invoice`)).status).toBe(400);
    const s = await garage("POST", `/garage/jobs/${jobId}/send-estimate`);
    estimateToken = s.data.job.estimateToken;
    const e = await anon("GET", `/public/estimates/${estimateToken}`);
    expect(e.data.items).toHaveLength(2);
    const ap = await anon("POST", `/public/estimates/${estimateToken}/approve`, { approvedItemIds: e.data.items.map((i: any) => i.id) });
    expect(ap.data.ok).toBe(true);
    expect((await anon("POST", `/public/estimates/${estimateToken}/approve`, { approvedItemIds: [] })).status).toBe(409);
  });

  test("invoice is GST-correct, verifiable, and detects tampering", async () => {
    const r = await garage("POST", `/garage/jobs/${jobId}/invoice`);
    expect(r.status).toBe(201);
    invoice = r.data.invoice;
    // 450 + 18% = 531 ; 1500 + 28% = 1920 → 2451
    expect(invoice.total).toBe("2451.00");
    const v = await anon("GET", `/public/invoices/verify/${invoice.verifyCode}`);
    expect(v.data).toMatchObject({ found: true, genuine: true });
    await db.update(invoices).set({ total: "2400.00" }).where(eq(invoices.id, invoice.id));
    expect((await anon("GET", `/public/invoices/verify/${invoice.verifyCode}`)).data.genuine).toBe(false);
    await db.update(invoices).set({ total: invoice.total }).where(eq(invoices.id, invoice.id));
    expect((await anon("GET", `/public/invoices/verify/FMS-0000-0000`)).data.found).toBe(false);
  });

  test("customer pays via payment link; job becomes paid", async () => {
    const p = await anon("POST", `/public/invoices/pay/${invoice.payToken}`, { method: "upi", outcome: "success" });
    expect(p.data.payment.status).toBe("succeeded");
    expect((await anon("GET", `/public/invoices/verify/${invoice.verifyCode}`)).data.invoice.status).toBe("paid");
    expect((await garage("GET", `/garage/jobs/${jobId}`)).data.job.status).toBe("paid");
  });

  test("passport shows service, part with warranty, and can be shared", async () => {
    const p = await owner("GET", `/vehicles/${vehicleId}/passport`);
    expect(p.data.services).toHaveLength(1);
    expect(p.data.parts[0]).toMatchObject({ name: "Front brake pads", brand: "Bosch", sellerName: "Raza Auto Parts", warrantyActive: true });
    expect(p.data.stats.totalSpent).toBe("2451.00");
    expect((await garage("GET", `/vehicles/${vehicleId}/passport`)).status).toBe(403);
    const fit = await owner("POST", `/vehicles/parts/${p.data.parts[0].id}/fit`, { fits: true });
    expect(fit.data.ok).toBe(true);
    const sh = await owner("POST", `/vehicles/${vehicleId}/share`, { sections: { services: true, parts: true, odometer: true, invoices: false } });
    const pub = await anon("GET", `/public/passport/${sh.data.shareToken}`);
    expect(pub.data.services).toHaveLength(1);
    expect(pub.data.services[0].invoice).toBeNull();
    expect(pub.data.vehicle.regNoDisplay).toContain("•");
    await owner("DELETE", `/vehicles/${vehicleId}/share`);
    expect((await anon("GET", `/public/passport/${sh.data.shareToken}`)).status).toBe(404);
  });
});

describe("admin", () => {
  test("metrics reflect the journey", async () => {
    const m = await admin("GET", "/admin/marketplace-health");
    expect(m.status).toBe(200);
    expect(m.data.invoices).toBeGreaterThan(0);
    expect(m.data.confirmed_fits).toBeGreaterThan(0);
    expect(typeof m.data.fillRate).toBe("number");
    expect((await owner("GET", "/admin/marketplace-health")).status).toBe(403);
  });
});
