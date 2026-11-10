import { revisieDatum } from './nuchter-datums-helper.mjs';
// Moza neutralisation, push 11 Nov 2026. Manufacturer URLs and ranking stay the same;
// no referrals, sponsored rel, partner-click hooks or unearned partner notes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { matchBases } from '../src/assets/js/match-logic.js';
import { quizShopLink } from '../src/assets/js/match-exit.js';
import { MOZA_EU_PRODUCT_EXITS, PARTNERLINKS, NOOT_HTML, partnerVendor, mozaEuProductExit, mozaExitSlug, productExitAnchor } from '../src/lib/partnerlinks.js';
import { BASES, sortedBases } from '../src/wheelbases.mjs';
import { matchJson } from '../src/pages.mjs';
import { renderMarkdown } from '../src/markdown.mjs';

const EXITS = [
  ['R9 V3', 'https://eu.mozaracing.com/products/r9-wheelbase'],
  ['R12 V2', 'https://eu.mozaracing.com/products/r12-wheelbase'],
  ['R16 Ultra', 'https://eu.mozaracing.com/products/r16-ultra'],
  ['R21 Ultra', 'https://eu.mozaracing.com/products/r21-ultra'],
  ['R25 Ultra', 'https://eu.mozaracing.com/products/r25-ultra'],
];
const anchors = (html) => [...html.matchAll(/<a\s[^>]*>/g)].map((m) => m[0]);
const hrefOf = (tag) => tag.match(/href="([^"]+)"/)[1].replace(/&amp;/g, '&');
const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f); return statSync(p).isDirectory() ? walk(p) : [p];
});
const neutral = (tag, context = '') => {
  assert.equal(new URL(hrefOf(tag)).searchParams.has('ref'), false, `${context}: ref`);
  assert.match(tag, /rel="noopener"/, context);
  assert.doesNotMatch(tag, /sponsored|nofollow|data-(?:vendor|cta|pos|partner-slot)=/, context);
};

test('five EU exits are neutral source pages; Moza is absent from all partner configuration', () => {
  assert.deepEqual(Object.entries(MOZA_EU_PRODUCT_EXITS), EXITS);
  assert.equal(PARTNERLINKS.moza, undefined);
  assert.deepEqual(Object.keys(PARTNERLINKS), ['simlab', 'pxn']);
  for (const [model, href] of EXITS) {
    const base = BASES.find((b) => b.model === model);
    assert.equal(base.brand, 'Moza');
    assert.equal(base.url, href);
    assert.equal(mozaEuProductExit(model, base.url), href);
    assert.equal(mozaExitSlug(href), href.split('/').pop());
    assert.equal(partnerVendor(href), '');
    neutral(productExitAnchor(href), model);
  }
  assert.equal(mozaEuProductExit('not a base'), '');
  assert.throws(() => mozaEuProductExit('R9 V3', 'https://mozaracing.com/products/r9-wheelbase'), /same EU page/);
  for (const href of [
    'https://eu.mozaracing.com/',
    'https://mozaracing.com/',
    'https://eu.mozaracing.com/?ref=simracingmatch',
    'https://eu.mozaracing.com/products/r9-wheelbase?ref=eerlukwf',
  ]) assert.equal(partnerVendor(href), '', href);
  const source = 'https://eu.mozaracing.com/blogs/news/moza-tgs-2026';
  assert.equal(renderMarkdown(`[Moza](${source})`), `<p><a href="${source}" rel="noopener">Moza</a></p>`);
  assert.equal(partnerVendor(PARTNERLINKS.pxn), 'pxn');
  assert.equal(partnerVendor(PARTNERLINKS.simlab), 'simlab');
});

test('quiz uses ordinary Moza links without partner note or click hooks', () => {
  const data = JSON.parse(matchJson());
  assert.equal(Object.hasOwn(data, 'partnerNote'), false);
  for (const b of data.bases) {
    assert.ok(!b.url.includes('ref='), b.model);
    const tag = quizShopLink(b);
    assert.equal(tag, `<a class="btn ghost" href="${b.url}" rel="noopener" target="_blank">Manufacturer page</a>`);
    neutral(tag, b.model);
  }
  for (const [model, href] of EXITS) assert.equal(data.bases.find((b) => b.model === model).exit, href);
  const xbox = matchBases(data.bases, { budget: '300-700', platform: 'xbox', space: 'stand', experience: 'upgrader', style: 'casual' });
  assert.deepEqual(xbox.filter((b) => b.brand === 'Moza').map((b) => b.model), ['R16 Ultra']);
  const legacy = { url: EXITS[0][1], exit: `${EXITS[0][1]}?ref=eerlukwf` };
  neutral(quizShopLink(legacy), 'a stale commercial exit must fall back to the neutral source');
  for (const f of ['src/assets/js/match-logic.js', 'src/assets/js/match.js', 'src/assets/js/match-exit.js']) {
    assert.doesNotMatch(readFileSync(f, 'utf8'), /partnerlinks|sponsored|[?&]ref=|eerlukwf|pnoot|partnerNote/, f);
  }
});

test('product data, complete table order and all 144 answer rankings stay identical to dafb84e', () => {
  const data = JSON.parse(matchJson());
  const ranks = [];
  for (const budget of ['u300', '300-700', '700-1500', 'o1500']) for (const platform of ['pc', 'playstation', 'xbox']) for (const space of ['desk', 'stand', 'cockpit']) for (const experience of ['beginner', 'upgrader']) for (const style of ['casual', 'competitive']) {
    const answers = { budget, platform, space, experience, style };
    const models = matchBases(BASES, answers).map((b) => `${b.brand} ${b.model}`);
    assert.deepEqual(matchBases(data.bases, answers).map((b) => `${b.brand} ${b.model}`), models);
    ranks.push({ answers, models });
  }
  const snapshot = { bases: BASES, table: sortedBases().map((b) => `${b.brand} ${b.model}`), ranks };
  // Snapshot from dafb84eabec18352d3bf03a2b527702c56fbb822 before neutralising any links.
  assert.equal(createHash('sha256').update(JSON.stringify(snapshot)).digest('hex'), '14eac25631c7c0dde0b642f2001f6de1a78ae664bdd11c1f1eeefda00d44d700');
});

test('all served Moza links are neutral in production and preview; only genuine partner blocks keep notes', () => {
  for (const preview of [false, true]) {
    execSync('node build.mjs', { stdio: 'ignore', env: { ...process.env, BASE: preview ? '/simracingmatch-site' : '', PREVIEW: preview ? '1' : '', GO_LIVE: preview ? '' : '1', THEME: preview ? 'B' : 'A' } });
    let mozaLinks = 0;
    for (const f of walk('dist').filter((p) => /\.(html|js|mjs|json|xml|txt)$/.test(p))) {
      const s = readFileSync(f, 'utf8');
      assert.doesNotMatch(s, /ref=simracingmatch|eerlukwf|data-vendor="moza"|data-partner-slot="moza"/, f);
      if (!f.endsWith('.html')) continue;
      const tags = anchors(s);
      for (const tag of tags) {
        const href = hrefOf(tag);
        if (!/^https?:/.test(href)) continue;
        if (/(^|\.)mozaracing\.com$/.test(new URL(href).hostname)) {
          mozaLinks++; neutral(tag, f);
        }
      }
      if (!tags.some((tag) => /rel="[^"]*\bsponsored\b/.test(tag))) assert.ok(!s.includes(NOOT_HTML), `${f}: no note without a partner link`);
    }
    assert.ok(mozaLinks > 20, `site-wide audit exercised ${mozaLinks} Moza links`);
    const c = readFileSync('dist/wheel-bases/compare/index.html', 'utf8');
    const table = c.match(/<table class="wb-table">([\s\S]*?)<\/table>/)[1];
    for (const [model, href] of EXITS) {
      assert.ok(table.includes(productExitAnchor(href)), model);
      assert.equal(anchors(table).filter((t) => hrefOf(t) === href).length, 1, model);
    }
    assert.ok(!c.includes('</table></div></div>' + NOOT_HTML), 'table: no partner note after neutral product links');
    assert.ok(c.includes('<div class="out actions">'), 'store block retained');
    assert.ok(c.includes('</a></div>' + NOOT_HTML), 'store note retained for PXN and Sim-Lab');
    for (const vendor of ['simlab', 'pxn']) assert.match(c, new RegExp(`rel="sponsored nofollow noopener"[^>]*data-vendor="${vendor}"`));
    const store = anchors(c).find((tag) => hrefOf(tag) === 'https://eu.mozaracing.com/');
    assert.ok(store, 'Moza store remains in its original row');
    neutral(store, 'Moza store');
    const home = readFileSync('dist/index.html', 'utf8');
    const json = JSON.parse(home.match(/<script type="application\/json" id="match-data">([^<]+)<\/script>/)[1]);
    for (const [model, href] of EXITS) assert.equal(json.bases.find((b) => b.model === model).exit, href);
    assert.ok(!home.includes(NOOT_HTML), 'home: partner note removed');
    const expo = readFileSync('dist/blog/simracing-expo-2026-announcements/index.html', 'utf8');
    assert.ok(!expo.includes(NOOT_HTML), 'Expo: former Moza-only sources need no partner note');
  }
  execSync('node build.mjs', { stdio: 'ignore', env: { ...process.env, BASE: '', PREVIEW: '', GO_LIVE: '1', THEME: 'A' } });
});

test('neutralisation dates: visible, dateModified and sitemap lastmod all equal 11 Nov 2026', () => {
  execSync('node build.mjs', { stdio: 'ignore', env: { ...process.env, BASE: '', PREVIEW: '', GO_LIVE: '1', THEME: 'A' } });
  const sitemap = readFileSync('dist/sitemap.xml', 'utf8');
  for (const path of ['/', '/wheel-bases/compare/', '/blog/simracing-expo-2026-announcements/']) {
    const s = readFileSync(`dist${path}index.html`, 'utf8');
    assert.match(s, new RegExp(`(?:Updated\\s+|<time datetime="${revisieDatum(path, '2026-11-11')}">)${revisieDatum(path, '2026-11-11').endsWith('18') ? '18' : '11'} November 2026`));
    assert.match(s, new RegExp(`"dateModified":"${revisieDatum(path, '2026-11-11')}"`));
    assert.ok(sitemap.includes(`<loc>https://simracingmatch.com${path}</loc><lastmod>${revisieDatum(path, '2026-11-11')}</lastmod>`), path);
  }
});
