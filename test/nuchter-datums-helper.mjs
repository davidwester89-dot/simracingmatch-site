// Onafhankelijke verwachting voor de stijlrelease van 13 november 2026.
export const STIJL_PADEN = new Set([
  "/blog/",
  "/blog/ps5-direct-drive-wheels-2026/",
  "/blog/simracing-expo-2026-announcements/",
  "/wheel-bases/how-much-torque/"
]);
export const revisieDatum = (pad, vorige) => STIJL_PADEN.has(pad) ? '2026-11-13' : vorige;
