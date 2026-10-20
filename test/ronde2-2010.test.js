// Round 2 (20-10-2026): no 'score' in footer/disclaimer, careful fee wording.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const read = (p) => readFileSync(p, 'utf8');
const build = () => execSync('node build.mjs', { env: { ...process.env, BASE: '', PREVIEW: '', GO_LIVE: '1', THEME: 'A' } });

test('footer and disclaimer: no "score"; order never depends on commission', () => {
  build();
  const h = read('dist/disclaimer/index.html');
  const main = h.slice(h.indexOf('<main'), h.indexOf('</main>'));
  const footer = h.slice(h.indexOf('<footer'), h.indexOf('</footer>'));
  assert.doesNotMatch(main, /score/i);
  assert.doesNotMatch(footer, /score/i);
  assert.match(main, /never affect the match or on-page order/);
});

test('fee wording is a possibility ("may earn"), not a certainty', () => {
  const s = read('src/pages.mjs') + read('src/privacy-gdpr.mjs');
  assert.doesNotMatch(s, /When we earn a fee|we (will )?earn a fee\b(?! if)/i);
  assert.match(read('src/privacy-gdpr.mjs'), /If you buy something, we may earn a fee\./);
  assert.match(s, /Links through which we may earn a fee are clearly labelled/);
});
