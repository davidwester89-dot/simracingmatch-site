import { esc, MATCH_LIVE } from './layout.mjs';
import { partnerVendor } from './lib/partnerlinks.js';

const MATCH_HASH = '/#setup-match';

/** Link HTML. External https → rel=noopener. Root-relative (/..., /#...) stay root-relative here;
 *  layout() runs withBase() over the whole page, so the BASE prefix (preview) is added exactly once.
 *  Links to the setup match carry data-quiz/data-cta so consent.js sends quiz_start. */
function link(text, href, cls) {
  if (href.startsWith('/')) {
    const quiz = href === MATCH_HASH ? ' data-cta="blog_match" data-quiz="start"' : '';
    return `<a href="${href}"${cls ? ` class="${cls}"` : ''}${quiz}>${text}</a>`;
  }
  const vendor = partnerVendor(href.replace(/&amp;/g, '&'));
  if (vendor) return `<a href="${href}" rel="sponsored nofollow noopener" data-vendor="${vendor}" data-cta="outbound">${text}</a> <span class="partner">Partner link</span>`;
  return `<a href="${href}" rel="noopener">${text}</a>`;
}

const LINK_RE = /\[([^\]]+)\]\(((?:https?:\/\/|\/)[^)\s]*)\)/g;

/** Minimal markdown → HTML for blog posts. Supports: # ## ###, paragraphs, **bold**, *italic*, [text](url) with https or root-relative URLs, lists, `code`. */
export function renderMarkdown(md, { afterH2, matchLive = MATCH_LIVE } = {}) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;
  const inline = (s) => esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(LINK_RE, (m, t, h) => link(t, h));

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (line.startsWith('### ')) { out.push(`<h3>${inline(line.slice(4))}</h3>`); i++; continue; }
    if (line.startsWith('## ') || line.startsWith('# ')) { // H1 comes from the template
      const t = line.replace(/^#{1,2} /, '');
      out.push(/^sources$/i.test(t.trim()) ? `<h2 class="src-h">${inline(t)}</h2>` : `<h2>${inline(t)}</h2>`);
      if (afterH2 && line.startsWith('## ')) { const extra = afterH2(t.trim()); if (extra) out.push(extra); }
      i++; continue;
    }
    if (/^[-*] /.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) { items.push(`<li>${inline(lines[i].slice(2))}</li>`); i++; }
      out.push(`<ul>${items.join('')}</ul>`);
      continue;
    }
    const para = [];
    while (i < lines.length && lines[i].trim() && !/^#{1,3} /.test(lines[i]) && !/^[-*] /.test(lines[i])) { para.push(lines[i]); i++; }
    const text = para.join(' ');
    // A paragraph made only of internal links that starts with the setup match → CTA box.
    const only = [...text.matchAll(LINK_RE)];
    if (only.length && only[0][2] === MATCH_HASH && text.replace(LINK_RE, '').replace(/[\s·|]/g, '') === '') {
      // Match nog niet live: blog-link als hoofdknop, match-link als 'Preview the 5 questions' (audit 20-10, F2).
      const items = matchLive || only.length < 2 ? only : [...only.slice(1), only[0]];
      out.push(`<p class="post-cta">${items.map(([, t, h], n) => link(esc(h === MATCH_HASH && !matchLive ? 'Preview the 5 questions' : t), h, n === 0 ? 'btn' : '')).join('')}</p>`);
      continue;
    }
    out.push(`<p>${inline(text)}</p>`);
  }
  return out.join('\n');
}
