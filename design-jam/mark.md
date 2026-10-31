# mark: Home mark and operator logo rules

Branch `design/mark`. Shots in `design-jam/shots/mark/`.

## What changed

The resting Home mark is now the Base square with an arched door cut from its base (direction B, "Doorway").

- The door is 20% of the square wide and 50% tall, centred. That leaves two 40% walls, the same width as the h stem the hover animation already grows, so stem plus door is a lowercase h (`02-refine.png`, bottom row). In the live hover this h only flashes past under the Doto pixels (`06-hover-frames.png`); it is the reason for the proportions more than a visible frame.
- Why it beat the others: it keeps the Base square, adds one idea, and still reads at 16 px. Gable and Chimney read as house but lose the square. Window and Keyhole vanish under 24 px. Ascender (runner-up) reads as a bar chart at rest.
- Implemented as one `clip-path: path()` on the first square (desktop, 28 px) and on the mobile square (24 px) in `apps/web/components/home-mark.module.css`. The hover sequence in `home-mark-animation.ts` is untouched.
- Dark appearance: the mark uses `#578bfa` (the Dark `--primary`). The brand blue `#002ef4` is 2.3:1 on the Dark header; `#578bfa` is 5.6:1.
- Favicon: `apps/web/app/icon.svg`, hand-hinted on a 16 grid (door 4 px wide, 6 px tall, walls 6 px), with a `prefers-color-scheme: dark` swap to `#578bfa`. Apple touch icon: `apps/web/app/apple-icon.png`, 180 px blue tile with the door rising from the bottom edge. The repo had no favicon before.

## Operator logo rules

Status: proposal. Today `BrandSettings` has no logo field (gallery found the same), so these rules are the contract a future `logo` setting would validate against. The shots inject each logo into the real landing header's Home mark slot.

### The slot

| | Desktop, 768 px and up | Mobile, under 768 px |
| --- | --- | --- |
| Logo height | 28 px | 24 px |
| Max width | 160 px | 112 px |
| Very wide logos (over 4:1) | 20 px tall, max 160 px wide | Swap to the square symbol |
| Hit target | at least 44 by 44 px | at least 44 by 44 px |

The logo's left edge sits where the Home mark's left edge sits. It is vertically centred on the header. It is a link to Home with the accessible name "{displayName} home", the same as the Home mark today.

### Clear space

25% of the rendered logo height on every side, measured from the artwork's tight bounds: 7 px on desktop, 6 px on mobile, 5 px for a 20 px very wide logo. Nothing enters it: no badge, no divider, no page title. The 44 px hit area may overlap it.

### Shape classes

Ratio is width over height of the supplied viewBox.

| Class | Ratio | Desktop | Mobile |
| --- | --- | --- | --- |
| Tall | under 0.8 | 28 px tall, natural width | 24 px tall |
| Square | 0.8 to 1.25 | 28 by 28 | 24 by 24 |
| Wide | 1.25 to 4 | 28 px tall, up to 160 wide, then scale down | 24 px tall, up to 112 wide, then scale down |
| Very wide | over 4 | 20 px tall, up to 160 wide | square symbol at 24 |

Wide logos are never cropped or squashed. If scaling to the max width takes a wordmark under the 16 px minimum, the symbol is used instead.

### Minimum size

- Symbol: 16 px. It is also the favicon, so it must read in a browser tab.
- Wordmark: 16 px tall and 64 px wide.

### Files

- SVG only. viewBox tight to the artwork, no padding baked in (Home adds the clear space).
- Text outlined to paths. No raster, gradients, filters, scripts, external references or animation.
- At most two flat colours.
- Three files: Light logo (required), Dark logo (required unless the Light logo is one colour drawn in `currentColor`), and a square symbol with its own Light and Dark versions (required). The symbol is the favicon, the mobile fallback for very wide logos and the collapsed desktop rail.

### Light and dark

- The main colour of each version needs 3:1 against its header: white in Light, `#171717` in Dark. Home rejects a version that fails and asks for a fix, rather than tinting it.
- A one-colour logo can be drawn in `currentColor`. Home paints it `--foreground`, so it is near black in Light and near white in Dark with no second file (Quillmere below).
- Logos keep their colours. They are not recoloured to the operator's `primaryColor`.

### Behaviour

Operator logos do not animate. The hover that spells "home" belongs to the Home mark only. Focus ring and hit target match the Home mark.

### The four made-up operators

All four names are invented and are not meant to resemble any real institution. Files in `design-jam/shots/mark/operators/`, generator in `design-jam/shots/mark/src/operators.mjs` (it also holds the `fit()` sizing function, ready to port).

| Operator | Logo | Class | Desktop | Mobile |
| --- | --- | --- | --- | --- |
| Okaro | Green rounded square with a ring | Square | 28 by 28 | 24 by 24 |
| Quillmere | Serif wordmark in `currentColor` | Wide, 3.9:1 | 109 by 28 | 93 by 24 |
| Ferrowan Mutual | F symbol and name lockup | Very wide, 7.2:1 | 143 by 20 | symbol, 24 by 24 |
| Marrowby Co-op | Purple crest | Tall, 0.77:1 | 22 by 28 | 18 by 24 |

Shots: `04-operators-header.png` (all four, 1280 and 390, Light and Dark), `05-operators-clear-space.png` (clear space drawn on).

Note: the mock logos use live system text inside the SVG for speed. Real submissions must outline text, per the file rules.

## Shots

| File | What |
| --- | --- |
| `01-directions.svg` (and `.png`) | SVG contact sheet: eight directions at 96, 32, 24, 16 px, Light and Dark |
| `02-refine.png` | Doorway and Ascender refined: sizes, 16 px pixel proofs, Dark tab, app icon, the h story |
| `03-landing-1280.png`, `03-landing-390.png` | The doorway mark in the real landing header |
| `04-operators-header.png` | Four made-up operators in the real header, 1280 and 390, Light and Dark |
| `05-operators-clear-space.png` | Same, with tight bounds and clear space drawn |
| `06-hover-frames.png` | Hover sequence still works with the clipped first square |
| `operators/*.svg` | The mock operator logo files |

Sources: `src/marks.mjs` (all mark paths), `src/contact-sheet.mjs`, `src/refine.mjs`, `src/operators.mjs`, `src/header-shots.mjs` (needs a dev server; pass its URL).

## Checks

Run with my dev server stopped (with five sessions on one box, the first attempt was OOM killed).

- `bun install --frozen-lockfile`: no changes.
- `DATABASE_URL="" bun lint`: pass, exit 0, no warnings (`--deny-warnings`).
- `bun typecheck`: pass, exit 0 (needed `NODE_OPTIONS=--max-old-space-size=6144` on this shared box).
- `bun run gates`: pass, exit 0. The new `app/icon.svg` and `app/apple-icon.png` need no route-contract entry.

## Cool finds

- `clip-path: path()` takes pixel coordinates, so a 24 grid drawing pastes straight into a 24 px element. A second subpath above the box (`M-20 -60H60V2.8H-20Z`) leaves room for children that grow out of it, here the h ascender.
- Pixel proofs: render the SVG into a 16 by 16 canvas, then draw that canvas at 8x with `imageSmoothingEnabled = false`. Shows exactly what a tab will show. Script: `design-jam/shots/mark/src/refine.mjs`.

## Borrowed from

- gallery: the finding that `BrandSettings` has no logo field and that Dark ignores the brand. It is why the rules require a Dark logo or a `currentColor` logo, instead of relying on the brand theme.

## For the others

- gallery: use the operator logo rules above for your made-up banks. `fit()` and `classify()` in `design-jam/shots/mark/src/operators.mjs` give the size for any viewBox; a `currentColor` wordmark is the cheapest way to get a logo that works in Light and Dark.
- everyone: the Home mark now has a Dark colour (`#578bfa`). If your shots show the header in Dark, rebase or expect the mark to differ.
- review: favicon and apple touch icon did not exist on main; they do on this branch.
- motion: your `document.getAnimations()` pause-and-step trick would have given me a clean hover frame strip. My real-time screenshots are noisy.
