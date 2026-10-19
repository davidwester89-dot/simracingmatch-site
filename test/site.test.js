import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { PARTNERLINKS } from '../src/lib/partnerlinks.js';

const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const unesc = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

test('build (productie): pagina’s, sitemap, robots, IndexNow, CNAME, regels', () => {
  execSync('node build.mjs', { env: { ...process.env, BASE: '', PREVIEW: '', GO_LIVE: '1' } });
  const html = walk('dist').filter((f) => f.endsWith('.html') && !/\/google[0-9a-f]+\.html$/.test(f));
  assert.equal(html.length, 5, `aantal pagina's ${html.length}`);
  const sm = readFileSync('dist/sitemap.xml', 'utf8');
  assert.equal((sm.match(/<loc>/g) || []).length, html.length - 1); // 404 noindex
  assert.match(readFileSync('dist/robots.txt', 'utf8'), /Sitemap: https:\/\/simracingmatch\.nl\/sitemap\.xml/);
  assert.equal(readFileSync('dist/CNAME', 'utf8').trim(), 'simracingmatch.nl');
  const key = readdirSync('dist').find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
  assert.ok(key && readFileSync(join('dist', key), 'utf8') === key.replace('.txt', ''));
  assert.ok(existsSync('dist/google78d915054efb904d.html'));
  assert.equal(readFileSync('dist/google78d915054efb904d.html', 'utf8'), 'google-site-verification: google78d915054efb904d.html');
  // Geen thin placeholders voor de toekomstige 14 URL's.
  for (const p of ['simrace-setup-kiezen', 'beste-racestuur', 'beste-racestuur-ps5', 'beste-racestuur-pc', 'beste-racestuur-xbox', 'racestuur-met-pedalen', 'direct-drive-stuur', 'sim-racing-pedalen', 'sim-racing-cockpit', 'fanatec-vs-moza', 'logitech-g29-vs-g923', 'wat-kost-een-simrace-setup', 'bronnen-en-werkwijze']) {
    assert.ok(!existsSync(`dist/${p}/index.html`), `geen placeholder ${p}`);
    assert.ok(!sm.includes(`/${p}/`), `niet in sitemap ${p}`);
  }
  const verboden = [/Dave/i, /Wester/i, /batterijmatch/i, /reddit/i, /\bratings?\b/i, /aggregateRating/, /reviewCount/, /ratingValue/, /sterrenbeoordeling/i, /klantbeoordeling/i, /★/, /content volgt/i];
  for (const f of html) {
    const s = readFileSync(f, 'utf8');
    for (const r of verboden) assert.ok(!r.test(s), `${f} bevat ${r}`);
    if (!f.endsWith('404.html')) { assert.match(s, /<link rel="canonical" href="https:\/\/simracingmatch\.nl\//); assert.ok(!s.includes('noindex'), f); }
    const title = unesc(s.match(/<title>(.*?)<\/title>/)[1]); assert.ok(title.length <= 60, `${f}: titel te lang (${title.length}) ${title}`);
    assert.match(s, /Ook van ons/);
    for (const d of ['boekhoudmatch.nl', 'shopmatch.nl', 'verduurzaammatch.nl', 'warmtepompenmatch.nl', 'thuisaccumatch.nl', 'kassamatch.nl']) assert.ok(s.includes(`https://${d}/`), `${f}: netwerk ${d}`);
    const net = s.slice(s.indexOf('<div class="net">'), s.indexOf('<p class="fine">'));
    assert.ok(!net.includes('simracingmatch.nl'), `${f}: netwerkfooter linkt naar zichzelf`);
    assert.match(s, /<details class="menu">/); assert.match(s, /<footer class="site">/);
    if (/class="src">Door/.test(s) || /class="author">Door/.test(s)) assert.match(s, /Redactie SimracingMatch/);
    for (const m of s.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)) JSON.parse(m[1]);
    for (const m of s.matchAll(/href="(\/[^"#?]*)/g)) {
      const p = m[1]; const t = p.endsWith('/') ? join('dist', p, 'index.html') : join('dist', p);
      assert.ok(existsSync(t), `${f}: kapotte link ${p}`);
    }
    const sponsored = [...s.matchAll(/<a [^>]*rel="[^"]*sponsored[^"]*"[^>]*>/g)];
    for (const m of sponsored) assert.match(s.slice(m.index), /^<a [^>]*>[^<]*<\/a><span class="partner">partnerlink<\/span>/, `${f}: sponsored zonder label`);
    assert.equal((s.match(/class="partner"/g) || []).length, sponsored.length, `${f}: label zonder sponsored link`);
  }
  assert.ok(Object.keys(PARTNERLINKS).length === 0, 'partnerlinks blijven leeg tot goedkeuring');
  // Home is indexeerbaar in GO_LIVE.
  const home = readFileSync('dist/index.html', 'utf8');
  assert.ok(!home.includes('noindex'));
  assert.match(home, /Welke simrace-setup past bij jou/);
  assert.match(home, /5 vragen/);
  assert.match(home, /partnerlink/);
  assert.match(sm, /<loc>https:\/\/simracingmatch\.nl\/<\/loc>/);
});

test('build (preview): noindex, Disallow, BASE-paden, geen CNAME', () => {
  execSync('node build.mjs', { env: { ...process.env, BASE: '/simracingmatch-site', GO_LIVE: '' } });
  const s = readFileSync('dist/index.html', 'utf8');
  assert.match(s, /<meta name="robots" content="noindex">/);
  assert.match(s, /href="\/simracingmatch-site\/contact\/"/);
  assert.match(s, /<link rel="canonical" href="https:\/\/simracingmatch\.nl\/">/);
  assert.match(readFileSync('dist/robots.txt', 'utf8'), /Disallow: \//);
  assert.ok(!existsSync('dist/CNAME'));
});

test('analytics: consent-script met GA_ID, alleen na toestemming; zonder ID geen Google', () => {
  const c = readFileSync('src/assets/js/consent.js', 'utf8');
  assert.match(c, /track\('vendor_click'/);
  assert.match(c, /track\('match_cta'/);
  assert.match(readFileSync('src/lib/consent.js', 'utf8'), /sm-consent/);
  assert.match(readFileSync('src/analytics.config.mjs', 'utf8'), /G-HJLSDLMDD0/);
  execSync('node build.mjs', { env: { ...process.env, BASE: '', GO_LIVE: '1', GA_ID: 'G-TEST1234' } });
  const s = readFileSync('dist/index.html', 'utf8');
  assert.match(s, /data-ga="G-TEST1234"/); assert.match(s, /src="\/js\/consent\.js"/); assert.match(s, /googletagmanager/);
  assert.match(readFileSync('dist/privacy/index.html', 'utf8'), /_ga/);
  execSync('node build.mjs', { env: { ...process.env, BASE: '', GO_LIVE: '1', GA_ID: '' } });
  const z = readFileSync('dist/index.html', 'utf8');
  assert.ok(!z.includes('googletagmanager')); assert.ok(!z.includes('consent.js'));
});
