// Wheel base cluster (28-10): order by price per Nm, Moza partner link only, dates = push date, SEO limits.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { BASES, sortedBases, perNm, WB_DATE } from '../src/wheelbases.mjs';
import { PARTNERLINKS } from '../src/lib/partnerlinks.js';

const unesc = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const PAGES = ['/wheel-bases/compare/', '/wheel-bases/direct-drive-vs-belt/', '/wheel-bases/how-much-torque/'];

test('compare order: price per Nm low to high, unknown prices last; no commission input', () => {
  const s = sortedBases();
  const known = s.filter((b) => b.price != null);
  for (let i = 1; i < known.length; i++) assert.ok(perNm(known[i - 1]) <= perNm(known[i]), `${known[i].model} out of order`);
  assert.ok(s.slice(known.length).every((b) => b.price == null));
  for (const b of BASES) {
    assert.deepEqual(Object.keys(b).filter((k) => /commission|partner|fee|rank|score/i.test(k)), []);
    assert.match(b.url, /^https:\/\/(eu\.mozaracing\.com|www\.fanatec\.com|simucube\.com|www\.asetek\.com|www\.logitechg\.com|shop\.thrustmaster\.com)\//, b.model);
    assert.ok(!b.url.includes('ref='), `${b.model}: source link without partner code`);
    assert.ok(b.nm > 0 && b.platforms.length > 0);
    assert.equal(b.sale, undefined, b.model + ': sale price without end date (L4)');
  }
});

test('cluster pages: title <60, meta 120-155, one og:image, Article dates = push date, partner link only Moza with one disclosure', () => {
  execSync('node build.mjs', { stdio: 'ignore', env: { ...process.env, BASE: '', PREVIEW: '', GO_LIVE: '1', THEME: 'A' } });
  const sm = readFileSync('dist/sitemap.xml', 'utf8');
  for (const p of PAGES) {
    const s = readFileSync(`dist${p}index.html`, 'utf8');
    const title = unesc(s.match(/<title>(.*?)<\/title>/)[1]);
    const desc = unesc(s.match(/<meta name="description" content="([^"]*)"/)[1]);
    assert.ok(title.length < 60, `${p}: title ${title.length}`);
    assert.ok(desc.length >= 120 && desc.length <= 155, `${p}: meta ${desc.length}`);
    assert.equal((s.match(/property="og:image"/g) || []).length, 1, `${p}: og:image`);
    const ld = [...s.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
    const art = ld.find((x) => x['@type'] === 'Article');
    assert.equal(art.datePublished, WB_DATE); assert.equal(art.dateModified, WB_DATE);
    assert.equal(art.author.name, 'SimracingMatch Editorial');
    assert.ok(s.includes(`<time datetime="${WB_DATE}">`), `${p}: visible date`);
    assert.doesNotMatch(s, /aggregateRating|ratingValue|"Review"/);
    assert.ok(sm.includes(`<loc>https://simracingmatch.com${p}</loc><lastmod>${WB_DATE}</lastmod>`), `${p}: sitemap`);
    const sponsored = [...s.matchAll(/<a\s[^>]*rel="sponsored nofollow noopener"[^>]*>/g)].map((m) => m[0].match(/href="([^"]+)"/)[1]);
    for (const h of sponsored) assert.equal(h, PARTNERLINKS.moza);
    assert.equal(s.split('<p class="pnoot">').length - 1, sponsored.length ? 1 : 0, `${p}: disclosure count`);
  }
  const c = readFileSync('dist/wheel-bases/compare/index.html', 'utf8');
  assert.ok(c.includes('href="https://eu.mozaracing.com/?ref=DAVIDWEST" rel="sponsored nofollow noopener"'));
  assert.match(c, /Some links are partner links; this never affects the ranking\./);
  assert.doesNotMatch(c, /sale €|special price/i, 'no sale prices on the compare page (L4)');
});


test('2-3+ inbound internal links per cluster page from existing pages', () => {
  const home = readFileSync('dist/index.html', 'utf8');
  const ps5 = readFileSync('dist/blog/ps5-direct-drive-wheels-2026/index.html', 'utf8');
  const expo = readFileSync('dist/blog/simracing-expo-2026-announcements/index.html', 'utf8');
  for (const p of PAGES) assert.ok(home.includes(`href="${p}"`), `home → ${p}`);
  assert.ok(ps5.includes('href="/wheel-bases/compare/"') && expo.includes('href="/wheel-bases/compare/"'));
  assert.ok(ps5.includes('href="/wheel-bases/direct-drive-vs-belt/"'));
  assert.ok(expo.includes('href="/wheel-bases/how-much-torque/"'));
});
