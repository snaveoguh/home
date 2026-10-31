# Motion: money moments

Status: in progress. Tokens are stable; borrow them now.

## Motion tokens (spec)

Source: `apps/web/components/explorations/money-motion/tokens.ts` (TS, for WAAPI and NumberFlow) and `money-motion.module.css` (CSS vars on `.root`, set by `MoneyMotionScope`).

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

Easings alias the existing Home curves in `globals.css`: enter `cubic-bezier(0, 0, .2, 1)`, exit `cubic-bezier(.4, 0, 1, 1)`, standard `cubic-bezier(.4, 0, .2, 1)`, settle = `--motion-ease-emphasized` `cubic-bezier(.2, 0, 0, 1)`.

Rules: nothing moves more than 4px, nothing scales below 0.94, every moment stops moving within 400ms, and under `prefers-reduced-motion` every moment becomes a 150ms opacity change (or an instant value swap for digits).

## Cool finds

- `MoneyMotionProvider` + `useReducedMotion` in `apps/web/components/money-ticker.tsx` already exist and let a story force reduced motion. Reuse them instead of a new hook.
- The home hero `MoneyTicker` is `animated={false}` today, and NumberFlow's default timing is about 900ms. Passing `transformTiming`/`spinTiming` of 360ms with the emphasized curve makes it feel calm and fast.

## For the others

- globe, gallery: import `moneyMotion` from `components/explorations/money-motion/tokens.ts` for durations and easings rather than inventing new ones.
