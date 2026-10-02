import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { base, brands } from '../dist/index.js';

// WCAG 2.1 relative luminance and contrast ratio.
const channel = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => channel(parseInt(hex.slice(i, i + 2), 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

test('every brand defines the same colour keys', () => {
  const [first, ...rest] = Object.values(brands).map((b) => Object.keys(b.color).sort().join());
  for (const keys of rest) assert.equal(keys, first);
});

for (const [id, brand] of Object.entries(brands)) {
  const c = brand.color;
  test(`${id}: body and muted text pass WCAG AA on every surface`, () => {
    for (const surface of [c.surface, c.surfaceRaised, c.surfaceSunken]) {
      assert.ok(contrast(c.text, surface) >= 4.5, `text on ${surface}: ${contrast(c.text, surface).toFixed(2)}`);
      assert.ok(contrast(c.textMuted, surface) >= 4.5, `muted on ${surface}: ${contrast(c.textMuted, surface).toFixed(2)}`);
    }
  });

  test(`${id}: buttons, status colours and the focus ring are readable`, () => {
    assert.ok(contrast(c.onAccent, c.accentStrong) >= 4.5, 'button label on accent');
    for (const status of [c.positive, c.negative, c.warning, c.accent]) {
      assert.ok(contrast(status, c.surface) >= 4.5, `${status} on surface: ${contrast(status, c.surface).toFixed(2)}`);
    }
    assert.ok(contrast(c.focus, c.surface) >= 3, 'focus ring is a 3:1 non-text indicator');
  });

  test(`${id}: cards, odds and badges stay readable`, () => {
    for (const card of [c.card, c.cardHigh]) {
      for (const [name, fg] of [['text', c.text], ['muted', c.textMuted], ['odds', c.odds]]) {
        assert.ok(contrast(fg, card) >= 4.5, `${name} on ${card}: ${contrast(fg, card).toFixed(2)}`);
      }
    }
    assert.ok(contrast(c.onPositive, c.positive) >= 4.5, 'deposit button label');
    assert.ok(contrast(c.onAccent, c.live) >= 4.5, `live badge label: ${contrast(c.onAccent, c.live).toFixed(2)}`);
    assert.ok(contrast(c.gold, c.surface) >= 4.5, 'gold on surface');
  });

  test(`${id}: CSS variables are emitted for every colour`, () => {
    const css = readFileSync(new URL(`../dist/${id}.css`, import.meta.url), 'utf8');
    for (const key of Object.keys(c)) assert.match(css, new RegExp(`--sb-color-${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}:`));
  });
}

test('the Tailwind theme maps every colour to its brand variable', () => {
  const theme = readFileSync(new URL('../dist/theme.css', import.meta.url), 'utf8');
  assert.match(theme, /@theme \{/);
  assert.match(theme, /--color-accent: var\(--sb-color-accent\);/);
  assert.match(theme, /--breakpoint-lg: 64rem;/);
  assert.equal(base.maxContentWidth, 1280);
});
