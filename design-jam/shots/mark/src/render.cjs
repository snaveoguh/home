const { chromium } = require("playwright");
const { readFileSync } = require("node:fs");
const [, , input, output, scale = "1"] = process.argv;
(async () => {
  const browser = await chromium.launch();
  const svg = readFileSync(input, "utf8");
  const w = Number(svg.match(/width="(\d+)"/)[1]);
  const h = Number(svg.match(/height="(\d+)"/)[1]);
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: Number(scale) });
  await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
  await page.screenshot({ path: output });
  await browser.close();
})();
