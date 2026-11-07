// EU portal product exits for the five Moza wheel bases (7 Nov 2026, ref=eerlukwf).
// Quiz and /wheel-bases/compare/ commercial exits only. Editorial source URLs and the brand route stay put.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { matchBases } from '../src/assets/js/match-logic.js';
import { quizHasPartnerExit, quizShopLink } from '../src/assets/js/match-exit.js';
import { MOZA_EU_PRODUCT_EXITS, PARTNERLINKS, PARTNER_NOOT, mozaEuProductExit, mozaExitSlug, productExitAnchor } from '../src/lib/partnerlinks.js';
import { BASES } from '../src/wheelbases.mjs';
import { matchJson } from '../src/pages.mjs';

const EXITS = [
  ['R9 V3', 'https://eu.mozaracing.com/products/r9-wheelbase?ref=eerlukwf'],
  ['R12 V2', 'https://eu.mozaracing.com/products/r12-wheelbase?ref=eerlukwf'],
  ['R16 Ultra', 'https://eu.mozaracing.com/products/r16-ultra?ref=eerlukwf'],
  ['R21 Ultra', 'https://eu.mozaracing.com/products/r21-ultra?ref=eerlukwf'],
  ['R25 Ultra', 'https://eu.mozaracing.com/products/r25-ultra?ref=eerlukwf'],
];

const anchors = (html) => [...html.matchAll(/<a\s[^>]*>/g)].map((m) => m[0]);
const hrefOf = (tag) => tag.match(/href="([^"]+)"/)[1];

test('five EU product exits: exact portal URLs, same EU page as the source, brand route untouched', () => {
  assert.deepEqual(Object.entries(MOZA_EU_PRODUCT_EXITS), EXITS);
  assert.equal(PARTNERLINKS.moza, 'https://eu.mozaracing.com/?ref=simracingmatch');
  assert.ok(!PARTNERLINKS.moza.includes('eerlukwf'));
  assert.deepEqual(Object.keys(PARTNERLINKS), ['moza', 'pxn', 'simlab']);
  for (const [model, href] of EXITS) {
    const base = BASES.find((b) => b.model === model);
    assert.ok(base, model);
    assert.equal(base.brand, 'Moza');
    assert.equal(base.url, href.slice(0, href.indexOf('?')));
    assert.match(base.url, /^https:\/\/eu\.mozaracing\.com\/products\//);
    assert.equal(mozaEuProductExit(model, base.url), href);
    assert.equal(mozaExitSlug(href), href.split('/').pop().split('?')[0]);
    assert.equal(mozaEuProductExit('not a base'), '');
  }
  assert.throws(() => mozaEuProductExit('R9 V3', 'https://mozaracing.com/products/r9-wheelbase'), /same EU page/);
});

test('quiz exits: exact href, sponsored nofollow noopener, vendor_click hooks; other products and order unchanged', () => {
  const data = JSON.parse(matchJson());
  assert.equal(data.partnerNote, PARTNER_NOOT);
  for (const b of data.bases) assert.ok(!b.url.includes('ref='), b.model);
  for (const [model, href] of EXITS) {
    const b = data.bases.find((x) => x.model === model);
    assert.equal(b.exit, href);
    const tag = quizShopLink({ ...b, perNm: b.price / b.nm });
    const slug = mozaExitSlug(href);
    assert.equal(tag, `<a class="btn ghost" href="${href}" rel="sponsored nofollow noopener" target="_blank" data-vendor="moza" data-pos="quiz_exit_${slug}" data-cta="outbound" data-partner-slot="moza">Manufacturer page</a>`);
  }
  for (const b of data.bases.filter((x) => !x.exit)) {
    const tag = quizShopLink(b);
    assert.ok(tag.includes(`href="${b.url}" rel="noopener" target="_blank">Manufacturer page</a>`), b.model);
    assert.doesNotMatch(tag, /sponsored|\?ref=|data-vendor=/);
  }
  const pc = { budget: 'o1500', platform: 'pc', space: 'cockpit', experience: 'upgrader', style: 'competitive' };
  const withExit = matchBases(data.bases, pc).map((b) => b.model);
  const plain = matchBases(BASES, pc).map((b) => b.model);
  assert.deepEqual(withExit, plain);
  const shown = matchBases(data.bases, pc);
  assert.equal(quizHasPartnerExit(shown), true);
  for (const [model, href] of EXITS) assert.equal(shown.find((b) => b.model === model).exit, href);
  const xbox = matchBases(data.bases, { budget: '300-700', platform: 'xbox', space: 'stand', experience: 'upgrader', style: 'casual' });
  assert.deepEqual(xbox.filter((b) => b.brand === 'Moza').map((b) => b.model), ['R16 Ultra']);
  assert.equal(xbox.find((b) => b.model === 'R16 Ultra').exit, EXITS[2][1]);
  assert.equal(quizHasPartnerExit(matchBases(data.bases, { budget: 'u300', platform: 'pc', space: 'desk', experience: 'beginner', style: 'casual' })), false);
  const logic = readFileSync('src/assets/js/match-logic.js', 'utf8');
  const quiz = readFileSync('src/assets/js/match.js', 'utf8');
  assert.doesNotMatch(logic, /partnerlinks|sponsored|[?&]ref=|eerlukwf/);
  assert.doesNotMatch(quiz, /partnerlinks|sponsored|[?&]ref=|eerlukwf/);
  assert.match(quiz, /quizShopLink/);
});

test('compare commercial exits tracked; sources, brand route and other products are not', () => {
  execSync('node build.mjs', { stdio: 'ignore', env: { ...process.env, BASE: '', PREVIEW: '', GO_LIVE: '1', THEME: 'A' } });
  const c = readFileSync('dist/wheel-bases/compare/index.html', 'utf8');
  const table = c.match(/<table class="wb-table">([\s\S]*?)<\/table>/)[1];
  const tags = anchors(table);
  for (const [model, href] of EXITS) {
    const slug = mozaExitSlug(href);
    const want = productExitAnchor(href, `wb_compare_exit_${slug}`);
    assert.ok(table.includes(want), model);
    assert.equal(tags.filter((t) => hrefOf(t) === href).length, 1, model);
  }
  assert.ok(c.includes('</table></div></div><p class="pnoot">Some links are partner links; this never affects the ranking.</p>'), 'partner note directly after the comparison table');
  assert.ok(c.includes('href="https://eu.mozaracing.com/?ref=simracingmatch" rel="sponsored nofollow noopener"'));
  assert.equal((c.match(/ref=simracingmatch/g) || []).length, 1);
  const sources = c.match(/<h2 class="src-h">Sources<\/h2><ul>([\s\S]*?)<\/ul>/)[1];
  for (const [, href] of EXITS) {
    const bare = href.slice(0, href.indexOf('?'));
    assert.ok(sources.includes(`href="${bare}" rel="noopener">`), bare);
    assert.ok(!sources.includes('eerlukwf'));
  }
  for (const b of BASES.filter((x) => x.brand !== 'Moza')) {
    assert.ok(table.includes(`href="${b.url}" rel="noopener">product page</a>`), b.model);
    assert.ok(!table.includes(b.url + '?'), b.model);
  }
  const home = readFileSync('dist/index.html', 'utf8');
  const json = JSON.parse(home.match(/<script type="application\/json" id="match-data">([^<]+)<\/script>/)[1]);
  for (const [model, href] of EXITS) assert.equal(json.bases.find((b) => b.model === model).exit, href);
  assert.match(readFileSync('dist/js/match.js', 'utf8'), /quizShopLink/);
  assert.match(readFileSync('dist/js/match-exit.js', 'utf8'), /rel="sponsored nofollow noopener"/);
  const mvf = readFileSync('dist/wheel-bases/moza-vs-fanatec/index.html', 'utf8');
  assert.doesNotMatch(mvf, /eerlukwf|rel="sponsored|\?ref=/);
  for (const f of ['dist/wheel-bases/direct-drive-vs-belt/index.html', 'dist/wheel-bases/how-much-torque/index.html', 'dist/blog/load-cell-pedals/index.html']) {
    assert.ok(!readFileSync(f, 'utf8').includes('eerlukwf'), f);
  }
});
