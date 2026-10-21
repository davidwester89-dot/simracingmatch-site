import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { partnerBlokken, partnerNoten, metNoot, NOOT_HTML, PARTNER_NOOT } from '../src/lib/partnerlinks.js';

// Partnerzin i.p.v. label per knop: precies één zin per blok met partnerlinks; rel sponsored nofollow noopener blijft.
const A = '<a class="btn" href="https://example.com/a" rel="sponsored nofollow noopener" data-vendor="x">Naar A</a>';
const B = A.replace('/a"', '/b"');
const G = '<a class="btn" href="https://example.com/g" rel="noopener" data-vendor="g">Naar G</a>';

test('partner note: one sentence per blok met partnerlink(s), geen zin zonder partnerlink, geen label', () => {
  assert.equal(PARTNER_NOOT, 'Some links are partner links; this never affects the ranking.');
  const blok = (x) => `<div class="out">${x}</div>`;
  const out = partnerNoten(`<main>${blok(A + B)}<p>tekst</p>${blok(G)}</main>`);
  assert.equal(out.split(NOOT_HTML).length - 1, 1);
  assert.ok(out.includes(blok(A + B) + NOOT_HTML));
  assert.ok(out.includes(blok(G) + '</main>'));
  assert.equal(partnerNoten(out), out, 'geen tweede zin bij opnieuw draaien');
  assert.equal(metNoot(G), G);
  assert.equal(metNoot(A + B), A + B + NOOT_HTML);
  const lopend = partnerNoten(`<p>Intro.</p><ul><li>${A}</li><li>${G}</li></ul><p>Meer.</p>`, { kaal: true });
  assert.equal(lopend, `<p>Intro.</p><ul><li>${A}</li><li>${G}</li></ul>${NOOT_HTML}<p>Meer.</p>`);
  assert.doesNotMatch(out, />\s*partner ?link\s*<\/span>/i);
});

const html = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? html(p) : p.endsWith('.html') ? [p] : []; });
test('build: geen label per knop, precies 1 zin per partnerblok, rel sponsored nofollow noopener', () => {
  execSync('node build.mjs', { stdio: 'ignore', env: { ...process.env, BASE: '', PREVIEW: '' } });
  let links = 0, blokken = 0;
  for (const f of html('dist')) {
    const s = readFileSync(f, 'utf8');
    assert.doesNotMatch(s, /<span class="(partner|plabel)">\s*partner ?link/i, `${f}: label per knop`);
    const ls = [...s.matchAll(/<a\s[^>]*rel="[^"]*sponsored[^"]*"[^>]*>/g)];
    for (const m of ls) assert.match(m[0], /rel="sponsored nofollow noopener"/, `${f}: rel`);
    const bl = partnerBlokken(s, { kaal: true }).filter((b) => b.partner);
    for (const m of ls) assert.ok(bl.some((b) => m.index > b.start && m.index < b.end), `${f}: partnerlink buiten een blok`);
    for (const b of bl) {
      assert.ok(s.startsWith(NOOT_HTML, b.end), `${f}: blok met partnerlink zonder zin`);
      assert.ok(!s.slice(b.start, b.end).includes(NOOT_HTML), `${f}: zin binnen een blok`);
    }
    assert.equal(s.split(NOOT_HTML).length - 1, bl.length, `${f}: aantal zinnen ≠ aantal partnerblokken`);
    links += ls.length; blokken += bl.length;
  }
  assert.ok(links > 0 && blokken > 0, 'live partnerlinks verwacht');
});

