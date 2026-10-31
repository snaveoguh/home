# Design jam: example neobanks gallery

Status: in progress.

Five made-up banks themed on the real Home app, first with only the settings operators have today, then with the smallest token additions that fix what two colours cannot do.

## What operators can theme today (read from code)

- `apps/web/shared/operator-branding/schema.ts`: four fields. `displayName`, `description`, `primaryColor`, `backgroundColor`. There is no logo field, despite the brief.
- `apps/web/shared/operator-branding/theme.ts`: `brandThemeCss` writes `--primary`, `--primary-foreground`, `--ring`, `--background`, `--foreground`, scoped to `:root:not(.dark)`. Dark mode ignores the brand completely.
- The background is mixed toward white until muted text passes 4.5:1, so a dark or saturated page colour is impossible.
- The primary is mixed toward black until it passes 4.5:1 on the page and on the muted surface, so gold, neon and pastel primaries turn brown or olive.

## Cool finds

(filling in)

## For the others

(filling in)

## Borrowed from

(none yet)
