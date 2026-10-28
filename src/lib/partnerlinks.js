// Approved partner links. EMPTY until Partnermanager approves a programme for simracingmatch.com.
// The match must NEVER import this file.
export const PARTNERLINKS = {
  // Moza Racing, own programme via GoAffPro (ref=DAVIDWEST), approved 21-10-2026.
  moza: 'https://eu.mozaracing.com/?ref=DAVIDWEST',
  // Sim-Lab, own programme via GoAffPro (ref=SINRACINGMATCH, code as supplied), approved 28-10-2026.
  simlab: 'https://sim-lab.eu/?ref=SINRACINGMATCH',
};

/** Vendor key when href is an approved partner link (same host + same ref), else ''. */
export function partnerVendor(href) {
  let u; try { u = new URL(href); } catch { return ''; }
  for (const [vendor, p] of Object.entries(PARTNERLINKS)) {
    const q = new URL(p);
    if (u.hostname === q.hostname && u.searchParams.get('ref') === q.searchParams.get('ref')) return vendor;
  }
  return '';
}

export function uitgaand(href, { partner = false, label = 'Visit shop', vendor = 'external' } = {}) {
  if (partner) return { href, rel: 'sponsored nofollow noopener', partner: true, label, vendor };
  return { href, rel: 'noopener', partner: false, label, vendor };
}

/** Outbound button. Partner links get rel sponsored nofollow (no visible label) + data-vendor/data-pos for vendor_click. */
export function knop(href, pos, { partner = false, label = 'Visit shop', vendor = 'external', cls = 'btn' } = {}) {
  const o = uitgaand(href, { partner, label, vendor });
  return `<a class="${cls}" href="${o.href}" rel="${o.rel}" target="_blank" data-vendor="${o.vendor}" data-pos="${pos}" data-cta="outbound"${partner ? ` data-partner-slot="${o.vendor}"` : ''}>${o.label}</a>`;
}

// Partner note: no label per button; exactly one short sentence right after each block (or paragraph/list) that
// contains a partner link (rel sponsored). Automatic: no partner link in a block, no sentence.
export const PARTNER_NOOT = 'Some links are partner links; this never affects the ranking.';
export const NOOT_HTML = `<p class="pnoot">${PARTNER_NOOT}</p>`;
const SPONSORED = /<a\s[^>]*rel="[^"]*\bsponsored\b/;
/** Eén blok als string: de zin erachter als er een partnerlink in staat. */
export const metNoot = (html) => (SPONSORED.test(html) ? html + NOOT_HTML : html);
/** Blokken (op class) met knoppen of links naar aanbieders. Het buitenste blok telt; binnen een blok komt geen tweede zin. */
export const BLOKKEN = ['out', 'pc-cta'];
/** Begin en eind van elk blok in html (buitenste eerst), en of er een partnerlink in staat. kaal = ook <p>, <ul>, <ol> zonder class. */
export function partnerBlokken(html, { blokken = BLOKKEN, kaal = true } = {}) {
  const cls = `<(div|ol|ul|p|aside|section)\\s[^>]*class="(?:[^"]*\\s)?(?:${blokken.join('|')})(?:\\s[^"]*)?"[^>]*>`;
  const re = new RegExp(kaal ? `${cls}|<(p|ul|ol)>` : cls, 'g');
  const res = []; let m;
  while ((m = re.exec(html))) {
    const tag = m[1] || m[2];
    const t = new RegExp(`<${tag}\\b|</${tag}>`, 'g'); t.lastIndex = m.index;
    let d = 0, eind = -1, x;
    while ((x = t.exec(html))) { if (x[0][1] === '/') { if (--d === 0) { eind = x.index + x[0].length; break; } } else d++; }
    if (eind < 0) continue;
    res.push({ start: m.index, end: eind, partner: SPONSORED.test(html.slice(m.index, eind)) });
    re.lastIndex = eind;
  }
  return res;
}
/** Hele pagina: precies één zin direct na elk blok met een partnerlink. */
export function partnerNoten(html, opts) {
  let out = '', i = 0;
  for (const b of partnerBlokken(html, opts)) if (b.partner && !html.startsWith(NOOT_HTML, b.end)) { out += html.slice(i, b.end) + NOOT_HTML; i = b.end; }
  return out + html.slice(i);
}
