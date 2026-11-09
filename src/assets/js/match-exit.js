// Neutral manufacturer exits. Order stays in match-logic.js, which does not read `exit`.
const EU_EXIT = /^https:\/\/eu\.mozaracing\.com\/products\/([a-z0-9-]+)$/;
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** Manufacturer-page button: ordinary noopener link, no partner status or click hooks. */
export function quizShopLink(b) {
  const href = typeof b.exit === 'string' && EU_EXIT.test(b.exit) ? b.exit : b.url;
  return `<a class="btn ghost" href="${esc(href)}" rel="noopener" target="_blank">Manufacturer page</a>`;
}
