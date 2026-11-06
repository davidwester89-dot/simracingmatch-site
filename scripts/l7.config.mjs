// Siteconfig voor scripts/l7check.mjs (L7-datumcheck, naamgrep, repo-root-404). Wijzigingen in exempt/BEKEND_* alleen met SC-OK.
import { execSync, execFileSync } from 'node:child_process';
import { join } from 'node:path';
export const CFG = {
  build: (dir, env) => { execSync('node build.mjs', { cwd: dir, env, stdio: 'ignore' }); return join(dir, 'dist'); },
  hubs: [{ hub: '/gidsen/', children: /^\/[^/]+\/$/ }],
  // Alleen ONTBREKENDE velden die de template van deze pagina niet heeft. Een aanwezig veld moet altijd kloppen.
  exempt: {},
};
// Naamgrep blijft rood op persoonsnamen. De Moza-ref is sinds 6-11-2026 ref=simracingmatch (geen persoonsnaam),
// dus die hoort zonder uitzondering door. De vorige refcode stond hier als smalle uitzondering; die blijft niet staan.
export const ALLOW_NAME = [];
export const BEKEND_ORPHAN = []; // SC 30-10 besluit 2: geserveerd = publiek, geen allowlist; build-only modules uit de output (zie build.mjs)
// Hub-audit: bestaande bevindingen op origin/main (30-10). Haal een regel weg zodra de hub is gefixt; dan bewaakt de test hem.
export const BEKEND_HUB = [];
// L7: bekende template-wijzigingen zonder inhoudswijziging (SC 5-11, keuzehulp live). Verloopt op tot; daarna weer rood.
export const BEKEND_L7 = [
  { pad: '/blog/simracing-expo-2026-announcements/', tot: '2026-11-19', reden: 'gedeelde CTA-tekst keuzehulp, geen inhoudswijziging' },
  { pad: '/wheel-bases/compare/', tot: '2026-11-19', reden: 'gedeelde CTA-tekst keuzehulp, geen inhoudswijziging' },
  { pad: '/wheel-bases/direct-drive-vs-belt/', tot: '2026-11-19', reden: 'gedeelde CTA-tekst keuzehulp, geen inhoudswijziging' },
];
