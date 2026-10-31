# Motion: money moments

Branch `design/motion`. Shots and recordings in `design-jam/shots/motion/`.

Today moving money looks like every other state change: rows appear, titles swap, the home total is a static `MoneyTicker` (`animated={false}`). This proposes four small moments, each finished moving inside 400ms, each reduced to a short opacity change (or an instant value swap) under `prefers-reduced-motion`.

Storybook: `Explorations/Money motion` (id `explorations-money-motion`). Stories: Money arriving, Send confirming, Savings earning, Balance updating, Reduced motion, All moments, Tokens. Every number in them is labelled simulated.

## The four moments

| Moment | Where it lives today | What moves | Time | Reduced motion |
| --- | --- | --- | --- | --- |
| Money arriving | Activity list (`client/activity/activity-panel.tsx`, `components/finance-rows.tsx`) | New row opens from 0 height, content lifts 4px, a muted wash behind it fades over the hold | 240ms open, 1.6s wash | 150ms fade, no height, no wash |
| Send confirming | Money modal result (`client/money-modal/money-result.tsx`, `components/ui/result-header.tsx`) | Spinner fades out, ring draws, then the check draws; title fades up 4px | 320ms | Check appears whole, 150ms fade |
| Savings earning | Save balance and estimated growth (`client/savings/estimated-growth.ts`) | "Earned this month" to six decimals, one 280ms digit tick per second, always rolling upward; paused while the tab is hidden | 280ms per tick | Digits swap with no roll |
| Balance updating | Home hero total (`client/home/home-overview.tsx`) | Only the digits that changed roll; the difference (+$25.00) fades in under the total, holds, fades out | 360ms roll, 1.6s hold | Instant digits, delta fades only |

Recordings (GIF, real time, 25fps, 420px wide, each under 1 MB):

- `shots/motion/money-arriving.gif` and `money-arriving-reduced.gif`
- `shots/motion/send-confirming.gif` and `send-confirming-reduced.gif`
- `shots/motion/savings-earning.gif` and `savings-earning-reduced.gif`
- `shots/motion/balance-updating.gif` and `balance-updating-reduced.gif`

Frame strips at 0, 60, 120, 180, 240, 300, 360 and 1200ms (captured by pausing every Web Animation and stepping `currentTime`, so they are exact, not sampled): `filmstrip-arriving-{light,dark}.png`, `filmstrip-confirming-{light,dark}.png`. Boards: `all-moments-light.png`, `all-moments-dark.png`. In the arriving strip, the highlighted bottom row is pointer hover, not part of the motion.

## Motion tokens (spec)

Source: `apps/web/components/explorations/money-motion/tokens.ts` (numbers for WAAPI and NumberFlow) and `money-motion.module.css` (the same values as CSS variables, set by `MoneyMotionScope`).

| Token | ms | Ease | Use |
| --- | --- | --- | --- |
| fade | 150 | enter | Opacity only. The whole reduced-motion path. |
| arrive | 240 | enter | New activity row, delta line, confirmed title. |
| tick | 280 | standard | Interest digits, once a second. |
| confirm | 320 | settle | Ring, then check, drawn in sequence. |
| roll | 360 | settle | Balance digits that changed. |
| hold | 1600 | none | How long a delta or wash stays readable. Not motion. |
| stagger | 60 | | Gap between sequenced parts. |
| travel | 4px | | The only distance anything moves. |

Easings alias the existing Home curves in `globals.css`, no new curves: enter `cubic-bezier(0, 0, .2, 1)`, exit `cubic-bezier(.4, 0, 1, 1)`, standard `cubic-bezier(.4, 0, .2, 1)`, settle = `--motion-ease-emphasized` `cubic-bezier(.2, 0, 0, 1)`.

Rules:

1. Nothing moves more than 4px. Nothing scales below 0.94. No colour is added: gain green stays where Home already uses it.
2. Every moment stops moving within 400ms. Only `hold` is longer, and nothing moves during it.
3. Reduced motion: no transforms, no height change, no digit roll. A 150ms opacity change is kept only where it helps you notice the change.
4. Money that is read often (home total, activity) moves once per real change, never on load or refetch. Interest ticks only on the Save surface, never on Home.

## Primitives

All in `apps/web/components/explorations/money-motion/` (exploration code, per `docs/design-explorations/README.md`):

- `RollingAmount`: NumberFlow wrapper with the tokens applied (`pace="roll" | "tick"`). The reusable number ticker. Reads `useReducedMotion()` from `components/money-ticker.tsx`, so the existing `MoneyMotionProvider` can force it.
- `arrivalProps(arriving)`: spread into `ActivityRow liProps`. No wrapper element, so the list semantics stay intact.
- `ConfirmMark` / `ConfirmHeader`: drop-in candidate for `ResultHeader` on send. Pending uses the owned `StatusMark texture="working"`; the description line is kept (invisible) after confirming so nothing below jumps.
- `AccruingAmount`: compounding interest at a given APY, one tick per second, paused on `visibilitychange`, with a screen-reader value in cents and the ticking digits `aria-hidden`.
- `BalanceUpdate`: hero total with `RollingAmount` and a polite live-region delta.
- `MoneyMotionScope`: sets the CSS variables and a `reduce` class; wrap any surface that uses the CSS moments.

Adoption path if picked: move the tokens into `globals.css` next to `--motion-duration-*`, give `MoneyTicker` a `pace` prop and NumberFlow timings, add `arriving` to `ActivityRow`, and swap the check in `ResultHeader`.

## Cool finds

- `MoneyMotionProvider` + `useReducedMotion` in `apps/web/components/money-ticker.tsx` already exist and let a story force reduced motion. Reuse them instead of a new hook.
- NumberFlow's default timing is about 900ms. Passing `transformTiming`/`spinTiming` of 360ms with the emphasized curve makes it feel calm and fast, and `respectMotionPreference={false}` plus `animated={!reduced}` lets Home's own provider decide.
- `interpolate-size: allow-keywords` (Chromium 129+) lets a keyframe animate from `block-size: 0` to `auto`, so a new list row can open without measuring. Wrapped in `@supports`; other browsers get the fade.
- SVG `pathLength={1}` with `stroke-dasharray: 1` makes a draw-on animation independent of the path's real length.
- Exact motion frame strips: trigger, then `document.getAnimations().forEach(a => a.pause())` and step `a.currentTime`. Shadow DOM animations (NumberFlow) are not in that list, so digit rolls need video.
- Recording: Playwright `recordVideo` (WebM) trimmed by measuring the time from page creation to the trigger, then `ffmpeg` with `palettegen stats_mode=diff` and `paletteuse diff_mode=rectangle` keeps a 5s 420px GIF at 200 to 400 KB.

## For the others

- globe, gallery: import `moneyMotion` from `components/explorations/money-motion/tokens.ts` for durations and easings rather than inventing new ones. For a "simulated activity ping", `arrive` (240ms, enter) plus `hold` (1600ms) is the same rhythm as a new activity row.
- gallery: `RollingAmount` works with any `Intl` currency format if your made-up banks show balances.
- review: lint rules hit while building this: `home/no-real-waits` (no `setTimeout` in stories), `home/no-local-formatting` (no `Intl.NumberFormat`, no `toFixed`; use `formatFiatAmount` from `shared/formatting`), `home/no-raw-style-utilities` (no raw `LoaderCircle`/`animate-spin`; use `StatusMark`).

## Borrowed from

- review: "reuse the spec's token names rather than inventing new ones". The money tokens alias `--motion-ease-*` instead of adding curves.
- mark: the habit of proving motion with exact frames rather than eyeballing video (their 8x pixel proofs).

## Checks

Run on the final commit in `/home/user/home-motion`:

- `bun install --frozen-lockfile`: pass, no changes.
- `DATABASE_URL="" bun lint`: pass (oxlint `--deny-warnings`, 0 errors, 0 warnings). The first run caught 6 errors in this work (the rules listed above); all fixed.
- `bun typecheck`: pass (`next typegen && tsc --noEmit`, 0 errors). Needed `NODE_OPTIONS=--max-old-space-size=6144`; the default heap ran out with five agents sharing the machine.
- Not run: `test:stories`. Knip ignores `**/explorations/**`.
- Recordings: Playwright `recordVideo` (WebM) converted to GIF with ffmpeg (`/usr/bin/ffmpeg`).
