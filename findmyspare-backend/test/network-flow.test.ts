// v3 network journey against a running dev server seeded with seed-v3:
//   DEMO_LOGIN=1 bun run dev   (in another terminal)
//   bun test --env-file=.env test/network-flow.test.ts
// Covers: taxonomy, industry search + demand logging, distributor → retailer
// purchase order (tier price, ship → stock + khata, receive → buyer stock),
// counter bill on credit, Fix request → technician accepts → job card,
// machines without plates, admin network overview, public storefront.
import { beforeAll, describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { products, users } from "../src/db/schema";

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

type C = ReturnType<typeof client>;
let ganesh: C, patil: C, imran: C, arjun: C, admin: C;
const anon = client();
const ids: Record<string, string> = {};

beforeAll(async () => {
  const health = await fetch(`${BASE}/health`).then((r) => r.ok).catch(() => false);
  if (!health) throw new Error(`API not reachable at ${BASE}. Start it with DEMO_LOGIN=1 bun run dev`);
  const emails = ["ganesh", "patil", "imran", "buyer1", "admin"].map((k) => `${k}@findmyspare.test`);
  [ganesh, patil, imran, arjun, admin] = (await Promise.all(emails.map(login))).map(client);
  for (const k of ["ganesh", "patil"]) {
    const [u] = await db.select({ id: users.id }).from(users).where(eq(users.email, `${k}@findmyspare.test`)).limit(1);
    ids[k] = u!.id;
  }
});

describe("taxonomy + search across industries", () => {
  test("ten industries, each with machine types and categories", async () => {
    const r = await anon("GET", "/catalog/taxonomy");
    expect(r.status).toBe(200);
    expect(r.data.industries.length).toBe(10);
    for (const i of r.data.industries) {
      expect(i.machineTypes.length).toBeGreaterThan(2);
      expect(i.categories.length).toBeGreaterThan(5);
    }
    expect(r.data.industries.find((i: any) => i.slug === "pumps").parts).toBeGreaterThan(5);
  });

  test("industry filter only returns that industry; search is logged for the radar", async () => {
    const r = await anon("GET", "/products?industry=pumps&search=capacitor&limit=50");
    expect(r.status).toBe(200);
    expect(r.data.products.length).toBeGreaterThan(0);
    expect(r.data.products.every((p: any) => p.industrySlug === "pumps")).toBe(true);
    const zero = await anon("GET", `/products?industry=marine&search=hovercraft-skirt-${Date.now()}`);
    expect(zero.data.products.length).toBe(0);
    await Bun.sleep(200);
    const gaps = await admin("GET", "/admin/network/overview");
    expect(gaps.data.searchGaps.some((g: any) => g.term.startsWith("hovercraft-skirt"))).toBe(true);
  });
});

describe("distribution chain: retailer orders from distributor", () => {
  let poId = "", productId = "", sellerStockBefore = 0;

  test("Business home shows live tasks, not made-up numbers", async () => {
    const r = await patil("GET", "/biz/me");
    expect(r.status).toBe(200);
    expect(r.data.me.businessRoles).toContain("retailer");
    expect(r.data.today.pos_to_receive).toBeGreaterThanOrEqual(1);
  });

  test("retailer sees distributor catalog at their price list, with tier price", async () => {
    const r = await patil("GET", `/biz/suppliers/${ids.ganesh}/catalog`);
    expect(r.status).toBe(200);
    expect(r.data.terms.priceList).toBe("Retailers");
    const cap = r.data.products.find((p: any) => p.partNumber === "KEL-36-440");
    expect(Number(cap.yourPrice)).toBeCloseTo(Number(cap.listPrice) * 0.95, 1);
    expect(cap.tier).toEqual({ price: "235.00", minQty: 20 });
    productId = cap.id;
    sellerStockBefore = cap.stockQuantity;
  });

  test("PO below MOQ is refused; at tier quantity it uses the tier price", async () => {
    const low = await patil("POST", "/biz/pos", { sellerId: ids.ganesh, lines: [{ productId, quantity: 2 }] });
    expect(low.status).toBe(400);
    const r = await patil("POST", "/biz/pos", { sellerId: ids.ganesh, lines: [{ productId, quantity: 20 }], paymentTerms: "credit" });
    expect(r.status).toBe(201);
    expect(r.data.po.lines[0].unitPrice).toBe("235.00");
    expect(r.data.po.total).toBe((20 * 235 * 1.18).toFixed(2));
    poId = r.data.po.id;
  });

  test("buyer can't ship their own order; seller accepts and ships → stock out + khata", async () => {
    expect((await patil("POST", `/biz/pos/${poId}/action`, { action: "ship" })).status).toBe(403);
    expect((await ganesh("POST", `/biz/pos/${poId}/action`, { action: "accept" })).status).toBe(200);
    const s = await ganesh("POST", `/biz/pos/${poId}/action`, { action: "ship", tracking: "Own van" });
    expect(s.status).toBe(200);
    const [p] = await db.select().from(products).where(eq(products.id, productId));
    expect(p!.stockQuantity).toBe(sellerStockBefore - 20);
    const k = await ganesh("GET", "/biz/khata");
    expect(Number(k.data.receivable.find((x: any) => x.counterparty_id === ids.patil).balance)).toBeGreaterThan(0);
    const pay = await patil("GET", "/biz/khata");
    expect(pay.data.payable.some((x: any) => x.owner_id === ids.ganesh)).toBe(true);
  });

  test("retailer receives → goods land in their own stock", async () => {
    const [before] = await db.select().from(products).where(eq(products.supplierId, ids.patil!)).then((l) => l.filter((x) => x.partNumber === "KEL-36-440"));
    const r = await patil("POST", `/biz/pos/${poId}/action`, { action: "receive" });
    expect(r.status).toBe(200);
    const [after] = await db.select().from(products).where(eq(products.id, before!.id));
    expect(after!.stockQuantity).toBe(before!.stockQuantity + 20);
  });
});

describe("counter billing + walk-in khata", () => {
  test("credit bill deducts stock and opens a khata line by phone", async () => {
    const mine = (await db.select().from(products).where(eq(products.supplierId, ids.patil!))).find((p) => p.partNumber === "FC-25")!;
    const phone = `98${String(Date.now()).slice(-8)}`;
    const r = await patil("POST", "/biz/bills", {
      customerName: "Test farmer", customerPhone: phone, paymentMode: "credit",
      lines: [{ productId: mine.id, name: mine.name, quantity: 3, unitPrice: 45, gstRate: 18 }],
    });
    expect(r.status).toBe(201);
    expect(r.data.bill.total).toBe((3 * 45 * 1.18).toFixed(2));
    const [after] = await db.select().from(products).where(eq(products.id, mine.id));
    expect(after!.stockQuantity).toBe(mine.stockQuantity - 3);
    const k = await patil("GET", "/biz/khata");
    expect(k.data.receivable.find((x: any) => x.phone === phone).balance).toBe(r.data.bill.total);
  });
});

describe("Fix: book a technician for a water pump", () => {
  let reqId = "";

  test("customer books; matching technician sees it without phone or address", async () => {
    const r = await arjun("POST", "/fix/requests", { industrySlug: "pumps", machineType: "monoblock", brand: "Sahyadri", model: "1 HP", problem: "Motor hums but shaft does not turn", city: "Pune", phone: "9123456789", address: "Kalyani Nagar" });
    expect(r.status).toBe(201);
    expect(r.data.notified).toBeGreaterThanOrEqual(1);
    reqId = r.data.request.id;
    const near = await imran("GET", "/fix/requests/nearby");
    const mine = near.data.requests.find((x: any) => x.id === reqId);
    expect(mine).toBeTruthy();
    expect(mine.phone).toBeNull();
    expect(mine.address).toBeNull();
  });

  test("technician accepts → job card with pump inspection; second accept is refused", async () => {
    const r = await imran("POST", `/fix/requests/${reqId}/accept`);
    expect(r.status).toBe(200);
    expect(r.data.job.complaint).toContain("hums");
    expect(r.data.job.inspection.map((i: any) => i.label)).toContain("Capacitor");
    expect((await imran("POST", `/fix/requests/${reqId}/accept`)).status).toBe(409);
    const mine = await arjun("GET", "/fix/requests/mine");
    const it = mine.data.requests.find((x: any) => x.id === reqId);
    expect(it.status).toBe("accepted");
    expect(it.garageName).toBe("Imran Motor Rewinding");
  });
});

describe("machines without number plates", () => {
  test("owner adds an AC by brand/model/serial", async () => {
    const r = await arjun("POST", "/vehicles", { industrySlug: "appliances", machineType: "ac", makeName: "LG", modelName: "Dual Inverter 1 T", serialNo: `LG${Date.now()}`, nickname: "Hall AC" });
    expect(r.status).toBe(201);
    expect(r.data.vehicle.regNo).toBeNull();
    expect(r.data.vehicle.industrySlug).toBe("appliances");
  });

  test("technician opens a walk-in job for a genset by serial", async () => {
    const r = await imran("POST", "/garage/jobs", { industrySlug: "power", machineType: "genset", makeName: "Kirloskar", modelName: "KG1 15 kVA", serialNo: `KG${Date.now()}`, complaint: "Low voltage under load" });
    expect(r.status).toBe(201);
    expect(r.data.vehicle.regNoDisplay).toStartWith("S/N ");
    expect(r.data.job.inspection.map((i: any) => i.label)).toContain("AVR");
  });
});

describe("admin + storefront", () => {
  test("admin sees roles, industries and trade across the network", async () => {
    const r = await admin("GET", "/admin/network/overview");
    expect(r.status).toBe(200);
    expect(r.data.industries.length).toBe(10);
    expect(r.data.roles.map((x: any) => x.role)).toEqual(expect.arrayContaining(["manufacturer", "super_stockist", "distributor", "retailer", "technician"]));
    expect(r.data.trade.links).toBeGreaterThan(5);
    const b = await admin("GET", "/admin/network/businesses?role=super_stockist");
    expect(b.data.businesses.some((x: any) => x.businessName === "Deccan Industrial Stockists")).toBe(true);
    expect((await patil("GET", "/admin/network/overview")).status).toBe(403);
  });

  test("public storefront lists a seller's parts", async () => {
    const r = await anon("GET", `/public/store/${ids.patil}`);
    expect(r.status).toBe(200);
    expect(r.data.store.businessName).toBe("Patil Electricals & Pumps");
    expect(r.data.products.length).toBeGreaterThan(3);
  });
});
