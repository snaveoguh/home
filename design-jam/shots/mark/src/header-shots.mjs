import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
import { operators, fit, slot } from "./operators.mjs";

const base = process.argv[2] ?? "http://127.0.0.1:3102/";
const outDir = process.argv[3] ?? ".";
const browser = await chromium.launch();

async function shoot(op, width, theme, guides) {
  const page = await browser.newPage({ viewport: { width, height: 400 }, deviceScaleFactor: 2 });
  await page.addInitScript((t) => localStorage.setItem("home.appearance.v1", t), theme);
  await page.goto(base, { waitUntil: "load", timeout: 90000 });
  await page.waitForSelector("[data-home-mark]");
  await page.waitForTimeout(4000);
  const desktop = width >= 768;
  const f = fit(op, desktop);
  const dark = theme === "dark";
  const markup = f.use === "symbol" ? (dark ? op.symbolDark : op.symbolLight) : (dark ? op.dark ?? op.light : op.light);
  const clear = Math.round(f.height * slot.clearSpace);
  const measured = await page.evaluate(({ markup, f, clear, guides, name }) => {
    const host = document.querySelector("[data-home-mark]");
    const wrap = document.createElement("a");
    wrap.href = "#";
    wrap.setAttribute("aria-label", `${name} home`);
    wrap.style.cssText = `display:inline-flex;align-items:center;justify-content:flex-start;min-height:44px;min-width:44px;padding:0 ${clear}px;margin-inline-start:-${clear}px;color:var(--foreground);box-sizing:border-box;position:relative`;
    wrap.innerHTML = markup;
    const svg = wrap.querySelector("svg");
    svg.setAttribute("width", String(f.width));
    svg.setAttribute("height", String(f.height));
    svg.style.display = "block";
    if (guides) {
      const g = document.createElement("span");
      g.style.cssText = `position:absolute;left:0;right:0;top:calc(50% - ${f.height / 2 + clear}px);height:${f.height + clear * 2}px;outline:1px dashed #e11d48;background:rgba(225,29,72,.06);pointer-events:none`;
      const i = document.createElement("span");
      i.style.cssText = `position:absolute;left:${clear}px;top:calc(50% - ${f.height / 2}px);width:${f.width}px;height:${f.height}px;outline:1px solid #e11d48;pointer-events:none`;
      wrap.append(g, i);
    }
    host.style.display = "none";
    host.setAttribute("data-replaced", "");
    host.after(wrap);
    const header = wrap.closest("header") ?? wrap.parentElement.parentElement;
    const r = header.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  }, { markup, f, clear, guides, name: op.name });
  await page.waitForTimeout(600);
  const visibleHome = await page.locator("[data-home-mark]:not([data-replaced])").count();
  if (visibleHome) throw new Error(`Home mark came back for ${op.slug} ${width} ${theme}`);
  const file = `${outDir}/header-${op.slug}-${width}-${theme}${guides ? "-guides" : ""}.png`;
  await page.screenshot({ path: file, clip: { x: 0, y: 0, width, height: Math.max(56, Math.ceil(measured.y + measured.height)) } });
  await page.close();
  return { file, f, clear };
}

const results = [];
for (const op of operators) {
  for (const width of [1280, 390]) {
    for (const theme of ["light", "dark"]) results.push({ op: op.slug, width, theme, ...(await shoot(op, width, theme, false)) });
  }
  results.push({ op: op.slug, width: 1280, theme: "light", ...(await shoot(op, 1280, "light", true)) });
  results.push({ op: op.slug, width: 390, theme: "light", ...(await shoot(op, 390, "light", true)) });
}
console.log(JSON.stringify(results.map((r) => [r.file, r.f.use, r.f.kind, Math.round(r.f.width), Math.round(r.f.height), r.clear])));
await browser.close();
