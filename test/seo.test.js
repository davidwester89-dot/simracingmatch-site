import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const unesc = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

test('on-page SEO: unieke titels, meta 70-155, één H1, canonical, og, schema', () => {
  execSync('node build.mjs', { env: { ...process.env, BASE: '', PREVIEW: '', GO_LIVE: '1', GA_ID: '' } });
  const files = walk('dist').filter((f) => f.endsWith('.html') && !f.endsWith('404.html') && !/\/google[0-9a-f]+\.html$/.test(f));
  const sm = readFileSync('dist/sitemap.xml', 'utf8');
  const titles = new Map(); const descs = new Map();
  for (const f of files) {
    const s = readFileSync(f, 'utf8');
    const url = 'https://simracingmatch.com/' + f.replace(/^dist\//, '').replace(/index\.html$/, '');
    const title = unesc(s.match(/<title>(.*?)<\/title>/)[1]);
    assert.ok(!titles.has(title), `${f}: dubbele titel`); titles.set(title, f);
    const desc = unesc(s.match(/<meta name="description" content="([^"]*)"/)[1]);
    assert.ok(desc.length >= 70 && desc.length <= 155, `${f}: meta description ${desc.length} tekens`);
    assert.ok(!descs.has(desc), `${f}: dubbele description`); descs.set(desc, f);
    assert.equal((s.match(/<h1[\s>]/g) || []).length, 1, `${f}: precies één H1`);
    assert.ok(s.includes(`<link rel="canonical" href="${url}">`), `${f}: canonical`);
    const og = s.match(/<meta property="og:image" content="https:\/\/simracingmatch\.com(\/[^"]+)"/)[1];
    assert.ok(existsSync(join('dist', og)), `${f}: og:image ${og}`);
    assert.ok(sm.includes(`<loc>${url}</loc>`), `${f}: sitemap`);
    const ld = [...s.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
    if (url !== 'https://simracingmatch.com/') assert.ok(ld.some((x) => x['@type'] === 'BreadcrumbList'), `${f}: BreadcrumbList`);
    const faq = ld.find((x) => x['@type'] === 'FAQPage');
    if (faq) assert.ok((s.match(/<details>/g) || []).length >= faq.mainEntity.length, `${f}: FAQPage zonder zichtbare FAQ`);
    const hs = [...s.split('<main')[1].matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
    for (let i = 1; i < hs.length; i++) assert.ok(hs[i] <= hs[i - 1] + 1, `${f}: kopsprong h${hs[i - 1]} → h${hs[i]}`);
  }
  assert.ok([...titles.keys()].some((t) => t.toLowerCase().includes('simrace')), 'geen titel met simrace');
});
