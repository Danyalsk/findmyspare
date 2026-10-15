# QC report: D1 "Nut Lens" (final)

Scores are 1–5; they're a decision aid, not proof of market success. Evidence is screen rendering in Chromium (Playwright). No physical print or sticker test was done.

| Criterion | Score | Evidence |
|---|---|---|
| Originality / differentiation | 4 | No India auto-parts competitor found using a nut-as-lens mark (preliminary, not a trademark search). D2/D3 rejected for genericness/Facebook resemblance (`02-directions-bw-board.png`) |
| Simplicity | 5 | 2 paths: hex ring (evenodd) + capsule handle |
| Memorability | 4 | One idea: "the part is the search" |
| Silhouette | 4 | Reads as a magnifier at all sizes; the hexagon is legible from 24 px (`03-final-size-tests.png`) |
| Small-size function | 4 | 16 px app icon and 16 px favicon read as a lens; the hexagon softens at 16 px (accepted) |
| Monochrome function | 5 | Black and white lockups tested on light/vermilion |
| Legibility (wordmark) | 5 | Plus Jakarta Sans 800, outlined; legible at a 120 px-wide lockup |
| Scalability | 5 | Vector; 16 px → 600 px sticker |
| Product fit | 5 | Find + part; extends to Verified (green symbol) and the Passport watermark |
| Emotional fit | 4 | Warm vermilion + chunky type ≈ the Swiggy friendliness the user asked for; mechanical, not greasy |
| System extensibility | 4 | Hexagon motif, verified-green semantics, tokens for web; mobile not yet migrated |
| Accessibility / contrast | 5 | All UI text pairs ≥4.5:1 (computed). Brand `#E5461B` restricted to logo/large shapes (4.0:1) |
| Production readiness | 4 | Clean paths, explicit viewBox, no rasters, no font dependency. Sticker min 50 mm; print untested |
| Migration safety | 4 | Name and warm-accent equity retained; v1 favicon/f-tile retired atomically on web |

**Average: 4.43**, no score below 4. **Decision: pass**, with the open risks below.

## Untested surfaces (not passing, just untested)
Thermal-printer invoice, the physical sticker on a shutter, Android adaptive-icon mask (safe zone should be fine at 19% padding), Play Store listing.

## Open risks
- Trademark clearance not done. Get counsel before printing stickers at scale.
- The hexagon softens at 16 px. If tab recognition matters later, consider a simplified favicon with a thicker ring.
