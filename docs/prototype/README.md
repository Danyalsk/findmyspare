# FindMySpare v3: Working Prototype Walkthrough

Web-only, end-to-end prototype of the plans in `docs/strategy/` (v3: `vision-v3-every-spare-part.md`). It covers spare parts for **every machine in 10 industries**, a **supply-chain network** (raw material → manufacturer → super stockist → distributor → retailer → technician → customer), **Fix** (book a technician for any machine), the marketplace, request-and-quote, Workshop OS, machine passports and verifiable invoices, all on the **"Nut Lens"** brand.

**Payments are mocked.** Nothing touches a real gateway or real money. The whole journey below is automated in `e2e/journey.mjs`, and every screenshot here comes from that run against a fresh database.

---

## Run it locally

```bash
# 1. Postgres (any local instance) → backend .env
#    DATABASE_URL=postgresql://postgres:postgres@localhost:5432/findmyspare
#    DEMO_LOGIN=1   ← lets the seeded @findmyspare.test accounts sign in with OTP 123456 (never in production)
cd findmyspare-backend && bun install
bun run db:push && bun run db:seed        # seed.ts + seed-v2.ts + taxonomy (10 industries) + seed-v3.ts (multi-tier network)
bun run dev                                # :8000

# 2. Web
cd ../findmyspare && npm install && npm run dev   # :3000 (NEXT_PUBLIC_API_URL=http://localhost:8000)

# 3. Tests
cd ../findmyspare-backend && bun test --env-file=.env test/garage-lib.test.ts test/network-flow.test.ts  # 6 unit + 16 v3 network tests
bun test --env-file=.env test/api-flow.test.ts            # 13 v2 journey tests (restart the API between files: OTP sends are rate-limited per IP)
cd ../e2e && npm i && node journey.mjs                  # browser journey + screenshots
```

### Demo accounts (OTP `123456` with `DEMO_LOGIN=1`)
| Email | Plays |
|---|---|
| `buyer1@findmyspare.test` | **Arjun**, car owner with a Swift (MH 12 AB 3456) and an Activa |
| `garage@findmyspare.test` | **Vikram, Sharma Auto Works**: Garage OS user (also buys parts) |
| `raza@` / `ayman@` / `selvam@findmyspare.test` | Sellers in Delhi / Mumbai / Chennai |
| `admin@findmyspare.test` | Admin (Network console, Businesses, Taxonomy studio) |
| `castings@findmyspare.test` | **Ludhiana Castings & Forgings**: raw material supplier + manufacturer |
| `sahyadri@findmyspare.test` | **Sahyadri Pumps Manufacturing** (Kolhapur): pump manufacturer |
| `deccan@findmyspare.test` | **Deccan Industrial Stockists** (Pune): super stockist |
| `ganesh@findmyspare.test` | **Shree Ganesh Distributors** (Pune): distributor / wholesaler |
| `patil@findmyspare.test` | **Patil Electricals & Pumps** (Pune): retailer with bills, khata, POs in every state |
| `imran@findmyspare.test` | **Imran Motor Rewinding**: technician for pumps, appliances, motors (gets Fix jobs in Pune) |
| `coolcare@` `powergen@` `krishi@` `bearings@` `earthmover@` `mobilehub@` `kochi@findmyspare.test` | Appliances, power, farm, industrial, construction, electronics and marine businesses |

---

## v3: every machine, every tier

| Area | Where | What it does |
|---|---|---|
| Buyer home | `/` | One search for any part, industry carousel (10 industries), Shop / Fix / Quotes / Business doors, My machines, rails per industry |
| Industry pages | `/i/[slug]` | Machine types, brands, part categories, products, "book a technician" |
| Search | `/search` | Industry filters; a selected car only narrows vehicle-part searches |
| Fix | `/fix`, `/fix/requests` | Book a technician for any machine; matching workshops in the city are notified; first to accept gets a job card |
| My machines | `/vehicles` | Cars by number plate; pumps, ACs, gensets… by brand + serial; each has a passport |
| Business OS | `/biz/*` | Task-driven home (live counts only), counter billing + GST bills, purchase orders in/out, trade network + directory, order stock at your price list, khata (to collect / to pay), price lists, demand radar, CSV import |
| Storefront | `/s/[id]` | Public shop page for any seller |
| Workshop OS | `/workshop/*` | Jobs near you, industries serviced, walk-in jobs for any machine, per-industry inspection checklists |
| Admin | `/admin/network/*` | Network overview (roles, industries, trade, search gaps), businesses by role, taxonomy studio (add an industry = data, not a deploy) |

Screenshots of every v3 area: `docs/prototype/screens/v3/` (01–07 buyer, 08–18 Business OS, 19–21 Workshop, 22–24 Admin).

API: `routes/network.ts` (`/biz/*`, `/public/store/:id`), `routes/fix.ts` (`/catalog/taxonomy`, `/fix/*`, `/admin/network/*`), schema in `db/schema/network.ts`.

---

## The story (29 screens)

### Marketplace
| # | Screen | What it shows |
|---|---|---|
| 01–02 | Home (desktop / mobile) | Swiggy-style storefront: vehicle card, three "doors" (Shop · Get quotes · Passport), round categories, rails, promise strip, garage band |
| 03 | Home for my Swift | Picking *Daily Swift* from My vehicles re-targets every rail to parts that fit |
| 04 | Search · Brakes | Fitment filter chip, part-type chips, "Fits Swift VXi 2019" on every tile, ADD buttons |
| 05 | Product | Fit check, buyer-confirmed fits, seller card (GST verified, rating, orders), **compare other offers** for the same part, reviews tagged with "Fitted perfectly" |
| 06–07 | Cart bar → Cart | Floating "View cart" bar; cart **split by seller** with per-seller delivery (free above ₹999), MRP savings, address sheet |
| 08–09 | FMS Pay (mock) → Order placed | UPI / card / netbanking / COD. The journey first **simulates a decline** and recovers, then pays. Money is held in escrow |
| 10 | Seller fulfils | Confirm → ship (auto AWB "FMS Express (mock)") → in transit → delivered. Sellers never see unpaid orders |
| 11 | Tracking + review | Timeline; 5★ + **"Did it fit your vehicle?"** confirms fit, completes the order and releases escrow, and adds to the fitment graph |

### Garage OS + Vehicle Passport
| # | Screen | What it shows |
|---|---|---|
| 12 | Workshop dashboard | Open jobs, ready to bill, collected today, unpaid, month revenue |
| 13 | New job card | Plate lookup (mock RC), customer, odometer, complaint chips |
| 14 | Consent request | Owner sees *"Sharma Auto Works wants to add service records"* and taps **Allow** (DPDP-style consent) |
| 15 | Job card lines | Labour + parts, GST per line, inspection grid, **Get quotes** on a missing part |
| 16 | Quotes for the garage | A seller quoted (Bosch, OES); the garage taps **Accept & pay**. The job line links to the order and the seller |
| 17–19 | Estimate share → owner approves on phone | WhatsApp / copy link; the public estimate page needs no login; the owner approves line by line |
| 20 | Job ready | Fitted ticks, stepper at *Ready* |
| 21 | GST invoice | CGST/SGST split, HSN/SAC, **verification QR + code + fingerprint**, UPI collect QR, counter collection, payment link |
| 22 | Pay invoice (mobile) | Customer pays the link through the mock gateway |
| 23 | Verify | Anyone enters the code: **Genuine and unaltered · Paid**. Tampering is caught (see API test) |
| 24–25 | Passport | Timeline with garage-verified service and invoice; **Warranty Wallet** with days left and "Did it fit?" |
| 26 | Shared history | Owner-chosen sections, plate partly masked: a verified history for resale |
| 27 | Admin | North-star tiles: GMV, fill rate, time to first quote, confirmed fits, Garage OS usage |
| 28–29 | Mobile | Search and job card on a phone |

---

## What's real vs mocked

| Area | Status |
|---|---|
| Accounts, roles, sessions | Real (BetterAuth email OTP; demo OTP only with `DEMO_LOGIN=1` outside production) |
| Catalog, fitment filter, ratings, reviews, fitment graph | Real |
| Multi-seller checkout, escrow hold/release, refunds on cancel | Real (database state) |
| **Payment gateway** | **Mock.** `completeMockPayment()` in `findmyspare-backend/src/lib/commerce.ts` is the only swap-in point for Razorpay/Cashfree |
| **Courier / AWB** | **Mock.** Auto-assigned "FMS Express" AWB on ship |
| **RC (registration) lookup** | **Mock.** Our own record if we have one, else a deterministic pick from the vehicle catalog (`lookupRegNo()` in `lib/garage.ts`) |
| WhatsApp sends | Real `wa.me` share links. No WhatsApp Business API calls |
| Invoice verification | Real: SHA-256 over canonical invoice content; the public page recomputes it |
| Product images | Category illustrations (seed parts have no photos) |

---

## What changed in the code

**Backend** (`findmyspare-backend`)
- New schema:
  - `vehicles.ts`: makes/models/variants, vehicles, garages, vehicle_access
  - `garage-ops.ts`: job cards, items, invoices, fitted parts, fitments
  - `commerce.ts`: checkouts, payments, reviews
  - New columns on orders, products, bids, inquiries
- New routes:
  - `checkout.ts`: preview, checkout, payments, review
  - `vehicles.ts`: catalog, lookup, My vehicles, passport, consent, share, fit
  - `garage.ts`: Garage OS
  - `public-garage.ts`: estimate, verify, pay, shared passport; token-scoped and rate-limited
  - `/admin/marketplace-health`
- Changed behaviour:
  - Quote acceptance now creates an unpaid order + checkout (was: escrow without payment)
  - Sellers only see paid orders
  - Products expose brand / part type / MRP / ratings / fit filters
- Fixed:
  - Admin `/admin/metrics` passed a `Date` into raw SQL and 500'd
  - drizzle-kit forced SSL on local databases

**Web** (`findmyspare`)
- Brand tokens in `globals.css` and the `Logo` component.
- The shop shell (`components/shop/*`), and the new or rebuilt pages listed above.
- Fixed:
  - The v1 accent picker was overriding the brand colour.
  - The auth store and persisted stores caused **hydration mismatches** on every logged-in page.
  - Unlayered `a { color: inherit }` broke Tailwind text colours on links.
  - Quote acceptance used to hand buyers off to WhatsApp (disintermediation). It now pays on-platform.

**Brand** (`brand/`, `.branding/`): see `brand/GUIDELINES.md`.

---

## Known limitations / next steps
- The mobile Expo app is not rebranded or extended (web only, as agreed).
- Schema changes are applied with `drizzle-kit push`. Generate proper migrations before touching the Nhost production database.
- Photo upload for requests and job inspections isn't wired into the new screens (the upload API exists).
- The RC lookup, courier and gateway are mocks behind single functions. Swap them in for production.
- v3 gaps: bill/PO numbers are `count+1` (can collide under concurrent saves); PO GST is a flat 18%; the business directory lists sellers only; a workshop profile field can't be cleared once set; buyers can read but not record payments to a supplier.
- Seven `react-hooks/set-state-in-effect` lint errors pre-date this work (admin/health, magic link, story, verify-email, DesktopNav, TabBar, socket). None were added.

---

## Production deploy runbook (findmyspare.com)

Order matters: **the database first, then code.** The new API reads columns the live database doesn't have yet.

1. **Migrate the database** (add-only; one transaction each). `0001` is already applied in production; v3 needs `0002`:
   ```bash
   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f findmyspare-backend/drizzle/manual/0002_v3_network_every_industry.sql
   ```
2. **Seed the catalog** (vehicle makes + the 10-industry taxonomy). Production-safe and idempotent; no demo users or products. Either run `drizzle/manual/0003_v3_taxonomy_seed.sql` (plain SQL, works in the Neon SQL editor) or:
   ```bash
   cd findmyspare-backend && DATABASE_URL=… bun run src/scripts/seed-catalog.ts
   ```
3. **Merge to `main`.** Vercel builds the web app; Render rebuilds the API (trigger a manual deploy if auto-deploy is off).
4. **Payments stay off** in production (`PAYMENTS_MODE` unset → `off`):
   - Cart and quote acceptance show "launching soon".
   - Garages still collect at the counter.
   - Invoice links show a real UPI QR to the garage's UPI ID.
   - Set `PAYMENTS_MODE=mock` only on a demo deployment. A real gateway replaces `completeMockPayment()`.
5. **Smoke test:** `GET /config` → `{"payments":"off"}`; home, search, a product page, `/verify`, `/workshop` (sign in).
