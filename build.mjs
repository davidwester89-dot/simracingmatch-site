import { mkdirSync, writeFileSync, cpSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { layout, SITE, BASE, PREVIEW } from './src/layout.mjs';
import * as P from './src/pages.mjs';
const OUT = 'dist';
rmSync(OUT, { recursive: true, force: true });
const write = (p, s) => { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, s); };
// Alleen home + juridische pagina's tot de content voor de 14 URL's klaar is. Geen thin placeholders.
export const pages = [P.home, P.privacy, P.disclaimer, P.contact, P.notfound];
for (const p of pages) write(p.path.endsWith('.html') ? join(OUT, p.path) : join(OUT, p.path, 'index.html'), layout(p));
cpSync('src/assets/js', join(OUT, 'js'), { recursive: true });
cpSync('src/lib', join(OUT, 'js/lib'), { recursive: true });
cpSync('src/assets/og', join(OUT, 'og'), { recursive: true });
cpSync('src/assets/icons', OUT, { recursive: true });
cpSync('src/assets/fonts', join(OUT, 'fonts'), { recursive: true });
cpSync('src/root', OUT, { recursive: true });
// CNAME pas bij livegang (GO_LIVE=1). Zonder CNAME blijft dit een preview op github.io.
if (process.env.GO_LIVE === '1') write(join(OUT, 'CNAME'), 'simracingmatch.com\n');
write(join(OUT, '.nojekyll'), '');
write(join(OUT, 'robots.txt'), PREVIEW ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\n\nSitemap: ${SITE.domain}/sitemap.xml\n`);
write(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.filter((p) => !p.noindex).map((p) => `<url><loc>${SITE.domain}${p.path}</loc><lastmod>${p.lastmod || SITE.updated}</lastmod></url>`).join('\n')}\n</urlset>\n`);
console.log(`Built ${pages.length} pages → ${OUT}/${PREVIEW ? ` (preview, BASE=${BASE || '/'})` : ''}`);
