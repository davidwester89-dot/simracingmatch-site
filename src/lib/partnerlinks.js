// Approved partner links. EMPTY until Partnermanager approves a programme for simracingmatch.com.
// The match must NEVER import this file.
export const PARTNERLINKS = {
  // Moza is not a partner: its manufacturer links stay neutral (11 Nov 2026).
  // Keep the existing GoAffPro → Impact disclosure order on /privacy/; no content or date change there.
  // Sim-Lab, own programme via GoAffPro (ref=SINRACINGMATCH, code as supplied), approved 28-10-2026.
  simlab: 'https://sim-lab.eu/?ref=SINRACINGMATCH',
  // PXN SIM Racing, Impact (sjv.io deep link, no ?ref=), approved 6-11-2026.
  pxn: 'https://pxnsimracing.sjv.io/7X6qgd',
};

// B: in-text partner links on an existing brand word (GB2 18-11-2026, MM-OK via Partnermanager; rules as SEO decision E-CTA-1 B).
// Kept apart from PARTNERLINKS: no new store button, no change to the privacy network list. The visible label inside the
// anchor is the disclosure, so a block with only B links gets no extra partner note (no new text, no date lift).
// Asetek SimSports, GoAffPro, reflink as supplied (Partnermanager, overzicht.md 18-11).
export const B_PARTNERLINKS = Object.freeze({ asetek: 'https://www.asetek.com/simsports/?aff=SIMRACINGMATCH' });
export const B_NAAM = Object.freeze({ asetek: 'Asetek' });
export const B_LABEL = ' (partner link)';
/** Exactly the B links: rel sponsored + data-pos="mid" + visible label, no nested tags. Same rule as scripts/l7.config.mjs stripCta. */
export const B_RE = /<a\b(?=[^>]*\srel="sponsored nofollow noopener")(?=[^>]*\sdata-pos="mid")[^>]*>([^<]*?) \(partner link\)<\/a>/g;
/** html with every B link reduced to its existing word (markup and label removed). */
export const zonderB = (html) => html.replace(new RegExp(B_RE.source, B_RE.flags), '$1');
/** In-text partner link on an existing word. tekst = the word that is already there (default: brand name). */
export function bTekstlink(vendor, tekst) {
  const href = B_PARTNERLINKS[vendor];
  if (!href) throw new Error(`bTekstlink: no B partner link for ${vendor}`);
  const t = tekst || B_NAAM[vendor];
  return `<a href="${href}" rel="sponsored nofollow noopener" target="_blank" data-vendor="${vendor}" data-cta="outbound" data-pos="mid">${t}${B_LABEL}</a>`;
}

// Neutral manufacturer exits for the five Moza wheel bases. Same EU pages as the sources.
// No referral parameters, sponsored rel or partner tracking (11 Nov 2026).
export const MOZA_EU_PRODUCT_EXITS = Object.freeze({
  'R9 V3': 'https://eu.mozaracing.com/products/r9-wheelbase',
  'R12 V2': 'https://eu.mozaracing.com/products/r12-wheelbase',
  'R16 Ultra': 'https://eu.mozaracing.com/products/r16-ultra',
  'R21 Ultra': 'https://eu.mozaracing.com/products/r21-ultra',
  'R25 Ultra': 'https://eu.mozaracing.com/products/r25-ultra',
});

const MOZA_EU_EXIT_RE = /^https:\/\/eu\.mozaracing\.com\/products\/([a-z0-9-]+)$/;

/** Exact EU product exit for a comparison model, or '' when this model has none. */
export function mozaEuProductExit(model, sourceUrl) {
  const href = MOZA_EU_PRODUCT_EXITS[model] || '';
  if (!href) return '';
  if (!MOZA_EU_EXIT_RE.test(href)) throw new Error(`Bad Moza EU product exit for ${model}`);
  if (sourceUrl != null && href !== sourceUrl) {
    throw new Error(`Moza EU product exit is not the same EU page as the source for ${model}`);
  }
  return href;
}

export function mozaExitSlug(href) {
  const m = String(href).match(MOZA_EU_EXIT_RE);
  return m ? m[1] : '';
}

/** Vendor key when href is an approved partner link. Exact URL first (Impact sjv.io without ?ref=); else same host + same ref (GoAffPro). */
export function partnerVendor(href) {
  let u; try { u = new URL(href); } catch { return ''; }
  for (const [vendor, p] of Object.entries(PARTNERLINKS)) {
    if (href === p) return vendor;
    const q = new URL(p);
    const ref = q.searchParams.get('ref');
    if (ref != null && u.hostname === q.hostname && u.searchParams.get('ref') === ref) return vendor;
  }
  return '';
}

export function uitgaand(href, { partner = false, label = 'Visit shop', vendor = 'external' } = {}) {
  if (partner) return { href, rel: 'sponsored nofollow noopener', partner: true, label, vendor };
  return { href, rel: 'noopener', partner: false, label, vendor };
}

/** Outbound button. Partner links get sponsored rel; track=false leaves a neutral link without click hooks. */
export function knop(href, pos, { partner = false, label = 'Visit shop', vendor = 'external', cls = 'btn', track = true } = {}) {
  const o = uitgaand(href, { partner, label, vendor });
  return `<a class="${cls}" href="${o.href}" rel="${o.rel}" target="_blank"${track ? ` data-vendor="${o.vendor}" data-pos="${pos}" data-cta="outbound"` : ''}${partner ? ` data-partner-slot="${o.vendor}"` : ''}>${o.label}</a>`;
}

/** Neutral comparison-table manufacturer exit; no partner status or click hooks. */
export function productExitAnchor(href) {
  return `<a href="${href}" rel="noopener" target="_blank">product page</a>`;
}

// Partner note: no label per button; exactly one short sentence right after each block (or paragraph/list) that
// contains a partner link (rel sponsored). Automatic: no partner link in a block, no sentence.
export const PARTNER_NOOT = 'Some links are partner links; this never affects the ranking.';
export const NOOT_HTML = `<p class="pnoot">${PARTNER_NOOT}</p>`;
// Footer (fine print, every page): the fuller disclosure, says what a partner link is (SC review e4176d2). The notes next to the buttons stay PARTNER_NOOT.
export const FOOTER_NOOT = 'Some links are partner links, which may earn us a commission; this never affects the ranking.';
const SPONSORED = /<a\s[^>]*rel="[^"]*\bsponsored\b/;
/** Eén blok als string: de zin erachter als er een partnerlink in staat. */
export const metNoot = (html) => (SPONSORED.test(zonderB(html)) ? html + NOOT_HTML : html);
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
    res.push({ start: m.index, end: eind, partner: SPONSORED.test(zonderB(html.slice(m.index, eind))) }); // B links carry their own label
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
