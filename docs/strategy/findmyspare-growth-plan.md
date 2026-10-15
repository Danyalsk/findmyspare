# FindMySpare: Strategy to Become India's Largest Spare-Parts Marketplace

_Research date: 15 Oct 2026. Sources are listed at the end. Where sources disagree or are dated, this document says so._

---

## 1. What FindMySpare is today

FindMySpare is an auto-parts marketplace for India. It connects **buyers** (car and bike owners, mechanics) with **verified suppliers** (parts shops and distributors). One backend serves three products:

| Surface | Stack |
|---|---|
| Backend | Bun + Elysia + Drizzle + Postgres (Nhost) + Socket.IO |
| Web | Next.js 16 |
| Mobile | Expo SDK 54 (iOS/Android) |

### What's built (from the code)

| Area | Status |
|---|---|
| Accounts: email/password, magic link, WhatsApp OTP, buyer/supplier/admin roles | ✅ Built |
| Supplier onboarding with GSTIN verification and admin approve/reject (with reasons) | ✅ Built |
| Product listings: images, specs, part number, warranty, `compatibleVehicles` (make/model/year as JSON) | ✅ Built |
| Supplier inventory: stock movements, low-stock threshold, draft products | ✅ Built |
| Search and browse by brand | ✅ Built (basic) |
| **Part requests ("inquiries")**: buyer posts part + make/model/year + photo, and suppliers see it live as a lead | ✅ Built |
| **Bids/quotes** on a request: price, condition, warranty months, ETA days | ✅ Built |
| Real-time chat: typing indicators, read receipts, attachments | ✅ Built |
| Orders, order items, disputes, notifications, addresses | 🟡 Schema and pages exist |
| Cart and checkout | 🟡 Pages exist |
| Payment | ⛔ Stubbed ("Payment is unavailable"). No gateway integrated |
| Escrow | 🟡 Table only (`held/released/refund_*`). Not wired to money |
| VIN / part-number / photo scanner | 🟡 UI mock only (simulated camera) |
| Admin: moderation, flagged content, banners, audit log, platform config, health | ✅ Built |

**In short:** FindMySpare today is a lead-gen and chat marketplace with a working reverse-auction flow (request → quotes). It can't yet take money, ship parts or guarantee fitment. Those three gaps separate it from a real marketplace.

---

## 2. The market: the prize is large and nobody has won it

| Fact | Number | Source |
|---|---|---|
| India auto-component aftermarket, FY25 (ACMA) | **₹99,948 crore**, +6% | ACMA via Business Today / Motor India |
| India aftermarket, FY26 (ACMA) | **₹1,08,453 crore (~$12.3B)**, +9% | ACMA via Autocar Pro |
| ACMA-EY forecast | $10B (2023) → $14B by 2028, covering only 7 categories (excludes tyres, batteries, lubes) | ACMA-EY |
| Two-wheelers vs cars on the road | ~25 crore 2W vs ~4.6 crore cars (2021); 2W fleet >5× cars | Upstox / MoRTH |
| Total registered vehicles | 400M+ (unverified blog figure) | indiadatamap |
| Used cars sold | ~5.5–5.9M in FY25, projected 9.5M by 2030 | S&P Global / Indian Blue Book |
| Light vehicles >3 years old (out of warranty) | ~40M (2022) → 55M+ (2034), about ⅔ of the parc | S&P Global Mobility |
| Customers who move to local garages after warranty | ~65% | Stellantis India |
| Share of 2W aftermarket that's unorganised | ~80% | GarageWorks / Entrepreneur (dated) |

**Ownership trend:** cars are being kept 4–5 years instead of 6–8, so more cars enter the used market. Each one leaves warranty, leaves the dealer and enters the independent-garage aftermarket. That's FindMySpare's market, and it grows every year.

### The competition is small

| Player | Model | Scale (latest found) |
|---|---|---|
| **Boodmo** | B2C/B2B catalog e-commerce, Gurugram, since 2015 | ~$12.5M raised; **FY24 revenue ₹18.1 crore** (Dealroom) |
| Koovers | B2B parts to workshops, Bengaluru | Acquired by Schaeffler India for ₹142.4 cr |
| SparesHub | B2B, Pune | ~$2.8M raised (Series A) |
| Garaaz | B2B, Jaipur | ~$692K seed (Jan 2025) |
| Amicco | B2B garage-procurement marketplace, Gurugram | $1M seed (Apr 2025) |
| Partnr | Mechanic app plus ~100 dark stores in 30 cities, 2-hour delivery | Company claims |
| GoMechanic Spares | Distributor outlets, expanding to Tier 2/3 | — |
| TruckParts | CV parts quick-commerce app | Single article |
| ONDC | Hero MotoCorp (May 2024) and Uno Minda (Sep 2024) sell parts on the network | Govt / press |
| Amazon / Flipkart | Generic e-commerce, weak fitment data | — |

Boodmo is the best-known pure-play brand, and after about 10 years its revenue is roughly ₹18 crore. That's **less than 0.02% of the market**. Nobody has digitised Indian spare parts yet. The prize is open.

Tracxn also reports a **79% drop in auto-components startup funding in 2026 vs 2025**. FindMySpare has to win on **capital efficiency**, not burn. That rules out a dark-store race with Partnr.

---

## 3. Problems people face (research findings)

### 3.1 Buyers: car/bike owners and mechanics

1. **"Which part fits my vehicle?"** (identification and fitment)
   - One model can have many variants, fuel types, model-year changes and part-number supersessions. Owners don't know part numbers. Mechanics identify parts by eye.
   - Wrong parts are the top complaint against online sellers. Boodmo reviews include *"delivered the wrong part (Maruti Track Control Arm)"*, *"ordered an oxygen sensor, they sent me a Harpic cleaner"* and *"product not compatible with the vehicle… not accepting the return"*.
   - Structured fitment data (TecDoc India, launched in 2020 with ACMA) exists but costs too much for small sellers to license.

2. **Fake and spurious parts**
   - Industry estimates put counterfeits at **36–47% of the replacement market** (SIAM 2008, ACMA 2012). These figures are dated, but nothing newer replaces them.
   - ACMA-EY links **~20% of road accidents** directly or indirectly to spurious parts.
   - A recent nine-city survey found **22% of respondents** had come across counterfeit spare parts.
   - Fakes are worst in two-wheelers, mainly filters, bearings, pistons and rings, and lubricants.

3. **Price opacity and overcharging**
   - The CCI (2014) found OEM spare-part markups **as high as 4,817%**. It fined 14 carmakers ₹2,544 crore for locking independent garages out of genuine parts. The Supreme Court later stayed the order, and the current status is unclear.
   - Owners have no reference price for a part, and mechanics add margin on parts they source.

4. **Availability and speed**
   - In Tier 2/3 towns, *"waiting for parts used to mean closing the shop for a whole day"* (Partnr). Mechanics *"lose hours running around for parts or risk losing customers"*.
   - Vehicle days off-road due to parts shortages averaged 11–16 days (R2C data via a secondary source; unverified).
   - Old, discontinued, imported and EV parts are the hardest to find. The EV parts ecosystem is described as *"unorganised"*.

5. **Bad transactions**
   - Non-returnable listings, slow or missing refunds, "unboxing video required" return rules, and sellers who go silent after payment.

### 3.2 Sellers: parts shops, distributors and wholesalers

1. **Offline and WhatsApp-run:** inventory lives in their heads, Tally/Busy/Marg billing software, or a notebook. Hubs like Kashmere Gate (Delhi) list on IndiaMART but take orders over WhatsApp and phone.
2. **No demand visibility:** a shop in Kashmere Gate can't see that a mechanic in Gorakhpur needs the part sitting on its shelf.
3. **Working capital strain:** sellers give mechanics credit (*udhaar*) and wait weeks to get paid.
4. **Digital catalogs are too much work:** listing thousands of SKUs with fitment data by hand isn't realistic for a small shop.
5. **Lead quality:** IndiaMART-style leads are often unqualified.

### 3.3 Mechanics and garages (the real buyers)

Independent garages handle **53–64% of car servicing**, and ~65% of owners move to them after warranty. Car owners rarely buy parts themselves; **the mechanic buys**. Mechanics need:

- **Speed** over price: a car waiting on a lift is lost money.
- **Credit**: they get paid after the customer collects the car.
- **GST invoices**: for input tax credit, especially for fleets.
- **Help with trust**: they're blamed when a fake part fails.

---

## 4. Strategy

### 4.1 Positioning

> **FindMySpare: any part, for any vehicle, from a verified seller, guaranteed to fit.**

The name is the strategy. Boodmo and Amazon do **catalog e-commerce**: they sell what's already listed. FindMySpare should own **finding**. You describe or photograph the part, and verified sellers compete to supply it. FindMySpare already has this request-and-quote engine, which none of the large players lead with.

This works in India because:
- Fitment data is incomplete for Indian vehicles, so a pure catalog can't cover the long tail. Human sellers who know their parts can.
- Sellers already sell this way on WhatsApp and phone. FindMySpare makes it structured, multi-seller, competitive and protected.
- **Every fulfilled request creates fitment data:** "Part X from seller Y fitted a 2019 Swift VXi petrol, confirmed by the buyer." Over time this builds India's best fitment graph without paying for TecDoc. That graph then powers instant catalog search.

### 4.2 Flywheel

```
More requests  ──►  More sellers join (free qualified demand)
     ▲                         │
     │                         ▼
Better fitment   ◄──  Faster, cheaper quotes; higher fill rate
graph + trust               │
     ▲                         ▼
     └────── Confirmed-fit orders and ratings ◄──── Buyers return
```

### 4.3 Who to serve, in order

1. **Mechanics and independent garages (Pro)**: highest frequency (several parts a day), the real decision-makers, and they bring their customers.
2. **Two-wheeler owners and DIY buyers**: the 2W fleet is 5× cars, and many parts are cheap and DIY-friendly. Mass reach, brand building.
3. **Car owners**: price checks, verified parts, and "find a mechanic to fit it".
4. **Fleets: taxis, logistics, buses and EV fleets**: high-value, recurring and invoice-driven.
5. **Verticals:** EV, commercial vehicles, tractors, used/recycled parts from scrapping facilities, vintage/discontinued parts.

### 4.4 Geography: "hub supply, Bharat demand"

Supply is concentrated in wholesale hubs (Kashmere Gate and Naiwala/Karol Bagh in Delhi, Pudupet in Chennai, J.C. Road in Bengaluru, and similar). Demand is everywhere, and **the pain is worst in Tier 2/3 towns**.

- **Phase 1:** go deep in one hub city on both sides (e.g. Delhi NCR, the country's largest parts hub).
- **Phase 2:** keep hub sellers and ship to Tier 2/3 within 24–72 hours via courier aggregators. Add hub cities one at a time.
- **No dark stores early on.** Use sellers' own shelves as a "virtual warehouse" and on-demand bike couriers for same-day metro delivery. Dark stores only come later, for proven high-velocity SKUs.

### 4.5 Business model

| Revenue line | When |
|---|---|
| **Take rate** on transactions: 5–12% by category | Once payments are live |
| **Seller subscriptions** (Free / Pro / Elite): lead priority, more quotes per day, analytics, multiple users | Phase 1 |
| **Promoted listings and quote boosts** | Phase 2 |
| **FMS Assured fulfilment fee**: inspection, authentic-part check, protected returns | Phase 2 |
| **Embedded finance**: mechanic BNPL and seller working capital through an NBFC partner (FMS earns a referral/interest share) | Phase 2–3 |
| **Logistics margin** on aggregated shipping | Phase 2 |
| **Brand partnerships**: authorised brand stores (Bosch, Uno Minda, etc.), demand insights for manufacturers | Phase 3 |

### 4.6 Moats

1. **Fitment graph** built from confirmed transactions. This is the most valuable asset and the hardest to copy.
2. **Seller liquidity:** a request in any city gets three or more quotes in under 15 minutes.
3. **Trust layer:** seller scorecards, authenticity checks and the FMS guarantee.
4. **Mechanic workflow lock-in:** credit line, job cards and estimates, purchase history.

### 4.7 Biggest risk: disintermediation

Buyer and seller meet in chat and then move the deal to WhatsApp. **This is the #1 way marketplaces like this die.** Countermeasures:
- Mask phone numbers in chat. Block number and UPI-ID sharing before an order (with warnings).
- Buyer protection, returns, credit and ratings **only apply to on-platform orders**.
- For sellers, FMS must bring new customers the seller couldn't reach otherwise (out-of-city demand), so leaving costs them more than the fee.
- Keep take rates low on repeat pairs, or offer a subscription instead.

### 4.8 Other risks

| Risk | Mitigation |
|---|---|
| Counterfeit liability | Seller KYC tiers, part-type labels, brand verification, fast takedowns, penalties |
| Compliance: Consumer Protection (E-Commerce) Rules 2020, GST TCS / Income Tax TDS as e-commerce operator, IT Act intermediary rules | Show seller details and country of origin, appoint a grievance officer, automate TCS/TDS reports |
| Funding winter | Revenue from day one (subscriptions plus take rate). No dark stores, no blanket discount burn |
| OEM pushback | Lead with OES and branded aftermarket parts. Partner with OEM dealers as sellers (they have surplus stock) |
| Low seller digital literacy | WhatsApp-first seller flows, Hindi/regional UI, field onboarding team |

---

## 5. Roadmap

### Phase 0: Make it a real marketplace (0–3 months)
- Payments: gateway with marketplace split settlement. Wire the existing `escrow_transactions` to real money.
- Shipping aggregator integration: pickup from seller, tracking, returns/RTO handling.
- GST invoice generation (B2C and B2B with buyer GSTIN).
- **Fitment data model** (see §7): normalised vehicles, part master and cross-references.
- **WhatsApp request bot:** "Send a photo + your vehicle number → get quotes."
- Vehicle lookup by registration number (consented) and a working VIN/part-number OCR, replacing the mock scanner.
- Return policy and the FMS Buyer Protection promise.
- Analytics: funnel from request → quote → order → delivered → fit confirmed.

### Phase 1: Win one city (3–9 months)
- Field team onboards **500 sellers** and **3,000 mechanics** in one hub city.
- Launch FMS Pro for mechanics: trade pricing, GST invoices, repeat orders.
- Targets: **time to first quote < 15 min**, **request fill rate > 70%**, **wrong-part rate < 2%**, mechanics ordering at least weekly.

### Phase 2: Hub supply to Bharat demand (9–24 months)
- 5–10 hub cities. Ship to 500+ Tier 2/3 towns.
- Mechanic credit line (NBFC partner), seller working capital.
- FMS Assured, seller subscriptions, promoted listings.
- ONDC seller-side integration, which gives FMS sellers reach through other buyer apps.
- Billing software inventory sync (Tally/Busy/Marg).

### Phase 3: Category leader (24–48 months)
- Verticals: EV, CV/fleet (purchase orders, approvals, monthly billing), tractors and farm equipment, **graded used/recycled parts** sourced from registered vehicle scrapping facilities (RVSFs, 84–117 registered), vintage/discontinued "concierge hunt".
- Garage SaaS: job cards, customer estimates, service reminders.
- Brand stores and demand insights for manufacturers.
- Open API so garage software and fleet tools can order through FMS.

### North-star metric
**Parts requests fulfilled and confirmed-fit per week.** GMV follows from this. It captures liquidity, fitment quality and trust in one number.

---

## 6. Full feature list

Legend: ✅ built · 🟡 partial · 🆕 new. Priority: **P0** = Phase 0–1, **P1** = Phase 2, **P2** = Phase 3.

### A. Find the right part (discovery and fitment)
| Feature | Status | Priority |
|---|---|---|
| Text search and browse by brand | ✅ | — |
| **"My Garage"**: save your vehicles, then all results filter to parts that fit | 🆕 | P0 |
| **Vehicle number lookup** → make/model/variant/fuel/year (consented) | 🆕 | P0 |
| VIN scan and decode (real OCR, replacing the mock) | 🟡 | P0 |
| Part-number search with OEM ↔ OES ↔ aftermarket **cross-reference** and supersessions | 🆕 | P0 |
| **"Verified Fit" badge**: "Fitted on 142 Swift VXi 2019 — confirmed by buyers" | 🆕 | P0 |
| **AI photo identify**: snap the old part to get the part name, likely part numbers and matching listings | 🆕 | P1 |
| Hindi + regional language UI, **voice search** ("Swift ka front brake pad") | 🆕 | P1 |
| Exploded diagrams (EPC-style) for top 50 models | 🆕 | P2 |
| Service kits: "40,000 km service kit for Activa 6G" | 🆕 | P1 |

### B. Request and quote (the core differentiator)
| Feature | Status | Priority |
|---|---|---|
| Post a part request: part, make/model/year, photo | ✅ | — |
| Live leads to suppliers | ✅ | — |
| Quotes with price, condition, warranty, ETA | ✅ | — |
| **Request via WhatsApp** (photo or voice note) | 🆕 | P0 |
| **Smart routing**: send each request only to sellers matching brand, category, location and past performance | 🆕 | P0 |
| Multi-part requests: a mechanic's job-card list in one request | 🆕 | P0 |
| Compare quotes side by side: part type (Genuine OEM / OES / Branded aftermarket / Used / Refurbished), brand, seller score, delivery | 🟡 | P0 |
| Quote SLA timers, seller nudges, auto-expiry | 🆕 | P0 |
| Accept a quote → one-tap checkout | 🆕 | P0 |
| **Concierge hunt** for rare/discontinued parts (paid) | 🆕 | P2 |

### C. Trust and safety
| Feature | Status | Priority |
|---|---|---|
| GSTIN-verified sellers, admin approval | ✅ | — |
| Disputes, moderation, audit log | ✅ | — |
| **Seller tiers**: GST → KYC → shop visit → "FMS Verified" | 🆕 | P0 |
| **Seller scorecard**: fill rate, response time, wrong-part %, dispatch time, ratings | 🆕 | P0 |
| Ratings and reviews tied to delivered orders only | 🆕 | P0 |
| **FMS Buyer Protection**: money held until delivery; wrong part = free pickup and refund | 🟡 (escrow schema) | P0 |
| **Masked phone numbers**, contact-sharing detection in chat | 🆕 | P0 |
| Dispatch photos (part + box + label) taken in the seller app | 🆕 | P0 |
| Brand authenticity check: scan brand QR/hologram, brand-authorised seller badge | 🆕 | P1 |
| Counterfeit reporting and fast takedown | 🟡 (flagged content exists) | P1 |
| Fraud/risk scoring for COD, returns abuse and fake sellers | 🆕 | P1 |

### D. Checkout, payments and logistics
| Feature | Status | Priority |
|---|---|---|
| Cart and checkout pages | 🟡 | — |
| **Payment gateway**: UPI, cards, netbanking, wallets; marketplace split settlement | ⛔ | P0 |
| COD with prepaid nudges (discount for UPI) | 🆕 | P0 |
| **GST invoice** auto-generated; B2B invoice with buyer GSTIN | 🆕 | P0 |
| Shipping aggregator: pickup, tracking, RTO | 🆕 | P0 |
| Same-day local delivery via on-demand bike couriers | 🆕 | P1 |
| Returns workflow and reverse pickup | 🆕 | P0 |
| Seller payouts (T+N), settlement reports | 🆕 | P0 |
| Order tracking with WhatsApp updates | 🆕 | P0 |

### E. FMS Pro for mechanics and garages
| Feature | Status | Priority |
|---|---|---|
| Pro account: trade pricing, GST invoices, order history, quick reorder | 🆕 | P0 |
| **Job card and customer estimate**: parts + labour, shared to the car owner on WhatsApp | 🆕 | P1 |
| **Credit line / pay later** (15/30 days) via NBFC partner | 🆕 | P1 |
| Loyalty cashback and mechanic referral rewards | 🆕 | P1 |
| Garage listing, so car owners can find a verified mechanic to fit parts | 🆕 | P1 |
| Multiple staff users per garage | 🆕 | P1 |
| EV repair training content and diagnostics partners | 🆕 | P2 |

### F. Seller (supplier) tools
| Feature | Status | Priority |
|---|---|---|
| Product listing, inventory, stock movements, drafts | ✅ | — |
| Leads feed, real-time chat | ✅ | — |
| **Quote from WhatsApp** (reply to a lead without opening the app) | 🆕 | P0 |
| **Bulk upload** (Excel/CSV), auto-fill from part number | 🆕 | P0 |
| **AI photo-to-listing**: photograph a part, get title, category, specs and fitment suggestions | 🆕 | P1 |
| **Billing software sync** (Tally/Busy/Marg) for live stock | 🆕 | P1 |
| **Demand insights**: "120 requests for Creta clutch plates in Lucknow this week" | 🆕 | P1 |
| Price suggestions based on winning quotes | 🆕 | P1 |
| Subscription plans, promoted listings, quote boosts | 🆕 | P1 |
| Multiple users, multiple branches | 🆕 | P1 |
| Working capital / inventory finance | 🆕 | P2 |
| ONDC seller integration | 🆕 | P1 |

### G. Car and bike owners
| Feature | Status | Priority |
|---|---|---|
| **Fair price check**: compare against MRP and the platform's median price | 🆕 | P0 |
| Service reminders by vehicle and km | 🆕 | P1 |
| "Buy part + book a mechanic to fit it" bundle | 🆕 | P1 |
| DIY guides and videos (SEO engine) | 🆕 | P1 |
| Accessories, tyres, batteries, lubricants | 🆕 | P1 |

### H. Verticals
| Feature | Priority |
|---|---|
| EV parts and batteries (2W/3W/4W), EV fleet accounts | P1 |
| Commercial vehicles: fleet accounts, POs, approvals, monthly invoices | P2 |
| Tractors and farm equipment | P2 |
| **Used/recycled parts** from RVSFs and salvage yards, with condition grading (A/B/C) and a short warranty | P2 |
| Vintage, imported and discontinued parts concierge | P2 |

### I. Platform, admin and growth
| Feature | Status | Priority |
|---|---|---|
| Admin console: users, suppliers, products, inquiries, banners, config, health | ✅ | — |
| **Field sales app**: onboard sellers in-shop, capture KYC, bulk-photo the shelf | 🆕 | P0 |
| SEO pages: "{part} for {model} price in {city}", which are huge long-tail traffic | 🆕 | P0 |
| Event analytics and funnel dashboards | 🆕 | P0 |
| AI catalog normaliser (deduplicate "Swift brk pad frnt" vs "Brake Pad Front Swift") | 🆕 | P1 |
| AI support agent (order status, returns) in chat and WhatsApp | 🆕 | P1 |
| Public API for garage software and fleets | 🆕 | P2 |

---

## 7. Technical recommendations for this codebase

1. **Normalise fitment data.** `products.compatibleVehicles` is free-form JSON (`{make, model, year?}`). That can't be queried well, can't handle variants or fuel type, and drifts in spelling. Add:
   - `vehicle_makes`, `vehicle_models`, `vehicle_variants` (fuel, engine, transmission, year_from, year_to, segment: 2W/3W/PV/CV/tractor)
   - `parts` (canonical part master: name, category, OEM numbers)
   - `part_numbers` / `part_cross_refs` (OEM ↔ OES ↔ aftermarket, supersessions)
   - `fitments` (part ↔ variant, with `source` = catalog / seller / buyer-confirmed, plus a confidence score)
   - `products` become **listings**: a seller's offer of a canonical part (price, stock, condition)
2. **Link requests to the vehicle model.** `inquiries` takes free-text make/model/year. Link it to `vehicle_variant_id`, support several items per request, and add `vehicle_reg_no` and `vin`.
3. **Enrich quotes.** `bids.condition` is a free varchar. Make it an enum (`genuine_oem`, `oes`, `aftermarket_branded`, `used`, `refurbished`) and add `brand`, `part_number` and `photos`.
4. **Close the fitment loop.** After delivery, ask the buyer "Did it fit?" and write a confirmed `fitments` row.
5. **Search.** Move from SQL `LIKE` to Postgres `pg_trgm` + full-text first, then a dedicated engine (Typesense/Meilisearch) with synonyms (Hindi/Hinglish), part-number normalisation and vehicle filters.
6. **Payments.** Wire `escrow_transactions` to a gateway's marketplace/route settlement. Release funds on delivery + N days or on "fit confirmed".
7. **WhatsApp Business API** as a first-class channel for login (already used for OTP), requests, quotes and order updates.
8. **Contact masking** in `messages`: detect phone numbers, UPI IDs and links before an order exists.

---

## 8. 90-day action list

1. Integrate the payment gateway and escrow. Launch FMS Buyer Protection.
2. Integrate shipping. Launch the returns policy.
3. Ship the fitment data model and the "Did it fit?" loop.
4. Launch the WhatsApp request bot and quote-from-WhatsApp for sellers.
5. Add vehicle-number lookup and My Garage.
6. Pick the launch city. Hire 3–5 field agents. Onboard the first 200 sellers and 1,000 mechanics.
7. Launch FMS Pro (GST invoices, trade pricing).
8. Generate SEO pages for the top 200 models × top 100 parts.
9. Build a dashboard for time-to-first-quote, fill rate, wrong-part rate and repeat rate.

---

## Sources

- ACMA FY25: [Business Today](https://www.businesstoday.in/auto/story/domestic-auto-component-industry-grows-10-in-fy25-acma-483592-2025-07-08), [Motor India](https://www.motorindiaonline.in/indian-auto-component-sector-nearly-doubles-in-5-years-hits-%e2%82%b96-73-lakh-crore-turnover-in-fy25/)
- ACMA FY26: [Autocar Pro](https://www.autocarpro.in/news/acma-indian-auto-component-industry-grows-127-percent-to-inr-76-lakh-crore-in-fy26-133454?amp=1), [Motor India](https://www.motorindiaonline.in/indian-auto-component-industry-grows-12-7-to-inr-7-6-lakh-crore-in-fy2025-26/)
- ACMA-EY aftermarket study: [Autocar Pro](https://autocarpro.in/news/indias-automotive-aftermarket-is-likely-to-grow-to-usd-14-billion-by-2028-acma-ey-study-118910)
- Ken Research aftermarket estimate: [Ken Research](https://www.kenresearch.com/industry-reports/india-automotive-aftermarket-market)
- S&P Global FY25 aftermarket: [S&P Global](https://aftermarketinsight.spglobal.com/news/4559/indias-automotive-aftermarket-sales-growth-slows-in-fy-2025)
- Boodmo: [Dealroom](https://app.dealroom.co/companies/boodmo), [Autocar Pro](https://autocarpro.in/news-national/online-auto-spares-marketplace-boodmo-raises-rs-15-crore-55918), [Trustpilot](https://it.trustpilot.com/review/boodmo.com), [Voxya complaint](https://voxya.com/consumer-complaints/incompatible-item-delivered-and-not-accepting-the-return/239506)
- Koovers / Schaeffler: [Venture Intelligence](https://news.ventureintelligence.com/private-equity/schaeffler-india-to-acquire-b2b-auto-spare-parts-platform-koovers-for-rs.142-cr), [Entrepreneur](https://india.entrepreneur.com/?p=34039)
- B2B auto parts landscape: [Tracxn](https://tracxn.com/d/trending-business-models/startups-in-b2b-auto-spare-parts/__xfHG-ux-13uS-abpT2gYVGwj_KQIKBxMy82PV3NA3BI), [Amicco seed – Autocar Pro](https://www.autocarpro.in/news/amicco-raises-$1-million-to-transform-automotive-spare-parts-sourcing-125807)
- Counterfeits: [Autocar Pro – fakes](https://www.autocarpro.in/feature/fake-fake-3402), [ACMA/SIAM](https://www.autocarpro.in/analysis-report/acma-siam-challenge-spurious-4731), [Counterfeit survey](https://www.autocarpro.in/news/one-in-three-indians-encountered-counterfeit-products-in-the-past-year-survey-finds-131654?amp=1)
- CCI vs carmakers: [Bar & Bench](https://www.barandbench.com/news/cci-imposes-rs-2544-crore-fine-14-car-manufacturers), [SC stay](https://www.barandbench.com/news/supreme-court-stays-compat-order-car), [Motor Authority](https://www.motorauthority.com/news/1094069_india-fines-carmakers-for-violating-anti-trust-laws), [iPleaders](https://blog.ipleaders.in/right-repair-india/)
- Mechanics' sourcing pain: [YourStory – Partnr](https://yourstory.com/2025/10/digitising-local-garages-how-partnr-is-empowering-unorganised-mechanics), [FreightFox](https://freightfox.ai/blog/4d-strategy-for-aftermarket-spare-part-supply-chain-visibility)
- Unorganised 2W aftermarket: [Entrepreneur](https://india.entrepreneur.com/news-and-trends/heres-why-indias-two-wheeler-aftersales-market-needs-a/341300), [YourStory – GarageWorks](https://yourstory.com/2022/04/pune-b2c-startup-doorstep-repair-maintenance-two-wheelers-garageworks/amp)
- Independent garage share: [Mahindra ServoXpert](https://www.mahindra.com/news-room/press-release/en/digitizing-independent-garages-in-automotive-service-industry-with-servoxpert), [S&P Global – Stellantis](https://aftermarketinsight.spglobal.com/main/news/view/printer-friendly?id=4320)
- Vehicle parc: [Upstox](https://upstox.com/news/business-news/economy/how-two-wheelers-outpaced-cars-on-indian-roads-since-independence/article-198622/), [indiadatamap](https://indiadatamap.com/2025/11/15/indias-vehicles-ownership-per-state/)
- Used cars: [S&P Global](https://aftermarketinsight.spglobal.com/news/4903/indias-pre-owned-car-market-projected-to-grow-to-95-million-units-by-2030-study), [Storyboard18](https://storyboard18.com/how-it-works/indias-used-car-boom-rs-4-lakh-crore-market-grows-faster-than-new-vehicles-set-to-triple-by-2030-76392.htm), [IMARC](https://imarcgroup.com/india-used-car-market)
- EV parts: [Autocar Pro – Zypp/Mechanifyspares](https://autocarpro.in/news-national/zypp-electric-partners-mechanifyspares%c2%a0for-aftersales-support-80944)
- Fitment / TecDoc India: [Autocar Pro – TecAlliance](https://www.autocarpro.in/news-national/tecalliance-eyes-slice-of-india-business-at-auto-expo-components-show-55417?amp=1), [Prodexa](https://prodexa.com/en/kb/fitment-data-provider/), [ChannelX](https://channelx.world/2019/12/optiseller-give-cost-effective-tecdoc-catalogue-access-for-auto-parts-traders/)
- Scrappage / RVSF: [BigMint](https://bigmint.co/insights/detail/indias-vehicle-scrappage-policy-picks-up-pace-what-lies-ahead-455796), [ICRA](https://icra.in/Rating/DownloadResearchSummaryReport?id=5958)
- ONDC auto parts: [MediaNama – Hero](https://www.medianama.com/2024/05/223-hero-motocorp-joins-ondc-hyperlocal-sales-motorcycle-parts/), [Autocar Pro – Uno Minda](https://autocarpro.in/news/uno-minda-partners-with-ondc-to-expand-digital-reach-122622), [IndBiz](https://indbiz.gov.in/ondc-hits-new-milestone-with-12-million-orders-in-july)
- CV parts: [Digital Commerce 360 – Daimler](https://www.digitalcommerce360.com/2025/02/10/daimler-truck-launches-b2b-marketplace/), [Motor India – TruckParts](https://www.motorindiaonline.in/truckparts-revolutionizing-aftermarket-parts-trade-through-quick-commerce/)
- Delhi hub listings: [IndiaMART – Motor Udyog](https://m.indiamart.com/motor-udyog/engine-mounting.html)
