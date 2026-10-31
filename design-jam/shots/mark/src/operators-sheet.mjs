import { writeFileSync } from "node:fs";
import { operators, fit } from "./operators.mjs";

const [, , dir, out, mode = "plain"] = process.argv;
const rows = operators.map((op) => {
  const d = fit(op, true);
  const m = fit(op, false);
  const desc = `${op.kind}. Desktop ${Math.round(d.width)} by ${Math.round(d.height)}${d.use === "symbol" ? " symbol" : ""}. Mobile ${Math.round(m.width)} by ${Math.round(m.height)}${m.use === "symbol" ? ", swaps to symbol" : ""}.`;
  const imgs = mode === "guides"
    ? `<img class="w" src="${dir}/header-${op.slug}-1280-light-guides.png"><img class="n" src="${dir}/header-${op.slug}-390-light-guides.png">`
    : `<img class="w" src="${dir}/header-${op.slug}-1280-light.png"><img class="n" src="${dir}/header-${op.slug}-390-light.png"><img class="w" src="${dir}/header-${op.slug}-1280-dark.png"><img class="n" src="${dir}/header-${op.slug}-390-dark.png">`;
  return `<section><h2>${op.name} <span>${desc}</span></h2><div class="grid">${imgs}</div></section>`;
}).join("");
const title = mode === "guides" ? "Operator logos, clear space shown" : "Four made-up operators in the Home header";
const lede = mode === "guides"
  ? "Solid line: the logo's tight bounds. Dashed: clear space, 25% of the rendered height on every side. Nothing else may enter it."
  : "Invented names, not real institutions. Each row: 1280 and 390 wide, Light then Dark. Real landing header, logo injected in the Home mark slot.";
writeFileSync(out, `<!doctype html><html><head><meta charset="utf-8"><style>
body{margin:0;background:#f5f5f5;font:13px/1.45 ui-sans-serif,system-ui,-apple-system,Helvetica,Arial,sans-serif;color:#0a0a0a}
main{width:1760px;padding:40px;box-sizing:border-box}
h1{font-size:22px;font-weight:600;margin:0 0 6px}.lede{color:#737373;margin:0 0 24px}
section{margin-bottom:22px}h2{font-size:14px;margin:0 0 10px}h2 span{font-weight:400;color:#737373;margin-left:8px}
.grid{display:grid;grid-template-columns:1280px 390px;gap:12px 16px;align-items:start}
img{display:block;border:1px solid #e5e5e5;border-radius:6px;background:#fff}.w{width:1280px}.n{width:390px}
</style></head><body><main><h1>${title}</h1><p class="lede">${lede}</p>${rows}</main></body></html>`);
