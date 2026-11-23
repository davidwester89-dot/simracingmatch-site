// Wk48 (SEO 23-11, push 26-11): Asetek Forte-pedalen op /blog/load-cell-pedals/ = € 487,05 incl. btw (402,52 × 1,21; ook de reguliere prijs op asetek.com),
// niet € 495,10; plus één inlink naar /blog/sim-racing-setup-cost/. L7: dateModified, zichtbare stempel en lastmod 2026-11-26.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
execSync('node build.mjs', { stdio: 'ignore', env: { ...process.env, BASE: '', PREVIEW: '' } });
const h = readFileSync('dist/blog/load-cell-pedals/index.html', 'utf8');
test('Forte: € 487,05 = 402,52 × 1,21, nergens meer € 495,10', () => {
  assert.equal((402.52 * 1.21).toFixed(2), '487.05');
  assert.equal((h.match(/€487\.05/g) || []).length, 2);
  assert.ok(!h.includes('495.10'));
  assert.ok(!readFileSync('dist/blog/sim-racing-setup-cost/index.html', 'utf8').includes('495.10'));
});
test('inlink naar setup-cost: precies één', () => {
  assert.equal((h.match(/href="\/blog\/sim-racing-setup-cost\/"/g) || []).length, 1);
});
test('L7 2026-11-26 op load-cell-pedals', () => {
  assert.match(h, /"dateModified":"2026-11-26"/);
  assert.match(h, /<meta property="article:modified_time" content="2026-11-26">/);
  assert.match(h, /Updated <time datetime="2026-11-26">26 November 2026<\/time>/);
  assert.ok(readFileSync('dist/sitemap.xml', 'utf8').includes('<loc>https://simracingmatch.com/blog/load-cell-pedals/</loc><lastmod>2026-11-26</lastmod>'));
});
test('/blog/: JSON-LD dateModified = lastmod = zichtbare Updated-regel (SEO 23-11)', () => {
  const b = readFileSync('dist/blog/index.html', 'utf8');
  const lm = readFileSync('dist/sitemap.xml', 'utf8').match(/<loc>https:\/\/simracingmatch\.com\/blog\/<\/loc><lastmod>([^<]+)</)[1];
  const dm = b.match(/"@type":"CollectionPage"[^<]*"dateModified":"([^"]+)"/);
  assert.ok(dm, 'dateModified ontbreekt');
  assert.equal(dm[1], lm);
  assert.ok(b.includes(`Updated <time datetime="${lm}">`));
});
