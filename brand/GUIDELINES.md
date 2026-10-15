# FindMySpare Brand Guidelines (v2, "Nut Lens")

The full rationale is in `.branding/`. All files here are generated from `brand/source/` (`npm i && node generate.mjs final && node applications.mjs`).

## The mark
A **hex nut that is also a magnifying lens**: *Find* + *Spare* in one shape. The handle leaves the nut perpendicular to an edge at 45°.

| File | Use |
|---|---|
| `logo/lockup.svg` | Default on white or light backgrounds |
| `logo/lockup-on-dark.svg` | On ink/dark backgrounds |
| `logo/lockup-white.svg` / `lockup-black.svg` | One-colour print, stamps, embossing |
| `logo/symbol.svg` (+ `-black`, `-white`) | Avatars, loaders, small UI, watermark |
| `logo/app-icon.svg` | App icon / PWA (vermilion tile) |
| `logo/app-icon-ink.svg` | Alternate icon on dark launchers |
| `logo/favicon.svg` | Browser tab (tighter padding) |
| `logo/whatsapp-dp.svg` | WhatsApp Business / social avatar (safe inside a circle crop) |

**Clear space:** the lens-hole diameter on every side.
**Minimum size:**
- Symbol: 16 px (screen) / 5 mm (print).
- Lockup: 96 px wide / 25 mm.
- Sticker artwork: 50 mm diameter (its ring text is not legible below that).

**Don't:**
- Recolour the symbol outside the palette.
- Add gradients or shadows to the mark.
- Rotate the handle.
- Put the vermilion symbol on vermilion.
- Retype the wordmark in another font.
- Set the wordmark in lowercase.

## Colour
| Token | Hex | Rule |
|---|---|---|
| brand | `#E5461B` | Logo, icon tile, large shapes. **Not for small text** (4.0:1 on white) |
| brand-strong | `#CC3A12` | Primary buttons, links, prices: 5.0:1 with white |
| brand-ink / brand-wash | `#A32D0C` / `#FFF1EB` | Pressed state / selected chips (6.5:1) |
| ink → ink-4 | `#1B1E24` `#3E434E` `#5B6170` `#8A909C` | Text scale. `ink-4` is placeholders/disabled only |
| paper → paper-3 | `#FFFFFF` `#F6F6F8` `#EFEFF3` | Canvas, bands, app background |
| verified | `#0B7A53` on `#E7F5EF` | FMS Verified, fit confirmed, paid (4.8:1) |
| amber / danger / info | `#9A6700` / `#B42318` / `#2457C5` | Status chips, each ≥4.5:1 on its wash |

**Ratio:** ~80% white/grey, ~15% ink, **≤5% vermilion**. Vermilion marks the one action that matters on a screen, the Swiggy way: one loud colour, everything else calm.

## Type
- **Plus Jakarta Sans** (OFL) for everything.
  - 800 for headlines and prices.
  - 700 for titles and buttons.
  - 500/600 for body.
  - Headlines tracked −0.02em.
- **Noto Sans Devanagari** as the Hindi fallback, at the same sizes.
- **JetBrains Mono** for registration numbers, part numbers and invoice IDs, which must be unambiguous.

## Visual DNA (how the UI should feel)
1. **Clean canvas, chunky cards:** white cards, radius 16–20, soft shadow, 16 px gutters.
2. **One hero action per screen:** a full-width `brand-strong` button, often sticky at the bottom.
3. **Image- and icon-led browsing:** round category tiles and brand tiles in horizontal scrollers.
4. **Proof is green:** anything verified or confirmed uses `verified` + the small symbol, never vermilion.
5. **Hexagon motif, sparingly:** the nut hexagon is used as a bullet/badge shape, a loader and a card watermark. Never as wallpaper.
6. **Motion:** press = scale .97 / 120 ms; enter = 8 px rise + fade / 220 ms; the cart bar slides up. No bounces on data.
7. **Voice:** short, warm, numbers first. "3 sellers quoted · best ₹1,180 · fits your Swift". Hinglish is OK in marketing, not in legal text.

## Applications
- `applications/invoice-header.svg`: GST invoice header with the verification QR slot and the "FMS Verified invoice" pill.
- `applications/vehicle-passport-card.svg`: the shareable vehicle card.
- `applications/verified-garage-sticker.svg`: shop-front trust sticker (print ≥50 mm).
- Web UI: tokens in `findmyspare/src/app/globals.css` mirror `tokens/tokens.json`.

## Migration (from v1)
| v1 asset | Decision |
|---|---|
| Name "FindMySpare" (camel case) | **Retain** (equity, search) |
| Black "f" tile in the header | **Retire** (no meaning, reads as Facebook at small sizes) |
| Green target-ring favicon | **Retire** (conflicts with the brand colour, generic target) |
| Saffron accent `#C4500F` | **Evolve** → vermilion `#E5461B` / `#CC3A12` (same warm family, more confident) |
| Emerald CTAs | **Retire** for CTAs; green is now reserved for *verified/success* only |
| Inter | **Evolve** → Plus Jakarta Sans (friendlier, chunkier at 800) |
| Mobile "Titanium" cobalt | **Retire** at the next mobile release; mobile adopts these tokens |

**Rollout order:**
1. Web app and favicon (this change).
2. Invoice and Passport templates.
3. WhatsApp Business avatar.
4. Mobile app + store icons.
5. Shop stickers for onboarded garages.
6. Social.

Keep the old favicon nowhere; the change is atomic on web.
