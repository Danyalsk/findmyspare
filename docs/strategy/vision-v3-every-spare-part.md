# FindMySpare v3: India's Spare-Parts Network for Every Machine

> **Every spare part, for every machine, from every link in the chain.**
> Cars and bikes are where we start, not where we stop. Pumps, motors, ACs, generators, tractors, bearings, hydraulics, phones, boats: anything with a part that wears out.

---

## 1. Why the current app feels "stuck"

| Problem | Root cause | Fix in v3 |
|---|---|---|
| Supplier opens the app and has nothing to do | The app is **reactive**: useful only when an inquiry or order arrives | Every role gets a **daily business tool** (billing, stock, credit book, purchase orders) that's useful even with zero marketplace demand |
| Buyer comes once, buys, leaves | Only one job: "buy a part" | Buyers also: book a technician, track their machines, reorder, get reminders, sell used parts, buy in bulk |
| Feels generic | Auto-parts only, one-to-one buyer↔seller, template screens | A **multi-tier network** (manufacturer → super stockist → distributor → wholesaler → retailer → technician → customer), Swiggy-style super-app UX, live data everywhere |
| Fake numbers on the supplier dashboard | Hardcoded placeholders ("42 quotes", "67% win rate") | Every number comes from real data; empty states tell you what to do next |

**Design rule:** *nobody should ever open FindMySpare and find nothing to do.*

---

## 2. The big idea: one network, every machine, every link

```
 RAW MATERIAL ─► MANUFACTURER ─► C&F / SUPER STOCKIST ─► DISTRIBUTOR ─► WHOLESALER ─► RETAILER / SHOP
                      │                                                                      │
                      ▼                                                                      ▼
               BRAND PORTAL                                      TECHNICIAN / GARAGE / SERVICE CENTRE
          (authenticity, warranty,                                           │
           secondary-sales data)                                             ▼
                                                     END CUSTOMER (home, business, factory, fleet, farm)
                                                                             │
                                                                             ▼
                                                     REFURBISHER / SCRAP / RECYCLER ──► back into the chain
```

Today each arrow is a phone call, a WhatsApp message, a paper bill and a credit notebook. **FindMySpare turns every arrow into a transaction on one network.** The platform carries the order, invoice, payment, credit, delivery, warranty and record. Every participant becomes both a buyer and a seller.

### Industries (verticals), all on one engine

| # | Vertical | Example machines | Example parts | Who repairs |
|---|---|---|---|---|
| 1 | **Automotive** | Car, bike, scooter, truck, bus, e-rickshaw, EV | Brakes, clutch, filters, batteries | Garages, mechanics |
| 2 | **Water & pumps** | Submersible / monoblock / borewell / solar pumps, water motors | Impellers, windings, capacitors, seals, starters | Pump mechanics, motor rewinders |
| 3 | **Electrical & motors** | Industrial motors, starters, panels, transformers | Bearings, coils, contactors, relays | Electricians, rewinding shops |
| 4 | **Home appliances** | AC, fridge, washing machine, geyser, mixer, fan | Compressors, PCBs, motors, gas | AC/appliance technicians |
| 5 | **Power & backup** | Gensets, inverters, UPS, solar | Batteries, AVRs, controllers, panels | Electricians, solar installers |
| 6 | **Agriculture** | Tractors, harvesters, sprayers, drip systems | Gearbox parts, nozzles, pumps, blades | Rural mechanics |
| 7 | **Industrial MRO** | CNC, compressors, hydraulics, pneumatics, conveyors | Bearings, belts, seals, valves, cylinders | Plant maintenance teams |
| 8 | **Construction equipment** | JCB/backhoe, mixers, cranes | Hydraulic pumps, teeth, filters | Field service engineers |
| 9 | **Electronics & mobiles** | Phones, laptops, TVs, CCTV | Screens, batteries, boards, ports | Repair shops |
| 10 | **Marine & others** | Boats, outboard motors, medical, textile and printing machinery | Propellers, impellers, specialised parts | Specialists |

Same engine, different taxonomy. Adding an industry is **configuration, not new code**.

---

## 3. Universal data model (what makes "everything" possible)

| Entity | What it is | Generalises today's… |
|---|---|---|
| **Industry → Machine type → Brand → Model → Variant** | Universal taxonomy (e.g. Water & pumps → Submersible pump → Kirloskar → KS4 → 1 HP) | `vehicle_makes/models/variants` |
| **Asset** | One specific machine someone owns (car MH12…, pump at a farm, factory compressor), identified by plate / VIN / serial no. / QR | `vehicles` |
| **Asset Passport** | Lifetime service, parts, warranty and invoice record of any asset | Vehicle Passport |
| **Part** | Canonical part with OEM numbers, cross-references, specs and fitment to models | `products` + `fitments` |
| **Listing** | A business's offer of a part: price per tier, stock, MOQ, lead time | `products` |
| **Business** | Any organisation with **one or many roles**: manufacturer, super stockist, distributor, wholesaler, retailer, service centre, technician, refurbisher, recycler, logistics, buyer business | `users.role` (single role) |
| **Relationship** | Who supplies whom, credit limit, price list, scheme, territory | *(new)* |
| **Trade** | Any transaction between two parties: retail order, B2B purchase order, RFQ/quote, consignment, return | `orders` + `bids` |
| **Job** | Any service: repair, installation, AMC visit | Job cards |
| **Proof** | Verifiable invoices, warranty cards, authenticity checks | Verifiable invoices |

---

## 4. Every role gets a reason to open the app every day

### Manufacturers / brands: **Brand Portal**
- Product master with OEM numbers, specs and fitment, which flows to every distributor's catalog.
- **Secondary-sales visibility:** what sold where, through which distributor.
- Scheme and price-list management per tier and territory.
- QR authenticity on every box (scan to verify, fights fakes), plus warranty registration and claims.
- Technician loyalty: points when a mechanic scans a genuine part they fitted.
- Demand intelligence: what people search for that nobody stocks.

### Super stockists / C&F / distributors / wholesalers: **Distribution OS**
- **Purchase orders upward** (to brands) and **sales orders downward** (from retailers), with tier-wise pricing.
- **Retailer ordering app:** their shops reorder from them on FindMySpare instead of over phone calls.
- **Salesman beat app:** visits, orders and collections on the route.
- **Credit and collections:** limits, ageing, UPI collection links, reminders.
- Godown stock, batches, multi-branch, e-way bills, GST e-invoicing.
- Territory dashboard: retailers served, fill rate, overdue amounts.

### Retailers / parts shops: **Shop OS** (the fix for "I'm stuck")
- **POS billing in 10 seconds:** scan or search, GST bill, WhatsApp the bill. Stock updates itself.
- **Khata (credit book):** what each mechanic owes, with auto reminders.
- **Reorder from my distributor** in one tap when stock runs low.
- **Demand radar:** "23 people near you searched for 1 HP pump capacitors this week. You have 0 listed."
- **Catalog from photos:** snap the shelf and AI creates the listings.
- **Your own storefront link** (findmyspare.com/s/your-shop) to share on WhatsApp.
- Daily cash report, profit by category.
- Marketplace inquiries and quotes are an extra on top, not the only reason to open the app.

### Technicians, mechanics, service centres: **Service OS** (today's Workshop, for every industry)
- Job cards, estimates, invoices, verifiable QR and UPI collection, for a car garage, AC technician, pump mechanic or motor rewinder alike.
- **Get jobs:** customers nearby book a technician for their AC, pump, bike or genset.
- Source parts in-job (quotes from shops near the customer).
- Skill profile, ratings, certifications, training (EV, inverter AC, solar).

### Buyers: a **Swiggy-style super app** for end customers and business buyers
- **Shop:** every category, every industry.
- **Quick:** express delivery from nearby shops.
- **Fix:** book a technician.
- **Quotes:** ask sellers to compete on a part.
- **My machines:** Asset Passport for car, bike, pump, AC, genset, with reminders and warranties.
- **Business buyers (factories, fleets, farms, housing societies):** bulk RFQ, GST input credit, approvals, monthly credit terms, consolidated invoices.
- Reorder in one tap, compare sellers, track live.

### Refurbishers, scrap yards, recyclers: **Second Life**
- List graded used and remanufactured parts (A/B/C grade, short warranty).
- Core-return programmes: old alternator, compressor or motor back for credit.
- Battery and e-waste recycling pickups.

### Logistics partners
- Last-mile riders and intercity transporters pick up parcels between any two businesses.
- Milk-runs: distributor → 30 retailers in one route.

### Lenders and insurers (partners)
- Credit lines for retailers, technicians and buyers, underwritten on real platform data.
- Extended warranties and equipment protection sold at checkout.

---

## 5. The admin super-console ("cover everything")

| Module | What it controls |
|---|---|
| **Taxonomy studio** | Industries, machine types, brands, models, part categories, attributes per category (HP for pumps, tonnage for ACs, CC for bikes) |
| **Catalog moderation** | AI duplicate merging, OEM cross-reference review, image and spec quality, banned and counterfeit items |
| **Participant verification** | KYC queues per role (GST, PAN, trade licence, brand authorisation letters), tiers (Basic → Verified → Gold) |
| **Network map** | Who supplies whom, by territory; gaps (districts with no pump-parts seller) |
| **Commerce controls** | Commission by category and tier, delivery fees, promotions, coupons, schemes |
| **Money** | Payments, escrow, payouts, refunds, credit exposure, reconciliation, GST TCS/TDS reports |
| **Trust and safety** | Disputes, returns, fraud and risk scores, counterfeit reports, takedowns |
| **Logistics** | Couriers, rider fleet, SLAs, failed deliveries |
| **Growth** | Banners, home-page layout per city, campaigns, WhatsApp broadcasts, referral |
| **Markets** | Launch cities and industries, feature flags per market |
| **Analytics** | North star per vertical, funnel, cohort, seller performance, demand heatmaps, search-with-no-result report |
| **Support desk** | Tickets, chats, call logs, SLA |
| **Team and permissions** | Role-based admin access (ops, finance, catalog, support), audit log |

---

## 6. UX: Swiggy-style, **not orange**

What we take from Swiggy:
- Location-first header.
- **Super-app tiles** (Food / Instamart / Dineout → **Shop / Quick / Fix / Quotes**).
- "What's on your mind?" round category carousel.
- Offer banners, filter chips, rich cards with rating, delivery time and price.
- The **ADD → stepper** button and the sticky green cart bar.
- Live order tracking and one-tap reorder.
- Bottom tab bar on mobile.

What we don't take: the orange. The current vermilion still reads orange, and you said no. Section 9 has three non-orange palettes to choose from.

Each role gets its own **mode** with a Swiggy-clean home:
- **Buyer:** tiles, categories, "for your machines", deals, reorder.
- **Business (any supplier tier):** today's tasks (bills to send, stock low, orders to pack, credit due), demand radar, quick actions (New bill, Reorder, Add stock, Collect payment).
- **Technician:** today's jobs, nearby job requests, earnings.

---

## 7. How the network connects (the engine)

1. **Need → routing.** A buyer, technician or factory needs a part. The routing engine finds it by fitment, stock, distance, rating and price across **every tier's live inventory**. Retailer first (fast); if nobody has it, the distributor; then the manufacturer.
2. **Multi-hop fulfilment.** If the retailer doesn't stock it, the platform auto-raises a purchase order to their distributor, and the part travels distributor → retailer → customer, with every hop invoiced and paid on FindMySpare.
3. **Trust graph.** Verified businesses, ratings on every trade, confirmed fitments, authentic QR scans.
4. **Money layer.** UPI and cards, escrow, B2B credit terms, automatic GST invoices, payouts.
5. **Proof layer.** Every part fitted lands in an Asset Passport, so warranty, resale and insurance all work.
6. **AI layer:**
   - Identify a part from a photo, a voice note in Hindi, or an old part's label.
   - Diagnose from symptoms.
   - Auto-catalog listings.
   - Suggest prices.
   - Forecast demand for distributors.

---

## 8. Phased plan (think big, launch narrow, expand by adjacency)

**"Bigger than Amazon"** is the destination. The way there is to win specific chains completely, then copy the playbook. IndiaMART (leads), Moglix/Industrybuying (industrial MRO), Udaan (B2B retail) and Boodmo (auto) each own a slice. **Nobody connects the whole chain plus service plus the asset record.**

| Phase | Time | Build | Win condition |
|---|---|---|---|
| **A: Foundation** (next build) | 0–2 mo | New non-orange brand palette, universal taxonomy (industries → models → parts), multi-role businesses, Shop OS (billing, khata, stock, reorder), Swiggy-style buyer super-app, Service OS for any technician, admin super-console v1, remove fake stats | A shop or technician uses it daily **with zero marketplace orders** |
| **B: Chain** | 2–6 mo | Distribution OS (tiered price lists, POs up/down, retailer ordering, credit and collections, salesman beat app), routing engine across tiers, real payments | One distributor and 50 of their retailers ordering through FindMySpare |
| **C: Brand and trust** | 6–12 mo | Brand Portal, QR authenticity, warranty claims, technician loyalty, logistics milk-runs, lending partner | A brand sees live secondary sales; fake-part reports drop |
| **D: Every industry** | 12–24 mo | Verticals 2–7 switched on (pumps, electrical, appliances, power, agri, industrial MRO), business-buyer procurement, ONDC | 5+ industries with all chain tiers |
| **E: Platform** | 24+ mo | Open APIs, financing at scale, Second Life marketplace, export (SE Asia, Middle East, Africa) | Third parties build on FindMySpare |

**Launch wedge (recommended):** automotive (already built) + **water pumps & motors** + **ACs & appliances**. Same retailer often stocks pump and motor parts; technicians cross over; huge in Tier 2/3 and rural India; the seasonal peaks complement each other (summer AC, monsoon pumps, year-round vehicles).

---

## 9. Decisions needed before the build

1. **Brand colour** (no orange):
   - **Electric Indigo** `#4F46E5`: confident, techy, distinct from Swiggy and Zomato.
   - **Deep Teal** `#0F766E`: trustworthy, industrial, calm.
   - **Royal Blue** `#1D4ED8`: classic, B2B-safe, but common.
2. **Industries in Phase A:** automotive + pumps & motors + appliances (recommended), or all 10 at once (wider but shallower catalogs).
3. **Scope of the next build:** full Phase A, which is large. Real payments come in Phase B unless Razorpay keys arrive earlier.
