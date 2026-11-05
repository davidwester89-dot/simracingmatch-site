// Setup match (5-11): rules, data only from the comparison table, no partner links, live on the home page.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { matchBases, targetBand } from '../src/assets/js/match-logic.js';
import { BASES } from '../src/wheelbases.mjs';
import { PARTNERLINKS } from '../src/lib/partnerlinks.js';

test('filters on platform and budget only (mount = note); best fit first, then price per Nm', () => {
  const r = matchBases(BASES, { budget: '300-700', platform: 'playstation', space: 'desk', experience: 'beginner', style: 'casual' });
  assert.ok(r.length > 0);
  for (const b of r) { assert.ok(b.platforms.includes('PlayStation')); assert.ok(b.price <= 700); }
  assert.equal(r.length, matchBases(BASES, { budget: '300-700', platform: 'playstation', space: 'cockpit', experience: 'beginner', style: 'casual' }).length);
  assert.ok(!/\b1[28] ?Nm\b/.test(readFileSync('src/assets/js/match-logic.js', 'utf8') + readFileSync('src/pages.mjs', 'utf8')), 'no invented mount caps');
  for (let i = 1; i < r.length; i++) assert.ok(r[i - 1].d < r[i].d || (r[i - 1].d === r[i].d && r[i - 1].perNm <= r[i].perNm));
  assert.ok(r[0].inBand);
  assert.equal(matchBases(BASES, { budget: 'u300', platform: 'playstation', space: 'desk', experience: 'beginner', style: 'casual' }).length, 0);
  assert.ok(matchBases(BASES, { budget: 'o1500', platform: 'pc', space: 'cockpit', experience: 'upgrader', style: 'competitive' }).length === BASES.filter((b) => b.platforms.includes('PC')).length);
  // No hidden mount cap (SC 5-11): a desk answer with the top budget still returns bases above 12 and 18 Nm.
  const desk = matchBases(BASES, { budget: 'o1500', platform: 'pc', space: 'desk', experience: 'upgrader', style: 'competitive' });
  assert.ok(desk.some((b) => b.nm > 12) && desk.some((b) => b.nm > 18));
  assert.equal(desk.length, BASES.filter((b) => b.platforms.includes('PC')).length);
  assert.deepEqual(targetBand('beginner', 'casual'), [5, 8]);
  assert.deepEqual(targetBand('upgrader', 'competitive'), [10, 15]);
});

test('match logic and data never use partner links', () => {
  for (const f of ['src/assets/js/match-logic.js', 'src/assets/js/match.js']) {
    const s = readFileSync(f, 'utf8');
    assert.ok(!/partnerlinks|sponsored|[?&]ref=/.test(s), f);
  }
  execSync('node build.mjs', { stdio: 'ignore', env: { ...process.env, BASE: '', PREVIEW: '', GO_LIVE: '1', THEME: 'A' } });
  const home = readFileSync('dist/index.html', 'utf8');
  const json = JSON.parse(home.match(/<script type="application\/json" id="match-data">([^<]+)<\/script>/)[1]);
  assert.equal(json.bases.length, BASES.length);
  for (const b of json.bases) {
    assert.ok(!b.url.includes('ref='), b.model);
    assert.ok(json.logos[b.brand], b.brand + ' has a logo');
  }
  for (const p of Object.values(PARTNERLINKS)) assert.ok(!JSON.stringify(json).includes(p));
  assert.match(home, /<form id="match-form"/);
  assert.match(home, /<script type="module" src="\/js\/match.js"><\/script>/);
  assert.ok(!/coming soon/i.test(home));
  assert.match(readFileSync('dist/sitemap.xml', 'utf8'), /<loc>https:\/\/simracingmatch\.com\/<\/loc><lastmod>2026-11-05<\/lastmod>/);
});
