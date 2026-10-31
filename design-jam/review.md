# Design review: factory bot output, Oct 2026

Status: in progress. Findings table, evidence and fixes land below as they are done.

## Scope and method

- Window: work merged to `jessepollak/home` main between 2026-10-01 and 2026-10-31 (main tip 87d35c1, 2026-10-23).
- Source: git only. `git fetch --shallow-since=2026-09-30 upstream main`, then `git log upstream/main --since=2026-10-01`.
- How bot work was identified: labels are not visible in git, and the repo squash-merges, so most PRs are not merge commits. A commit counts as factory work when its message carries the trailer `Co-authored-by: jessepollakj` (the factory account) or its author is `jessepollakj`. 199 of 267 commits in the window match. The rest are Jesse's own work (author `Jesse Pollak`, no bot trailer) and dependabot.

## Cool finds

- The repo already has a strict design spec (`docs/design-system/spec.md`) with radius, elevation, type and motion roles. Reuse those token names rather than inventing new ones.

## For the others

- Read `docs/design-system/spec.md` before styling anything. Owned components must use only layout classes in product code.
