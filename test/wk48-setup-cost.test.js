// Wk48 (SEO-briefing 23-11): nieuwe post /blog/sim-racing-setup-cost/, push 26-11. Geen CTA-component (golf 3), geen partnerlink in de post,
// Moza/Fanatec/Logitech/Thrustmaster niet bij naam; prijzen alleen van PXN, Sim-Lab en Asetek (merkpagina's) en de eigen basetabel.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
execSync('node build.mjs', { stdio: 'ignore', env: { ...process.env, BASE: '', PREVIEW: '' } });
const h = readFileSync('dist/blog/sim-racing-setup-cost/index.html', 'utf8');
const main = (h.match(/<main[\s\S]*<\/main>/) || [''])[0];
test('wk48 setup cost: title, meta, byline, datums 26-11', () => {
  assert.match(h, /<title>Sim racing setup cost: budget, mid-range and high-end/);
  const meta = h.match(/<meta name="description" content="([^"]*)"/)[1];
  assert.ok(meta.length >= 120 && meta.length <= 155, 'meta ' + meta.length);
  assert.match(h, /SimracingMatch Editorial/);
  assert.match(h, /"author":\{"@type":"Organization","name":"SimracingMatch Editorial"/);
  assert.match(h, /"datePublished":"2026-11-26","dateModified":"2026-11-26"/);
  const sm = readFileSync('dist/sitemap.xml', 'utf8');
  assert.ok(sm.includes('<loc>https://simracingmatch.com/blog/sim-racing-setup-cost/</loc><lastmod>2026-11-26</lastmod>'));
});
test('wk48 setup cost: geen sponsored link, geen CTA-blok, geen niet-partnermerken bij naam, geen reddit', () => {
  assert.doesNotMatch(main, /sponsored/);
  assert.doesNotMatch(main, /data-partner-slot|class="pnoot"/);
  assert.doesNotMatch(main, /\b(Moza|Fanatec|Logitech|Thrustmaster)\b/);
  assert.doesNotMatch(h, /reddit/i);
});
test('wk48 setup cost: sommen van de drie budgetniveaus kloppen', () => {
  const r2 = (x) => Math.round(x * 100) / 100;
  assert.equal(r2(259 + 99.99), 358.99);
  assert.equal(r2(419 + 379), 798);
  assert.equal(r2(964.95 + 670.07 + 549 + 789), 2973.02);
  assert.equal(r2(553.78 * 1.21), 670.07);
  assert.equal(r2(125.21 * 1.21), 151.5);
  for (const s of ['€358.99', '€798.00', '€2,973.02', '€670.07', '€151.50', '€354.87', '€964.95']) assert.ok(main.includes(s), s);
});
test('wk48 setup cost: interne links uit de briefing', () => {
  for (const p of ['/blog/sim-racing-cockpit-guide/', '/blog/load-cell-pedals/', '/wheel-bases/how-much-torque/', '/wheel-bases/direct-drive-vs-belt/', '/blog/sim-lab-p1x-pro-vs-ultimate/', '/blog/ps5-direct-drive-wheels-2026/', '/wheel-bases/compare/']) {
    assert.ok(main.includes(`href="${p}"`), p);
  }
});
