// FindMySpare logo generator.
// Builds every logo SVG from geometry + OFL fonts (wordmarks are outlined to
// paths, so the SVGs never depend on installed fonts).
//   npm i && node generate.mjs            → writes ../exploration and ../logo
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const out = (rel, svg) => {
  const p = path.join(here, "..", rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, svg.trim() + "\n");
  return p;
};

const font = (pkg, file) =>
  opentype.parse(fs.readFileSync(path.join(here, "node_modules/@fontsource", pkg, "files", file)).buffer);
const JAKARTA_800 = font("plus-jakarta-sans", "plus-jakarta-sans-latin-800-normal.woff");
const OUTFIT_800 = font("outfit", "outfit-latin-800-normal.woff");

// ─── Geometry helpers ────────────────────────────────
const f = (n) => +n.toFixed(2);
const pt = (cx, cy, r, deg) => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)];

/** Closed polygon with quadratic-rounded corners. radii: number or per-vertex array. */
function roundedPolygon(pts, radii) {
  const n = pts.length;
  let d = "";
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n];
    const r = Array.isArray(radii) ? radii[i] : radii;
    const u = (a, b) => { const dx = a[0] - b[0], dy = a[1] - b[1], l = Math.hypot(dx, dy); return [dx / l, dy / l]; };
    const ua = u(p0, p1), ub = u(p2, p1);
    const a = [p1[0] + ua[0] * r, p1[1] + ua[1] * r];
    const b = [p1[0] + ub[0] * r, p1[1] + ub[1] * r];
    d += `${i === 0 ? "M" : "L"}${f(a[0])} ${f(a[1])}Q${f(p1[0])} ${f(p1[1])} ${f(b[0])} ${f(b[1])}`;
  }
  return d + "Z";
}
const hexPts = (cx, cy, R, rot) => Array.from({ length: 6 }, (_, k) => pt(cx, cy, R, rot + 60 * k));
const circle = (cx, cy, r) =>
  `M${f(cx - r)} ${f(cy)}a${r} ${r} 0 1 0 ${f(2 * r)} 0a${r} ${r} 0 1 0 ${f(-2 * r)} 0Z`;
/** Capsule (rounded bar) between A and B with half-width w. */
function capsule(A, B, w) {
  const dx = B[0] - A[0], dy = B[1] - A[1], l = Math.hypot(dx, dy);
  const nx = (-dy / l) * w, ny = (dx / l) * w;
  return `M${f(A[0] + nx)} ${f(A[1] + ny)}L${f(B[0] + nx)} ${f(B[1] + ny)}A${w} ${w} 0 0 0 ${f(B[0] - nx)} ${f(B[1] - ny)}L${f(A[0] - nx)} ${f(A[1] - ny)}A${w} ${w} 0 0 0 ${f(A[0] + nx)} ${f(A[1] + ny)}Z`;
}

/** Outline text with manual tracking + kerning. Returns {d, width, ascent}. */
function textPath(fnt, text, size, { tracking = 0, x = 0, y = 0 } = {}) {
  const scale = size / fnt.unitsPerEm;
  const glyphs = fnt.stringToGlyphs(text);
  let cx = x, d = "";
  glyphs.forEach((g, i) => {
    d += g.getPath(cx, y, size).toPathData(2);
    const kern = i < glyphs.length - 1 ? fnt.getKerningValue(g, glyphs[i + 1]) : 0;
    cx += (g.advanceWidth + kern) * scale + (i < glyphs.length - 1 ? tracking * size : 0);
  });
  return { d, width: cx - x, capHeight: (fnt.tables.os2.sCapHeight || fnt.ascender * 0.7) * scale };
}

// ─── Symbols (64×64 grid) ─────────────────────────────
// D1 "Nut Lens": hex nut whose ring is a magnifier lens; handle leaves an edge at 45°.
function symNutLens() {
  const c = [25, 25], R = 20.5;
  const hex = roundedPolygon(hexPts(c[0], c[1], R, 15), 3.6); // edge midpoint at 45°
  const apothem = R * Math.cos(Math.PI / 6);
  const A = pt(c[0], c[1], apothem - 4, 45), B = pt(c[0], c[1], 44, 45);
  return { paths: [{ d: hex + circle(c[0], c[1], 9.2), rule: "evenodd" }, { d: capsule(A, B, 5.6) }], box: [0, 0, 64, 64] };
}
// D2 "Part Pin": pointy-top hex nut that tapers into a map-pin tip.
function symPartPin() {
  const c = [32, 25], R = 21;
  const p = hexPts(c[0], c[1], R, -90); // top, upper-right, lower-right, bottom, lower-left, upper-left
  p[3] = [32, 61];
  return { paths: [{ d: roundedPolygon(p, [3.6, 3.6, 4.5, 2.2, 4.5, 3.6]) + circle(c[0], c[1], 8.6), rule: "evenodd" }], box: [0, 0, 64, 64] };
}
// D3 "Friendly f": outlined lowercase f monogram for the wordmark-led route.
function symF() {
  const t = textPath(OUTFIT_800, "f", 60, { x: 0, y: 0 });
  // centre the glyph in 64×64 using its bounding box
  const g = OUTFIT_800.charToGlyph("f"), s = 60 / OUTFIT_800.unitsPerEm;
  const bb = g.getBoundingBox();
  const w = (bb.x2 - bb.x1) * s, h = (bb.y2 - bb.y1) * s;
  const dx = 32 - w / 2 - bb.x1 * s, dy = 32 + h / 2 + bb.y1 * s;
  return { paths: [{ d: g.getPath(dx, dy, 60).toPathData(2) }], box: [0, 0, 64, 64] };
}

const SYMBOLS = { "d1-nut-lens": symNutLens, "d2-part-pin": symPartPin, "d3-friendly-f": symF };

// ─── SVG writers ─────────────────────────────────────
const pathEls = (paths, fill) =>
  paths.map((p) => `<path d="${p.d}" fill="${fill}"${p.rule ? ` fill-rule="${p.rule}"` : ""}/>`).join("\n  ");

function symbolSvg(sym, fill, title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${sym.box.join(" ")}" role="img" aria-label="${title}">
  <title>${title}</title>
  ${pathEls(sym.paths, fill)}
</svg>`;
}

function iconSvg(sym, bg, fg, title, { pad = 0.2, radius = 0.225 } = {}) {
  const S = 512, inner = S * (1 - 2 * pad), k = inner / 64, o = S * pad;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" role="img" aria-label="${title}">
  <title>${title}</title>
  <rect width="${S}" height="${S}" rx="${S * radius}" fill="${bg}"/>
  <g transform="translate(${f(o)} ${f(o)}) scale(${f(k)})">
  ${pathEls(sym.paths, fg)}
  </g>
</svg>`;
}

function wordmark(fnt, text, size, tracking) {
  return textPath(fnt, text, size, { tracking, x: 0, y: 0 });
}

/** Horizontal lockup: symbol at cap-height scale + wordmark. */
function lockupSvg(sym, word, colors, title) {
  const size = 100, tm = wordmark(JAKARTA_800, word, size, -0.025);
  const symH = 104, k = symH / 64, gap = 26;
  const textX = symH + gap, baseline = symH / 2 + tm.capHeight / 2;
  const W = Math.ceil(textX + tm.width + 4), H = symH;
  const tp = textPath(JAKARTA_800, word, size, { tracking: -0.025, x: textX, y: baseline });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${title}">
  <title>${title}</title>
  <g transform="scale(${f(k)})">
  ${pathEls(sym.paths, colors.symbol)}
  </g>
  <path d="${tp.d}" fill="${colors.text}"/>
</svg>`;
}

/** D3 wordmark: lowercase with the i-dot replaced by a hex nut. */
function d3WordmarkSvg(fill, accent, title) {
  const size = 100, tracking = -0.02;
  const fnt = OUTFIT_800, s = size / fnt.unitsPerEm;
  const text = "findmyspare";
  const glyphs = fnt.stringToGlyphs(text.replace("i", "ı"));
  const hasDotless = glyphs[1].unicode === 0x131 || glyphs[1].name === "dotlessi";
  const gl = hasDotless ? glyphs : fnt.stringToGlyphs(text);
  let x = 0, d = "", iX = 0, iW = 0;
  gl.forEach((g, i) => {
    if (i === 1) { iX = x; iW = g.advanceWidth * s; }
    d += g.getPath(x, 0, size).toPathData(2);
    const kern = i < gl.length - 1 ? fnt.getKerningValue(g, gl[i + 1]) : 0;
    x += (g.advanceWidth + kern) * s + (i < gl.length - 1 ? tracking * size : 0);
  });
  const xh = (fnt.tables.os2.sxHeight || 500) * s;
  const nut = roundedPolygon(hexPts(iX + iW / 2, -xh - 17, 11.5, -90), 2.2) + circle(iX + iW / 2, -xh - 17, 4.4);
  const top = -xh - 34, H = 34 + xh + 30;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 ${f(top - 6)} ${f(x + 4)} ${f(H + 12)}" role="img" aria-label="${title}">
  <title>${title}</title>
  <path d="${d}" fill="${fill}"/>
  <path d="${nut}" fill="${accent}" fill-rule="evenodd"/>
  <!-- dotless-i glyph used: ${hasDotless} -->
</svg>`;
}

// ─── Build ───────────────────────────────────────────
const mode = process.argv[2] || "explore";
const written = [];

if (mode === "explore") {
  for (const [id, make] of Object.entries(SYMBOLS)) {
    const sym = make();
    written.push(out(`exploration/${id}/symbol-black.svg`, symbolSvg(sym, "#111111", `FindMySpare ${id}`)));
    written.push(out(`exploration/${id}/icon-black.svg`, iconSvg(sym, "#111111", "#FFFFFF", `FindMySpare ${id} icon`)));
    if (id !== "d3-friendly-f")
      written.push(out(`exploration/${id}/lockup-black.svg`, lockupSvg(sym, "FindMySpare", { symbol: "#111111", text: "#111111" }, `FindMySpare ${id} lockup`)));
  }
  written.push(out(`exploration/d3-friendly-f/wordmark-black.svg`, d3WordmarkSvg("#111111", "#111111", "findmyspare wordmark")));
}

// ─── Final identity (D1 refined) ─────────────────────
// Refinement vs D1: larger nut + wider lens hole so the hexagon reads at 16px,
// shorter/thicker handle so it reads as a lens, not a key.
export const COLORS = {
  brand: "#E5461B",       // Spark Vermilion: logo, icon tile, large surfaces
  brandStrong: "#CC3A12", // buttons + text on white (4.9:1 with white)
  ink: "#1B1E24",
  white: "#FFFFFF",
};
export function symFinal() {
  const c = [25.5, 25.5], R = 22.5;
  const hex = roundedPolygon(hexPts(c[0], c[1], R, 15), 4.2);
  const apothem = R * Math.cos(Math.PI / 6);
  const A = pt(c[0], c[1], apothem - 4, 45), B = pt(c[0], c[1], 41.5, 45);
  return { paths: [{ d: hex + circle(c[0], c[1], 10.6), rule: "evenodd" }, { d: capsule(A, B, 6.4) }], box: [0, 0, 64, 64] };
}

if (mode === "final") {
  const sym = symFinal(), C = COLORS;
  const T = "FindMySpare";
  const files = {
    "logo/symbol.svg": symbolSvg(sym, C.brand, T),
    "logo/symbol-black.svg": symbolSvg(sym, "#000000", T),
    "logo/symbol-white.svg": symbolSvg(sym, "#FFFFFF", T),
    "logo/lockup.svg": lockupSvg(sym, T, { symbol: C.brand, text: C.ink }, T),
    "logo/lockup-on-dark.svg": lockupSvg(sym, T, { symbol: C.brand, text: C.white }, T),
    "logo/lockup-black.svg": lockupSvg(sym, T, { symbol: "#000000", text: "#000000" }, T),
    "logo/lockup-white.svg": lockupSvg(sym, T, { symbol: "#FFFFFF", text: "#FFFFFF" }, T),
    "logo/app-icon.svg": iconSvg(sym, C.brand, C.white, `${T} app icon`, { pad: 0.19 }),
    "logo/app-icon-ink.svg": iconSvg(sym, C.ink, C.brand, `${T} app icon (ink)`, { pad: 0.19 }),
    "logo/favicon.svg": iconSvg(sym, C.brand, C.white, `${T}`, { pad: 0.12, radius: 0.22 }),
    "logo/whatsapp-dp.svg": iconSvg(sym, C.brand, C.white, `${T}`, { pad: 0.27, radius: 0 }), // circle-cropped by WhatsApp
  };
  for (const [rel, svg] of Object.entries(files)) written.push(out(rel, svg));
  fs.writeFileSync(path.join(here, "..", "logo", "symbol-paths.json"), JSON.stringify(sym, null, 2) + "\n");
}

export { SYMBOLS, symbolSvg, iconSvg, lockupSvg, d3WordmarkSvg, roundedPolygon, hexPts, circle, capsule, textPath, JAKARTA_800, OUTFIT_800, out };
if (process.argv[1] === fileURLToPath(import.meta.url)) console.log(written.map((p) => path.relative(path.join(here, ".."), p)).join("\n"));
