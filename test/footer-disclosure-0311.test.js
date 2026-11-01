// External feedback Nov (SRM P2): partner disclosure in the footer of every page (Moza and Sim-Lab partner links are live).
// Same sentence as the note next to partner buttons (PARTNER_NOOT), in the footer's fine print, not as a .pnoot block.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { PARTNER_NOOT, NOOT_HTML } from '../src/lib/partnerlinks.js';

const files = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? files(p) : p.endsWith('.html') ? [p] : []; });
test('footer: partner disclosure on every page', () => {
  execSync('node build.mjs', { env: { ...process.env, BASE: '', PREVIEW: '' }, stdio: 'ignore' });
  const pages = files('dist');
  assert.ok(pages.length > 5);
  for (const f of pages) {
    const h = readFileSync(f, 'utf8');
    if (!h.includes('<footer')) continue;
    const footer = h.slice(h.indexOf('<footer'), h.indexOf('</footer>'));
    assert.ok(footer.includes(`<p class="fine">© 2026 SimracingMatch. ${PARTNER_NOOT}</p>`), f);
    assert.ok(!footer.includes(NOOT_HTML), `${f}: footer is no partner block`);
  }
});
