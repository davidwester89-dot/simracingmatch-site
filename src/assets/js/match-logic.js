// Setup match rules (pure, shared by the browser and the tests). No partner links, no commission input:
// the order is fit to the torque range for your answers, then price per Nm (same order as /wheel-bases/compare/).
export const BUDGETS = { u300: 300, '300-700': 700, '700-1500': 1500, o1500: Infinity };
// Mount limits follow /wheel-bases/how-much-torque/: desk = lower torque range, stand up to 18 Nm, rigid cockpit for everything above.
export const SPACE_MAX_NM = { desk: 12, stand: 18, cockpit: Infinity };
/** Torque range to aim for (makers' advice on the torque guide): 5-8 Nm to start, 8-15 Nm sweet spot. */
export function targetBand(experience, style) {
  if (experience === 'beginner') return style === 'competitive' ? [8, 12] : [5, 8];
  return style === 'competitive' ? [10, 15] : [8, 15];
}
const dist = (nm, [lo, hi]) => (nm < lo ? lo - nm : nm > hi ? nm - hi : 0);
/** answers: { budget, platform: 'pc'|'playstation'|'xbox', space, experience, style }. Returns bases that fit, best fit first. */
export function matchBases(bases, a) {
  const max = BUDGETS[a.budget] ?? Infinity;
  const cap = SPACE_MAX_NM[a.space] ?? Infinity;
  const band = targetBand(a.experience, a.style);
  return bases
    .filter((b) => b.price != null && b.price <= max && b.nm <= cap && b.platforms.map((p) => p.toLowerCase()).includes(a.platform))
    .map((b) => ({ ...b, inBand: dist(b.nm, band) === 0, d: dist(b.nm, band), perNm: b.price / b.nm }))
    .sort((x, y) => x.d - y.d || x.perNm - y.perNm || (x.brand + x.model).localeCompare(y.brand + y.model));
}
