// Builds dist/ from tokens/: per-brand CSS variables, a Tailwind v4 theme, and a typed JS module for React Native.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const read = (file) => JSON.parse(readFileSync(join(root, 'tokens', file), 'utf8'));
const base = read('base.json');
const brands = Object.fromEntries(
  readdirSync(join(root, 'tokens'))
    .filter((f) => f !== 'base.json' && f.endsWith('.json'))
    .map((f) => [f.replace('.json', ''), read(f)]),
);
const kebab = (key) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
const dist = join(root, 'dist');
mkdirSync(dist, { recursive: true });

// Brand values as plain custom properties; the Tailwind theme refers to these, so one theme serves every brand.
for (const [id, brand] of Object.entries(brands)) {
  const lines = Object.entries(brand.color).map(([k, v]) => `  --sb-color-${kebab(k)}: ${v};`);
  writeFileSync(join(dist, `${id}.css`), `/* ${brand.name} brand */\n:root {\n  color-scheme: ${brand.colorScheme};\n${lines.join('\n')}\n}\n`);
}

const first = Object.values(brands)[0];
const theme = [
  ...Object.keys(first.color).map((k) => `  --color-${kebab(k)}: var(--sb-color-${kebab(k)});`),
  ...Object.entries(base.spacing).map(([k, v]) => `  --spacing-${k}: ${v / 16}rem;`),
  ...Object.entries(base.radius).map(([k, v]) => `  --radius-${k}: ${v}px;`),
  ...Object.entries(base.breakpoint).map(([k, v]) => `  --breakpoint-${k}: ${v / 16}rem;`),
  ...Object.entries(base.zIndex).map(([k, v]) => `  --z-index-${kebab(k)}: ${v};`),
  `  --font-sans: ${base.font.sans};`,
  `  --font-mono: ${base.font.mono};`,
];
writeFileSync(join(dist, 'theme.css'), `/* Tailwind v4 theme: import tailwindcss, then this, then one brand file. */\n@theme {\n${theme.join('\n')}\n}\n`);

const brandType = `{ readonly name: string; readonly colorScheme: 'dark' | 'light'; readonly color: Readonly<Record<${Object.keys(first.color).map((k) => `'${k}'`).join(' | ')}, string>> }`;
writeFileSync(join(dist, 'index.js'), `export const base = ${JSON.stringify(base, null, 2)};\nexport const brands = ${JSON.stringify(brands, null, 2)};\n`);
writeFileSync(
  join(dist, 'index.d.ts'),
  `export type BrandId = ${Object.keys(brands).map((b) => `'${b}'`).join(' | ')};\nexport type Brand = ${brandType};\nexport declare const base: ${JSON.stringify(base)};\nexport declare const brands: Readonly<Record<BrandId, Brand>>;\n`,
);
console.log(`built ${Object.keys(brands).join(', ')}`);
