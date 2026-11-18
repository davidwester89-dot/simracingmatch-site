// Asetek B-tekstlinks (GB2 18-11-2026, MM-OK via Partnermanager): partnerlink op een bestaand woord, eerste vermelding in p/li per H2,
// niet in koppen/FAQ/schema/bronnen/tabellen, zichtbaar label, rel sponsored, data-vendor + data-pos. Geen nieuwe tekst, geen datumlift:
// de hele build is byte-gelijk aan de stand vóór B (PRE_B) zodra de B-links terug het woord zijn.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { execSync } from 'node:child_process';
import { B_PARTNERLINKS, B_RE, B_LABEL, zonderB, bTekstlink } from '../src/lib/partnerlinks.js';
import { CFG } from '../scripts/l7.config.mjs';
import { bodyFingerprint } from '../scripts/l7check.mjs';
import { secties, plekFouten } from './b-plek.mjs';

const PRE_B = 'ff0fe6f'; // origin/main vóór Asetek-B (18-11)
const REF = 'https://www.asetek.com/simsports/?aff=DAVIDWEST';
let gebouwd = false;
const build = () => { if (!gebouwd) { execSync('node build.mjs', { stdio: 'ignore', env: { ...process.env, BASE: '', PREVIEW: '' } }); gebouwd = true; } };
const walk = (d) => readdirSync(d).flatMap((f) => { const q = join(d, f); return statSync(q).isDirectory() ? walk(q) : [q]; });
const paginas = () => walk('dist').filter((f) => f.endsWith('index.html'));
const bLinks = (h) => [...h.matchAll(/<a\b[^>]*\sdata-pos="mid"[^>]*>[\s\S]*?<\/a>/g)].map((m) => m[0]);
let basisDir = null;
const basis = () => {
  if (basisDir !== null) return basisDir || null;
  const tmp = mkdtempSync(join(tmpdir(), 'srm-pre-b-'));
  try { execSync(`git archive ${PRE_B} | tar -x -C ${tmp}`, { stdio: 'ignore' }); } catch { rmSync(tmp, { recursive: true, force: true }); basisDir = ''; return null; }
  execSync('node build.mjs', { cwd: tmp, stdio: 'ignore', env: { ...process.env, BASE: '', PREVIEW: '' } });
  basisDir = tmp; return tmp;
};
after(() => { if (basisDir) rmSync(basisDir, { recursive: true, force: true }); });

test('Asetek B: exacte reflink, rel, label, target, data-vendor/cta/pos; linktekst = bestaande merknaam', () => {
  build();
  assert.equal(B_PARTNERLINKS.asetek, REF);
  let n = 0;
  for (const f of paginas()) {
    for (const a of bLinks(readFileSync(f, 'utf8'))) {
      n++;
      assert.match(a, new RegExp(`^<a href="${REF.replace(/[.?/]/g, '\\$&')}" rel="sponsored nofollow noopener" target="_blank" data-vendor="asetek" data-cta="outbound" data-pos="mid">(Asetek|Asetek Racing)${B_LABEL.replace(/[()]/g, '\\$&')}</a>$`), `${f}: ${a}`);
    }
  }
  assert.ok(n > 0);
  assert.equal(bTekstlink('asetek'), `<a href="${REF}" rel="sponsored nofollow noopener" target="_blank" data-vendor="asetek" data-cta="outbound" data-pos="mid">Asetek (partner link)</a>`);
  // l7.config gebruikt exact dezelfde regel als de site
  const r = CFG.stripCta.find((x) => Array.isArray(x));
  assert.equal(String(r[0]), String(B_RE)); assert.equal(r[1], '$1');
});

test('Asetek B: geen sponsored link in h1-h6, FAQ of schema; per H2 max. 1 op de eerste p/li-vermelding', () => {
  build();
  const fout = [];
  for (const f of paginas()) {
    const h = readFileSync(f, 'utf8');
    for (const m of h.matchAll(/<(h[1-6])\b[^>]*>((?:(?!<\/\1>)[\s\S])*)<\/\1>/g)) if (/<a\b[^>]*\srel="[^"]*\bsponsored\b/.test(m[2])) fout.push(`${f}: sponsored in <${m[1]}>`);
    for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) if (/asetek\.com\/simsports|aff=|data-pos|\(partner link\)/.test(m[1])) fout.push(`${f}: B in schema`);
    if (!bLinks(h).length) continue;
    for (const s of secties(h, /(?=<h2\b)/)) {
      if (/^<h2\b[^>]*>[^<]*(FAQ|Frequently asked)/i.test(s) && bLinks(s).length) fout.push(`${f}: B in FAQ`);
      for (const x of plekFouten(s)) fout.push(`${f} [${(s.match(/^<h2[^>]*>([\s\S]*?)<\/h2>/) || [, 'intro'])[1].replace(/<[^>]+>/g, '')}] ${x}`);
    }
  }
  assert.deepEqual(fout, []);
});

test('Asetek B: alleen bestaande woorden; build byte-gelijk aan de stand vóór B na het terugzetten van de B-links (ranking, datums, tabellen, bronnen)', (t) => {
  build();
  const b = basis(); if (!b) { t.skip(`${PRE_B} niet in deze clone`); return; }
  let metB = 0;
  for (const f of walk('dist')) {
    const o = join(b, 'dist', relative('dist', f));
    assert.ok(existsSync(o), `nieuw bestand ${f}`);
    const x = readFileSync(f), y = readFileSync(o);
    if (x.equals(y)) continue;
    assert.equal(zonderB(x.toString('utf8')), y.toString('utf8'), `${f}: wijkt af buiten de B-linkmarkup`);
    metB++;
  }
  for (const f of walk(join(b, 'dist'))) assert.ok(existsSync(join('dist', relative(join(b, 'dist'), f))), `weg: ${f}`);
  assert.ok(metB > 0);
});

test('Asetek B: negatieve tests (plek en L7-unwrap)', () => {
  const B = (t = 'Asetek') => bTekstlink('asetek', t);
  const ok = (s) => assert.deepEqual(plekFouten(s), [], s);
  const rood = (s, re) => assert.ok(plekFouten(s).some((x) => re.test(x)), `${s} → ${plekFouten(s)}`);
  ok(`<h2>X</h2><p>${B()} says it works. Asetek also sells pedals.</p>`);
  rood(`<h2>Kies ${B()}</h2><p>Asetek.</p>`, /in <h2>|lopende tekst/);
  rood(`<h2>X</h2><p>Asetek says so. ${B()} too.</p>`, /eerdere vermelding/);
  rood(`<h2>X</h2><p>Asetek's base. ${B()} too.</p>`, /eerdere vermelding/);
  rood(`<h2>X</h2><p>${B()} DD10 is new.</p>`, /productnaam/);
  rood(`<h2>X</h2><p>${B()} and ${B()}.</p>`, /2 B-links/);
  rood(`<h2>X</h2><table><tr><td>${B()}</td></tr></table>`, /lopende tekst/);
  rood(`<h2>X</h2><ul><li><a href="https://www.asetek.com/x" rel="noopener">Asetek: DD10</a></li></ul><p>${B()}.</p>`, /eerdere vermelding/);
  rood(`<h2>X</h2><p>${B('Fanatec')} says.</p>`, /geen vermelding/);
  // L7: B op een bestaand woord = geen bodywijziging; alles daarbuiten telt
  const pag = (body) => `<html><body><main><h1>T</h1>${body}</main></body></html>`;
  const fp = (body) => bodyFingerprint(pag(body), CFG);
  assert.equal(fp('<p>Asetek says so.</p>'), fp(`<p>${B()} says so.</p>`));
  assert.notEqual(fp('<p>Asetek says so.</p>'), fp(`<p>${B()} now says so.</p>`));
  assert.notEqual(fp('<p>Asetek says so.</p>'), fp(`<p>${B().replace(' (partner link)', '')} says so.</p>`), 'zonder label geen unwrap');
  assert.notEqual(fp('<p>Asetek says so.</p>'), fp(`<p>${B().replace(' (partner link)</a>', '</a> (partner link)')} says so.</p>`), 'label buiten de link telt');
  assert.notEqual(fp('<p>Asetek says so.</p>'), fp(`<p>${B().replace('data-pos="mid"', 'data-pos="top"')} says so.</p>`));
  assert.notEqual(fp('<p>Asetek says so.</p>'), fp(`<p>${B().replace('>Asetek (', '><strong>Asetek</strong> (')} says so.</p>`));
  assert.notEqual(fp('<p>Tekst.</p>'), fp(`<p>Tekst. ${B()}.</p>`), 'nieuwe zin met alleen B is rood');
  // echte pagina: één woord buiten de link anders = rood
  build();
  const h = readFileSync('dist/wheel-bases/compare/index.html', 'utf8');
  const eerste = bLinks(h)[0];
  assert.equal(bodyFingerprint(h, CFG), bodyFingerprint(zonderB(h), CFG));
  assert.notEqual(bodyFingerprint(h.replace(eerste, `Extra ${eerste}`), CFG), bodyFingerprint(h, CFG));
});
