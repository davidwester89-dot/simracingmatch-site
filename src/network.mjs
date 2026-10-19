// Netwerk-footer ("Ook van ons"). Alleen live match-sites (geen Goodfellas). networkFor() laat de eigen site weg.
export const NETWORK = [
  { naam: 'BoekhoudMatch', logo: 'Boekhoud<b>Match</b>.nl', url: 'https://boekhoudmatch.nl/', wat: 'Boekhoudprogramma kiezen' },
  { naam: 'VerduurzaamMatch', logo: 'Verduurzaam<b>Match</b>.nl', url: 'https://verduurzaammatch.nl/', wat: 'Je huis verduurzamen' },
  { naam: 'ShopMatch', logo: 'Shop<b>Match</b>.nl', url: 'https://shopmatch.nl/', wat: 'Webshopplatform kiezen' },
  { naam: 'WarmtepompenMatch', logo: 'Warmtepompen<b>Match</b>.nl', url: 'https://warmtepompenmatch.nl/', wat: 'Warmtepomp kiezen' },
  { naam: 'ThuisaccuMatch', logo: 'Thuisaccu<b>Match</b>.nl', url: 'https://thuisaccumatch.nl/', wat: 'Thuisaccu kiezen' },
  { naam: 'KassaMatch', logo: 'Kassa<b>Match</b>.nl', url: 'https://kassamatch.nl/', wat: 'Kassasysteem kiezen' },
  { naam: 'SimracingMatch', logo: 'Simracing<b>Match</b>.com', url: 'https://simracingmatch.com/', wat: 'Simrace-setup kiezen' },
];
export const networkFor = (self) => NETWORK.filter((s) => !s.url.includes(self));
