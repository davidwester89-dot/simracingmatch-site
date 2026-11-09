// Wheel base cluster (28-10): order by price per Nm, Moza neutral and PXN/Sim-Lab partners, dates = push date, SEO limits.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { BASES, sortedBases, perNm, WB_DATE, MVF_DATE, LCP_DATE, WB_LOGOS, MATCH_DATE, MOZA_EU_EXIT_DATE } from '../src/wheelbases.mjs';
import { PARTNERLINKS } from '../src/lib/partnerlinks.js';

const unesc = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const PAGES = ['/wheel-bases/compare/', '/wheel-bases/direct-drive-vs-belt/', '/wheel-bases/how-much-torque/', '/wheel-bases/moza-vs-fanatec/'];
// [datePublished, dateModified] per page.
// Compare: neutral Moza EU product exits on MOZA_EU_EXIT_DATE (L7). Torque: live match link since MATCH_DATE.
// Belt stays WB_DATE (template-only). Moza vs Fanatec links to the load-cell post since LCP_DATE.
const DATES = { '/wheel-bases/compare/': [WB_DATE, MOZA_EU_EXIT_DATE], '/wheel-bases/direct-drive-vs-belt/': [WB_DATE, WB_DATE], '/wheel-bases/how-much-torque/': [WB_DATE, MATCH_DATE], '/wheel-bases/moza-vs-fanatec/': [MVF_DATE, LCP_DATE] };

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

test('cluster pages: title <60, meta 120-155, one og:image, Article dates = push date, only PXN/Sim-Lab partners, one store disclosure and no Moza tracking', () => {
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
    const [pub, mod] = DATES[p];
    assert.equal(art.datePublished, pub); assert.equal(art.dateModified, mod);
    assert.equal(art.author.name, 'SimracingMatch Editorial');
    assert.ok(s.includes(`<time datetime="${mod}">`), `${p}: visible date`);
    assert.doesNotMatch(s, /aggregateRating|ratingValue|"Review"/);
    assert.ok(sm.includes(`<loc>https://simracingmatch.com${p}</loc><lastmod>${mod}</lastmod>`), `${p}: sitemap`);
    const sponsored = [...s.matchAll(/<a\s[^>]*rel="sponsored nofollow noopener"[^>]*>/g)].map((m) => m[0].match(/href="([^"]+)"/)[1]);
    const allowed = new Set(Object.values(PARTNERLINKS));
    for (const h of sponsored) assert.ok(allowed.has(h), `${p}: ${h}`);
    const notes = sponsored.length ? 1 : 0;
    assert.equal(s.split('<p class="pnoot">').length - 1, notes, `${p}: disclosure count`);
  }
  const c = readFileSync('dist/wheel-bases/compare/index.html', 'utf8');
  assert.ok(c.includes('href="https://eu.mozaracing.com/" rel="noopener" target="_blank">Moza Racing</a>'));
  assert.doesNotMatch(c, /ref=simracingmatch|eerlukwf|data-vendor="moza"/);
  assert.match(c, /Some links are partner links; this never affects the ranking\./);
  assert.ok(c.includes('href="https://sim-lab.eu/?ref=SINRACINGMATCH" rel="sponsored nofollow noopener" target="_blank" data-vendor="simlab"'), 'Sim-Lab partner button in brand stores');
  assert.ok(c.includes('href="https://pxnsimracing.sjv.io/7X6qgd" rel="sponsored nofollow noopener"'), 'PXN Impact partner button in brand stores');
  assert.ok(c.includes('data-vendor="pxn"'), 'PXN data-vendor on compare store buttons');
  assert.ok(c.includes('<li><a href="https://sim-lab.eu/products/dds-torquesync" rel="noopener">'), 'Sim-Lab source stays a neutral link');
  assert.doesNotMatch(c, /<li><a href="[^"]*\?ref=/, 'no partner link in the sources list');
  assert.doesNotMatch(c, /sale €|special price/i, 'no sale prices on the compare page (L4)');
});

// L4 (gap SC 28-10 M2: 'special price of €349.99' on /direct-drive-vs-belt/ gave 0 fails): check EVERY built page, not only /compare/.
// A promo/sale/special price is a price tied to sale/special/deal/discount wording, '€x off', 'x% off' or 'save €x'.
// The one explanatory sentence 'Some stores showed a temporary sale price … we leave those out' is allowed (no amount).
export const PROMO_PRICE = /special price|\b(?:sale|deal|promo(?:tional)?|discount(?:ed)?|introductory|launch|black friday|cyber monday) price\b|\b(?:sale|special|deal|discount|promo)\s*(?:price\s*)?(?:of\s*|:\s*)?€\s?\d|€\s?\d[\d.,]*\s*(?:sale|special|deal|off)\b|\d+\s?% off\b|\bsave (?:up to )?€\s?\d|limited[- ]time (?:price|offer|deal)/i;
export function promoHits(html) {
  const text = html.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<(script|style|noscript)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&euro;/g, '€').replace(/\s+/g, ' ');
  return text.split(/(?<=[.!?])\s+/).filter((z) => PROMO_PRICE.test(z) && !/we leave (?:those|them) out/i.test(z)).map((z) => z.slice(0, 120));
}
test('L4: no sale, special or temporary promo price on ANY built page (all wheel-base pages, posts, home)', () => {
  execSync('node build.mjs', { stdio: 'ignore', env: { ...process.env, BASE: '', PREVIEW: '', GO_LIVE: '1', THEME: 'A' } });
  const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(`${d}/${e.name}`) : e.name.endsWith('.html') ? [`${d}/${e.name}`] : []));
  const fout = walk('dist').flatMap((f) => promoHits(readFileSync(f, 'utf8')).map((z) => `${f}: ${z}`));
  assert.deepEqual(fout, []);
  // self-test on the exact SC mutations (M2, M3) and allowed wording
  assert.equal(promoHits('<p>The T300 RS GT has a special price of €349.99 this week.</p>').length, 1);
  assert.equal(promoHits('<p>R9 V3: sale €319.</p>').length, 1);
  assert.equal(promoHits('<p>Now 20% off at the store.</p>').length, 1);
  assert.equal(promoHits('<p>Some stores showed a temporary sale price on 28 October 2026 without an end date; we leave those out.</p><p>Announced, not yet on sale.</p><p>On sale from 3 December 2026.</p>').length, 0);
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

test('compare table: maker logo per row (Dave 30-10), fixed size, lazy, alt; order and partner links unchanged', () => {
  execSync('node build.mjs', { stdio: 'ignore', env: { ...process.env, BASE: '', PREVIEW: '', GO_LIVE: '1', THEME: 'A' } });
  const c = readFileSync('dist/wheel-bases/compare/index.html', 'utf8');
  const rows = [...c.match(/<tbody>([\s\S]*?)<\/tbody>/)[1].matchAll(/<tr [^>]*>([\s\S]*?)<\/tr>/g)].map((m) => m[1]);
  const s = sortedBases();
  assert.equal(rows.length, s.length);
  rows.forEach((r, i) => {
    const b = s[i];
    assert.ok(r.includes(`<strong>${b.brand}</strong> `), `row ${i + 1}: ${b.brand} ${b.model} (order)`);
    const im = r.match(/<img [^>]*>/);
    assert.ok(im, `${b.brand}: logo`);
    const [src, w, h] = WB_LOGOS[b.brand];
    assert.ok(im[0].includes(`src="${src}" width="${w}" height="${h}" alt="${b.brand} logo" loading="lazy"`), im[0]);
    assert.ok(existsSync('dist' + src), src);
  });
  for (const b of BASES) assert.ok(WB_LOGOS[b.brand], b.brand);
  assert.doesNotMatch(rows.join(''), /score|rating|★|\/10\b/i, 'no score or rating icons in the table');
});

test('Moza vs Fanatec (SEO wk45): only Moza and Fanatec rows with the compare values, links to the compare page, no partner link, no winner', () => {
  execSync('node build.mjs', { stdio: 'ignore', env: { ...process.env, BASE: '', PREVIEW: '', GO_LIVE: '1', THEME: 'A' } });
  const m = readFileSync('dist/wheel-bases/moza-vs-fanatec/index.html', 'utf8');
  const c = readFileSync('dist/wheel-bases/compare/index.html', 'utf8');
  const rows = [...m.match(/<tbody>([\s\S]*?)<\/tbody>/)[1].matchAll(/<tr [^>]*>([\s\S]*?)<\/tr>/g)].map((x) => x[1]);
  const want = sortedBases().filter((b) => b.brand === 'Moza' || b.brand === 'Fanatec');
  assert.equal(rows.length, want.length);
  rows.forEach((r, i) => {
    const b = want[i];
    if (b.brand === 'Moza') {
      assert.ok(r.includes(`href="${b.url}" rel="noopener">product page</a>`), `${b.model}: editorial source on Moza vs Fanatec`);
      assert.ok(!c.includes(r), `${b.model}: compare commercial exit is not the editorial source cell`);
    } else {
      assert.ok(c.includes(r), `row ${i + 1} (${b.model}) identical to the compare table`);
    }
  });
  for (const h of ['/wheel-bases/compare/', '/wheel-bases/how-much-torque/', '/wheel-bases/direct-drive-vs-belt/', '/blog/ps5-direct-drive-wheels-2026/']) assert.ok(m.includes(`href="${h}"`), h);
  assert.ok(c.includes('href="/wheel-bases/moza-vs-fanatec/"'), 'compare → Moza vs Fanatec');
  assert.ok(readFileSync('dist/index.html', 'utf8').includes('href="/wheel-bases/moza-vs-fanatec/"'), 'home → Moza vs Fanatec');
  assert.doesNotMatch(m, /rel="sponsored|\?ref=|<p class="pnoot">/, 'no partner link or note on Moza vs Fanatec');
  assert.doesNotMatch(m.replace(/<[^>]+>/g, ' '), /\b(the winner is|best buy|our pick|we recommend)\b/i);
});
