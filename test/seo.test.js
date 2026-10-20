import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const unesc = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

test('on-page SEO: unique titles, meta 70-155, one H1, canonical, hreflang', () => {
  execSync('node build.mjs', { env: { ...process.env, BASE: '', PREVIEW: '', GO_LIVE: '1', GA_ID: '', THEME: 'A' } });
  const files = walk('dist').filter((f) => f.endsWith('.html') && !f.endsWith('404.html') && !/\/google[0-9a-f]+\.html$/.test(f) && !f.includes('/blog/'));
  const titles = new Map(); const descs = new Map();
  for (const f of files) {
    const s = readFileSync(f, 'utf8');
    const url = 'https://simracingmatch.com/' + f.replace(/^dist\//, '').replace(/index\.html$/, '');
    const title = unesc(s.match(/<title>(.*?)<\/title>/)[1]);
    assert.ok(!titles.has(title), `dup title ${f}`); titles.set(title, f);
    const desc = unesc(s.match(/<meta name="description" content="([^"]*)"/)[1]);
    assert.ok(desc.length >= 70 && desc.length <= 155, `${f}: meta ${desc.length}`);
    assert.ok(!descs.has(desc), `dup desc ${f}`); descs.set(desc, f);
    assert.equal((s.match(/<h1[\s>]/g) || []).length, 1, `${f}: H1`);
    assert.ok(s.includes(`<link rel="canonical" href="${url}">`), f);
    assert.match(s, /hreflang="en"/);
    assert.match(s, /hreflang="x-default"/);
    const og = s.match(/og:image" content="https:\/\/simracingmatch\.com(\/[^"]+)"/)[1];
    assert.ok(existsSync(join('dist', og)), og);
  }
  assert.ok([...titles.keys()].some((t) => /sim racing|SimracingMatch/i.test(t)));
});

test('merknaam Asetek: "Asetek Racing" (asetek.com/simsports/about-us), nergens "Asetek SimSports"', async () => {
  const { readFileSync } = await import('node:fs');
  const s = readFileSync(new URL('../src/pages.mjs', import.meta.url), 'utf8');
  assert.ok(s.includes('alt="Asetek Racing"'));
  assert.ok(!/Asetek SimSports/i.test(s));
});
