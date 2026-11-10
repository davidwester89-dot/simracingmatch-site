// Stijlronde: uitsluitend gewijzigde pagina's (incl. clientdata); hubs zonder eigen body blijven staan.
// Geen nieuwe broncontrole: publicatie- en controledatums blijven staan.
const RELEASE_DATE = '2026-11-18';
const HUB_DATUMS = {"/blog/": "2026-11-11"};
const PADEN = new Set([
  "/blog/ps5-direct-drive-wheels-2026/",
  "/blog/simracing-expo-2026-announcements/",
  "/wheel-bases/how-much-torque/"
]);
const updatedTime = /((?:[Ll]aatst\s+)?(?:[Bb]ijgewerkt|[Uu]pdated)(?:\s+(?:op|on))?\s*:?\s*)(<time\b[^>]*datetime=")[^"]+("[^>]*>)[^<]*(<\/time>)/g;
const updatedText = /((?:[Ll]aatst\s+)?(?:[Bb]ijgewerkt|[Uu]pdated)(?:\s+(?:op|on))?\s*:?\s*)(?:\d{4}-\d{2}-\d{2}|\d{1,2}\s+[A-Za-z]+\s+\d{4})/g;
export function nuchterDatum(p) {
  const hub = HUB_DATUMS[p.path];
  if (!PADEN.has(p.path) && !hub) return p;
  // De stijlronde is geen eigen hub-update; een echte latere hub-revisie blijft mogelijk.
  const later = [p.updated, p.lastmod, p.stamp?.updated, ...(p.schema || []).map((x) => x.dateModified)].filter(Boolean).some((d) => d > RELEASE_DATE);
  if (hub && later) return p;
  // Een releasevloer, geen datumplafond: latere pagina-updates blijven behouden.
  const UPD = hub || [RELEASE_DATE, p.updated, p.lastmod, p.stamp?.updated, p.article?.updated, ...(p.schema || []).map((x) => x.dateModified)].filter((d) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)).sort().at(-1);
  const DATUM = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Amsterdam' }).format(new Date(UPD + 'T12:00:00Z'));
  let body = p.body.replace(hub ? new RegExp(updatedTime.source) : updatedTime, (_, label, open, close, end) => `${label}${open}${UPD}${close}${DATUM}${end}`).replace(hub ? new RegExp(updatedText.source) : updatedText, (_, label) => `${label}<time datetime="${UPD}">${DATUM}</time>`);
  const hasUpdated = /(?:bijgewerkt|updated)\s*(?:op\s*|on\s*)?(?::\s*)?(?:<time|\d)/i.test(body);
  if (!hasUpdated) body = body.replace(/<\/h1>/, `$&<p class="muted">Updated <time datetime="${UPD}">${DATUM}</time></p>`);
  return { ...p, body, updated: UPD, lastmod: UPD,
    ...(p.article ? { article: { ...p.article, updated: UPD } } : {}),
    ...(p.schema ? { schema: p.schema.map((x) => ('dateModified' in x ? { ...x, dateModified: UPD } : x)) } : {}) };
}
