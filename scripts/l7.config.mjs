// Siteconfig voor scripts/l7check.mjs (L7-datumcheck, naamgrep, repo-root-404). Wijzigingen in exempt/BEKEND_* alleen met SC-OK.
import { execSync, execFileSync } from 'node:child_process';
import { join } from 'node:path';
export const CFG = {
  build: (dir, env) => { execSync('node build.mjs', { cwd: dir, env, stdio: 'ignore' }); return join(dir, 'dist'); },
  hubs: [{ hub: '/gidsen/', children: /^\/[^/]+\/$/ }],
  // Alleen ONTBREKENDE velden die de template van deze pagina niet heeft. Een aanwezig veld moet altijd kloppen.
  exempt: {},
};
// Moza-partnerlink: de refcode die Moza heeft uitgegeven bevat de naam (sitecheck.py meldt dit als INFO 'naam-in-refcode').
// Alleen precies '=DAVIDWEST' als URL-parameterwaarde; elke andere vermelding blijft rood. Wijzigen kan alleen via Moza.
// Moza-refcode ref=DAVIDWEST (Dave-besluit 21-10, SC-log). Exact: alleen in een Moza-href, alleen in blogposts en de vergelijkpagina.
export const ALLOW_NAME = [{ file: /^(blog\/[\w-]+|wheel-bases\/compare)\/index\.html$/, match: /^=DAVIDWEST"$/, ctx: /href="https:\/\/eu\.mozaracing\.com\/[^"\s]*\?ref=DAVIDWEST"/, reden: 'Moza-refcode ref=DAVIDWEST (Dave-besluit)' }];
export const BEKEND_ORPHAN = []; // SC 30-10 besluit 2: geserveerd = publiek, geen allowlist; build-only modules uit de output (zie build.mjs)
// Hub-audit: bestaande bevindingen op origin/main (30-10). Haal een regel weg zodra de hub is gefixt; dan bewaakt de test hem.
export const BEKEND_HUB = [
  { pad: '/blog/', reden: 'blog index: no visible Updated line, lastmod 2026-10-19, posts 2026-10-30 (30-10, inhoudsfix niet in deze commit; SC/MM beslist)' },
];
