import { readFileSync } from 'node:fs';
import { GA_ID as GA_CONFIG } from './analytics.config.mjs';
import { GA_ID_RE } from './lib/consent.js';
import { networkFor } from './network.mjs';

export const GA_ID = (process.env.GA_ID ?? GA_CONFIG).trim();
if (GA_ID && !GA_ID_RE.test(GA_ID)) throw new Error(`Invalid GA_ID "${GA_ID}"`);
export const BASE = (process.env.BASE || '').replace(/\/$/, '');
export const PREVIEW = BASE !== '' || process.env.PREVIEW === '1';
const G = GA_ID ? { script: ' https://www.googletagmanager.com', connect: ' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com', img: ' https://*.google-analytics.com https://www.googletagmanager.com' } : { script: '', connect: '', img: '' };

export const SITE = {
  name: 'SimracingMatch', domain: 'https://simracingmatch.com', email: 'info@simracingmatch.com',
  tagline: 'Find the sim racing setup that fits you', updated: '2026-10-19', theme: '#0b0c0f', owner: 'SimracingMatch Editorial',
};
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const BRAND = 'Simracing<b>Match</b>';
export const LOGO = '<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false"><rect width="40" height="40" rx="11" fill="#e10600"/><circle cx="20" cy="20" r="12" fill="none" stroke="#fff" stroke-width="2.8"/><circle cx="20" cy="20" r="4.2" fill="#fff"/><path d="M20 8v5M20 27v5M8 20h5M27 20h5" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><circle cx="32" cy="8" r="4" fill="#f5c518"/></svg>';

const ic = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
export const ICONS = {
  match: ic('<path d="M9 11l3 3 8-8"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/>'),
  calendar: ic('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>'),
  source: ic('<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>'),
  shield: ic('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>'),
  free: ic('<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 12 0v1"/><path d="M17 11l2 2 4-4"/>'),
};

/** Simple inline SVGs for hero / question cards — no brand logos. */
export const SVG = {
  wheel: `<svg viewBox="0 0 120 120" aria-hidden="true" focusable="false"><circle cx="60" cy="60" r="48" fill="none" stroke="#e10600" stroke-width="6"/><circle cx="60" cy="60" r="14" fill="#f2f3f5"/><path d="M60 12v20M60 88v20M12 60h20M88 60h20" stroke="#f2f3f5" stroke-width="5" stroke-linecap="round"/><path d="M28 28l14 14M78 78l14 14M92 28L78 42M42 78L28 92" stroke="#a3a8b5" stroke-width="4" stroke-linecap="round"/></svg>`,
  pedals: `<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><rect x="8" y="12" width="18" height="40" rx="3" fill="none" stroke="currentColor" stroke-width="3"/><rect x="32" y="20" width="18" height="32" rx="3" fill="none" stroke="currentColor" stroke-width="3"/><path d="M12 28h10M36 32h10" stroke="currentColor" stroke-width="2"/></svg>`,
  rig: `<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path d="M10 48h44M18 48V28l14-10 14 10v20" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><circle cx="32" cy="30" r="6" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M22 48l-4 10M42 48l4 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`,
  budget: `<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" stroke-width="3"/><path d="M32 18v28M24 24h12a6 6 0 0 1 0 12H24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`,
  platform: `<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><rect x="8" y="16" width="48" height="28" rx="3" fill="none" stroke="currentColor" stroke-width="3"/><path d="M24 52h16M32 44v8" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`,
  space: `<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path d="M8 48h48M12 48V28h40v20M20 28V20h24v8" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/></svg>`,
  experience: `<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path d="M32 10l6 14h14l-11 9 4 14-13-9-13 9 4-14-11-9h14z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/></svg>`,
  style: `<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path d="M8 40c12-20 36-20 48 0" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="20" cy="40" r="6" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="44" cy="40" r="6" fill="none" stroke="currentColor" stroke-width="3"/></svg>`,
};

const NAV = [
  ['/', 'Home'],
  ['/#setup-match', 'Find your setup', 'nav-cta'],
  ['/blog/', 'Blog'],
  ['/contact/', 'Contact'],
];
const navLinks = (navPath) => NAV.map(([h, t, c]) => {
  const current = h === '/' ? navPath === '/' : (h.startsWith('/#') ? false : navPath.startsWith(h));
  const cta = c === 'nav-cta' ? ` class="nav-cta" data-cta="nav_match" data-quiz="start"` : (c ? ` class="${c}"` : '');
  return `<a href="${h}"${cta}${current ? ' aria-current="page"' : ''}>${esc(t)}</a>`;
}).join('');

const CSS = readFileSync(new URL('./assets/css/style.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*\n\s*/g, '').replace(/\s*([{};:,>])\s*/g, '$1').replace(/;}/g, '}');

export function networkFooter() {
  return `<div class="net"><p class="fh">Also from us</p><ul>${networkFor('simracingmatch.com').map((s) => `<li><a href="${s.url}">${s.logo}</a> · ${esc(s.wat)}</li>`).join('')}</ul></div>`;
}

export function withBase(html) {
  if (!BASE) return html;
  return html.replace(/(href|src|action)="\/(?!\/)/g, `$1="${BASE}/`)
    .replace(/(href)="\/#/g, `$1="${BASE}/#`)
    .replace(/srcset="([^"]+)"/g, (m, v) => `srcset="${v.replace(/(^|, )\//g, `$1${BASE}/`)}"`)
    .replace(/url\(\/fonts\//g, `url(${BASE}/fonts/`);
}

/** hreflang: always en + x-default to this EN URL. Optional p.hreflangNl for a future /nl/ URL (empty = omit). */
export function hreflangTags(enUrl, hreflangNl) {
  let out = `<link rel="alternate" hreflang="en" href="${enUrl}">\n<link rel="alternate" hreflang="x-default" href="${enUrl}">`;
  if (hreflangNl) out += `\n<link rel="alternate" hreflang="nl" href="${hreflangNl}">`;
  return out;
}

export function layout(p) {
  const url = SITE.domain + (p.path === '/404.html' ? '/' : p.path);
  const trail = p.path === '/' || p.path === '/404.html' ? [] : [['/', 'Home'], ...(p.parents || []), [p.path, p.crumb || p.h1]];
  const crumbs = trail.length ? `<nav class="crumbs" aria-label="Breadcrumb">${trail.map(([h, t], i) => (i === trail.length - 1 ? `<span aria-current="page">${esc(t)}</span>` : `<a href="${h}">${esc(t)}</a>`)).join(' › ')}</nav>` : '';
  const ld = [
    ...(trail.length ? [{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: trail.map(([h, t], i) => ({ '@type': 'ListItem', position: i + 1, name: t, item: SITE.domain + h })) }] : []),
    siteGraph(),
    ...(p.schema || []),
  ];
  const og = `${SITE.domain}/og/${p.og || 'home'}.png`;
  const navPath = p.navPath || p.path;
  const robots = PREVIEW || p.noindex ? '<meta name="robots" content="noindex">' : '';
  const hl = p.noindex ? '' : hreflangTags(url, p.hreflangNl || '') + '\n';
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'${G.script}; style-src 'self' 'unsafe-inline'; img-src 'self' data:${G.img}; font-src 'self'; connect-src 'self'${G.connect}; base-uri 'self'; form-action 'self'; object-src 'none'">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.description)}">
${robots}${p.noindex ? '' : `<link rel="canonical" href="${url}">`}
${hl}<meta property="og:site_name" content="${SITE.name}"><meta property="og:locale" content="en_US"><meta property="og:type" content="${p.ogType || 'website'}">
<meta property="og:title" content="${esc(p.ogTitle || p.title)}"><meta property="og:description" content="${esc(p.description)}"><meta property="og:url" content="${url}">
<meta property="og:image" content="${og}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${esc(p.h1 || p.title)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(p.ogTitle || p.title)}"><meta name="twitter:description" content="${esc(p.description)}"><meta name="twitter:image" content="${og}">
${p.article ? `<meta property="article:published_time" content="${p.article.date}"><meta property="article:modified_time" content="${p.article.updated || p.article.date}">` : ''}
<meta name="theme-color" content="${SITE.theme}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="icon" href="/favicon-32.png" sizes="32x32"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/fonts/inter-400.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/fonts/inter-800.woff2" as="font" type="font/woff2" crossorigin>
<style>${CSS}</style>
${ld.map((x) => `<script type="application/ld+json">${JSON.stringify(x).replace(/</g, '\\u003c')}</script>`).join('\n')}
</head>
<body${GA_ID ? ` data-ga="${GA_ID}"` : ''}${BASE ? ` data-base="${BASE}"` : ''}>
<a class="skip" href="#content">Skip to content</a>
${PREVIEW ? '<p class="preview">Preview of SimracingMatch.com — not live yet</p>' : ''}
<header class="site"><div class="wrap">
<a class="logo" href="/" aria-label="${SITE.name}, home">${LOGO}<span>${BRAND}</span></a>
<nav class="main" aria-label="Main">${navLinks(navPath)}</nav>
<details class="menu"><summary><span class="burger" aria-hidden="true"></span><span class="menu-txt">Menu</span></summary><nav aria-label="Main">${navLinks(navPath)}</nav></details>
</div></header>
<div class="kerb" aria-hidden="true"></div>
<main id="content"><div class="wrap">
${crumbs}
${p.body}
${reportError(url)}
</div></main>
<footer class="site"><div class="wrap">
<div class="cols">
<div><a class="logo" href="/">${LOGO}<span>${BRAND}</span></a><p class="muted">Honest help choosing a sim racing setup. Manufacturer data only.</p></div>
<div><p class="fh">Explore</p><ul><li><a href="/#setup-match" data-cta="footer_match" data-quiz="start">Find your setup</a></li><li><a href="/blog/">Blog</a></li><li><a href="/contact/">Contact</a></li></ul></div>
<div><p class="fh">Legal</p><ul><li><a href="/privacy/">Privacy &amp; cookies</a></li>${GA_ID ? '<li><a href="/privacy/#cookies" data-consent-open>Cookie settings</a></li>' : ''}<li><a href="/disclaimer/">Disclaimer</a></li></ul></div>
</div>
${networkFooter()}
<p class="fine">© 2026 ${SITE.name}. Partner links never affect rankings or the match.</p>
</div></footer>
${[...(GA_ID ? ['/js/consent.js'] : []), ...(p.scripts || [])].map((s) => `<script type="module" src="${s}"></script>`).join('\n')}
</body>
</html>`;
  return withBase(html);
}

export const ORG = { '@type': 'Organization', '@id': SITE.domain + '/#org', name: SITE.name, url: SITE.domain + '/', email: SITE.email, logo: { '@type': 'ImageObject', url: SITE.domain + '/apple-touch-icon.png' } };
export const AUTHOR = { '@type': 'Organization', name: SITE.owner, url: SITE.domain + '/', parentOrganization: { '@id': SITE.domain + '/#org' } };
export function siteGraph() {
  return { '@context': 'https://schema.org', '@graph': [ORG, { '@type': 'WebSite', '@id': SITE.domain + '/#website', name: SITE.name, url: SITE.domain + '/', inLanguage: 'en', publisher: { '@id': SITE.domain + '/#org' } }] };
}
const MND = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const fmtDate = (iso) => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${MND[m - 1]} ${y}`; };
export function reportError(url) {
  const q = `subject=${encodeURIComponent(`Error on ${url.replace(/^https?:\/\//, '')}`)}&body=${encodeURIComponent(`Page: ${url}\n\nWhat is wrong?\n`)}`;
  return `<p class="report">Spotted an error? <a href="mailto:${SITE.email}?${q}" data-cta="report_error">Let us know</a>.</p>`;
}
