import { contrastRatio, type BrandSettings } from "@/shared/operator-branding/schema";
import { brandThemeCss } from "@/shared/operator-branding/theme";

export type Typeface = "sans" | "serif" | "rounded" | "mono" | "heavy";
export type RadiusScale = "square" | "soft" | "round";
export type Density = "standard" | "roomy";
export type Imagery = "route" | "jar" | "quorum" | "monogram" | "stickers";

export type ColourPair = { primaryColor: string; backgroundColor: string };

export type ProposedBrand = {
  light: ColourPair;
  dark: ColourPair;
  typeface: Typeface;
  radius: RadiusScale;
  density: Density;
  mark: string;
  markColours: { light: readonly [string, string]; dark: readonly [string, string] };
  wordmark: string;
  imagery: Imagery;
};

export type ExampleBank = {
  id: string;
  name: string;
  customer: string;
  today: BrandSettings;
  proposed: ProposedBrand;
};

const typefaceStacks: Record<Typeface, string> = {
  sans: "\"Inter Display\", \"Inter\", ui-sans-serif, system-ui, sans-serif",
  serif: "\"Iowan Old Style\", Charter, \"Bitstream Charter\", \"Source Serif 4\", Georgia, serif",
  rounded: "ui-rounded, \"SF Pro Rounded\", \"Nunito\", \"Inter Display\", ui-sans-serif, sans-serif",
  mono: "\"JetBrains Mono\", ui-monospace, SFMono-Regular, Menlo, monospace",
  heavy: "\"Inter Display\", \"Inter\", ui-sans-serif, system-ui, sans-serif",
};

const typefaceWeights: Record<Typeface, number> = { sans: 600, serif: 500, rounded: 700, mono: 500, heavy: 900 };
const typefaceTracking: Record<Typeface, string> = { sans: "-0.025em", serif: "-0.01em", rounded: "-0.02em", mono: "-0.04em", heavy: "-0.045em" };
const radiusValues: Record<RadiusScale, string> = { square: "0.0625rem", soft: "0.375rem", round: "0.875rem" };
const densityValues: Record<Density, string> = { standard: "0.25rem", roomy: "0.28125rem" };

function svgUrl(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function paint(body: string, [a, b]: readonly [string, string]): string {
  return body.replaceAll("{a}", a).replaceAll("{b}", b);
}

function markSvg(body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28">${body}</svg>`;
}

const advance: Record<Typeface, number> = { sans: 0.56, serif: 0.52, rounded: 0.58, mono: 0.6, heavy: 0.62 };

export function wordmarkWidth(word: string, typeface: Typeface): number {
  return 36 + Math.ceil([...word].length * 17 * advance[typeface]);
}

function wordmarkSvg(mark: string, word: string, colour: string, typeface: Typeface): string {
  const escaped = word.replace(/&/g, "&amp;");
  const width = wordmarkWidth(word, typeface);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 28" width="${width}" height="28"><g>${mark}</g><text x="36" y="20" fill="${colour}" font-family='${typefaceStacks[typeface].replace(/"/g, "")}' font-size="17" font-weight="${typefaceWeights[typeface]}" letter-spacing="-0.3">${escaped}</text></svg>`;
}

const logoSlot = { desktop: { height: 28, maxWidth: 160, veryWideHeight: 20 }, mobile: { height: 24, maxWidth: 112 } } as const;

export type LogoClass = "tall" | "square" | "wide" | "very wide";

export function classifyLogo(ratio: number): LogoClass {
  if (ratio < 0.8) return "tall";
  if (ratio <= 1.25) return "square";
  if (ratio <= 4) return "wide";
  return "very wide";
}

export function fitLogo(ratio: number, desktop: boolean): { use: "full" | "symbol"; kind: LogoClass; width: number; height: number } {
  const kind = classifyLogo(ratio);
  if (!desktop && kind === "very wide") return { use: "symbol", kind, width: logoSlot.mobile.height, height: logoSlot.mobile.height };
  const box = desktop ? logoSlot.desktop : logoSlot.mobile;
  let height: number = kind === "very wide" && desktop ? logoSlot.desktop.veryWideHeight : box.height;
  let width = height * ratio;
  if (width > box.maxWidth) {
    width = box.maxWidth;
    height = width / ratio;
  }
  return { use: "full", kind, width: Math.round(width), height: Math.round(height) };
}

export function markContrast(bank: ExampleBank): { light: number; dark: number } {
  const { markColours, light, dark } = bank.proposed;
  return { light: contrastRatio(markColours.light[0], light.backgroundColor), dark: contrastRatio(markColours.dark[0], dark.backgroundColor) };
}

export const exampleBanks: readonly ExampleBank[] = [
  {
    id: "lagoon-line",
    name: "Lagoon Line",
    customer: "Nigerians in London sending money home to Lagos",
    today: { displayName: "Lagoon Line", description: "Send pounds home to Lagos as dollars on Base, for a flat fee.", primaryColor: "#14824f", backgroundColor: "#f6f1e6" },
    proposed: {
      light: { primaryColor: "#0f6b42", backgroundColor: "#f6f1e6" },
      dark: { primaryColor: "#52c48a", backgroundColor: "#0f1914" },
      typeface: "sans",
      radius: "soft",
      density: "standard",
      mark: "<rect width='28' height='28' rx='7' fill='{a}'/><path d='M6 18c4-8 12-8 16 0' stroke='{b}' stroke-width='2.4' fill='none' stroke-linecap='round'/><circle cx='6' cy='18' r='2.4' fill='{b}'/><circle cx='22' cy='18' r='2.4' fill='{b}'/>",
      markColours: { light: ["#0f6b42", "#f6f1e6"], dark: ["#52c48a", "#0f1914"] },
      wordmark: "Lagoon Line",
      imagery: "route",
    },
  },
  {
    id: "pocketful",
    name: "Pocketful",
    customer: "Teenagers saving with a parent watching",
    today: { displayName: "Pocketful", description: "Save for the next thing you want. A parent can see it, only you can spend it.", primaryColor: "#7c4dff", backgroundColor: "#f3efff" },
    proposed: {
      light: { primaryColor: "#5b2ee6", backgroundColor: "#f3efff" },
      dark: { primaryColor: "#b39dff", backgroundColor: "#161127" },
      typeface: "rounded",
      radius: "round",
      density: "roomy",
      mark: "<rect width='28' height='28' rx='14' fill='{a}'/><rect x='8' y='9' width='12' height='12' rx='6' fill='{b}'/>",
      markColours: { light: ["#5b2ee6", "#c8f560"], dark: ["#b39dff", "#c8f560"] },
      wordmark: "Pocketful",
      imagery: "jar",
    },
  },
  {
    id: "tallyhouse",
    name: "Tallyhouse",
    customer: "A DAO treasury run by a multisig of contributors",
    today: { displayName: "Tallyhouse", description: "A treasury your contributors can read. Every payment shows its signers.", primaryColor: "#1d5c63", backgroundColor: "#f2f3f1" },
    proposed: {
      light: { primaryColor: "#1d5c63", backgroundColor: "#f2f3f1" },
      dark: { primaryColor: "#7cc6cc", backgroundColor: "#101415" },
      typeface: "mono",
      radius: "square",
      density: "standard",
      mark: "<rect width='28' height='28' fill='{a}'/><g fill='{b}'><rect x='5' y='5' width='4' height='4'/><rect x='12' y='5' width='4' height='4'/><rect x='19' y='5' width='4' height='4'/><rect x='5' y='12' width='4' height='4'/><rect x='12' y='12' width='4' height='4'/><rect x='5' y='19' width='4' height='4'/></g><g fill='none' stroke='{b}' stroke-width='1'><rect x='19.5' y='12.5' width='3' height='3'/><rect x='12.5' y='19.5' width='3' height='3'/><rect x='19.5' y='19.5' width='3' height='3'/></g>",
      markColours: { light: ["#1d5c63", "#f2f3f1"], dark: ["#7cc6cc", "#101415"] },
      wordmark: "Tallyhouse",
      imagery: "quorum",
    },
  },
  {
    id: "ashcombe",
    name: "Ashcombe Private",
    customer: "Private clients who want a quiet, formal account",
    today: { displayName: "Ashcombe Private", description: "Private banking on Base. By introduction.", primaryColor: "#c9a24a", backgroundColor: "#0b0b0c" },
    proposed: {
      light: { primaryColor: "#7a5f1c", backgroundColor: "#f8f5ee" },
      dark: { primaryColor: "#c9a24a", backgroundColor: "#0b0b0c" },
      typeface: "serif",
      radius: "square",
      density: "roomy",
      mark: "<rect width='28' height='28' fill='{a}'/><rect x='2.5' y='2.5' width='23' height='23' fill='none' stroke='{b}' stroke-width='0.8'/><text x='14' y='19.5' text-anchor='middle' fill='{b}' font-family='Charter, Bitstream Charter, Georgia, serif' font-size='15'>A</text>",
      markColours: { light: ["#0b0b0c", "#c9a24a"], dark: ["#c9a24a", "#0b0b0c"] },
      wordmark: "Ashcombe",
      imagery: "monogram",
    },
  },
  {
    id: "moshpit",
    name: "Moshpit",
    customer: "Friends splitting gig tickets, merch and the night bus",
    today: { displayName: "Moshpit", description: "Money for the group chat. Split it, send it, pay back the friend who got the tickets.", primaryColor: "#ff2e88", backgroundColor: "#fff35c" },
    proposed: {
      light: { primaryColor: "#c8005e", backgroundColor: "#fff35c" },
      dark: { primaryColor: "#ff5aa5", backgroundColor: "#1b0f3a" },
      typeface: "heavy",
      radius: "round",
      density: "roomy",
      mark: "<rect width='28' height='28' rx='9' fill='{a}' transform='rotate(-8 14 14)'/><path d='M8 19l3-10 3 7 3-7 3 10' stroke='{b}' stroke-width='2.6' fill='none' stroke-linejoin='round' stroke-linecap='round'/>",
      markColours: { light: ["#c8005e", "#fff35c"], dark: ["#ff5aa5", "#1b0f3a"] },
      wordmark: "Moshpit",
      imagery: "stickers",
    },
  },
];

function channels(hex: string): [number, number, number] {
  return [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16)) as [number, number, number];
}

export function mix(from: string, to: string, amount: number): string {
  const a = channels(from);
  const b = channels(to);
  return `#${a.map((channel, index) => Math.round(channel + (b[index]! - channel) * amount).toString(16).padStart(2, "0")).join("")}`;
}

function isDark(hex: string): boolean {
  return contrastRatio(hex, "#ffffff") > contrastRatio(hex, "#000000");
}

function readable(colour: string, against: readonly string[], toward: string, minimum: number): string {
  for (let step = 0; step <= 100; step += 1) {
    const candidate = mix(colour, toward, step / 100);
    if (against.every((surface) => contrastRatio(candidate, surface) >= minimum)) return candidate;
  }
  return toward;
}

export type SchemeTokens = Record<string, string>;

export function deriveScheme(pair: ColourPair): SchemeTokens {
  const background = pair.backgroundColor;
  const dark = isDark(background);
  const ink = dark ? "#f5f5f4" : "#141414";
  const foreground = mix(ink, background, 0.04);
  const muted = dark ? mix(background, "#000000", 0.35) : mix(background, ink, 0.035);
  const secondary = mix(background, ink, dark ? 0.1 : 0.06);
  const mutedForeground = readable(mix(ink, background, 0.45), [background, muted, secondary], ink, 4.5);
  const primary = readable(pair.primaryColor, [background, muted], ink, 4.5);
  const primaryForeground = contrastRatio(primary, "#ffffff") >= contrastRatio(primary, "#0a0a0a") ? "#ffffff" : "#0a0a0a";
  return {
    "--background": background,
    "--foreground": foreground,
    "--card": background,
    "--card-foreground": foreground,
    "--popover": dark ? mix(background, ink, 0.06) : background,
    "--popover-foreground": foreground,
    "--primary": primary,
    "--primary-foreground": primaryForeground,
    "--secondary": secondary,
    "--secondary-foreground": foreground,
    "--muted": muted,
    "--muted-foreground": mutedForeground,
    "--accent": secondary,
    "--accent-foreground": foreground,
    "--border": mix(background, ink, dark ? 0.18 : 0.11),
    "--input": mix(background, ink, dark ? 0.26 : 0.14),
    "--ring": primary,
  };
}

function declarations(tokens: SchemeTokens): string {
  return Object.entries(tokens).map(([name, value]) => `${name}:${value}`).join(";");
}

export function todayCss(bank: ExampleBank): string {
  return brandThemeCss(bank.today) ?? "";
}

export function proposedTokens(bank: ExampleBank): SchemeTokens {
  const { typeface, radius, density, mark, markColours, wordmark, light } = bank.proposed;
  const family = typefaceStacks[typeface];
  const weight = typefaceWeights[typeface];
  const lightInk = deriveScheme(light)["--foreground"]!;
  return {
    "--radius": radiusValues[radius],
    "--spacing": densityValues[density],
    "--font-display": family,
    "--font-display-weight": String(weight),
    "--font-display-tracking": typefaceTracking[typeface],
    "--brand-mark": svgUrl(markSvg(paint(mark, markColours.light))),
    "--brand-wordmark": svgUrl(wordmarkSvg(paint(mark, markColours.light), wordmark, lightInk, typeface)),
  };
}

export function proposedCss(bank: ExampleBank): string {
  const { light, dark, mark, markColours, wordmark, typeface } = bank.proposed;
  const darkInk = deriveScheme(dark)["--foreground"]!;
  const shared = proposedTokens(bank);
  const darkMark = svgUrl(markSvg(paint(mark, markColours.dark)));
  const darkWordmark = svgUrl(wordmarkSvg(paint(mark, markColours.dark), wordmark, darkInk, typeface));
  const desktop = fitLogo(wordmarkWidth(wordmark, typeface) / 28, true);
  const mobile = fitLogo(wordmarkWidth(wordmark, typeface) / 28, false);
  const mobileWordmark = mobile.use === "full"
    ? [`@media (width < 768px){[data-home-mark]:not([class*=compact]){width:${mobile.width}px !important;min-width:${mobile.width}px !important}[data-home-mark]:not([class*=compact])>:is(a,button){background-image:var(--brand-wordmark) !important;background-size:${mobile.width}px ${mobile.height}px !important;width:${mobile.width}px !important}}`]
    : [];
  const consumers = [
    "body{background-color:var(--muted) !important}",
    "h1,h2,[data-slot=card-title]{font-family:var(--font-display);font-weight:var(--font-display-weight);letter-spacing:var(--font-display-tracking)}",
    "[aria-label=\"Total balance\"] .text-4xl{font-family:var(--font-display);font-weight:var(--font-display-weight);letter-spacing:var(--font-display-tracking)}",
    "[data-home-mark]>:is(a,button){background:var(--brand-mark) left center/28px 28px no-repeat !important}",
    "@media (width < 768px){[data-home-mark]>:is(a,button){background-size:24px 24px !important}}",
    `@media (width >= 768px){[data-home-mark]:not([class*=compact])>:is(a,button){background-image:var(--brand-wordmark) !important;background-size:${desktop.width}px ${desktop.height}px !important;width:${desktop.width}px !important}}`,
    ...mobileWordmark,
    "[data-home-mark]>:is(a,button)>*{visibility:hidden}",
  ];
  return [
    `:root{${declarations(shared)};${declarations(deriveScheme(light))}}`,
    `:root.dark{${declarations(deriveScheme(dark))};--brand-mark:${darkMark};--brand-wordmark:${darkWordmark}}`,
    ...consumers,
  ].join("\n");
}

export function proposedSettingsShape(bank: ExampleBank) {
  const { light, dark, typeface, radius, density, imagery } = bank.proposed;
  return {
    displayName: bank.today.displayName,
    description: bank.today.description,
    primaryColor: light.primaryColor,
    backgroundColor: light.backgroundColor,
    darkPrimaryColor: dark.primaryColor,
    darkBackgroundColor: dark.backgroundColor,
    typeface,
    radius,
    density,
    logo: {
      mark: { light: `${bank.id}-mark-light.svg`, dark: `${bank.id}-mark-dark.svg` },
      wordmark: { light: `${bank.id}-wordmark-light.svg`, dark: `${bank.id}-wordmark-dark.svg` },
      desktop: fitLogo(wordmarkWidth(bank.proposed.wordmark, typeface) / 28, true),
      mobile: fitLogo(wordmarkWidth(bank.proposed.wordmark, typeface) / 28, false),
    },
    landingImage: imagery,
  };
}
