export const BLUE = "#002EF4";
export const BLUE_DARK = "#578BFA";

const r = 2.4;
const square = `M${r} 0H${24 - r}A${r} ${r} 0 0 1 24 ${r}V${24 - r}A${r} ${r} 0 0 1 ${24 - r} 24H${r}A${r} ${r} 0 0 1 0 ${24 - r}V${r}A${r} ${r} 0 0 1 ${r} 0Z`;

export const doorway = `M${r} 0H${24 - r}A${r} ${r} 0 0 1 24 ${r}V${24 - r}A${r} ${r} 0 0 1 ${24 - r} 24H14.4V14.4A2.4 2.4 0 0 0 9.6 14.4V24H${r}A${r} ${r} 0 0 1 0 ${24 - r}V${r}A${r} ${r} 0 0 1 ${r} 0Z`;

export const doorway16 = `M2 0H14A2 2 0 0 1 16 2V14A2 2 0 0 1 14 16H10V10A2 2 0 0 0 6 10V16H2A2 2 0 0 1 0 14V2A2 2 0 0 1 2 0Z`;

const ax = 3.5;
const aw = 17;
const ah = 6.9;
const ar = 1.4;
export const ascender = `M${ax + ar} 0H${ax + 6.8 - ar}A${ar} ${ar} 0 0 1 ${ax + 6.8} ${ar}V${ah}H${ax + aw - ar}A${ar} ${ar} 0 0 1 ${ax + aw} ${ah + ar}V${24 - ar}A${ar} ${ar} 0 0 1 ${ax + aw - ar} 24H${ax + ar}A${ar} ${ar} 0 0 1 ${ax} ${24 - ar}V${ar}A${ar} ${ar} 0 0 1 ${ax + ar} 0Z`;

export const ascender16 = `M3.25 0H6.75A1 1 0 0 1 7.75 1V4.5H11.75A1 1 0 0 1 12.75 5.5V15A1 1 0 0 1 11.75 16H3.25A1 1 0 0 1 2.25 15V1A1 1 0 0 1 3.25 0Z`;

const gable = `M12 0.6L23.1 8.6A2.2 2.2 0 0 1 24 10.4V${24 - r}A${r} ${r} 0 0 1 ${24 - r} 24H${r}A${r} ${r} 0 0 1 0 ${24 - r}V10.4A2.2 2.2 0 0 1 0.9 8.6Z`;
const windowHole = `M14.4 4.8H19.2V9.6H14.4Z`;
const chimney = `M${r} 6H15.6V2A1.2 1.2 0 0 1 16.8 0.8H19.6A1.2 1.2 0 0 1 20.8 2V6H${24 - r}A${r} ${r} 0 0 1 24 ${6 + r}V${24 - r}A${r} ${r} 0 0 1 ${24 - r} 24H${r}A${r} ${r} 0 0 1 0 ${24 - r}V${6 + r}A${r} ${r} 0 0 1 ${r} 6Z`;
const keyhole = `M12 7.2A3 3 0 0 1 13.5 12.8L14.4 18H9.6L10.5 12.8A3 3 0 0 1 12 7.2Z`;

const pixelRows = ["10000", "10000", "11110", "10001", "10001"];
function pixels() {
  const cell = 4.4;
  const gap = 0.5;
  const parts = [];
  pixelRows.forEach((row, y) => [...row].forEach((on, x) => {
    if (on === "1") parts.push(`<rect x="${(x * (cell + gap)).toFixed(2)}" y="${(y * (cell + gap)).toFixed(2)}" width="${cell}" height="${cell}" rx="0.6"/>`);
  }));
  return parts.join("");
}

export const directions = [
  { id: "A", name: "Square", note: "Current. Base square, nothing added.", body: (c) => `<path fill="${c}" d="${square}"/>` },
  { id: "B", name: "Doorway", note: "Arched door cut from the base. It is also the counter of the h.", body: (c) => `<path fill="${c}" d="${doorway}"/>` },
  { id: "C", name: "Ascender", note: "The first frame of the hover: the square grows an h stem.", body: (c) => `<path fill="${c}" d="${ascender}"/>` },
  { id: "D", name: "Gable", note: "Pitched roof on the square. Reads as house, loses Base.", body: (c) => `<path fill="${c}" d="${gable}"/>` },
  { id: "E", name: "Window", note: "One lit window, top right. Gets lost under 24px.", body: (c) => `<path fill="${c}" fill-rule="evenodd" d="${square}${windowHole}"/>` },
  { id: "F", name: "Pixel h", note: "The Doto grid from the hover, frozen as an h.", body: (c) => `<g fill="${c}">${pixels()}</g>` },
  { id: "G", name: "Chimney", note: "Square with a chimney block. Cute, but a clip-art cue.", body: (c) => `<path fill="${c}" d="${chimney}"/>` },
  { id: "H", name: "Keyhole", note: "Security cue. Wrong idea for a money app's front door.", body: (c) => `<path fill="${c}" fill-rule="evenodd" d="${square}${keyhole}"/>` },
];

export function svg24(body, size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">${body}</svg>`;
}
