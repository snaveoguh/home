const sans = `font-family="ui-sans-serif, system-ui, -apple-system, Helvetica, Arial, sans-serif"`;
const serif = `font-family="Georgia, 'Times New Roman', serif"`;

function svg(w, h, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>`;
}

const okaro = (green) => svg(24, 24, `<rect width="24" height="24" rx="6" fill="${green}"/><circle cx="12" cy="12" r="5.6" fill="none" stroke="#ffffff" stroke-width="3.2"/>`);
const ferrowanSymbol = (red) => `<rect width="24" height="24" rx="3" fill="${red}"/><path d="M6 6H18V9.6H9.6V11H16V14.6H9.6V18H6Z" fill="#ffffff"/>`;
const marrowby = (purple, ink) => svg(20, 26, `<path d="M0 0H20V15A10 11 0 0 1 10 26A10 11 0 0 1 0 15Z" fill="${purple}"/><path d="M4.5 16V6.5L10 12L15.5 6.5V16H13V12.4L10 15.4L7 12.4V16Z" fill="${ink}"/>`);

export const operators = [
  {
    slug: "okaro",
    name: "Okaro",
    kind: "Symbol only, square",
    light: okaro("#0f7a4f"),
    dark: okaro("#2fbf7f"),
    symbolLight: okaro("#0f7a4f"),
    symbolDark: okaro("#2fbf7f"),
  },
  {
    slug: "quillmere",
    name: "Quillmere",
    kind: "Wordmark, one colour (currentColor)",
    light: svg(124, 32, `<text x="0" y="25" font-size="30" ${serif} fill="currentColor" letter-spacing="-0.6">Quillmere</text>`),
    dark: null,
    symbolLight: svg(24, 24, `<rect width="24" height="24" rx="5" fill="currentColor"/><text x="12" y="18.5" text-anchor="middle" font-size="18" ${serif} fill="#ffffff">Q</text>`),
    symbolDark: svg(24, 24, `<rect width="24" height="24" rx="5" fill="currentColor"/><text x="12" y="18.5" text-anchor="middle" font-size="18" ${serif} fill="#171717">Q</text>`),
  },
  {
    slug: "ferrowan",
    name: "Ferrowan Mutual",
    kind: "Symbol and wordmark lockup, very wide",
    light: svg(172, 24, `${ferrowanSymbol("#b4361e")}<text x="32" y="17.5" font-size="16" font-weight="600" ${sans} fill="#1c1917">Ferrowan Mutual</text>`),
    dark: svg(172, 24, `${ferrowanSymbol("#e2583b")}<text x="32" y="17.5" font-size="16" font-weight="600" ${sans} fill="#fafaf9">Ferrowan Mutual</text>`),
    symbolLight: svg(24, 24, ferrowanSymbol("#b4361e")),
    symbolDark: svg(24, 24, ferrowanSymbol("#e2583b")),
  },
  {
    slug: "marrowby",
    name: "Marrowby Co-op",
    kind: "Crest, taller than wide",
    light: marrowby("#5b3fd1", "#ffffff"),
    dark: marrowby("#a594ff", "#171717"),
    symbolLight: marrowby("#5b3fd1", "#ffffff"),
    symbolDark: marrowby("#a594ff", "#171717"),
  },
];

export const slot = {
  desktop: { height: 28, maxWidth: 160, veryWideHeight: 20 },
  mobile: { height: 24, maxWidth: 112 },
  clearSpace: 0.25,
  minSymbol: 16,
  minWordmarkHeight: 16,
};

export function ratioOf(markup) {
  const [, , w, h] = markup.match(/viewBox="([\d.\s-]+)"/)[1].split(/\s+/).map(Number);
  return w / h;
}

export function classify(ratio) {
  if (ratio < 0.8) return "tall";
  if (ratio <= 1.25) return "square";
  if (ratio <= 4) return "wide";
  return "very wide";
}

export function fit(op, desktop) {
  const ratio = ratioOf(op.light);
  const kind = classify(ratio);
  if (!desktop && kind === "very wide") {
    const r = ratioOf(op.symbolLight);
    return { use: "symbol", kind, height: slot.mobile.height, width: slot.mobile.height * r };
  }
  const box = desktop ? slot.desktop : slot.mobile;
  let height = kind === "very wide" && desktop ? box.veryWideHeight : box.height;
  let width = height * ratio;
  if (width > box.maxWidth) {
    width = box.maxWidth;
    height = width / ratio;
  }
  return { use: "full", kind, height, width };
}
