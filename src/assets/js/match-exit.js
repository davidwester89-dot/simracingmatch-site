// Quiz commercial exit. Order stays in match-logic.js, which does not read `exit`.
const EU_EXIT = /^https:\/\/eu\.mozaracing\.com\/products\/([a-z0-9-]+)\?ref=eerlukwf$/;
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** Manufacturer-page button. Tracked EU Moza product exits keep sponsored, noopener and vendor_click hooks. */
export function quizShopLink(b) {
  const href = typeof b.exit === 'string' ? b.exit : '';
  const slug = (href.match(EU_EXIT) || [])[1];
  if (slug) {
    return `<a class="btn ghost" href="${esc(href)}" rel="sponsored nofollow noopener" target="_blank" data-vendor="moza" data-pos="quiz_exit_${slug}" data-cta="outbound" data-partner-slot="moza">Manufacturer page</a>`;
  }
  return `<a class="btn ghost" href="${esc(b.url)}" rel="noopener" target="_blank">Manufacturer page</a>`;
}

export function quizHasPartnerExit(list) {
  return list.some((b) => EU_EXIT.test(b && b.exit));
}
