// Wheel base cluster (SMM-01 #1-#3): /wheel-bases/compare/, /wheel-bases/direct-drive-vs-belt/, /wheel-bases/how-much-torque/.
// Rules (SC/MM 20-10): Nm and price per model only from the manufacturer's own product page, with link + check date.
// No estimates: a value we cannot read on the page stays 'unknown'. 'Price per Nm' is a plain sum (price / Nm), never a verdict.
// Order: price per Nm, low to high. Never commission or partner status. Partner links only via src/lib/partnerlinks.js.
import { SITE, esc, ORG, AUTHOR, fmtDate, MATCH_CTA, MATCH_LIVE } from './layout.mjs';
import { PARTNERLINKS, knop } from './lib/partnerlinks.js';

/** Expected push/go-live date: every date field (visible, JSON-LD, sitemap). */
export const WB_DATE = '2026-10-30';
/** Day we read every price and spec on the manufacturer pages. */
export const WB_CHECKED = '2026-10-28';

const eur = (n) => '€' + n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const perNm = (b) => (b.price == null ? null : b.price / b.nm);

/**
 * Direct drive wheel bases sold on the makers' own EU stores, read on WB_CHECKED.
 * price = the store's regular price incl. VAT as shown; Sale prices are not listed: none of the stores showed an end date (L4).
 * torque = the maker's own wording, because 'peak', 'holding', 'sustained' and 'constant' are not the same thing.
 */
export const BASES = [
  { brand: 'Moza', model: 'R9 V3', nm: 9, torque: '9 Nm peak torque', platforms: ['PC'], price: 399, url: 'https://eu.mozaracing.com/products/r9-wheelbase' },
  { brand: 'Moza', model: 'R12 V2', nm: 12, torque: '12 Nm peak torque', platforms: ['PC'], price: 529, url: 'https://eu.mozaracing.com/products/r12-wheelbase' },
  { brand: 'Moza', model: 'R16 Ultra', nm: 16, torque: '16 Nm sustained', platforms: ['PC', 'Xbox'], note: 'Xbox only with the Moza ESX wheel', price: 549, url: 'https://eu.mozaracing.com/products/r16-ultra' },
  { brand: 'Moza', model: 'R21 Ultra', nm: 21, torque: '21 Nm sustained', platforms: ['PC'], price: 799, url: 'https://eu.mozaracing.com/products/r21-ultra' },
  { brand: 'Moza', model: 'R25 Ultra', nm: 25, torque: '25 Nm sustained', platforms: ['PC'], price: 999, url: 'https://eu.mozaracing.com/products/r25-ultra' },
  { brand: 'Fanatec', model: 'CSL DD (5 Nm)', nm: 5, torque: '5 Nm peak torque (8 Nm with the Boost Kit 180, sold separately)', platforms: ['PC', 'Xbox'], note: 'Xbox only with a Fanatec Xbox-licensed wheel', price: 329.95, url: 'https://www.fanatec.com/eu/en/p/wheel-bases/csl_dd_qr2l_90_eu/csl-dd-qr2l-5-nm-eu' },
  { brand: 'Fanatec', model: 'CSL DD (8 Nm)', nm: 8, torque: '8 Nm peak torque (Boost Kit 180 included)', platforms: ['PC', 'Xbox'], note: 'Xbox only with a Fanatec Xbox-licensed wheel', price: 429.95, url: 'https://www.fanatec.com/eu/en/p/wheel-bases/csl_dd_qr2l_180_eu/csl-dd-qr2l-8-nm-eu' },
  { brand: 'Fanatec', model: 'Gran Turismo DD Pro Wheel Base (8 Nm)', nm: 8, torque: '8 Nm peak torque (Boost Kit 180 included)', platforms: ['PC', 'PlayStation'], price: 499.95, url: 'https://www.fanatec.com/eu/en/p/wheel-bases/crd-9020006-eu/gran-turismo-dd-pro-wheel-base-qr2-eu' },
  { brand: 'Fanatec', model: 'ClubSport DD (15 Nm)', nm: 15, torque: '15 Nm holding torque', platforms: ['PC', 'Xbox'], note: 'Xbox only with a Fanatec Xbox-licensed wheel', price: 599.95, url: 'https://www.fanatec.com/eu/en/p/wheel-bases/cs_dd_eu/clubsport-dd-eu' },
  { brand: 'Fanatec', model: 'ClubSport DD+ (18 Nm)', nm: 18, torque: '18 Nm holding torque', platforms: ['PC', 'PlayStation'], price: 799.95, url: 'https://www.fanatec.com/eu/en/p/wheel-bases/cs_dd+_eu/clubsport-dd-plus-eu' },
  { brand: 'Fanatec', model: 'Podium DD (25 Nm)', nm: 25, torque: '25 Nm holding torque (33 Nm peak overshoot)', platforms: ['PC', 'Xbox'], note: 'Xbox only with a Fanatec Xbox-licensed wheel', price: 1099.95, url: 'https://www.fanatec.com/eu/en/p/wheel-bases/crd-9020022-eu/podium-dd-eu' },
  { brand: 'Simucube', model: 'Simucube 2 Sport', nm: 17, torque: '17 Nm max torque', platforms: ['PC'], price: 989.78, url: 'https://simucube.com/products/simucube-2-sport' },
  { brand: 'Simucube', model: 'Simucube 2 Pro', nm: 25, torque: '25 Nm max torque', platforms: ['PC'], price: 1298.33, url: 'https://simucube.com/products/simucube-2-pro' },
  { brand: 'Simucube', model: 'Simucube 3 Sport', nm: 15, torque: '15 Nm max torque', platforms: ['PC'], note: 'needs a Simucube Link Hub, sold separately', price: 1257.19, url: 'https://simucube.com/products/simucube-3-sport' },
  { brand: 'Simucube', model: 'Simucube 3 Pro', nm: 25, torque: '25 Nm max torque', platforms: ['PC'], note: 'needs a Simucube Link Hub, sold separately', price: 1499.19, url: 'https://simucube.com/products/simucube-3-pro' },
  { brand: 'Simucube', model: 'Simucube 3 Ultimate', nm: 35, torque: '35 Nm max torque', platforms: ['PC'], note: 'needs a Simucube Link Hub, sold separately', price: 3241.59, url: 'https://simucube.com/products/simucube-3-ultimate' },
  { brand: 'Asetek Racing', model: 'Initium Direct Drive Wheelbase', nm: 5.5, torque: '5.5 Nm max torque (8 Nm with the Initium Wheelbase Boost Kit, sold separately)', platforms: ['PC'], price: 354.87, exVat: 293.28, url: 'https://www.asetek.com/simsports/product/initium-direct-drive-wheelbase-eu/' },
  { brand: 'Asetek Racing', model: 'Initium DD10', nm: 10, torque: '10 Nm (14 Nm with the Asetek Racing Wheelbase Boost Kit, sold separately)', platforms: ['PC', 'Xbox'], note: 'Xbox only with an Asetek Racing Xbox-compatible wheel', price: 507.39, exVat: 419.33, url: 'https://www.asetek.com/simsports/product/asetek-racing-dd10-eu/' },
  { brand: 'Asetek Racing', model: 'La Prima Direct Drive Wheelbase', nm: 12, torque: '12 Nm peak/holding', platforms: ['PC'], price: 761.59, exVat: 629.41, url: 'https://www.asetek.com/simsports/product/la-prima-direct-drive-wheelbase-12nm/' },
  { brand: 'Asetek Racing', model: 'Forte Direct Drive Wheelbase', nm: 18, torque: '18 Nm peak/holding', platforms: ['PC'], price: 964.95, exVat: 797.48, url: 'https://www.asetek.com/simsports/product/forte-direct-drive-wheelbase-18nm/' },
  { brand: 'Asetek Racing', model: 'Invicta Direct Drive Wheelbase', nm: 27, torque: '27 Nm peak/holding', platforms: ['PC'], price: 1422.51, exVat: 1175.63, url: 'https://www.asetek.com/simsports/product/invicta-direct-drive-wheelbase-27nm/' },
  { brand: 'Logitech G', model: 'RS50 Base (PC)', nm: 8, torque: 'up to 8 Nm peak torque', platforms: ['PC', 'Xbox'], note: 'Xbox only with a Logitech G Xbox-compatible wheel, such as the RS Wheel Hub for Xbox', price: 299.99, url: 'https://www.logitechg.com/en-eu/shop/p/rs50-base' },
  { brand: 'Logitech G', model: 'RS50 Base (PS/PC)', nm: 8, torque: 'up to 8 Nm peak torque', platforms: ['PC', 'PlayStation', 'Xbox'], note: 'Xbox only with a Logitech G Xbox-compatible wheel, such as the RS Wheel Hub for Xbox', price: 399.99, url: 'https://www.logitechg.com/en-eu/shop/p/rs50-base' },
  { brand: 'Logitech G', model: 'PRO DD11 Wheel Base (PC)', nm: 11, torque: '11 Nm', platforms: ['PC', 'Xbox'], note: 'Xbox only with a Logitech G Xbox-compatible wheel, such as the RS Wheel Hub for Xbox', price: 649.99, url: 'https://www.logitechg.com/en-eu/shop/p/pro-dd11-base' },
  { brand: 'Logitech G', model: 'PRO DD11 Wheel Base (PS/PC)', nm: 11, torque: '11 Nm', platforms: ['PC', 'PlayStation', 'Xbox'], note: 'Xbox only with a Logitech G Xbox-compatible wheel, such as the RS Wheel Hub for Xbox', price: 699.99, url: 'https://www.logitechg.com/en-eu/shop/p/pro-dd11-base' },
  { brand: 'Thrustmaster', model: 'T818 Black Edition', nm: 10, torque: '10 N·m constant torque', platforms: ['PC'], price: 599.99, url: 'https://shop.thrustmaster.com/en_eu/t818-black-edition.html' },
  { brand: 'Thrustmaster', model: 'T598 Servo Base', nm: 5, torque: '5 Nm constant torque, overshoot of +100%', platforms: ['PC', 'PlayStation'], price: 399.99, url: 'https://shop.thrustmaster.com/en_eu/t598-eu-servo-base-playstation-pc.html' },
];

/** Price per Nm low → high; bases without a clear price last (alphabetical). Commission is not an input. */
export const sortedBases = () => [...BASES].sort((a, b) => {
  const x = perNm(a), y = perNm(b);
  if (x == null && y == null) return (a.brand + a.model).localeCompare(b.brand + b.model);
  if (x == null) return 1; if (y == null) return -1;
  return x - y;
});

/** Store links for the button block, alphabetical. Only Moza has an approved partner link (PARTNERLINKS.moza). */
const STORES = [
  ['asetek', 'Asetek Racing', 'https://www.asetek.com/simsports/product-category/wheelbases/'],
  ['fanatec', 'Fanatec', 'https://www.fanatec.com/eu/en/c/wheel-bases'],
  ['logitech-g', 'Logitech G', 'https://www.logitechg.com/en-eu/shop/c/racing-wheels-pedals'],
  ['moza', 'Moza Racing', PARTNERLINKS.moza],
  ['simucube', 'Simucube', 'https://simucube.com/'],
  ['thrustmaster', 'Thrustmaster', 'https://shop.thrustmaster.com/en_eu/products-steering-wheels/plateform.html'],
];

const page = ({ path, title, h1, crumb, description, keyword, body, scripts }) => ({
  path, title, h1, crumb, description, og: 'home', ogType: 'article', lastmod: WB_DATE,
  article: { date: WB_DATE, updated: WB_DATE },
  parents: [['/wheel-bases/compare/', 'Wheel bases']].filter(([h]) => h !== path),
  hreflangNl: '', scripts,
  schema: [{ '@context': 'https://schema.org', '@type': 'Article', headline: h1, description, datePublished: WB_DATE, dateModified: WB_DATE, author: AUTHOR, publisher: ORG, mainEntityOfPage: SITE.domain + path, inLanguage: 'en', keywords: keyword }],
  body: `<article class="article-body prose"><header class="article-head"><p class="meta"><span class="kicker">Wheel bases</span><time datetime="${WB_DATE}">${fmtDate(WB_DATE)}</time></p><h1>${esc(h1)}</h1>
<p class="src author">By ${SITE.owner} · Published ${fmtDate(WB_DATE)} · Prices and specs checked on the manufacturers’ pages on ${fmtDate(WB_CHECKED)}</p></header>
${body}
<p class="post-cta"><a href="/blog/" class="btn">More articles on the blog</a><a href="/#setup-match" data-cta="wb_match" data-quiz="start">${MATCH_LIVE ? MATCH_CTA : 'Preview the 5 questions'}</a></p></article>`,
});

const a = (href, text) => `<a href="${href}" rel="noopener">${text}</a>`;
const sources = (list) => `<h2 class="src-h">Sources</h2><ul>${list.map(([t, h]) => `<li>${a(h, esc(t))}</li>`).join('')}</ul>`;
const cluster = (self) => `<h2>More on wheel bases</h2><ul>${[
  ['/wheel-bases/compare/', 'Direct drive wheel base comparison: torque, platform and price per Nm'],
  ['/wheel-bases/direct-drive-vs-belt/', 'Direct drive vs belt and gear: how the drive types differ'],
  ['/wheel-bases/how-much-torque/', 'How much torque you need for sim racing, and what your mount must hold'],
].filter(([h]) => h !== self).map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join('')}</ul>`;

function compareTable() {
  const rows = sortedBases().map((b) => {
    const pn = perNm(b);
    const priceCell = b.price == null ? `unknown <span class="muted">(${esc(b.shown)})</span>`
      : `${eur(b.price)}${b.exVat ? `<br><span class="muted">our sum: ${eur(b.exVat)} excl. VAT + 21% Dutch VAT</span>` : ''}`;
    return `<tr data-platforms="${b.platforms.join(' ').toLowerCase()}"><td><strong>${esc(b.brand)}</strong> ${esc(b.model)}</td><td>${esc(b.torque)}</td><td>${b.platforms.join(', ')}${b.note ? ` <span class="muted">(${esc(b.note)})</span>` : ''}</td><td>${priceCell}</td><td>${pn == null ? 'unknown' : eur(Math.round(pn * 100) / 100)}</td><td>${a(b.url, 'product page')}</td></tr>`;
  }).join('\n');
  return `<div class="wb-filter" hidden><p class="muted">Show bases for:</p><div class="actions"><button type="button" class="btn ghost" data-wb="all" aria-pressed="true">All platforms</button><button type="button" class="btn ghost" data-wb="pc" aria-pressed="false">PC</button><button type="button" class="btn ghost" data-wb="playstation" aria-pressed="false">PlayStation</button><button type="button" class="btn ghost" data-wb="xbox" aria-pressed="false">Xbox</button></div></div>
<div class="table-wrap wb-wrap"><table class="wb-table"><caption class="muted">Ordered by price per Nm, lowest first. Our sum: regular price ÷ Nm as the maker states it. Prices checked ${fmtDate(WB_CHECKED)}.</caption>
<thead><tr><th scope="col">Wheel base</th><th scope="col">Torque (maker’s wording)</th><th scope="col">Platforms (maker)</th><th scope="col">Regular price, EU store</th><th scope="col">Price per Nm</th><th scope="col">Source</th></tr></thead>
<tbody>
${rows}
</tbody></table></div>`;
}

export const wbCompare = page({
  path: '/wheel-bases/compare/',
  title: 'Direct Drive Wheel Base Comparison | SimracingMatch',
  h1: 'Direct drive wheel base comparison',
  crumb: 'Wheel bases',
  keyword: 'direct drive wheel base comparison',
  description: 'Compare direct drive wheel bases from Moza, Fanatec, Simucube, Asetek, Logitech G and Thrustmaster: torque, platforms, EU price and price per Nm.',
  scripts: ['/js/wb-filter.js'],
  body: `<p class="lead">This table puts the direct drive wheel bases that six brands sell on their own EU stores side by side: torque, platforms, regular price and price per Nm. We read every figure on the maker’s product page on ${fmtDate(WB_CHECKED)}. The order is price per Nm, lowest first, and it never depends on commission.</p>
<p>New to direct drive? Read <a href="/wheel-bases/direct-drive-vs-belt/">how direct drive differs from belt and gear drive</a> first. Not sure how strong a base you need? See <a href="/wheel-bases/how-much-torque/">how much torque you need for sim racing</a>.</p>
<h2>The comparison table</h2>
${compareTable()}
<h2>How to read the table</h2>
<ul>
<li><strong>Price per Nm is our sum, not a score.</strong> It is the regular price divided by the torque figure in the second column. A low number means you pay less for each newton metre. It says nothing about feel, detail, software or build quality.</li>
<li><strong>Torque figures are not all measured the same way.</strong> Makers use different words: “peak”, “holding”, “sustained”, “constant” or “max”. Moza says the 21 Nm of its R21 Ultra “refers to sustained torque, not a short-term peak”. Fanatec rates its ClubSport bases by holding torque and lists the Podium DD at 25 Nm holding torque with 33 Nm peak overshoot. Thrustmaster gives the T818 as 10 N·m of constant torque. So two bases with the same number can still feel different.</li>
<li><strong>Regular price.</strong> We list the store’s regular price. Some stores showed a temporary sale price on ${fmtDate(WB_CHECKED)} without an end date; we leave those out, because they can end at any time. Price per Nm uses the regular price.</li>
<li><strong>VAT.</strong> Most stores show one EU price with VAT. Simucube and Asetek adjust the price to your country, so for both we use the price excl. VAT plus 21% Dutch VAT. The amount at checkout may differ per country.</li>
<li><strong>A base alone does not drive.</strong> Every price here is for the base only. You still need a steering wheel, pedals and a way to mount it. Simucube 3 bases also need a Simucube Link Hub, which is sold separately.</li>
</ul>
<h2>Platform: check this before price</h2>
<p>A cheap price per Nm is no use if the base does not work on your console. The makers are clear about it:</p>
<ul>
<li><strong>PlayStation:</strong> in this table only the Fanatec Gran Turismo DD Pro and ClubSport DD+, the PS/PC versions of the Logitech G RS50 Base and PRO DD11, and the Thrustmaster T598 Servo Base are listed for PlayStation. Fanatec states that the CSL DD “is not compatible with any PlayStation® console and cannot be upgraded to achieve compatibility”. Moza says PlayStation is “not officially supported” on the R16 Ultra.</li>
<li><strong>Xbox:</strong> several bases work on Xbox only with the right steering wheel. Fanatec says the CSL DD “becomes compatible with XBOX One® and XBOX Series X|S when used with any Fanatec XBOX-licensed Steering Wheel”. Moza says the R16 Ultra “can be used on Xbox when paired with the officially licensed MOZA ESX Steering Wheel”. Asetek says the DD10 is Xbox-ready “when paired with an Asetek Racing Xbox-compatible steering wheel”. Logitech G says Xbox compatibility “can be added by attaching a wheel that is compatible with Xbox, such as the RS Wheel Hub for Xbox”.</li>
<li><strong>PC only:</strong> Simucube’s FAQ says: “Our products are compatible with PC only.” The other bases marked only PC in the table are listed for PC only on their product pages.</li>
</ul>
<p>Racing on PS5? Our news article on <a href="/blog/ps5-direct-drive-wheels-2026/">Moza’s first PS5 direct drive wheels and the Thrustmaster T-GT III</a> covers what is announced but not yet in this table.</p>
<h2>What the table shows per budget</h2>
<p>A few patterns stand out from the figures, without saying which base is “best”:</p>
<ul>
<li><strong>Under €400 (regular price):</strong> the Fanatec CSL DD (5 Nm), the Asetek Racing Initium, the Logitech G RS50 Base (PC and PS/PC), the Moza R9 V3 and the Thrustmaster T598 Servo Base. Two of them are listed for PlayStation: the RS50 Base (PS/PC) and the T598 Servo Base.</li>
<li><strong>€400 to €800:</strong> the largest group in the table. Here you find 8 to 21 Nm, including the Moza R16 Ultra, which has the lowest price per Nm in the table at its regular price.</li>
<li><strong>Above €800:</strong> the Fanatec Podium DD, the Moza R25 Ultra, the Asetek Racing Forte and Invicta, and the Simucube bases. The Simucube 3 Ultimate has the highest torque figure in the table: 35 Nm max torque.</li>
</ul>
<p>Torque is not the only cost. Fanatec warns that for its Podium bases “it is particularly important to have a very strong sim cockpit”. Moza asks you to confirm “that the mounting solution can securely support a 16 N·m direct drive wheelbase” before buying the R16 Ultra. More on that in <a href="/wheel-bases/how-much-torque/">how much torque you need</a>.</p>
<h2>Not in this table</h2>
<ul>
<li><strong>Sim-Lab DDS TorqueSync™ Founders Edition:</strong> Sim-Lab’s EU store lists this direct drive base as a preorder, with new orders shipping “from the end of November” (DDS26, 26 Nm, €1,499; DDS39, 39 Nm, €1,999; with VAT; checked on ${fmtDate(WB_CHECKED)}). We add it to the table once it ships.</li>
<li><strong>Bundles</strong> with a wheel and pedals are left out, because their prices include other parts. Belt and gear wheels such as the Thrustmaster T300RS GT are covered in <a href="/wheel-bases/direct-drive-vs-belt/">direct drive vs belt</a>.</li>
<li><strong>Announced, not yet on sale:</strong> Moza’s PS5 bases and the Thrustmaster T-GT III. See the <a href="/blog/ps5-direct-drive-wheels-2026/">PS5 article</a> and the <a href="/blog/simracing-expo-2026-announcements/">SimRacing Expo 2026 round-up</a>.</li>
</ul>
<h2>Brand stores</h2>
<p>The brand stores below are listed in alphabetical order. That order says nothing about the table.</p>
<div class="out actions">${STORES.map(([v, n, h], i) => knop(h, `wb_compare_${i + 1}`, { partner: h === PARTNERLINKS.moza, label: n, vendor: v, cls: 'btn ghost' })).join('')}</div>
${cluster('/wheel-bases/compare/')}
${sources(sortedBases().map((b) => [`${b.brand}: ${b.model}`, b.url]).concat([
  ['Simucube FAQ (platforms)', 'https://simucube.com/pages/faq'],
  ['Asetek Racing: DD10 wheelbase (Xbox FAQ)', 'https://www.asetek.com/simsports/landing/dd10-wheelbase/'],
  ['Fanatec: wheel bases', 'https://www.fanatec.com/eu/en/c/wheel-bases'],
  ['Fanatec: NM for sim racing – what is best?', 'https://www.fanatec.com/eu/en/explorer/products/racing-wheels-wheel-bases/nm-for-sim-racing-what-is-best/'],
  ['Sim-Lab: DDS TorqueSync™ Founders Edition', 'https://sim-lab.eu/products/dds-torquesync'],
]).filter(([, h], i, arr) => arr.findIndex(([, x]) => x === h) === i))}`,
});

export const wbDdVsBelt = page({
  path: '/wheel-bases/direct-drive-vs-belt/',
  title: 'Direct Drive vs Belt Driven Wheel | SimracingMatch',
  h1: 'Direct drive vs belt driven wheel: what is the difference?',
  crumb: 'Direct drive vs belt',
  keyword: 'direct drive vs belt driven wheel',
  description: 'Direct drive, belt or gear: how each sim racing wheel drive works, what makers say about torque and feel, and when a belt wheel still makes sense.',
  body: `<p class="lead">Every force feedback wheel has a motor. What differs is how the motor’s force reaches your hands: through gears, through a belt, or straight from the motor shaft. That choice changes how strong the wheel can be, how much detail you feel and what you pay. Here is what the manufacturers themselves say.</p>
<h2>Three ways to drive a wheel</h2>
<h3>Gear drive</h3>
<p>In a gear-driven wheel, gears between the motor and the steering shaft pass the force on. Logitech lists its G29 and G920 as a “2.3 Nm Racing System” with “dual-motor force feedback”.</p>
<h3>Belt drive</h3>
<p>In a belt-driven wheel, a belt connects the motor to the steering shaft. Thrustmaster describes the T300RS GT this way: “Its dual-belt system reduces disruptive noises and allows for smoother movements”. Thrustmaster also sells a mix of both: the T248 has a “HYBRID DRIVE system with a mixed belt and gear mechanism”.</p>
<h3>Direct drive</h3>
<p>A direct drive base has no gears or belt at all. Fanatec puts it like this: “A DD wheel base allows a steering wheel to be mounted directly to the motor shaft. Unlike cheaper solutions, there is no belt or gear reduction drive between the motor and your hands, so the force feedback you feel is the cleanest representation of the game’s physics.”</p>
<h2>Torque: the biggest practical difference</h2>
<p>According to Fanatec, “The most popular entry-level belt drive and gear drive systems from other manufacturers typically operate around 2-3 Nm, so 5 Nm is already a step up from a ‘beginner’ device.”</p>
<p>On the direct drive side, the bases in our <a href="/wheel-bases/compare/">wheel base comparison</a> range from 5 Nm (Fanatec CSL DD, Thrustmaster T598 Servo Base) to 35 Nm (Simucube 3 Ultimate), as their makers state it. Note that Thrustmaster calls the T598 motor “Direct Axial Drive”, and gives it “5 Nm of constant torque” with “an overshoot capability of +100%”.</p>
<p>More torque is not automatically better. Fanatec’s own advice is that “There’s no specific minimum or maximum torque required for any racing game”. How much you actually need is the subject of <a href="/wheel-bases/how-much-torque/">how much torque you need for sim racing</a>.</p>
<h2>Feel and detail</h2>
<p>The makers of direct drive bases mainly point to what happens at low force. Fanatec says its “direct drive technology means that there is no mechanical resistance in the steering system, so very light effects can still be felt.” Thrustmaster says of its belt system that it “removes the possible presence of any dead zones and decreases uncomfortable jolting”.</p>
<p>We have not tested these wheels ourselves, and we do not score feel. What you can compare on paper is the torque figure, the platform and the price. The rest is personal: some people prefer a softer wheel for casual racing, others want every kerb in their hands.</p>
<h2>Price: what a step to direct drive costs</h2>
<p>Prices on the makers’ own EU stores, checked ${fmtDate(WB_CHECKED)}:</p>
<ul>
<li><strong>Thrustmaster T248 (Xbox/PC), hybrid belt and gear:</strong> €299.99. Thrustmaster lists a magnetic pedal set with it.</li>
<li><strong>Thrustmaster T300RS GT Edition, belt:</strong> regular price €399.99; Thrustmaster says it “Includes a T3PAGT 3-pedal pedal set”. On ${fmtDate(WB_CHECKED)} the store showed the product as out of stock.</li>
<li><strong>Cheapest direct drive bases (base only, regular price):</strong> Logitech G RS50 Base (PC) at €299.99, Fanatec CSL DD (5 Nm) at €329.95, Asetek Racing Initium at €354.87 and Moza R9 V3 at €399.</li>
</ul>
<p>Keep in mind that a belt or gear wheel usually comes with the wheel rim and often pedals in the box, while a direct drive base price is for the base alone. Add a steering wheel, pedals and a mount before you compare totals.</p>
<h2>When a belt or gear wheel still makes sense</h2>
<ul>
<li><strong>Small budget, complete set.</strong> If you want to start racing for around €300 including wheel and pedals, a belt, gear or hybrid set is the simple choice.</li>
<li><strong>Console first.</strong> Many direct drive bases are PC only, or need a specific wheel for Xbox. Thrustmaster says “The T300RS GT is an officially-licensed PlayStation and Gran Turismo product, and is compatible with PS5, PS4 and PC.” Check our <a href="/wheel-bases/compare/">comparison table</a> for which direct drive bases are listed for PlayStation or Xbox.</li>
<li><strong>Desk racing.</strong> A lower-torque wheel puts less force on a desk clamp. Mounting is covered in <a href="/wheel-bases/how-much-torque/">how much torque you need</a>.</li>
<li><strong>Existing ecosystem.</strong> If you already own wheels or pedals from one brand, check what works with your next base. Thrustmaster says all products in the T300RS series “feature a quick and easy wheel changing system”, and the T818 base is “compatible with all Thrustmaster wheel rims, pedal sets and add-ons”.</li>
</ul>
<h2>When direct drive is worth it</h2>
<ul>
<li>You race several times a week and want more force and detail than 2–3 Nm.</li>
<li>You race on PC, where every brand in our table works.</li>
<li>You have, or plan, a stand or cockpit that can hold the base.</li>
</ul>
<p>Not sure which mix fits your budget, platform and room? Our setup match will ask five questions about exactly that.</p>
${cluster('/wheel-bases/direct-drive-vs-belt/')}
${sources([
  ['Fanatec: wheel bases (what a DD wheel base is)', 'https://www.fanatec.com/eu/en/c/wheel-bases'],
  ['Fanatec: NM for sim racing – what is best?', 'https://www.fanatec.com/eu/en/explorer/products/racing-wheels-wheel-bases/nm-for-sim-racing-what-is-best/'],
  ['Fanatec: Choosing the right wheel base and pedals for different sim racing titles', 'https://www.fanatec.com/eu/en/explorer/products/racing-wheels-wheel-bases/right-wheel-base-and-pedals-for-different-sim-racing-titles/'],
  ['Logitech G: G920/G29 Driving Force', 'https://www.logitechg.com/en-eu/products/driving/driving-force-racing-wheel.html'],
  ['Thrustmaster: T300RS GT Edition', 'https://shop.thrustmaster.com/en_eu/t300-rs-gt-edition.html'],
  ['Thrustmaster: T248 (Xbox/PC)', 'https://shop.thrustmaster.com/en_eu/t248-x-eu.html'],
  ['Thrustmaster: T598 Servo Base', 'https://shop.thrustmaster.com/en_eu/t598-eu-servo-base-playstation-pc.html'],
  ['Thrustmaster: T818 Black Edition', 'https://shop.thrustmaster.com/en_eu/t818-black-edition.html'],
  ['Fanatec: CSL DD (5 Nm)', 'https://www.fanatec.com/eu/en/p/wheel-bases/csl_dd_qr2l_90_eu/csl-dd-qr2l-5-nm-eu'],
  ['Asetek Racing: Initium Direct Drive Wheelbase', 'https://www.asetek.com/simsports/product/initium-direct-drive-wheelbase-eu/'],
  ['Moza Racing: R9 V3', 'https://eu.mozaracing.com/products/r9-wheelbase'],
  ['Logitech G: RS50 Base', 'https://www.logitechg.com/en-eu/shop/p/rs50-base'],
  ['Simucube: Simucube 3 Ultimate', 'https://simucube.com/products/simucube-3-ultimate'],
])}`,
});

export const wbTorque = page({
  path: '/wheel-bases/how-much-torque/',
  title: 'How Much Torque for Sim Racing? | SimracingMatch',
  h1: 'How much torque do you need for sim racing?',
  crumb: 'How much torque',
  keyword: 'how much torque do you need for sim racing',
  description: 'How many Nm you need for sim racing, what makers advise for GT, formula and rally, and what a desk clamp, wheel stand or cockpit must hold at each level.',
  body: `<p class="lead">Wheel bases are sold by their torque in newton metres (Nm). The bases in our <a href="/wheel-bases/compare/">wheel base comparison</a> range from 5 to 35 Nm. So how much do you actually need? The manufacturers give surprisingly modest answers, and they all point to one thing that is easy to forget: your mount.</p>
<h2>What Nm means on a wheel base</h2>
<p>Nm is the turning force the motor can put on the steering shaft. More Nm means the base can push back harder in a fast corner or when a wheel hits a kerb. Fanatec explains that “A higher Nm value tends to provide a larger dynamic range of force feedback”.</p>
<p>Be careful when you compare numbers. Makers use “peak”, “holding”, “sustained”, “constant” and “max” torque, and these are not the same. Moza says the R21 Ultra’s rating “refers to sustained torque, not a short-term peak”. Fanatec lists the Podium DD at 25 Nm holding torque with 33 Nm peak overshoot. Thrustmaster gives the T598 Servo Base “5 Nm of constant torque” with “an overshoot capability of +100%”.</p>
<h2>What the makers advise</h2>
<p>Fanatec, which sells bases from 5 to 25 Nm, is the most explicit. In its own guides it says:</p>
<ul>
<li>“There’s no specific minimum or maximum torque required for any racing game; it’s all about how the force feedback feels and suits your racing style.”</li>
<li>“For most players, the sweet spot for force feedback lies between 10-15Nm, as this range provides a great balance between immersion and control. However, 8Nm can also be more than sufficient”.</li>
<li>“At 8 Nm, the feedback is notably stronger. […] For many sim racers, 8 Nm is all they need for a great experience.”</li>
</ul>
<p>Asetek Racing answers the same question for its 18 Nm Forte: “Few run a base anywhere near maximum, so 18 Nm already sits above the forces you drive with day to day.” And Moza writes about the R16 Ultra: “You do not have to use the full 16 N·m output.”</p>
<h2>Torque per discipline: GT, formula, rally and drift</h2>
<p>The car you drive matters more than the game. Fanatec notes that extra torque helps “especially when driving older cars without power steering or rally vehicles. However, modern race cars, like those in GT3 or Formula racing, often have power steering, meaning high torque levels are not necessary for realism.”</p>
<ul>
<li><strong>GT and formula:</strong> modern cars with power steering. Here Fanatec’s general advice applies: 8 Nm “can also be more than sufficient”, and 10–15 Nm is “the sweet spot” for most players.</li>
<li><strong>Rally, drift and classic cars:</strong> cars without power steering or with fast, heavy wheel movements are where extra headroom helps, according to Fanatec.</li>
<li><strong>Casual console racing:</strong> belt and gear wheels around 2–3 Nm, as Fanatec describes them, are enough to start. See <a href="/wheel-bases/direct-drive-vs-belt/">direct drive vs belt</a> for the difference.</li>
</ul>
<h2>Torque per budget</h2>
<p>From the regular prices in our <a href="/wheel-bases/compare/">comparison table</a> (base only, checked ${fmtDate(WB_CHECKED)}):</p>
<ul>
<li><strong>5–8 Nm:</strong> from €299.99 (Logitech G RS50 Base, PC) to €499.95 (Fanatec Gran Turismo DD Pro, 8 Nm). Fanatec calls 5 to 8 Nm “A Great Starting Point”.</li>
<li><strong>9–12 Nm:</strong> Moza R9 V3 (€399) and R12 V2 (€529), Asetek Racing Initium DD10 (€507.39), Thrustmaster T818 (€599.99), Logitech G PRO DD11 (from €649.99) and Asetek Racing La Prima (€761.59).</li>
<li><strong>15–18 Nm:</strong> Fanatec ClubSport DD (€599.95) and DD+ (€799.95), Moza R16 Ultra (€549), Simucube 2 Sport (€989.78), Asetek Racing Forte (€964.95) and Simucube 3 Sport (€1,257.19).</li>
<li><strong>21 Nm and up:</strong> Moza R21 Ultra (€799) and R25 Ultra (€999), Fanatec Podium DD (€1,099.95), Simucube 2 Pro (€1,298.33), Simucube 3 Pro (€1,499.19), Simucube 3 Ultimate (€3,241.59) and Asetek Racing Invicta (€1,422.51).</li>
</ul>
<h2>What your mount has to hold</h2>
<p>The stronger the base, the more force goes into whatever it is bolted to. If the desk or rig flexes, you lose detail and the setup can move. The makers say so plainly:</p>
<ul>
<li><strong>Desk clamp:</strong> the usual choice at lower torque. Fanatec’s CSL DD page lists the CSL DD Table Clamp and the ClubSport DD Table Clamp as compatible mounts. Asetek includes a table clamp with the Initium, according to its wheelbase comparison page. Asetek lists no included table clamp for the DD10 or the Forte.</li>
<li><strong>Wheel stand or cockpit:</strong> Moza asks buyers of the R16 Ultra to “confirm that the mounting solution can securely support a 16 N·m direct drive wheelbase”.</li>
<li><strong>Rigid cockpit for the strongest bases:</strong> for its 25 Nm Podium bases Fanatec says “it is particularly important to have a very strong sim cockpit, not just because of the torque, but also the physical weight (approx 10 KG).”</li>
</ul>
<p>Also check the steering wheel. Fanatec’s torque FAQ says its bases “are limited to a maximum torque of 8 Nm” with some Fanatec wheels, such as the CSL Steering Wheel P1 V2, even on a Podium DD.</p>
<h2>A simple way to decide</h2>
<ol>
<li><strong>Platform first.</strong> Check in the <a href="/wheel-bases/compare/">comparison table</a> which bases work on your PC, PlayStation or Xbox.</li>
<li><strong>Then your mount.</strong> Desk only? Stay in the lower torque range, or plan a stand.</li>
<li><strong>Then torque.</strong> For modern GT and formula cars, the makers’ own advice points to 8–15 Nm. More gives headroom, not automatically a better lap.</li>
<li><strong>Then the whole budget.</strong> Add wheel, pedals and mount to the base price.</li>
</ol>
<p>Our setup match will ask about budget, platform, space, experience and driving style, and put those steps together for you.</p>
${cluster('/wheel-bases/how-much-torque/')}
${sources([
  ['Fanatec: What does Nm represent when selecting a wheelbase for sim racing?', 'https://www.fanatec.com/eu/en/explorer/games/gaming-tips/what-does-nm-represent-when-selecting-a-wheelbase-for-sim-racing/'],
  ['Fanatec: Choosing the right wheel base and pedals for different sim racing titles', 'https://www.fanatec.com/eu/en/explorer/products/racing-wheels-wheel-bases/right-wheel-base-and-pedals-for-different-sim-racing-titles/'],
  ['Fanatec: NM for sim racing – what is best?', 'https://www.fanatec.com/eu/en/explorer/products/racing-wheels-wheel-bases/nm-for-sim-racing-what-is-best/'],
  ['Fanatec Support: Wheel Base Torque FAQ', 'https://help.fanatec.com/hc/en-us/articles/48812077676177-Wheel-Base-Torque-FAQ'],
  ['Fanatec: Podium DD (25 Nm)', 'https://www.fanatec.com/eu/en/p/wheel-bases/crd-9020022-eu/podium-dd-eu'],
  ['Fanatec: CSL DD (5 Nm)', 'https://www.fanatec.com/eu/en/p/wheel-bases/csl_dd_qr2l_90_eu/csl-dd-qr2l-5-nm-eu'],
  ['Asetek Racing: Forte Direct Drive Wheelbase', 'https://www.asetek.com/simsports/product/forte-direct-drive-wheelbase-18nm/'],
  ['Asetek Racing: compare wheelbases', 'https://www.asetek.com/simsports/compare/wheelbases/'],
  ['Moza Racing: R16 Ultra', 'https://eu.mozaracing.com/products/r16-ultra'],
  ['Moza Racing: R21 Ultra', 'https://eu.mozaracing.com/products/r21-ultra'],
  ['Thrustmaster: T598 Servo Base', 'https://shop.thrustmaster.com/en_eu/t598-eu-servo-base-playstation-pc.html'],
])}`,
});

export const wheelBasePages = () => [wbCompare, wbDdVsBelt, wbTorque];
