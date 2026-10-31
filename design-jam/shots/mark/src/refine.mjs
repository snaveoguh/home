import { writeFileSync } from "node:fs";
import { BLUE, BLUE_DARK, doorway, doorway16, ascender, ascender16 } from "./marks.mjs";

const out = process.argv[2];
const s24 = (d, c, size) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24"><path fill="${c}" d="${d}"/></svg>`;
const s16 = (d, c, size) => `<svg width="${size}" height="${size}" viewBox="0 0 16 16"><path fill="${c}" d="${d}"/></svg>`;
const uri = (svg) => `data:image/svg+xml,${encodeURIComponent(svg.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" '))}`;
const hStem = `M0 -9.6H9.6V0H0Z`;

function row(name, note, d, d16) {
  const proof = (src, bg) => `<canvas class="proof" data-src="${src}" data-bg="${bg}" width="128" height="128"></canvas>`;
  return `
  <section>
    <header><h2>${name}</h2><p>${note}</p></header>
    <div class="strip">
      <figure>${s24(d, BLUE, 120)}<figcaption>Master, 24 grid</figcaption></figure>
      <figure class="sizes">${s24(d, BLUE, 48)}${s24(d, BLUE, 32)}${s24(d, BLUE, 24)}${s16(d16, BLUE, 16)}<figcaption>48, 32, 24, 16 hinted</figcaption></figure>
      <figure>${proof(uri(s24(d, BLUE, 16)), "#ffffff")}<figcaption>16 px, master scaled</figcaption></figure>
      <figure>${proof(uri(s16(d16, BLUE, 16)), "#ffffff")}<figcaption>16 px, hinted 16 grid</figcaption></figure>
      <figure>${proof(uri(s16(d16, BLUE_DARK, 16)), "#171717")}<figcaption>16 px, dark tab</figcaption></figure>
      <figure><div class="icon">${s24(d, "#ffffff", 72)}</div><figcaption>App icon, 180</figcaption></figure>
    </div>
  </section>`;
}

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  body { margin: 0; background: #f5f5f5; font: 13px/1.45 ui-sans-serif, system-ui, -apple-system, Helvetica, Arial, sans-serif; color: #0a0a0a; }
  main { width: 1200px; padding: 40px; box-sizing: border-box; }
  h1 { font-size: 22px; font-weight: 600; margin: 0 0 6px; }
  .lede { color: #737373; margin: 0 0 28px; }
  section { background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 24px; margin-bottom: 20px; }
  section header { display: flex; gap: 16px; align-items: baseline; margin-bottom: 20px; }
  h2 { font-size: 15px; margin: 0; }
  section header p { margin: 0; color: #525252; }
  .strip { display: flex; gap: 36px; align-items: flex-end; }
  figure { margin: 0; display: flex; flex-direction: column; gap: 10px; align-items: flex-start; }
  figure.sizes { flex-direction: row; align-items: flex-end; gap: 14px; flex-wrap: wrap; width: 170px; }
  figure.sizes figcaption { width: 100%; }
  figcaption { color: #737373; font-size: 12px; }
  canvas.proof { width: 128px; height: 128px; image-rendering: pixelated; border-radius: 4px; outline: 1px solid #e5e5e5; }
  .icon { width: 120px; height: 120px; border-radius: 27px; background: ${BLUE}; display: grid; place-items: center; }
  .story { display: flex; gap: 28px; align-items: flex-end; }
  .story svg { overflow: visible; }
</style></head><body><main>
  <h1>Refining two directions</h1>
  <p class="lede">The 16 px proofs are real 16 by 16 renders, enlarged eight times with no smoothing.</p>
  ${row("B Doorway", "Picked. The door is 20% wide, so the two walls match the 40% h stem the hover already draws.", doorway, doorway16)}
  ${row("C Ascender", "Runner-up. Strong link to the hover, but at rest it reads as a bar chart or an L.", ascender, ascender16)}
  <section>
    <header><h2>Why the doorway wins</h2><p>Add the hover's ascender to the resting doorway and you get a lowercase h. The mark already contains the word.</p></header>
    <div class="story">
      <figure>${s24(doorway, BLUE, 96)}<figcaption>At rest</figcaption></figure>
      <figure><svg width="96" height="134" viewBox="0 -9.6 24 33.6"><path fill="${BLUE}" d="${hStem}"/><path fill="${BLUE}" d="${doorway}"/></svg><figcaption>Hover, first beat</figcaption></figure>
      <figure><div style="font: 500 112px/0.8 ui-sans-serif, system-ui, Helvetica, Arial, sans-serif; color: ${BLUE}; letter-spacing: -0.02em;">h</div><figcaption>Base Sans h, for comparison</figcaption></figure>
    </div>
  </section>
</main>
<script>
  document.querySelectorAll("canvas.proof").forEach((canvas) => {
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      const small = document.createElement("canvas");
      small.width = 16; small.height = 16;
      const sctx = small.getContext("2d");
      sctx.fillStyle = canvas.dataset.bg; sctx.fillRect(0, 0, 16, 16);
      sctx.drawImage(img, 0, 0, 16, 16);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(small, 0, 0, 128, 128);
      canvas.dataset.ready = "1";
    };
    img.src = canvas.dataset.src;
  });
</script></body></html>`;
writeFileSync(out, html);
