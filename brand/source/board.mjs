// Renders an HTML comparison board for a set of SVGs at real sizes.
import fs from "node:fs"; import path from "node:path";
const [,, dir, outFile] = process.argv;
const ids = fs.readdirSync(dir).filter((d) => fs.statSync(path.join(dir, d)).isDirectory());
const img = (p, w, extra = "") => `<img src="${p}" width="${w}" style="${extra}">`;
const rows = ids.map((id) => {
  const base = `${id}`;
  const lock = fs.existsSync(path.join(dir, id, "lockup-black.svg")) ? `${base}/lockup-black.svg` : `${base}/wordmark-black.svg`;
  return `<section><h2>${id}</h2>
  <div class="row">${[16, 24, 32, 48, 96, 180].map((s) => `<figure>${img(`${base}/icon-black.svg`, s)}<figcaption>${s}px</figcaption></figure>`).join("")}</div>
  <div class="row"><div class="tile light">${img(lock, 320)}</div><div class="tile dark">${img(lock, 320, "filter:invert(1)")}</div>
  <div class="tile light">${img(lock, 140)}</div><div class="tile light">${img(`${base}/symbol-black.svg`, 20)} ${img(`${base}/symbol-black.svg`, 40)}</div></div></section>`;
}).join("");
fs.writeFileSync(outFile, `<!doctype html><meta charset="utf-8"><base href="file://${path.resolve(dir)}/"><style>
body{font:14px system-ui;margin:24px;background:#fff;color:#111}section{margin-bottom:28px;border-bottom:1px solid #eee;padding-bottom:20px}
.row{display:flex;gap:20px;align-items:end;flex-wrap:wrap;margin:10px 0}figure{margin:0;text-align:center}figcaption{font-size:11px;color:#777}
.tile{padding:22px;border-radius:14px;display:flex;align-items:center;gap:14px}.light{background:#f4f4f4}.dark{background:#111}</style>${rows}`);
