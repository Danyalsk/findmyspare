// FindMySpare v2: end-to-end browser journey (UI only, real backend, mock payments).
//
// Prereqs: backend on :8000 with DEMO_LOGIN=1 and seed + seed-v2 data, web on :3000.
//   cd e2e && npm i && node journey.mjs
// Screenshots → docs/prototype/screens/NN-name.png. Exits non-zero on the first failure.
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const WEB = process.env.WEB_URL || "http://localhost:3000";
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../docs/prototype/screens");
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || (fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined) });

let n = 0;
const errors = [];
async function shot(page, name, { full = true } = {}) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(400);
  const file = path.join(OUT, `${String(++n).padStart(2, "0")}-${name}.png`);
  await page.screenshot({ path: file, fullPage: full });
  console.log("📸", path.basename(file));
}
function step(title) { console.log(`\n▶ ${title}`); }

// Reuse a persona's session for extra devices (the OTP endpoint is rate-limited).
const sessions = new Map();
async function persona(email, { mobile = false } = {}) {
  const ctx = await browser.newContext({
    ...(mobile ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1280, height: 860 } }),
    ...(email && sessions.has(email) ? { storageState: sessions.get(email) } : {}),
  });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${email ?? "anon"}: ${e.message.split("\n")[0]}`));
  if (email && sessions.has(email)) return page;
  if (email) {
    await page.goto(`${WEB}/login`);
    await page.getByPlaceholder("you@example.com").fill(email);
    await page.getByPlaceholder("you@example.com").press("Enter");
    await page.getByPlaceholder("123456").fill("123456");
    await page.getByPlaceholder("123456").press("Enter");
    await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 20000 });
    sessions.set(email, await ctx.storageState());
  }
  return page;
}
const go = (page, p) => page.goto(`${WEB}${p}`, { waitUntil: "networkidle" });

try {
  // ── 1. Storefront ─────────────────────────────────────
  step("Guest storefront");
  const guest = await persona(null);
  await go(guest, "/");
  await shot(guest, "home-desktop");
  const mob = await persona(null, { mobile: true });
  await go(mob, "/");
  await shot(mob, "home-mobile", { full: false });

  // ── 2. Owner shops for their Swift ────────────────────
  step("Owner picks their vehicle and shops");
  const owner = await persona("buyer1@findmyspare.test");
  await go(owner, "/");
  await owner.getByRole("button", { name: "Choose your vehicle" }).click();
  await owner.getByRole("button", { name: /Daily Swift/ }).click();
  await owner.waitForTimeout(800);
  await shot(owner, "home-for-my-swift");
  await go(owner, "/search?category=Brakes");
  await shot(owner, "search-brakes-fits-swift");
  // Bosch front pads from Raza (product page with offer comparison)
  await owner.locator("a", { hasText: "Front Brake Pad Set" }).filter({ hasText: "Bosch" }).first().click().catch(async () => {
    await owner.getByText("Front Brake Pad Set").first().click();
  });
  await owner.waitForURL(/\/product\//);
  await owner.getByText(/Compare \d+ other offer/).waitFor();
  await shot(owner, "product-fit-check-and-offers");
  await owner.getByRole("button", { name: "Add", exact: true }).first().click();
  // A second seller: Mann cabin filter from Ayman
  await go(owner, "/search?q=cabin");
  await owner.getByRole("button", { name: "Add", exact: true }).first().click();
  await owner.waitForTimeout(300);
  await shot(owner, "cart-bar", { full: false });
  await go(owner, "/buyer/cart");
  await owner.getByText("Bill details").waitFor();
  await owner.getByRole("button", { name: /Proceed to pay/ }).waitFor();
  await shot(owner, "cart-split-by-seller");
  await owner.getByRole("button", { name: /Proceed to pay/ }).click();
  await owner.waitForURL(/\/pay\//);
  await owner.getByText("FMS Pay").waitFor();
  await shot(owner, "mock-gateway");
  // Declined first (shows recovery), then pay by UPI.
  await owner.getByText("Simulate a declined payment").click();
  await owner.getByRole("button", { name: /^Pay ₹/ }).click();
  await owner.getByText(/Payment declined/).waitFor();
  await owner.getByText("Simulate a declined payment").click();
  await owner.getByRole("button", { name: /^Pay ₹/ }).click();
  await owner.getByText("Order placed!").waitFor();
  await shot(owner, "order-placed");
  const orderHref = await owner.locator("a", { hasText: "Raza Auto Parts" }).first().getAttribute("href");

  // ── 3. Seller fulfils ────────────────────────────────
  step("Seller confirms, ships and delivers");
  const seller = await persona("raza@findmyspare.test");
  await go(seller, orderHref.replace("/buyer/orders", "/supplier/orders"));
  await seller.getByRole("button", { name: "Confirm order" }).click();
  await seller.getByRole("button", { name: "Mark shipped" }).click();
  await seller.getByRole("button", { name: "Confirm shipment" }).click();
  await seller.getByRole("button", { name: "Mark in transit" }).click();
  await seller.getByRole("button", { name: "Mark delivered" }).click();
  await seller.waitForTimeout(600);
  await shot(seller, "seller-order-delivered");

  // ── 4. Owner reviews + confirms fit ──────────────────
  step("Owner tracks, rates and confirms fit");
  await go(owner, orderHref);
  await owner.getByText("How was it?").waitFor();
  await shot(owner, "order-tracking-delivered");
  await owner.getByRole("radio", { name: "5 stars" }).click();
  await owner.getByRole("button", { name: /Yes, fitted perfectly/ }).click();
  await owner.getByPlaceholder(/Anything other buyers/).fill("Bosch pads fitted in 20 minutes. Exactly as listed.");
  await owner.getByRole("button", { name: /Submit & release payment/ }).click();
  await owner.getByText(/Order complete/).waitFor();

  // ── 5. Garage opens a job card ───────────────────────
  step("Garage checks the car in");
  const garage = await persona("garage@findmyspare.test");
  await go(garage, "/workshop");
  await garage.getByText("Vehicles in the workshop").waitFor();
  await shot(garage, "workshop-dashboard");
  await go(garage, "/workshop/jobs/new");
  await garage.getByRole("textbox", { name: "Registration number" }).fill("MH12AB3456");
  await garage.getByRole("button", { name: "Find" }).click();
  await garage.getByText(/Has Passport|Mock RC/).waitFor();
  await garage.locator("label", { hasText: "Customer name" }).locator("input").fill("Arjun Kumar");
  await garage.locator("label", { hasText: "Customer mobile" }).locator("input").fill("+91 91234 56789");
  await garage.locator("label", { hasText: "Odometer" }).locator("input").fill("48650");
  await garage.getByRole("button", { name: "Brake noise", exact: true }).click();
  await garage.getByRole("button", { name: "AC not cooling", exact: true }).click();
  await shot(garage, "job-new");
  await garage.getByRole("button", { name: "Open job card" }).click();
  await garage.waitForURL(/\/workshop\/jobs\/[0-9a-f-]{36}$/);
  const jobUrl = garage.url();

  // ── 6. Owner consents to Passport updates ────────────
  step("Owner allows the garage to write to the Passport");
  await go(owner, "/vehicles");
  // On a fresh database the request is pending; on reruns it was granted earlier.
  if (await owner.getByText(/wants to add service records/).first().isVisible().catch(() => false)) {
    await shot(owner, "consent-request");
    await owner.getByRole("button", { name: "Allow" }).first().click();
    await owner.getByText(/Garage allowed/).waitFor();
  } else console.log("  (consent already granted from an earlier run)");

  // ── 7. Garage builds estimate and sources a part ─────
  step("Garage adds lines and sources a part via quotes");
  await garage.goto(jobUrl, { waitUntil: "networkidle" });
  async function addLine(kind, name, price, extra = {}) {
    await garage.getByRole("button", { name: "+ Add line" }).click();
    await garage.getByRole("button", { name: kind === "part" ? "⚙️ Part" : "🔧 Labour" }).click();
    const sheet = garage.getByRole("dialog");
    await sheet.locator("label", { hasText: kind === "part" ? "Part name" : "Labour description" }).locator("input").fill(name);
    if (extra.brand) await sheet.locator("label", { hasText: "Brand" }).locator("input").fill(extra.brand);
    await sheet.locator("label", { hasText: "Price (excl. GST)" }).locator("input").fill(price);
    if (extra.warranty) await sheet.locator("label", { hasText: "Warranty" }).locator("input").fill(extra.warranty);
    await sheet.getByRole("button", { name: "Add to job" }).click();
    await garage.getByText(name).first().waitFor();
  }
  await addLine("labour", "Brake service & AC check", "650");
  await addLine("part", "AC cabin filter", "520", { brand: "Mann-Filter", warranty: "0" });
  await addLine("part", "Rear brake shoe set", "980", { warranty: "6" });
  await garage.getByRole("button", { name: "Get quotes" }).last().click();
  await garage.getByText("Waiting for quotes…").waitFor();
  const reqHref = await garage.locator("a", { hasText: "Waiting for quotes" }).getAttribute("href");
  const inquiryId = reqHref.split("/").pop();
  await shot(garage, "job-card-lines");

  step("Seller quotes on the garage's request");
  await go(seller, `/supplier/leads/${inquiryId}`);
  await seller.getByPlaceholder("e.g. 3200").fill("760");
  await seller.getByRole("button", { name: "OES" }).click();
  await seller.getByPlaceholder("Bosch, MGP…").fill("Bosch");
  await seller.getByRole("button", { name: /Submit quote/ }).click();
  await seller.getByRole("button", { name: "Back to leads" }).waitFor();

  step("Garage accepts the quote and pays");
  await go(garage, reqHref);
  await garage.getByRole("button", { name: /Accept & pay/ }).waitFor();
  await shot(garage, "quotes-for-garage");
  await garage.getByRole("button", { name: /Accept & pay/ }).first().click();
  await garage.waitForURL(/\/pay\//);
  await garage.getByRole("button", { name: /^Pay ₹/ }).click();
  await garage.getByText("Order placed!").waitFor();

  // ── 8. Estimate approval by the owner (public link) ──
  step("Garage sends estimate; owner approves from the link");
  await garage.goto(jobUrl, { waitUntil: "networkidle" });
  await garage.getByRole("button", { name: "Send estimate to owner" }).click();
  await garage.getByText("Share estimate with the owner").waitFor();
  await shot(garage, "estimate-share", { full: false });
  const estimateHref = await garage.getByRole("link", { name: "Preview" }).getAttribute("href");
  const customerPhone = await persona(null, { mobile: true });
  await customerPhone.goto(`${WEB}${estimateHref}`, { waitUntil: "networkidle" });
  await shot(customerPhone, "estimate-approval-mobile");
  await customerPhone.getByRole("button", { name: /Approve 3 items/ }).click();
  await customerPhone.getByText(/Approved. The garage can start/).waitFor();
  await shot(customerPhone, "estimate-approved-mobile", { full: false });

  // ── 9. Work, fitted, invoice ─────────────────────────
  step("Garage completes work and invoices");
  await garage.goto(jobUrl, { waitUntil: "networkidle" });
  for (const cb of await garage.getByRole("checkbox").all()) await cb.check();
  await garage.getByRole("button", { name: "Start work" }).click();
  await garage.getByRole("button", { name: "Mark ready for pickup" }).click();
  await shot(garage, "job-card-ready");
  await garage.getByRole("button", { name: "Generate GST invoice" }).click();
  await garage.waitForURL(/\/workshop\/invoices\//);
  await garage.getByText("Tax invoice").waitFor();
  await shot(garage, "gst-invoice-with-qr");
  const payHref = await garage.getByRole("link", { name: "Open" }).getAttribute("href");
  const verifyCode = (await garage.locator("aside a", { hasText: "Check verification page" }).innerText()).match(/FMS-[0-9A-Z]{4}-[0-9A-Z]{4}/)[0];

  // ── 10. Customer pays the payment link; anyone verifies ──
  step("Customer pays via link; anyone verifies the bill");
  await customerPhone.goto(`${WEB}${payHref}`, { waitUntil: "networkidle" });
  await shot(customerPhone, "invoice-pay-mobile");
  await customerPhone.getByRole("button", { name: /^Pay ₹/ }).click();
  await customerPhone.getByText(/Paid to Sharma Auto Works/).waitFor();
  await go(guest, "/verify");
  await guest.getByLabel("Verification code").fill(verifyCode);
  await guest.getByRole("button", { name: "Verify" }).click();
  await guest.getByText("Genuine and unaltered").waitFor();
  await shot(guest, "invoice-verified-genuine");

  // ── 11. Passport ─────────────────────────────────────
  step("Owner's Vehicle Passport");
  await go(owner, "/vehicles");
  await owner.locator(".card", { hasText: "Daily Swift" }).getByRole("link", { name: /Open Passport/ }).click();
  await owner.getByText("Vehicle Passport").first().waitFor();
  await owner.getByText("Sharma Auto Works").first().waitFor();
  await shot(owner, "passport-timeline");
  await owner.getByRole("button", { name: "Parts & warranty" }).click();
  await owner.getByText(/warranty left/).first().waitFor();
  await shot(owner, "passport-warranty-wallet");
  await owner.getByRole("button", { name: "Share history" }).click();
  await owner.getByRole("button", { name: /Create share link|Update link/ }).click();
  const shareHref = await owner.getByRole("link", { name: "Preview" }).getAttribute("href");
  await go(guest, shareHref);
  await guest.getByText("FindMySpare Verified History").waitFor();
  await shot(guest, "shared-history");

  // ── 12. Admin ────────────────────────────────────────
  step("Admin marketplace health");
  const admin = await persona("admin@findmyspare.test");
  await go(admin, "/admin");
  await admin.getByText("Quotes & fit (north star)").waitFor();
  await shot(admin, "admin-marketplace-health");

  // ── 13. Mobile spot checks ───────────────────────────
  step("Mobile spot checks");
  const ownerMobile = await persona("buyer1@findmyspare.test", { mobile: true });
  await go(ownerMobile, "/search?category=Filters");
  await shot(ownerMobile, "search-mobile", { full: false });
  const garageMobile = await persona("garage@findmyspare.test", { mobile: true });
  await garageMobile.goto(jobUrl, { waitUntil: "networkidle" });
  await shot(garageMobile, "job-card-mobile", { full: false });
} catch (e) {
  console.error("\n❌ Journey failed:", e.message);
  errors.unshift(`FAILED: ${e.message}`);
} finally {
  await browser.close();
}

const pageErrors = errors.filter((e) => !e.startsWith("FAILED"));
if (pageErrors.length) console.log("\n⚠️  Browser errors:\n" + pageErrors.join("\n"));
if (errors.some((e) => e.startsWith("FAILED"))) process.exit(1);
console.log(`\n✅ Journey complete: ${n} screenshots in ${path.relative(process.cwd(), OUT)}`);
