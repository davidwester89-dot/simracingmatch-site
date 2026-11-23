// Techronde 19-11 (SC): inlink naar /blog/sim-lab-p1x-pro-vs-ultimate/ vanaf /blog/load-cell-pedals/, push 25-11 (na Asetek B 5bd0fa0).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
execSync('node build.mjs', { stdio: 'ignore', env: { ...process.env, BASE: '', PREVIEW: '' } });
const h = readFileSync('dist/blog/load-cell-pedals/index.html', 'utf8');
const sm = readFileSync('dist/sitemap.xml', 'utf8');
test('techronde 19-11: één inlink naar de P1X-vergelijking in een bestaande zin', () => {
  assert.match(h, /Plan <a href="\/blog\/sim-lab-p1x-pro-vs-ultimate\/">a cockpit<\/a>, a wheel stand or at least a wall brace\./);
  assert.equal((h.match(/href="\/blog\/sim-lab-p1x-pro-vs-ultimate\/"/g) || []).length, 1);
});
// /blog/ volgt alleen de nieuwste publicatiedatum: vanaf wk48 (setup-cost, 26-11) 2026-11-26, nooit door deze update.
test('techronde 19-11: load-cell-pedals draagt 2026-11-25; /blog/ tilt niet mee (volgt nieuwste post)', () => {
  assert.match(h, /"datePublished":"2026-11-05","dateModified":"2026-11-25"/);
  assert.match(h, /Updated <time datetime="2026-11-25">25 November 2026<\/time>/);
  assert.ok(sm.includes('<loc>https://simracingmatch.com/blog/load-cell-pedals/</loc><lastmod>2026-11-25</lastmod>'));
  assert.ok(sm.includes('<loc>https://simracingmatch.com/blog/</loc><lastmod>2026-11-26</lastmod>'));
  assert.match(readFileSync('dist/blog/index.html', 'utf8'), /Updated <time datetime="2026-11-26">/);
});
