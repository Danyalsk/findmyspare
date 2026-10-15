// Brand application artwork (text outlined so files render without fonts).
// node applications.mjs → ../applications/*.svg
import { symFinal, COLORS as C, textPath, JAKARTA_800, out, roundedPolygon, hexPts, circle } from "./generate.mjs";
import opentype from "opentype.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const J600 = opentype.parse(fs.readFileSync(path.join(here, "node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-600-normal.woff")).buffer);
const sym = symFinal();
const symG = (x, y, size, fill) =>
  `<g transform="translate(${x} ${y}) scale(${size / 64})">${sym.paths.map((p) => `<path d="${p.d}" fill="${fill}"${p.rule ? ` fill-rule="${p.rule}"` : ""}/>`).join("")}</g>`;
const T = (fnt, s, size, x, y, fill, tracking = 0) => `<path d="${textPath(fnt, s, size, { x, y, tracking }).d}" fill="${fill}"/>`;
const W = (fnt, s, size, tracking = 0) => textPath(fnt, s, size, { tracking }).width;

// 1. GST invoice header (A4 width at 96dpi ≈ 794px), with verification QR slot.
const invoice = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 794 150" role="img" aria-label="FindMySpare invoice header">
  <rect width="794" height="150" fill="#fff"/>
  <rect width="794" height="8" fill="${C.brand}"/>
  ${symG(32, 38, 52, C.brand)}
  ${T(JAKARTA_800, "FindMySpare", 26, 96, 72, C.ink, -0.02)}
  ${T(J600, "GARAGE  ·  TAX INVOICE", 11, 97, 94, "#5B6170", 0.08)}
  <rect x="640" y="28" width="96" height="96" rx="10" fill="#fff" stroke="#D6D7DE"/>
  <path d="M664 52h18v18h-18zM700 52h12v12h-12zM664 88h12v12h-12zM694 82h18v18h-18zM684 72h8v8h-8z" fill="${C.ink}"/>
  ${T(J600, "Scan to verify", 10, 650, 140, "#5B6170")}
  <rect x="470" y="40" width="150" height="28" rx="14" fill="#E7F5EF"/>
  ${symG(480, 46, 16, "#0B7A53")}
  ${T(J600, "FMS Verified invoice", 11, 502, 58, "#0B7A53")}
</svg>`;

// 2. Vehicle Passport card (credit-card ratio 85.6×54 → 856×540).
const reg = "MH 12 AB 3456";
const passport = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 856 540" role="img" aria-label="FindMySpare Vehicle Passport card">
  <defs><clipPath id="c"><rect width="856" height="540" rx="36"/></clipPath></defs>
  <g clip-path="url(#c)">
    <rect width="856" height="540" fill="${C.ink}"/>
    ${symG(560, 210, 420, "#262A32")}
    <rect y="0" width="856" height="10" fill="${C.brand}"/>
  </g>
  ${symG(48, 46, 44, C.brand)}
  ${T(JAKARTA_800, "FindMySpare", 24, 102, 78, "#fff", -0.02)}
  ${T(J600, "VEHICLE PASSPORT", 14, 50, 160, "#9AA0AC", 0.12)}
  <rect x="48" y="186" width="${W(JAKARTA_800, reg, 44, 0.02) + 48}" height="78" rx="12" fill="#fff"/>
  ${T(JAKARTA_800, reg, 44, 72, 240, C.ink, 0.02)}
  ${T(J600, "Maruti Suzuki Swift VXi · Petrol · 2019", 22, 50, 318, "#C9CCD3")}
  ${T(J600, "SERVICES", 12, 50, 400, "#9AA0AC", 0.1)}${T(JAKARTA_800, "14", 34, 50, 444, "#fff")}
  ${T(J600, "PARTS FITTED", 12, 190, 400, "#9AA0AC", 0.1)}${T(JAKARTA_800, "37", 34, 190, 444, "#fff")}
  ${T(J600, "ACTIVE WARRANTIES", 12, 370, 400, "#9AA0AC", 0.1)}${T(JAKARTA_800, "5", 34, 370, 444, "#fff")}
  <rect x="48" y="470" width="214" height="36" rx="18" fill="#0F241C"/>
  ${symG(60, 478, 20, "#3DD39A")}${T(J600, "Verified history", 15, 88, 494, "#3DD39A")}
</svg>`;

// 3. "FMS Verified Garage" shop-front sticker (circle, 600×600).
const ring = "FMS VERIFIED GARAGE";
const sticker = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" role="img" aria-label="FMS Verified Garage sticker">
  <circle cx="300" cy="300" r="296" fill="${C.brand}"/>
  <circle cx="300" cy="300" r="262" fill="none" stroke="#fff" stroke-width="6"/>
  ${symG(170, 120, 260, "#fff")}
  ${T(JAKARTA_800, "FindMySpare", 52, 300 - W(JAKARTA_800, "FindMySpare", 52, -0.02) / 2, 440, "#fff", -0.02)}
  <rect x="${300 - (W(JAKARTA_800, ring, 26, 0.08) + 44) / 2}" y="462" width="${W(JAKARTA_800, ring, 26, 0.08) + 44}" height="48" rx="24" fill="#fff"/>
  ${T(JAKARTA_800, ring, 26, 300 - W(JAKARTA_800, ring, 26, 0.08) / 2, 495, C.brandStrong, 0.08)}
</svg>`;

console.log([out("applications/invoice-header.svg", invoice), out("applications/vehicle-passport-card.svg", passport), out("applications/verified-garage-sticker.svg", sticker)].join("\n"));
