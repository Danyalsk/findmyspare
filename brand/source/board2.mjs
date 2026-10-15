import fs from "node:fs"; import path from "node:path";
const [,, dir, outFile] = process.argv; const d = path.resolve(dir);
const sizes = [16, 24, 32, 48, 96, 180];
fs.writeFileSync(outFile, `<!doctype html><meta charset="utf-8"><base href="file://${d}/"><style>
body{font:14px system-ui;margin:24px;color:#1B1E24}.row{display:flex;gap:18px;align-items:end;flex-wrap:wrap;margin:14px 0}
.t{padding:22px;border-radius:16px}figure{margin:0;text-align:center}figcaption{font-size:11px;color:#777}
.wa{width:120px;height:120px;border-radius:50%;overflow:hidden}</style>
<div class="row">${sizes.map(s=>`<figure><img src="app-icon.svg" width="${s}"><figcaption>${s}</figcaption></figure>`).join("")}
${sizes.slice(0,3).map(s=>`<figure><img src="favicon.svg" width="${s}"><figcaption>fav ${s}</figcaption></figure>`).join("")}
<figure><img src="app-icon-ink.svg" width="96"><figcaption>ink</figcaption></figure><div class="wa"><img src="whatsapp-dp.svg" width="120"></div></div>
<div class="row"><div class="t" style="background:#fff;border:1px solid #eee"><img src="lockup.svg" width="340"></div>
<div class="t" style="background:#1B1E24"><img src="lockup-on-dark.svg" width="340"></div></div>
<div class="row"><div class="t" style="background:#F6F6F8"><img src="lockup-black.svg" width="200"></div>
<div class="t" style="background:#E5461B"><img src="lockup-white.svg" width="200"></div>
<div class="t" style="background:#fff;border:1px solid #eee"><img src="lockup.svg" width="120"></div>
<div class="t" style="background:#fff;border:1px solid #eee"><img src="symbol.svg" width="18"> <img src="symbol-black.svg" width="18"> <img src="symbol.svg" width="48"></div></div>`);
