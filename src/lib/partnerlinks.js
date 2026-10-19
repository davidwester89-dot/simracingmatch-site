// Approved partner links. EMPTY until Partnermanager approves a programme for simracingmatch.com.
// The match must NEVER import this file.
export const PARTNERLINKS = {};

export function uitgaand(href, { partner = false, label = 'Visit shop', vendor = 'external' } = {}) {
  if (partner) return { href, rel: 'sponsored nofollow noopener', partner: true, label, vendor };
  return { href, rel: 'noopener', partner: false, label, vendor };
}

/** Outbound button. Partner links always get the visible "Partner link" label + data-vendor/data-pos for vendor_click. */
export function knop(href, pos, { partner = false, label = 'Visit shop', vendor = 'external', cls = 'btn' } = {}) {
  const o = uitgaand(href, { partner, label, vendor });
  return `<a class="${cls}" href="${o.href}" rel="${o.rel}" target="_blank" data-vendor="${o.vendor}" data-pos="${pos}" data-cta="outbound"${partner ? ` data-partner-slot="${o.vendor}"` : ''}>${o.label}</a>${o.partner ? '<span class="partner">Partner link</span>' : ''}`;
}
