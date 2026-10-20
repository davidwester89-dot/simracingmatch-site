import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { PARTNERLINKS, knop } from '../src/lib/partnerlinks.js';
import { hreflangTags } from '../src/layout.mjs';

const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const unesc = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

test('hreflang: en + x-default; nl omitted when empty', () => {
  const t = hreflangTags('https://simracingmatch.com/', '');
  assert.match(t, /hreflang="en" href="https:\/\/simracingmatch\.com\/"/);
  assert.match(t, /hreflang="x-default" href="https:\/\/simracingmatch\.com\/"/);
  assert.ok(!t.includes('hreflang="nl"'));
  const withNl = hreflangTags('https://simracingmatch.com/', 'https://simracingmatch.com/nl/');
  assert.match(withNl, /hreflang="nl" href="https:\/\/simracingmatch\.com\/nl\/"/);
});

test('build (production theme A): pages, sitemap, CNAME, English, tracking hooks', () => {
  execSync('node build.mjs', { env: { ...process.env, BASE: '', PREVIEW: '', GO_LIVE: '1', THEME: 'A' } });
  assert.equal(readFileSync('dist/theme.txt', 'utf8').trim(), 'A');
  const html = walk('dist').filter((f) => f.endsWith('.html') && !/\/google[0-9a-f]+\.html$/.test(f));
  // home, privacy, disclaimer, contact, blog (noindex), 404
  assert.ok(html.length >= 5, `pages ${html.length}`);
  const sm = readFileSync('dist/sitemap.xml', 'utf8');
  assert.match(readFileSync('dist/robots.txt', 'utf8'), /Sitemap: https:\/\/simracingmatch\.com\/sitemap\.xml/);
  assert.equal(readFileSync('dist/CNAME', 'utf8').trim(), 'simracingmatch.com');
  const home = readFileSync('dist/index.html', 'utf8');
  assert.match(home, /lang="en"/);
  assert.match(home, /data-theme="A"/);
  assert.match(home, /hreflang="en"/);
  assert.match(home, /hreflang="x-default"/);
  assert.ok(!home.includes('hreflang="nl"'));
  // Match not live yet (MATCH_LIVE=false): no CTA promises a match (audit 20-10, F2).
  assert.ok(!home.includes('Find your setup'), 'no "Find your setup" while the match is not live');
  assert.match(home, /<a class="btn lg" href="\/blog\/" data-cta="home_hero_blog">Read the blog<\/a>/);
  assert.match(home, /Preview the 5 questions/);
  assert.match(home, /html\{scroll-padding-top:80px\}/);
  assert.ok(!/consent-btn\[data-c=no\]/.test(home), 'Accept and Reject styled the same');
  assert.match(home, /data-quiz="start"/);
  assert.match(home, /og:locale" content="en_US"/);
  assert.ok(!home.includes('noindex'));
  assert.ok(home.includes('Honest help choosing a sim racing setup.</p>'), 'footer tagline kort');
  assert.ok(!home.includes('never affect rankings or the match'), 'footer bottom line kort');
  assert.ok(home.includes("<meta name='impact-site-verification' value='35fa02aa-9ecb-4229-ae1e-7f5c562867eb'>"), 'Impact-meta op /');
  for (const f of html) if (!f.endsWith(join('dist', 'index.html'))) assert.ok(!readFileSync(f, 'utf8').includes('impact-site-verification'), `${f}: Impact-meta alleen op /`);
  assert.doesNotMatch(home, /Also from us/);
  // Hero brand block (replaces the trackmap)
  assert.match(home, /Brands we compare/);
  assert.doesNotMatch(home, /NIGHT RACE/);
  const blk = home.match(/<div class="hero-a brands"[\s\S]*?<\/div>/);
  assert.ok(blk, 'hero brand block');
  const b = blk[0];
  assert.doesNotMatch(b.replace(/<[^>]+>/g, ' '), /partner|official/i);
  assert.doesNotMatch(b, /partner|official/i);
  const imgs = [...b.matchAll(/<img [^>]*>/g)].map((m) => m[0]);
  assert.ok(imgs.length >= 5, `brand logos ${imgs.length}`);
  for (const im of imgs) {
    assert.match(im, /width="\d+"/, im);
    assert.match(im, /height="\d+"/, im);
    assert.match(im, /alt="[^"]+"/, im);
    const src = im.match(/src="([^"]+)"/)[1];
    assert.ok(src.startsWith('/brands/') && existsSync(join('dist', src)), `logo file ${src}`);
  }
  const hrefs = [...b.matchAll(/href="([^"]*)"/g)].map((m) => m[1]);
  assert.equal(hrefs.length, imgs.length);
  for (const h of hrefs) assert.ok(h.startsWith('/') && !h.startsWith('//'), `external href ${h}`);
  assert.equal((b.match(/data-cta="hero_brand"/g) || []).length, imgs.length);
  assert.equal((b.match(/data-brand="[a-z0-9-]+"/g) || []).length, imgs.length);
  assert.doesNotMatch(b, /rel="sponsored|target="_blank"/);
  const verboden = [/Dave/i, /Wester/i, /batterijmatch/i, /reddit/i, /aggregateRating/, /reviewCount/, /ratingValue/, /★/, /content volgt/i, /Redactie /];
  for (const f of html) {
    const s = readFileSync(f, 'utf8');
    for (const r of verboden) assert.ok(!r.test(s), `${f} has ${r}`);
    if (!f.endsWith('404.html') && !f.includes('/blog/index.html')) {
      assert.match(s, /<link rel="canonical" href="https:\/\/simracingmatch\.com\//);
    }
    const title = unesc(s.match(/<title>(.*?)<\/title>/)[1]);
    assert.ok(title.length <= 60, `${f}: title ${title.length}`);
    for (const m of s.matchAll(/href="(\/[^"#?]*)/g)) {
      const path = m[1];
      const t = path.endsWith('/') ? join('dist', path, 'index.html') : join('dist', path);
      assert.ok(existsSync(t), `${f}: broken ${path}`);
    }
  }
  assert.deepEqual(PARTNERLINKS, {});
  const k = knop('https://example.com/', 'test_pos', { partner: true, vendor: 'moza', label: 'Moza' });
  assert.match(k, /data-vendor="moza"/);
  assert.match(k, /data-pos="test_pos"/);
  assert.match(k, />Partner link</);
});

test('build theme B + preview', () => {
  execSync('node build.mjs', { env: { ...process.env, BASE: '/simracingmatch-site', GO_LIVE: '', THEME: 'B' } });
  const s = readFileSync('dist/index.html', 'utf8');
  assert.match(s, /data-theme="B"/);
  assert.match(s, /noindex/);
  assert.match(s, /PIT WALL/);
  assert.ok(!existsSync('dist/CNAME'));
  execSync('node build.mjs', { env: { ...process.env, BASE: '', GO_LIVE: '1', THEME: 'A' } });
});

test('analytics: quiz_start + quiz_complete stub + vendor_click', () => {
  const c = readFileSync('src/assets/js/consent.js', 'utf8');
  assert.match(c, /track\('quiz_start'/);
  assert.match(c, /track\('quiz_complete'/);
  assert.match(c, /track\('vendor_click'/);
  assert.match(c, /sm:quiz/);
  assert.match(readFileSync('src/lib/consent.js', 'utf8'), /sm-consent/);
  execSync('node build.mjs', { env: { ...process.env, BASE: '', GO_LIVE: '1', GA_ID: 'G-TEST1234', THEME: 'A' } });
  assert.match(readFileSync('dist/index.html', 'utf8'), /data-ga="G-TEST1234"/);
  assert.match(readFileSync('dist/privacy/index.html', 'utf8'), /_ga/);
});

test('blog posts: title <=60, meta <=155, one H1, BlogPosting, sitemap, index, links', () => {
  execSync('node build.mjs', { env: { ...process.env, BASE: '', GO_LIVE: '1', THEME: 'A' } });
  const sm = readFileSync('dist/sitemap.xml', 'utf8');
  const index = readFileSync('dist/blog/index.html', 'utf8');
  assert.ok(!index.includes('noindex'), 'blog index indexable');
  assert.match(sm, /<loc>https:\/\/simracingmatch\.com\/blog\/<\/loc>/);
  const home = readFileSync('dist/index.html', 'utf8');
  assert.match(home, /id="setup-match"/);
  const slugs = ['simracing-expo-2026-announcements', 'ps5-direct-drive-wheels-2026'];
  for (const slug of slugs) {
    const s = readFileSync(`dist/blog/${slug}/index.html`, 'utf8');
    const title = unesc(s.match(/<title>(.*?)<\/title>/)[1]);
    assert.ok(title.length <= 60, `${slug}: title ${title.length}`);
    const desc = unesc(s.match(/<meta name="description" content="([^"]*)"/)[1]);
    assert.ok(desc.length >= 70 && desc.length <= 155, `${slug}: meta ${desc.length}`);
    assert.equal((s.match(/<h1[\s>]/g) || []).length, 1, `${slug}: H1`);
    const lds = [...s.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
    const bp = lds.find((x) => x['@type'] === 'BlogPosting');
    assert.ok(bp, `${slug}: BlogPosting`);
    assert.equal(bp.datePublished, '2026-10-19');
    assert.equal(bp.author.name, 'SimracingMatch Editorial');
    assert.equal(bp.mainEntityOfPage, `https://simracingmatch.com/blog/${slug}/`);
    assert.equal(bp.headline, title);
    assert.ok(sm.includes(`<loc>https://simracingmatch.com/blog/${slug}/</loc>`), `${slug}: sitemap`);
    assert.ok(index.includes(`href="/blog/${slug}/"`), `${slug}: blog index`);
    assert.ok(!/href="https:\/\/simracingmatch\.com/.test(s.replace(/<link[^>]+>/g, '')), `${slug}: absolute internal link`);
    assert.match(s, /<p class="post-cta"><a href="\/blog\/" class="btn">[^<]+<\/a><a href="\/#setup-match" data-cta="blog_match" data-quiz="start">Preview the 5 questions<\/a>/);
  }
  execSync('node build.mjs', { env: { ...process.env, BASE: '/simracingmatch-site', GO_LIVE: '', THEME: 'B' } });
  const pv = readFileSync('dist/blog/ps5-direct-drive-wheels-2026/index.html', 'utf8');
  assert.match(pv, /href="\/simracingmatch-site\/blog\/simracing-expo-2026-announcements\/"/);
  assert.match(pv, /href="\/simracingmatch-site\/#setup-match"/);
  assert.ok(!pv.includes('/simracingmatch-site/simracingmatch-site/'));
  execSync('node build.mjs', { env: { ...process.env, BASE: '', GO_LIVE: '1', THEME: 'A' } });
});
