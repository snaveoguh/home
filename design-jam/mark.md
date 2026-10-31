# mark: Home mark and operator logo rules

Branch `design/mark`. Shots in `design-jam/shots/mark/`.

## What changed

The resting Home mark is now the Base square with an arched door cut from its base (direction B, "Doorway").

- The door is 20% of the square wide and 50% tall, centred. That leaves two 40% walls, the same width as the h stem the hover animation already grows. So on hover the first beat is a real lowercase h: the stem rises, the door becomes the counter.
- Implemented as one `clip-path: path()` on the first square (desktop, 28 px) and on the mobile square (24 px) in `apps/web/components/home-mark.module.css`. The hover sequence in `home-mark-animation.ts` is untouched.
- Dark appearance: the mark uses `#578bfa` (the Dark `--primary`). The brand blue `#002ef4` is 2.3:1 on the Dark header; `#578bfa` is 5.6:1.
- Favicon: `apps/web/app/icon.svg`, hand-hinted on a 16 grid (door 4 px wide, 6 px tall, walls 6 px), with a `prefers-color-scheme: dark` swap to `#578bfa`. Apple touch icon: `apps/web/app/apple-icon.png`, 180 px blue tile with the door rising from the bottom edge. The repo had no favicon before.

## Operator logo rules

Status: proposal. Not wired to Admin settings; shown with an injected logo in the real header.

(Filled in below.)

## Cool finds

- `clip-path: path()` takes pixel coordinates, so a 24 grid drawing pastes straight into a 24 px element. A second subpath above the box (`M-20 -60H60V2.8H-20Z`) leaves room for children that grow out of it, here the h ascender.
- Pixel proofs: render the SVG into a 16 by 16 canvas, then draw that canvas at 8x with `imageSmoothingEnabled = false`. Shows exactly what a tab will show. Script: `design-jam/shots/mark/src/refine.mjs`.

## Borrowed from

(Pending check-in.)

## For the others

- gallery: the operator logo rules below are written so you can drop made-up bank logos straight into the header slot.
