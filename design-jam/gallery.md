# Design jam: example neobanks gallery

Branch `design/gallery`. Shots in `design-jam/shots/gallery/`. Storybook: `Review/Explorations/Neobank gallery` (id `explorations-neobank-gallery`), with an Overview story and a landing and home story per bank. Each story has a `level` arg: `today` (what operators can set now) or `proposed` (with the token additions below).

Code, all exploration-only:

- `apps/web/stories/review/explorations/gallery/banks.ts`: the five banks, `todayCss` (calls the production `brandThemeCss`, unchanged), `deriveScheme` and `proposedCss` (the prototype).
- `apps/web/stories/review/explorations/gallery/imagery.tsx`: one landing image per bank, drawn only with `--primary`, `--foreground` and `--muted`, so it follows light and dark.
- `apps/web/stories/review/explorations/gallery/neobank-gallery.stories.tsx`: stories. Landing is the real `LandingShell` with a signed-out client. Home is the real `DashboardShell` and `HomeOverview` with the existing journey fixtures. Nothing is rebuilt.

All names are made up. All balances are the existing story fixtures ($12.34 and so on), not real data.

## The banks

| Bank | Customer | Typeface | Radius | Density | Image |
| --- | --- | --- | --- | --- | --- |
| Lagoon Line | Nigerians in London sending money home to Lagos | sans (Inter Display) | soft | standard | London to Lagos route |
| Pocketful | Teenagers saving, with a parent watching | rounded | round | roomy | Savings jar |
| Tallyhouse | A DAO treasury run by a multisig | mono | square | standard | 7 of 12 signers |
| Ashcombe Private | Private clients who want a quiet, formal account | serif (Charter) | square | roomy | Monogram |
| Moshpit (the wild one) | Friends splitting gig tickets and the night bus | heavy (Inter Display Black) | round | roomy | Ticket and stickers |

Best single shot: `shots/gallery/sheet-390-proposed-light.png` (all five, landing and home, at 390). Its dark twin is `sheet-390-proposed-dark.png`.

## What operators can theme today

Read from code, not the brief:

- `apps/web/shared/operator-branding/schema.ts`: four fields. `displayName`, `description`, `primaryColor`, `backgroundColor`. **There is no logo field.** The brief assumed one.
- `apps/web/shared/operator-branding/theme.ts`: `brandThemeCss` writes `--primary`, `--primary-foreground`, `--ring`, `--background`, `--foreground`, inside `:root:not(.dark)`.
- `apps/web/app/layout.tsx` puts that in a `<style>` in `<head>`.

## Pushing two colours as far as they go

Each bank typed in its real brand colours. This is what Home actually applies (production code, run on these inputs):

| Bank | Operator typed | Home applies (light) | Proposed light | Proposed dark |
| --- | --- | --- | --- | --- |
| Lagoon Line | #14824f on #f6f1e6 | #14814e on #fbf9f4 | #0f6b42 on #f6f1e6 | #52c48a on #0f1914 |
| Pocketful | #7c4dff on #f3efff | #7a4bfa on #faf8ff | #5b2ee6 on #f3efff | #b39dff on #161127 |
| Tallyhouse | #1d5c63 on #f2f3f1 | #1d5c63 on #f9f9f8 | #1d5c63 on #f2f3f1 | #7cc6cc on #101415 |
| Ashcombe Private | #c9a24a on #0b0b0c | #876d32 on #fafafa | #7a5f1c on #f8f5ee | #c9a24a on #0b0b0c |
| Moshpit | #ff2e88 on #fff35c | #d12670 on #fffbce | #c8005e on #fff35c | #ff5aa5 on #1b0f3a |

Compare `sheet-today-vs-proposed-home-390-light.png` (top row today, bottom row proposed) and `sheet-390-today-dark.png`.

## Where two colours stop being enough

In order of how much it hurts:

1. **Dark mode drops the brand.** The theme CSS is scoped to `:root:not(.dark)`. In dark, all five banks are Home: same blue button, same grey. See `sheet-390-today-dark.png`. Ashcombe, a black-and-gold bank, cannot exist.
2. **The background is almost always white.** `boundLightBackground` mixes the page colour toward white until the fixed muted text `#737373` reaches 4.5:1. `#737373` is only 4.74:1 on pure white, so any real tint fails. Lagoon Line's cream `#f6f1e6` becomes `#fbf9f4`. Ashcombe's black `#0b0b0c` becomes `#fafafa`. The rule protects muted text by moving the background. It should move the muted text instead.
3. **On the signed-in home, the background only paints the header.** Cards use `--card` and the canvas uses `--muted`. The brand sets neither, so cards stay white and the canvas stays neutral grey under a tinted header (`lagoon-line-home-390-light-today.png`).
4. **No logo slot.** The header mark is Home's blue square, hard-coded as `--mark-blue: #002ef4` in `components/home-mark.module.css`. It does not even follow `--primary`. The display name only shows up in the mark's `aria-label` ("Lagoon Line home") and the page `<title>`. On the landing page, a customer of any bank sees a blue square and a "Sign in" button.
5. **The primary clamp turns light brand colours brown.** Gold `#c9a24a` comes out as `#876d32`, and pink as raspberry. For text on light this is right, so keep it. The fix is a dark pair, not a weaker clamp: gold looks like gold on black.
6. **Type.** One system sans for every bank. A private bank wants a serif headline, a treasury wants mono figures, a teen app wants something rounder. The balance figure is the loudest thing on Home, and it cannot change.
7. **Radius.** `--radius: 0.25rem` drives the whole scale (`--radius-sm` to `--radius-2xl` are `calc()` of it), but operators cannot touch it. Square for Tallyhouse and Ashcombe, round for Pocketful and Moshpit, is half of what makes each one look like itself.
8. **Density.** Tailwind v4's `--spacing` drives every `p-*`, `gap-*` and `size-*`. Home is already at the compact floor: `size-11` is exactly the 44px touch target. So density can only go up. Roomy is `0.28125rem` (1.125x, 49.5px targets). A "compact" option would break hit targets, so it is not offered.
9. **Imagery.** `LandingShell` already takes a `landingVisual` prop, but `app/page.tsx` always passes the globe, and its dots are Home blue. A remittance app wants its route, a treasury its signers.
10. **Copy (not a token, but the gap you notice next).** The landing headline "One home for your money." and its subline are hard-coded in `SignedOutLanding`. `description` is stored but only used in `<meta>`. Every bank shows Home's pitch.

What should stay fixed, and did in the prototype: cash green, investments purple, gain and loss, status colours, payout-partner colours. They carry meaning, so they should not be brandable.

## Token prototypes: the smallest additions

Six new settings, plus one rule change. Shape (`proposedSettingsShape` in `banks.ts`):

```
displayName, description, primaryColor, backgroundColor        (today)
darkPrimaryColor, darkBackgroundColor                          (new: a second pair)
typeface: "sans" | "serif" | "rounded" | "mono" | "heavy"      (new: headline face only)
radius: "square" | "soft" | "round"                            (new: one --radius value)
density: "standard" | "roomy"                                  (new: one --spacing value)
logo: { mark: square SVG, wordmark: wide SVG }                 (new: header slot)
landingImage                                                   (new: fills landingVisual)
```

What they write:

| Setting | Token(s) | Values |
| --- | --- | --- |
| dark pair | the same scheme tokens under `.dark` | derived, see below |
| typeface | `--font-display`, `--font-display-weight`, `--font-display-tracking` | used by h1, h2, card titles and the balance figure only; body text stays system sans |
| radius | `--radius` | square 0.0625rem, soft 0.375rem, round 0.875rem |
| density | `--spacing` | standard 0.25rem, roomy 0.28125rem |
| logo | `--brand-mark`, `--brand-wordmark` | 28px square, 28px-tall wordmark; compact slots (mobile header, desktop rail) use the mark |
| landingImage | `landingVisual` prop | one image, drawn in the scheme's own tokens |

The rule change is in `deriveScheme`. It works in both light and dark from one colour pair:

- Pick ink (near black or near white) from the background's luminance. Do not move the background.
- Derive `--muted`, `--secondary`, `--accent`, `--border`, `--input` and `--card` from the background. Then cards, canvas and header all carry the brand.
- Move `--muted-foreground` toward ink until it reaches 4.5:1 on the background, muted and secondary.
- Move `--primary` toward ink until it reaches 4.5:1 on the background and muted, as today, but measured against the operator's real background.

Result: five banks that look like five banks in both modes, with every text pair still at 4.5:1. The prototype applies these through one `<style>` per story. Selectors for the logo and display face are story-only shims. In product they would be a `font-display` utility on the heading components and an `<img>` branch in `HomeMark`.

## Proposal for Home's theming system

1. **Ship tokens, not colours.** The operator setting stays small: two colour pairs (light and dark), a typeface from a list of five, three radii, two densities, a mark, a wordmark and one landing image. Everything else is derived, so an operator cannot produce a broken screen.
2. **Derive the whole surface scale from the background, in both modes.** Replace `boundLightBackground` with a rule that moves text, not the page. Scope the output to `:root` and `.dark`, not `:root:not(.dark)`.
3. **Make semantic colour off-limits.** Money meaning (gain, loss, cash, investments, status) is Home's, not the operator's. Write that into the schema, not a style guide.
4. **Give the logo a real slot with rules.** `HomeMark` renders the operator's mark when one is set, and Home's own mark is the fallback. mark's rules on `design/mark` are the place to set sizes, clear space and contrast.
5. **Copy is next.** Show `description` as the landing subline before adding any headline field.

Order: 2 and the dark pair first (biggest visible gain, no new UI), then radius and typeface (one token each), then logo, then imagery and density.

## Cool finds

- **`--spacing` is a single density knob.** Tailwind v4 computes every spacing utility from it, so one variable makes a whole surface roomier. Home sits exactly at the 44px floor, so it only works upward.
- **`--radius` already drives the full radius scale.** One value per brand covers every component.
- **`deriveScheme(pair)`** in `banks.ts` turns any colour pair, light or dark, into a full set of Home scheme tokens with 4.5:1 text. Reusable by anyone who needs a themed surface.
- **`LandingShell` takes `landingVisual`.** Any landing image can go in without touching the shell.
- **SVG wordmarks in a CSS `url()`** can use system-installed fonts but not web fonts. Fine for a prototype; a real slot should take an uploaded SVG with outlined text.
- **Story screenshots at scale:** one Playwright loop over `iframe.html?id=...&args=level:today&globals=theme:dark` gave the 80-shot matrix, then a `setContent` page tiled them into contact sheets.

## For the others

- **mark:** your dark-mode finding (brand blue at 2.3:1 on the dark header) shows up here too. For a themed operator, the mark is the only Home blue left on screen. The logo slot here reads `--brand-mark` and `--brand-wordmark`. If your rules define sizes and clear space, I will use them.
- **globe:** the globe's dots are fixed Home blue. If they read `--primary`, every operator's landing page would match its brand for free. Any themed landing (`level: today`) here shows the clash.
- **review:** at 390 in the Home composition, "Add money" wraps to two lines in the actions row, in every bank and in plain Home too. Also worth a row: the brand background reaches the header but not cards or the canvas.
- **motion:** your tokens are durations and easings only, so they would theme cleanly. Nothing here changes them.

## Borrowed from

Final pass pending, after the other four push.

## Shots

`design-jam/shots/gallery/`:

- Per bank: `<bank>-<landing|home>-<390|1280>-<light|dark>-<proposed|today>.png`. Banks: `lagoon-line`, `pocketful`, `tallyhouse`, `ashcombe`, `moshpit`. 80 files. The 390 proposed shots are 2x.
- Contact sheets: `sheet-390-{proposed,today}-{light,dark}.png`, `sheet-1280-{proposed,today}-{light,dark}.png`, `sheet-today-vs-proposed-home-390-{light,dark}.png`.

## Checks

Run in `/home/user/home-gallery` after `bun install --frozen-lockfile` (833 packages, lockfile unchanged):

- `DATABASE_URL="" bun lint`: pass (exit 0, oxlint with `--deny-warnings`, 0 errors, 0 warnings). The first run flagged two errors in my files (`home(exploration-story-tag)` and `jsx-a11y(alt-text)`), both fixed.
- `bun typecheck`: pass (exit 0). The first run hit a Node heap abort because the shared machine was short of memory. It passed with `NODE_OPTIONS=--max-old-space-size=6144`, and no code changed between runs.
