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

test('small body/source text at least 16px; consent link and crumbs at least 44px tap target', () => {
  const css = read('src/assets/css/style.css');
  const rule = (sel) => { const i = css.indexOf(sel + '{'); assert.ok(i >= 0, sel); return css.slice(i, css.indexOf('}', i)); };
  for (const sel of ['.crumbs', '.author,.report,.fine', '.stamp', '.blog-list .meta', '.consent p', '.qcard span', '.cta-hint', '.article-body h2.src-h+ul', '.post-fig figcaption', '.post-fig .credit', '.article-body ul.credits']) {
    assert.match(rule(sel), /font-size:1rem/, sel);
  }
  assert.match(rule('nav.main a,details.menu nav a'), /min-height:44px/);
  assert.match(rule('nav.main a,details.menu nav a'), /font-size:1rem/);
  assert.match(rule('.consent a'), /min-height:44px/);
  assert.match(rule('.crumbs a'), /padding-block:12px/);
  assert.doesNotMatch(css, /\.consent p\{font-size:\.9/);
});

test('SC ronde 2 fix: plural "They never change", 44px tap targets, hero/brands/kicker 1rem', () => {
  assert.match(read('src/pages.mjs'), /They never change the match or the order\./);
  assert.doesNotMatch(read('src/pages.mjs'), /It never changes the match/);
  const css = read('src/assets/css/style.css');
  assert.match(css, /footer\.site li a, \.article-body h2\.src-h\+ul a, \.post-cta a\{display:inline-block;min-height:44px;padding-block:12px;box-sizing:border-box\}/);
  assert.match(css, /\.hero-brand\{[^}]*font:800 1rem/);
  assert.match(css, /\.brands-h\{[^}]*font:700 1rem/);
  assert.match(css, /\.article-head \.kicker\{[^}]*font-size:1rem/);
});
