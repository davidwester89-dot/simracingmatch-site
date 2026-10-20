import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, esc, ORG, AUTHOR, fmtDate, MATCH_CTA } from './layout.mjs';
import { renderMarkdown } from './markdown.mjs';
import { POST_IMAGES, figure, creditsList } from './post-images.mjs';

/** Reading time from the real word count (≈220 words per minute). */
export const readMin = (md) => Math.max(1, Math.round(md.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').split(/\s+/).filter(Boolean).length / 220));

const POSTS_DIR = join(dirname(fileURLToPath(import.meta.url)), 'posts');

/** Parse YAML-like front-matter between --- lines. Keys: title, description, slug, datePublished, keyword (optional dateModified). */
export function parseFrontMatter(raw) {
  if (!raw.startsWith('---')) throw new Error('Post must start with --- front-matter');
  const end = raw.indexOf('\n---', 3);
  if (end < 0) throw new Error('Front-matter not closed');
  const fm = raw.slice(3, end).trim();
  const body = raw.slice(end + 4).replace(/^\n/, '');
  const meta = {};
  for (const line of fm.split('\n')) {
    const m = line.match(/^([a-zA-Z][a-zA-Z0-9_]*)\s*:\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    meta[m[1]] = v;
  }
  for (const k of ['title', 'description', 'slug', 'datePublished']) {
    if (!meta[k]) throw new Error(`Missing front-matter key: ${k}`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(meta.slug)) throw new Error(`Invalid slug: ${meta.slug}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.datePublished)) throw new Error(`Invalid datePublished: ${meta.datePublished}`);
  return { meta, body };
}

export function loadPosts() {
  if (!existsSync(POSTS_DIR)) return [];
  const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md')).sort();
  const posts = files.map((f) => {
    const { meta, body } = parseFrontMatter(readFileSync(join(POSTS_DIR, f), 'utf8'));
    return { ...meta, dateModified: meta.dateModified || meta.datePublished, body, file: f };
  });
  posts.sort((a, b) => (a.datePublished < b.datePublished ? 1 : a.datePublished > b.datePublished ? -1 : 0));
  return posts;
}

export function blogIndexPage(posts) {
  const list = posts.length
    ? `<ul class="blog-list">${posts.map((p) => `<li><a class="card" href="/blog/${p.slug}/"><p class="meta"><time datetime="${p.datePublished}">${fmtDate(p.datePublished)}</time> · ${readMin(p.body)} min read</p><h2>${esc(p.title)}</h2><p class="muted">${esc(p.description)}</p><span class="more">Read article <span aria-hidden="true">→</span></span></a></li>`).join('')}</ul>`
    : `<p class="muted">No posts yet. Check back soon — or <a href="/#setup-match" data-cta="blog_empty_match" data-quiz="start">${MATCH_CTA}</a>.</p>`;
  return {
    path: '/blog/',
    title: 'Blog | SimracingMatch',
    h1: 'Blog',
    crumb: 'Blog',
    og: 'home',
    description: 'Guides and explainers from SimracingMatch Editorial: sim racing setups, wheel bases and pedals — manufacturer data only, no invented scores.',
    hreflangNl: '',
    // Keep index out of sitemap until there is at least one post (thin otherwise).
    noindex: posts.length === 0,
    body: `<article class="prose"><h1>Blog</h1><p class="lead">Practical guides for choosing sim racing gear. Specs and prices from manufacturers, with check dates.</p><p>Here you find buying guides per platform, such as which direct drive wheel bases work on PS5, and news on new wheel bases, wheels and pedals with their prices and launch dates. Every post links to the manufacturer pages it is based on. Not sure where to start? <a href="/#setup-match" data-cta="blog_intro_match" data-quiz="start">${MATCH_CTA}</a>.</p>${list}</article>`,
  };
}

export function blogPostPages(posts) {
  return posts.map((p) => {
    const path = `/blog/${p.slug}/`;
    const imgs = POST_IMAGES[p.slug];
    const used = new Set();
    const html = renderMarkdown(p.body, imgs ? { afterH2: (t) => { const im = imgs.sections[t]; if (!im) return ''; used.add(t); return figure(im); } } : {});
    if (imgs) for (const k of Object.keys(imgs.sections)) if (!used.has(k)) throw new Error(`${p.slug}: no H2 "${k}" for its photo`);
    const hero = imgs?.hero ? figure(imgs.hero, { hero: true }) : '';
    const credits = imgs ? creditsList(imgs) : '';
    return {
      path,
      title: p.title.length <= 60 ? p.title : p.title.slice(0, 57) + '…',
      // Prefer full title in H1 even if truncated in <title>
      h1: p.title.replace(/\s*\|\s*SimracingMatch\s*$/i, '') || p.title,
      crumb: p.title.replace(/\s*\|\s*SimracingMatch\s*$/i, ''),
      description: p.description,
      og: 'home',
      ogType: 'article',
      lastmod: p.dateModified,
      article: { date: p.datePublished, updated: p.dateModified },
      parents: [['/blog/', 'Blog']],
      hreflangNl: '',
      schema: [{
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: p.title,
        description: p.description,
        datePublished: p.datePublished,
        dateModified: p.dateModified,
        author: AUTHOR,
        publisher: ORG,
        mainEntityOfPage: SITE.domain + path,
        inLanguage: 'en',
        keywords: p.keyword || undefined,
        image: imgs?.hero ? SITE.domain + `/img/blog/${imgs.hero.file}.webp` : undefined,
      }],
      body: `<article class="article-body prose"><header class="article-head"><p class="meta"><span class="kicker">Blog</span><time datetime="${p.datePublished}">${fmtDate(p.datePublished)}</time> · ${readMin(p.body)} min read</p><h1>${esc(p.title.replace(/\s*\|\s*SimracingMatch\s*$/i, ''))}</h1>
<p class="src author">By ${SITE.owner}</p></header>
${hero}${html}
${credits}</article>`,
    };
  });
}
