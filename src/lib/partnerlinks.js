// Goedgekeurde partnerlinks. LEEG tot Partnermanager een programma voor simracingmatch.nl goedkeurt.
// De match leest dit bestand NOOIT: partnerlinks hebben geen invloed op advies of volgorde.
export const PARTNERLINKS = {};

/** Uitgaande link: partnerlink (rel sponsored nofollow, met label) als die er is, anders de officiële URL. */
export function uitgaand(href, { partner = false, label = 'Naar de shop' } = {}) {
  if (partner) return { href, rel: 'sponsored nofollow noopener', partner: true, label };
  return { href, rel: 'noopener', partner: false, label };
}

/** Knop. Een partnerlink krijgt altijd direct erna het zichtbare label "partnerlink". */
export function knop(href, pos, { partner = false, label = 'Naar de shop', cls = 'btn' } = {}) {
  const o = uitgaand(href, { partner, label });
  return `<a class="${cls}" href="${o.href}" rel="${o.rel}" target="_blank" data-vendor="external" data-pos="${pos}" data-cta="outbound"${partner ? ' data-partner-slot="external"' : ''}>${o.label}</a>${o.partner ? '<span class="partner">partnerlink</span>' : ''}`;
}
