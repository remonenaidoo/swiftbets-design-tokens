# swiftbets-design-tokens

Brand tokens for every SwiftBets front end, defined once in `tokens/` and built into:

| Output | Used by |
|---|---|
| `theme.css`: a Tailwind v4 `@theme` whose colours point at brand variables | `swiftbets-web`, `swiftbets-dashboard` |
| `swiftbets.css`, `swiftplay.css`: one brand's `--sb-color-*` variables | the build for that brand |
| `index.js` / `index.d.ts`: `base` and `brands` as typed objects | `swiftbets-mobile` (React Native) |

```css
@import 'tailwindcss';
@import '@swiftbets/design-tokens/theme.css';
@import '@swiftbets/design-tokens/swiftbets.css';
```

Each brand is built separately; production never switches theme at runtime (ADR 0003).

## Rules the tests enforce

- Every brand defines the same colour keys.
- Body and muted text meet WCAG 2.1 AA (4.5:1) on every surface.
- Button labels, status colours and accents meet 4.5:1, and the focus ring meets 3:1.

## Install

Releases attach an npm tarball:

```bash
npm install https://github.com/remonenaidoo/swiftbets-design-tokens/releases/download/v0.1.0/swiftbets-design-tokens-0.1.0.tgz
```

## Develop

```bash
npm test   # builds dist/ and runs the token tests
```

Release by running the `ci` workflow with a `version`.
