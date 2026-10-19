import { mkdirSync, writeFileSync, cpSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { layout, SITE, BASE, PREVIEW } from './src/layout.mjs';
import { allPages } from './src/pages.mjs';

const OUT = 'dist';
const THEME = (process.env.THEME || 'A').toUpperCase(); // A = Night Race, B = Pit Wall Telemetry
if (THEME !== 'A' && THEME !== 'B') throw new Error(`THEME must be A or B, got ${THEME}`);

rmSync(OUT, { recursive: true, force: true });
const write = (p, s) => { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, s); };

const pages = allPages();
for (const p of pages) {
  let html = layout(p);
  // Theme class on <html> for CSS variants
  html = html.replace('<html lang="en">', `<html lang="en" data-theme="${THEME}">`);
  write(p.path.endsWith('.html') ? join(OUT, p.path) : join(OUT, p.path, 'index.html'), html);
}
cpSync('src/assets/js', join(OUT, 'js'), { recursive: true });
cpSync('src/lib', join(OUT, 'js/lib'), { recursive: true });
cpSync('src/assets/og', join(OUT, 'og'), { recursive: true });
cpSync('src/assets/icons', OUT, { recursive: true });
cpSync('src/assets/fonts', join(OUT, 'fonts'), { recursive: true });
cpSync('src/root', OUT, { recursive: true });
if (process.env.GO_LIVE === '1') write(join(OUT, 'CNAME'), 'simracingmatch.com\n');
write(join(OUT, '.nojekyll'), '');
write(join(OUT, 'robots.txt'), PREVIEW ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\n\nSitemap: ${SITE.domain}/sitemap.xml\n`);
const indexed = pages.filter((p) => !p.noindex);
write(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexed.map((p) => `<url><loc>${SITE.domain}${p.path}</loc><lastmod>${p.lastmod || SITE.updated}</lastmod></url>`).join('\n')}\n</urlset>\n`);
write(join(OUT, 'theme.txt'), THEME + '\n');
console.log(`Built ${pages.length} pages → ${OUT}/ theme=${THEME}${PREVIEW ? ` preview BASE=${BASE || '/'}` : ''}`);
