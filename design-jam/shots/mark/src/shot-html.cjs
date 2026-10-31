const { chromium } = require("playwright");
const { resolve } = require("node:path");
const [, , input, output, width = "1200"] = process.argv;
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: Number(width), height: 800 }, deviceScaleFactor: 2 });
  await page.goto(`file://${resolve(input)}`);
  await page.waitForFunction(() => [...document.querySelectorAll("canvas.proof")].every((c) => c.dataset.ready === "1"));
  await page.screenshot({ path: output, fullPage: true });
  await browser.close();
})();
