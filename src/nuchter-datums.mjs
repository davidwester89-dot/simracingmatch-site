// Stijlronde: uitsluitend gewijzigde pagina's (incl. clientdata) en hun L7-hubs.
// Geen nieuwe broncontrole: publicatie- en controledatums blijven staan.
const UPD = '2026-11-13';
const PADEN = new Set([
  "/blog/",
  "/blog/ps5-direct-drive-wheels-2026/",
  "/blog/simracing-expo-2026-announcements/",
  "/wheel-bases/how-much-torque/"
]);
const DATUM = '13 November 2026';
const updatedTime = /((?:[Ll]aatst\s+)?(?:[Bb]ijgewerkt|[Uu]pdated)(?:\s+(?:op|on))?\s*:?\s*)(<time\b[^>]*datetime=")[^"]+("[^>]*>)[^<]*(<\/time>)/g;
const updatedText = /((?:[Ll]aatst\s+)?(?:[Bb]ijgewerkt|[Uu]pdated)(?:\s+(?:op|on))?\s*:?\s*)(?:\d{4}-\d{2}-\d{2}|\d{1,2}\s+[A-Za-z]+\s+\d{4})/g;
export function nuchterDatum(p) {
  if (!PADEN.has(p.path)) return p;
  let body = p.body.replace(updatedTime, (_, label, open, close, end) => `${label}${open}${UPD}${close}${DATUM}${end}`).replace(updatedText, (_, label) => `${label}<time datetime="${UPD}">${DATUM}</time>`);
  const hasUpdated = /(?:bijgewerkt|updated)\s*(?:op\s*|on\s*)?(?::\s*)?(?:<time|\d)/i.test(body);
  if (!hasUpdated) body = body.replace(/<\/h1>/, `$&<p class="muted">Updated <time datetime="${UPD}">${DATUM}</time></p>`);
  return { ...p, body, lastmod: UPD, 
    ...(p.article ? { article: { ...p.article, updated: UPD } } : {}),
    ...(p.schema ? { schema: p.schema.map((x) => ('dateModified' in x ? { ...x, dateModified: UPD } : x)) } : {}) };
}
