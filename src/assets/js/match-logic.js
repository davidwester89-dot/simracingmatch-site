// Setup match rules (pure, shared by the browser and the tests). No partner links, no commission input:
// the order is fit to the torque range for your answers, then price per Nm (same order as /wheel-bases/compare/).
export const BUDGETS = { u300: 300, '300-700': 700, '700-1500': 1500, o1500: Infinity };
// Mount: no numeric filter (no maker gives one). Only notes quoted from /wheel-bases/how-much-torque/.
export const MOUNT_NOTES = {
  desk: 'Desk only? Stay in the lower torque range, or plan a stand (our torque guide).',
  stand: 'Moza asks buyers of the R16 Ultra to “confirm that the mounting solution can securely support a 16 N·m direct drive wheelbase”.',
  cockpit: 'For its 25 Nm Podium bases Fanatec says “it is particularly important to have a very strong sim cockpit”.',
};
/** Torque range to aim for (makers' advice on the torque guide): 5-8 Nm to start, 8-15 Nm sweet spot. */
export function targetBand(experience, style) {
  if (experience === 'beginner') return style === 'competitive' ? [8, 15] : [5, 8];
  return style === 'competitive' ? [10, 15] : [8, 15];
}
const dist = (nm, [lo, hi]) => (nm < lo ? lo - nm : nm > hi ? nm - hi : 0);
/** answers: { budget, platform: 'pc'|'playstation'|'xbox', space, experience, style }. space only adds a note (MOUNT_NOTES). Returns bases that fit, best fit first. */
export function matchBases(bases, a) {
  const max = BUDGETS[a.budget] ?? Infinity;
  const band = targetBand(a.experience, a.style);
  return bases
    .filter((b) => b.price != null && b.price <= max && b.platforms.map((p) => p.toLowerCase()).includes(a.platform))
    .map((b) => ({ ...b, inBand: dist(b.nm, band) === 0, d: dist(b.nm, band), perNm: b.price / b.nm }))
    .sort((x, y) => x.d - y.d || x.perNm - y.perNm || (x.brand + x.model).localeCompare(y.brand + y.model));
}
