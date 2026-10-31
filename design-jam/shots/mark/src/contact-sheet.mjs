import { writeFileSync } from "node:fs";
import { BLUE, BLUE_DARK, directions } from "./marks.mjs";

const out = process.argv[2];
const cellW = 300;
const cellH = 320;
const cols = 4;
const pad = 40;
const W = pad * 2 + cellW * cols;
const H = 120 + cellH * 2 + pad;
const font = `font-family="ui-sans-serif, system-ui, -apple-system, Helvetica, Arial, sans-serif"`;

function place(body, x, y, size) {
  return `<g transform="translate(${x} ${y}) scale(${size / 24})">${body}</g>`;
}

const cells = directions.map((d, i) => {
  const x = pad + (i % cols) * cellW;
  const y = 120 + Math.floor(i / cols) * cellH;
  const light = d.body(BLUE);
  const dark = d.body(BLUE_DARK);
  const chosen = d.id === "B" ? `<text x="${x + 260}" y="${y + 24}" text-anchor="end" font-size="12" fill="#0a0a0a" ${font}>Picked</text>` : "";
  const refined = d.id === "C" ? `<text x="${x + 260}" y="${y + 24}" text-anchor="end" font-size="12" fill="#737373" ${font}>Runner-up</text>` : "";
  return `
  <g>
    <rect x="${x}" y="${y}" width="${cellW - 20}" height="${cellH - 20}" rx="8" fill="#ffffff" stroke="#e5e5e5"/>
    <text x="${x + 20}" y="${y + 24}" font-size="13" font-weight="600" fill="#0a0a0a" ${font}>${d.id}  ${d.name}</text>${chosen}${refined}
    ${place(light, x + 20, y + 44, 96)}
    ${place(light, x + 136, y + 108, 32)}
    ${place(light, x + 180, y + 116, 24)}
    ${place(light, x + 216, y + 124, 16)}
    <rect x="${x + 20}" y="${y + 160}" width="${cellW - 60}" height="56" rx="6" fill="#171717"/>
    ${place(dark, x + 36, y + 172, 32)}
    ${place(dark, x + 84, y + 180, 16)}
    <text x="${x + 116}" y="${y + 193}" font-size="11" fill="#a3a3a3" ${font}>Dark, #578BFA</text>
    <foreignObject x="${x + 20}" y="${y + 228}" width="${cellW - 60}" height="60"><div xmlns="http://www.w3.org/1999/xhtml" style="font: 12px/1.45 ui-sans-serif, system-ui, sans-serif; color: #525252;">${d.note}</div></foreignObject>
  </g>`;
}).join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#f5f5f5"/>
  <text x="${pad}" y="56" font-size="22" font-weight="600" fill="#0a0a0a" ${font}>Home mark, eight directions</text>
  <text x="${pad}" y="84" font-size="13" fill="#737373" ${font}>Each at 96, 32, 24 and 16 px on light, then 32 and 16 px on the dark header. 24 unit grid, 2.4 corner radius.</text>
  ${cells}
</svg>`;
writeFileSync(out, svg);
