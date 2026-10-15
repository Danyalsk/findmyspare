# FindMySpare v2: Vision, Rebrand and Prototype Plan

_Follows `findmyspare-growth-plan.md`. Status: **plan only, awaiting go-ahead.**_

---

## Part 1: Thinking bigger

### 1.1 Your idea: a digital card for every vehicle, and garage invoicing

You suggested two things:
- **A card for every car:** what service was done, which part was fitted, when, and by whom, kept for the customer.
- **Garage tools:** the garage creates the invoice, sends it, collects payment and the invoice can be verified.

This is bigger than a feature. It changes what FindMySpare *is*.

| Today | With your idea |
|---|---|
| A place to **buy** parts | The place where a vehicle's **whole repair life** is recorded |
| Used once, when a part is needed | Used **every time** a vehicle is serviced |
| Competes with Boodmo on parts | Competes with nobody: no one in India owns the vehicle's service record |

### 1.2 New model: three products, one network

```
          ┌──────────────────────┐
          │  VEHICLE PASSPORT    │  ← car/bike owner
          │  lifetime record     │
          └─────────▲────────────┘
     writes service │ │ reminders, approvals,
     + parts fitted │ │ payments, reviews
          ┌─────────┴─▼──────────┐
          │     GARAGE OS        │  ← mechanic/garage (free tool)
          │ job cards, estimates,│
          │ invoices, payments   │
          └─────────▲────────────┘
       orders parts │ │ quotes, delivery,
       from the job │ │ warranty
          ┌─────────┴─▼──────────┐
          │ PARTS MARKETPLACE    │  ← suppliers (where money is made)
          │ request→quote→order  │
          └──────────────────────┘
       Every fitted part → FITMENT GRAPH + PROVENANCE
```

The order of play is **come for the tool, stay for the network**:

1. A garage adopts **Garage OS** because it's free and makes invoicing, estimates and payment collection easy. It's useful even if no other garage uses it.
2. Every job card a garage opens creates or updates a **Vehicle Passport**, and the owner receives it on WhatsApp. Owners arrive without any marketing spend.
3. When the job card needs a part, the garage taps **"Get quotes"**. That is the marketplace, built into daily work and monetised by commission.
4. Each fitted part becomes **confirmed fitment data and a provenance record**: this part, from this seller, fitted on this vehicle by this garage, on this date.

> **This changes the go-to-market from the first plan.** Lead with Garage OS, not the marketplace. A garage will try a free billing tool far more readily than a new place to buy parts. Commerce then follows the workflow.

### 1.3 Ideas beyond what we've discussed

Grouped by who benefits. ⭐ = high leverage, worth doing early.

**For vehicle owners**

1. ⭐ **Vehicle Passport and "FMS Verified History" report.** India sells about 5.9M used cars a year with almost no trustworthy service history, and odometer tampering is common. A verified history (services, parts, odometer readings over time, accident repairs) raises resale value. Dealers, buyers and lenders can pay for the report.
2. ⭐ **Warranty Wallet.** Every fitted part's warranty is tracked automatically. "Your battery has 7 months of warranty left." Claim in one tap, with the seller held accountable.
3. **Document vault:** RC, insurance, PUC (pollution certificate) and fitness expiry reminders. Renew insurance in-app, which is a commission revenue line.
4. **Predictive maintenance:** "Brake pads are due in about 2,000 km". Order the part and book the garage in one flow.
5. **Repair EMI:** split a ₹40,000 clutch-and-suspension bill into 3–6 EMIs through a lending partner.
6. **Breakdown SOS:** share live location, the nearest FMS garage is alerted, and the part is dispatched to the garage.
7. **Family and multi-vehicle:** one account for all family vehicles, with access shared to a driver.

**For garages and mechanics**

8. ⭐ **Garage OS:**
   - Digital job cards
   - Inspection with photos and video
   - Estimates the owner approves from a WhatsApp link
   - GST invoices
   - UPI QR or payment link on every invoice
   - Payment reconciliation
   - Credit book (*udhaar*) with reminders
   - Staff and bay tracking
   - Daily cash report
9. ⭐ **Verifiable invoices.** Every invoice carries a QR code and an ID. Scanning it opens a public FindMySpare page confirming the invoice is genuine, unaltered and paid. This stops fake bills in fleet reimbursements, company car claims and insurance claims. Fleets and insurers will want it.
10. **Mechanic profile:** a public profile with verified job count, ratings, specialisations (EV, AC, denting) and certifications. It's portable reputation that goes with the mechanic even if they change garages.
11. **Unified rewards wallet.** Parts brands already run loyalty schemes for mechanics. FindMySpare can combine them into one wallet, with points earned on every part fitted on the platform.
12. **Skill-up academy:** short Hindi/regional videos on EV repair and new models, with certificates shown on the profile.
13. **Garage financing:** working capital and equipment loans, underwritten on Garage OS cash-flow data.

**For suppliers and brands**

14. **Demand forecasting:** "Stock 40 Creta brake kits next month in Lucknow", based on passport data (which vehicles are due for what).
15. **Brand authenticity programme:** brands register serial/QR codes. A scan at fitting time links the part to the vehicle passport, which makes counterfeits traceable.
16. **Core exchange / reverse logistics:** old alternators, starters and batteries go back for remanufacturing, and the buyer gets a core credit. EV battery second life comes later.

**For fleets, insurers and lenders (B2B data and network)**

17. **Fleet console:** all vehicles, all job cards and spend per vehicle, approvals before work starts, monthly consolidated invoices.
18. **Insurance repair network:** cashless claims at FindMySpare garages, with verified invoices and photos sent straight to the insurer.
19. **India Parts Price Index:** an anonymised price and demand index sold to OEMs, brands, insurers and analysts.
20. **AI mechanic copilot:** input symptoms or an OBD-II code (the car's diagnostic fault code); get likely faults, a parts list and a labour estimate. Later, an OBD dongle streams live health data into the passport.

### 1.4 What makes this hard to copy

- **The Vehicle Passport is a network asset.** The more garages write to it, the more valuable it is to owners, buyers and insurers. No competitor can copy history that took years to build.
- **Garage OS makes switching costly.** A garage's customers, credit book and invoices all live there.
- **The fitment and provenance graph** grows with every job.

### 1.5 Guardrails

- **Privacy:** India's DPDP Act 2023 applies. The owner owns the passport. Garages write only with consent (OTP or link approval). The owner chooses what goes into a shareable history report.
- **Focus:** that's 20 ideas. **Build only ⭐ items 1, 2, 8 and 9 plus the existing marketplace first.** The rest are roadmap.
- **GST e-invoicing (IRN)** is mandatory only above a turnover threshold, and most garages fall below it. Support both. FindMySpare's own QR verification works for every invoice regardless.

### 1.6 Revised phases

| Phase | Lead product | Goal |
|---|---|---|
| 0–6 mo | **Garage OS (free)** + Vehicle Passport + marketplace inside job cards | 1,000 garages in one city creating invoices daily |
| 6–18 mo | Marketplace liquidity, payments, Warranty Wallet, Verified Invoice | Most parts for those garages ordered via FindMySpare |
| 18–36 mo | History reports, fleet console, insurer network, financing | New revenue lines on top of the data |

---

## Part 2: Rebrand plan, using the Tech Branding & Logo skill

**Skill:** [tech-branding-logo-repo.vercel.app](https://tech-branding-logo-repo.vercel.app). Open source (MIT): `github.com/Atmech/tech-branding-logo-repo`. Install with `npx -y github:Atmech/tech-branding-logo-repo`.
- **Safety step before installing:** it's third-party code, so I'll read the installer and `SKILL.md` before running anything.
- The skill keeps its state in `.branding/` (`context.md`, `decisions.md`, `state.json`, `handoff.md`) inside the repo, so the brand work is versioned with the code.

### 2.1 Mode
**Brand evolution / name-to-brand.** The product already has a name and a cobalt "Titanium" UI identity. The skill will:
1. **Audit** the current identity: keep, evolve or retire each element.
2. **Assess the name.** The question is whether "FindMySpare" still fits now that the product covers the vehicle's whole service life. My recommendation is to **keep FindMySpare** as the master brand. It says the job, it already has equity and it's good for search. Add a clear architecture:
   - **FindMySpare**: the marketplace and master brand
   - **FindMySpare Garage**: Garage OS
   - **FindMySpare Passport**: the vehicle card (the skill will test name options)
   - **FMS Verified**: the trust mark for invoices, sellers and garages
3. Domains: `technology` + `b2b` overlay (garages, suppliers, fleets).

### 2.2 Process (follows the skill)
1. **Brief:** audience (mechanics on budget Android phones, parts traders, car/bike owners), positioning, personality, references you like or dislike.
2. **Positioning and messaging:** one-line promise, tagline in English and Hindi, tone of voice.
3. **Logo exploration:** 50+ low-cost directions → shortlist → **3 distinct routes** → refine in black and white → then colour. Real editable SVGs, not mockups.
4. **Identity system:**
   - Colour tokens (light/dark, plus contrast suited to outdoor sunlight)
   - Typography that supports **Latin + Devanagari**
   - Icon style, patterns, a motion principle
5. **Applications:**
   - App icon, favicon, splash screen
   - WhatsApp profile picture
   - Invoice header with the verification QR
   - Vehicle Passport card design
   - "FMS Verified Garage" shop-front sticker and signboard
   - Seller badge, social post template
6. **QC on real surfaces:** 16 px favicon, Android launcher icon, WhatsApp crop, an invoice printed on a thermal printer, a sticker on a shop shutter.
7. **Export brand kit** to `brand/` and convert the tokens into the web Tailwind theme and the mobile theme.

### 2.3 What you'll review
You review at three checkpoints: **(a)** brief + positioning, **(b)** the 3 logo routes, **(c)** the final system. You can also say "choose for me" at any checkpoint and I'll proceed with my recommendation.

---

## Part 3: End-to-end working prototype

### 3.1 The demo story (one continuous flow, all real code)

| # | Actor | Step |
|---|---|---|
| 1 | Owner | Signs up and adds a vehicle by registration number (mock registration lookup) → **Vehicle Passport** created |
| 2 | Garage | Opens a **job card** for that registration number. The owner gets a consent link and approves |
| 3 | Garage | Adds an inspection (photos, notes, odometer) → builds an **estimate** (parts + labour) |
| 4 | Owner | Opens the estimate link → **approves** line items |
| 5 | Garage | Taps **"Get quotes"** for a missing part → suppliers see the live lead → they quote (existing request/quote flow) |
| 6 | Garage | Accepts a quote → **pays** (payment gateway in test mode, or mock) → supplier marks it dispatched → delivered |
| 7 | Garage | Fits the part (records part number, brand, serial, warranty) → closes the job → **GST invoice** with QR generated |
| 8 | Owner | Pays the invoice via a **UPI/payment link** (test mode) → paid |
| 9 | Anyone | Scans the invoice QR → public **Verify Invoice** page (genuine / altered / paid) |
| 10 | Owner | Passport timeline updates: service, parts fitted, odometer, **Warranty Wallet** entries. Owner answers **"Did it fit?"** → fitment record |
| 11 | Owner | Shares a **Verified History** link (read-only, chosen sections) |
| 12 | Admin | Dashboard: garages, job cards, GMV, fill rate, time-to-first-quote |

### 3.2 What already exists and gets reused
Auth (email, magic link, WhatsApp OTP), roles, supplier onboarding with GSTIN, products and inventory, inquiries → bids, real-time chat, orders, disputes, escrow table, notifications, admin console.

### 3.3 What gets built

**Backend** (Bun/Elysia/Drizzle), new tables:

| Area | Tables |
|---|---|
| Vehicle catalog | `vehicle_makes`, `vehicle_models`, `vehicle_variants` (seeded with top Indian 2W/4W models) |
| Passport | `vehicles` (reg no, VIN, variant, owner); `vehicle_access` (consent grants) |
| Garage | `garages` (a new `garage` role); `job_cards`, `job_items` (part/labour), `inspections` (photos, odometer) |
| Estimates | `estimates` (with an approval token) |
| Invoices | `invoices` (number series, GST split, content hash, verification ID, status) |
| Payments | `payments` (provider-agnostic: mock now, real gateway via env keys) |
| Parts history | `fitted_parts` (part, brand, serial, seller, warranty_until); `fitments` (variant ↔ part, confirmed) |
| Requests | `inquiries` gains `vehicle_id` / `job_card_id` |
| Quotes | `bids.condition` → enum (genuine OEM / OES / aftermarket / used / refurbished) |

Endpoints for each step above, plus:
- Public, unauthenticated, rate-limited endpoints: `/verify/:invoiceId` and `/share/:passportToken`
- PDF invoice rendering with a QR code

**Web** (Next.js):
- Garage OS screens: dashboard, job card, estimate builder, invoice
- Passport screens: vehicle list, timeline, warranty wallet, share
- Public pages: estimate approval, Verify Invoice, shared history
- The full rebrand applied across all existing screens

**Mobile** (Expo): the owner Passport and the garage job-card flow (the core screens), with the rebrand, app icon and splash.

**Mocked in the prototype, real-ready behind interfaces:**
- Vehicle registration lookup
- Shipping
- WhatsApp sends (shown as share links plus an in-app message log)
- The payment gateway, unless you give me test-mode keys

### 3.4 How I'll prove it works
- Seed script: 1 garage, 2 suppliers, 2 owners, 4 vehicles, catalog data.
- **Playwright end-to-end test** that runs steps 1–12 against local backend + web, with screenshots of every step.
- Backend unit tests for invoice hashing/verification, GST maths and consent rules.
- Typecheck and lint across all three packages.
- Mobile checked through Expo web.

### 3.5 Build order (after your go-ahead)
1. **Branding:** install and review the skill, brief, routes. **Checkpoint (a)** and **(b)** with you.
2. **Schema + backend** for Passport, Garage OS, invoices, payments; tests.
3. **Web:** Garage OS + Passport + public pages; apply the brand system.
4. **Mobile:** core screens + brand.
5. **E2E run, screenshots, walkthrough doc.** Checkpoint (c).

### 3.6 Blockers and decisions needed
- **GitHub push is blocked** (403). Reconnect GitHub / install the Claude GitHub App on `Danyalsk/findmyspare`, or commits stay local to this session.
- **Database:** I'll use a local Postgres in this environment for the prototype, so your Nhost production DB isn't touched.
