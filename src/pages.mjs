import { SITE, esc, ORG, GA_ID, ICONS, SVG, fmtDate, MATCH_LIVE, MATCH_CTA } from './layout.mjs';
import { PRIVACY_UPDATED, cookieTable, partnerNetwork, legalBasis, transfers, retention, rights } from './privacy-gdpr.mjs';
import { CONSENT_KEY } from './lib/consent.js';
import { PARTNERLINKS, PARTNER_NOOT, mozaEuProductExit } from './lib/partnerlinks.js';
import { loadPosts, blogIndexPage, blogPostPages } from './blog.mjs';
import { wheelBasePages, MVF_DATE, BASES, WB_LOGOS, WB_CHECKED, MATCH_DATE, HOME_DATE } from './wheelbases.mjs';
export { MATCH_DATE };
/** Quiz data. `url` stays the editorial manufacturer page. `exit` is the commercial href only; match-logic.js never reads it. */
export const matchJson = () => JSON.stringify({
  checked: fmtDate(WB_CHECKED),
  logos: WB_LOGOS,
  partnerNote: PARTNER_NOOT,
  bases: BASES.map(({ brand, model, nm, torque, platforms, note, price, url }) => {
    const row = { brand, model, nm, torque, platforms, note, price, url };
    const exit = mozaEuProductExit(model, url);
    if (exit) row.exit = exit;
    return row;
  }),
}).replace(/</g, '\\u003c');
const opt = (name, v, t) => `<label class="mopt"><input type="radio" name="${name}" value="${v}" required> <span>${t}</span></label>`;
const q = (n, name, title, opts) => `<fieldset class="qcard"><legend><strong>${n}. ${title}</strong></legend>${opts.map(([v, t]) => opt(name, v, t)).join('')}</fieldset>`;

const faqSchema = (faq) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, '') } })) });
const faqHtml = (faq) => `<h2>FAQ</h2>${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${a}</p></details>`).join('')}`;

const homeFaq = [
  ['What is SimracingMatch?', 'An English-language site that helps you choose a sim racing setup. The setup match asks five questions about budget, platform, space, experience and driving style, and shows the wheel bases that fit your answers.'],
  ['Where do the specs and prices come from?', 'Only from the manufacturer or the official shop, with the date we checked them. No invented specs, prices or stars.'],
  ['Do you earn from recommendations?', 'Sometimes, via a partner link. Those links are disclosed where they appear and never affect the match or the order.'],
  ['How does the match pick wheel bases?', 'With fixed rules: your platform and budget filter the bases in our comparison table, your mount adds the makers’ mount warnings, and your experience and driving style set the torque range to aim for. Within that, the order is price per Nm. Partner links are never an input. Email <a href="mailto:info@simracingmatch.com">info@simracingmatch.com</a> with questions.'],
];

export const home = {
  path: '/',
  title: 'Find your sim racing setup | SimracingMatch',
  ogTitle: 'SimracingMatch: find the setup that fits you',
  h1: 'Find the sim racing setup that fits you',
  og: 'home',
  lastmod: HOME_DATE,
  scripts: ['/js/match.js'],
  description: 'Match a sim racing wheel, pedals and rig to your budget, platform and space. Manufacturer data only. Partner links disclosed — they never change the order.',
  schema: [faqSchema(homeFaq)],
  // hreflangNl left empty until /nl/ exists
  hreflangNl: '',
  body: `<section class="hero">
<div>
<p class="hero-brand">Simracing<span class="wm-match">match</span>.com</p>
<h1>Find the sim racing setup that <em>fits you</em></h1>
<p class="lead">Answer five short questions. Get setups that match your platform, budget and space — ranked by fit, never by commission.</p>
<div class="actions">
${MATCH_LIVE ? `<a class="btn lg" href="/#setup-match" data-cta="home_hero" data-quiz="start">Find your setup</a>
<a class="btn ghost" href="/wheel-bases/compare/" data-cta="home_hero_compare">Compare wheel bases</a>` : `<a class="btn lg" href="/blog/" data-cta="home_hero_blog">Read the blog</a>
<a class="btn ghost" href="/#setup-match" data-cta="home_hero" data-quiz="start">Preview the 5 questions <span aria-hidden="true">↓</span></a>`}
</div>
</div>
<div class="hero-art">
<div class="hero-a brands" data-block="hero-brands">
<h2 class="brands-h">Brands we compare</h2>
<ul class="brand-grid">
<li><a href="/blog/ps5-direct-drive-wheels-2026/" data-cta="hero_brand" data-brand="moza"><img src="/brands/moza.svg" width="132" height="30" alt="Moza Racing" decoding="async" fetchpriority="low"></a></li>
<li><a href="/blog/ps5-direct-drive-wheels-2026/" data-cta="hero_brand" data-brand="fanatec"><img src="/brands/fanatec.svg" width="200" height="18" alt="Fanatec" decoding="async" fetchpriority="low"></a></li>
<li><a href="/blog/simracing-expo-2026-announcements/" data-cta="hero_brand" data-brand="asetek"><img src="/brands/asetek.webp" width="175" height="24" alt="Asetek Racing" decoding="async" fetchpriority="low"></a></li>
<li><a href="/blog/ps5-direct-drive-wheels-2026/" data-cta="hero_brand" data-brand="logitech-g"><img src="/brands/logitech-g.svg" width="116" height="28" alt="Logitech G" decoding="async" fetchpriority="low"></a></li>
<li><a href="/#setup-match" data-cta="hero_brand" data-brand="sim-lab"><img src="/brands/sim-lab.webp" width="150" height="25" alt="Sim-Lab" decoding="async" fetchpriority="low"></a></li>
<li><a href="/#setup-match" data-cta="hero_brand" data-brand="gt-omega"><img src="/brands/gt-omega.svg" width="179" height="28" alt="GT Omega" decoding="async" fetchpriority="low"></a></li>
</ul>
</div>
<div class="hero-b" aria-hidden="true"><svg class="telem" viewBox="0 0 360 240" focusable="false">
<defs><linearGradient id="tf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF6200" stop-opacity=".28"/><stop offset="1" stop-color="#FF6200" stop-opacity="0"/></linearGradient></defs>
<g class="telem-grid"><line x1="0" y1="40" x2="360" y2="40"/><line x1="0" y1="80" x2="360" y2="80"/><line x1="0" y1="120" x2="360" y2="120"/><line x1="0" y1="160" x2="360" y2="160"/><line x1="0" y1="200" x2="360" y2="200"/><line x1="40" y1="0" x2="40" y2="240"/><line x1="80" y1="0" x2="80" y2="240"/><line x1="120" y1="0" x2="120" y2="240"/><line x1="160" y1="0" x2="160" y2="240"/><line x1="200" y1="0" x2="200" y2="240"/><line x1="240" y1="0" x2="240" y2="240"/><line x1="280" y1="0" x2="280" y2="240"/><line x1="320" y1="0" x2="320" y2="240"/></g>
<g class="sector"><line x1="120" y1="36" x2="120" y2="226"/><line x1="240" y1="36" x2="240" y2="226"/></g>
<text class="tag" x="60" y="232" text-anchor="middle">S1</text><text class="tag" x="180" y="232" text-anchor="middle">S2</text><text class="tag" x="300" y="232" text-anchor="middle">S3</text>
<path class="telem-fill" d="M12 176 L42 168 L66 172 L92 128 L118 138 L146 96 L172 108 L200 74 L228 90 L256 56 L284 62 L312 40 L348 46 L348 226 L12 226 Z"/>
<path class="telem-brake" pathLength="1" d="M12 214 L42 214 L66 196 L92 214 L118 202 L146 214 L172 198 L200 214 L228 204 L256 214 L284 208 L312 214 L348 214"/>
<path class="telem-line" pathLength="1" d="M12 176 L42 168 L66 172 L92 128 L118 138 L146 96 L172 108 L200 74 L228 90 L256 56 L284 62 L312 40 L348 46"/>
<circle class="telem-dot" cx="348" cy="46" r="5"/>
<text class="hud" x="18" y="24">PIT WALL · THROTTLE TRACE</text>
<g class="legend"><rect x="250" y="15" width="10" height="3" fill="#FF6200"/><text class="tag" x="264" y="20">THR</text><rect x="300" y="15" width="10" height="3" fill="#e8edf4"/><text class="tag" x="314" y="20">BRK</text></g>
</svg></div>
</div>
</section>

<ul class="trustbar">
<li>${ICONS.source}<span>Manufacturer data only, with check dates</span></li>
<li>${ICONS.shield}<span>Ranking never paid for · partner links disclosed</span></li>
<li>${ICONS.free}<span>Free, no account</span></li>
</ul>

<h2>How it works</h2>
<ol class="steps">
<li><strong>Answer 5 questions</strong><span class="muted"> Budget, platform, space, experience and driving style.</span></li>
<li><strong>See setups that fit</strong><span class="muted"> Filtered by compatibility and your budget. Missing prices stay “unknown”.</span></li>
<li><strong>Check the sources</strong><span class="muted"> Every figure links back to the manufacturer or official shop.</span></li>
</ol>

<h2>Wheel base guides</h2>
<ul class="wb-links">
<li><a href="/wheel-bases/compare/" data-cta="home_wb">Compare direct drive wheel bases</a><span class="muted"> Torque, platforms, EU price and price per Nm for six brands.</span></li>
<li><a href="/wheel-bases/direct-drive-vs-belt/" data-cta="home_wb">Direct drive vs belt driven wheels</a><span class="muted"> How gear, belt and direct drive differ.</span></li>
<li><a href="/wheel-bases/how-much-torque/" data-cta="home_wb">How much torque do you need?</a><span class="muted"> What makers advise, and what your mount must hold.</span></li>
<li><a href="/wheel-bases/moza-vs-fanatec/" data-cta="home_wb">Moza vs Fanatec</a><span class="muted"> Both brands’ direct drive bases: torque, price and platforms.</span></li>
</ul>
<p class="muted">Updated <time datetime="${HOME_DATE}">${fmtDate(HOME_DATE)}</time></p>

<section id="setup-match" class="band">
<h2>The setup match: 5 questions</h2>
<p class="muted">Answer five questions and see which direct drive wheel bases from our <a href="/wheel-bases/compare/">comparison table</a> fit you. Free, no account, and your answers stay in your browser.</p>
<form id="match-form" class="match" hidden>
<div class="qgrid">
${q(1, 'budget', 'Budget for the wheel base', [['u300', 'Under €300'], ['300-700', 'Up to €700'], ['700-1500', 'Up to €1,500'], ['o1500', 'Over €1,500']])}
${q(2, 'platform', 'Platform', [['pc', 'PC'], ['playstation', 'PlayStation 5'], ['xbox', 'Xbox']])}
${q(3, 'space', 'Space and mount', [['desk', 'Desk clamp'], ['stand', 'Wheel stand'], ['cockpit', 'Fixed cockpit']])}
${q(4, 'experience', 'Experience', [['beginner', 'Beginner / casual'], ['upgrader', 'Serious upgrader']])}
${q(5, 'style', 'Driving style', [['casual', 'Casual (GT, F1, Forza)'], ['competitive', 'Competitive (iRacing, ACC)']])}
</div>
<p class="actions"><button type="submit" class="btn" data-quiz="submit">Show my matches</button></p>
</form>
<noscript><p>The match needs JavaScript. You can use the <a href="/wheel-bases/compare/">comparison table</a> instead.</p></noscript>
<div id="match-results" class="match-results" tabindex="-1" aria-live="polite"></div>
<p class="muted">How it works: platform and budget filter the bases; your mount adds the makers’ mount warnings from our <a href="/wheel-bases/how-much-torque/">torque guide</a> but filters nothing; experience and driving style set the range to aim for (5–8 Nm to start, 8–15 Nm for most drivers, as the makers advise). Then price per Nm, low to high. Match logic never reads partner links. Commission cannot change the order.</p>
<script type="application/json" id="match-data">${matchJson()}</script>
</section>

<h2>How we work</h2>
<ol class="steps">
<li><strong>Source only.</strong><span class="muted"> Specs and prices from the manufacturer or official shop, with a check date. If it is not public, we write “unknown”.</span></li>
<li><strong>No stars.</strong><span class="muted"> We do not invent scores or show buyer star ratings. The match follows fixed rules on your answers.</span></li>
<li><strong>Partner links change nothing.</strong><span class="muted"> Links through which we may earn a fee are disclosed where they appear. They never change the match or the order.</span></li>
</ol>

${faqHtml(homeFaq)}
<p class="author">By ${SITE.owner} · Questions? <a href="mailto:${SITE.email}">${SITE.email}</a></p>`,
};

export const privacy = {
  path: '/privacy/', title: 'Privacy & cookies | SimracingMatch', h1: 'Privacy & cookies', crumb: 'Privacy', og: 'home', lastmod: '2026-11-06',
  description: 'How SimracingMatch handles data: no account, answers stay in your browser, and analytics only after you consent.',
  hreflangNl: '',
  body: `<article class="prose"><h1>Privacy &amp; cookies</h1>
<p class="muted">Last updated: ${PRIVACY_UPDATED}</p>
<p>Questions? Email <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>
<h2>Who is responsible?</h2><p>Controller for personal data on this site: SimracingMatch, <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>
<h2>What data?</h2><p>Answers in the future match stay in your browser. We do not store them or send them anywhere. We do not ask for your name, email or other personal data via the site forms.</p>
${GA_ID ? `<h2 id="cookies">Cookies &amp; analytics</h2><p>We do not use advertising cookies. We turn on Google Analytics only if you click “Accept” on the cookie banner. Without consent we never load Google Analytics.</p>
<p>If you consent, Google Analytics sets cookies (such as <code>_ga</code>) and we measure page views and button clicks. Match answers are not sent. Google Analytics 4 does not store IP addresses (see <a href="#retention">retention</a>). See the <a href="https://policies.google.com/privacy" rel="noopener">Google Privacy Policy</a>.</p>
<p>Your choice is stored for 12 months in localStorage. You can withdraw consent via <a href="/privacy/#cookies" data-consent-open>Cookie settings</a>. We then stop Analytics and clear <code>_ga</code> cookies.</p>
<h3>Which cookies and storage?</h3>${cookieTable(GA_ID, CONSENT_KEY)}
` : '<h2 id="cookies">Cookies &amp; analytics</h2><p>We set no cookies. If we enable analytics later, we will ask for consent first and update this page.</p>'}
<h2>Links to shops</h2><p>If you click through to a manufacturer or shop, their privacy policy applies. A partner link tells them you came via SimracingMatch.</p>
${partnerNetwork(SITE.name, Object.values(PARTNERLINKS))}
${legalBasis()}
${transfers()}
${retention(14)}
<h2>Hosting</h2><p>The site runs on GitHub Pages. GitHub processes technical data such as your IP address to deliver the site (see the <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" rel="noopener">GitHub privacy statement</a>).</p>
${rights(SITE.email)}</article>`,
};

export const disclaimer = {
  path: '/disclaimer/', title: 'Disclaimer | SimracingMatch', h1: 'Disclaimer', crumb: 'Disclaimer', og: 'home', lastmod: MATCH_DATE,
  description: 'Terms for SimracingMatch: where specs and prices come from, how partner links work, and what the match result means.',
  hreflangNl: '',
  body: `<article class="prose"><h1>Disclaimer</h1>
<p class="muted">Updated <time datetime="${MATCH_DATE}">${fmtDate(MATCH_DATE)}</time></p>
<p>SimracingMatch summarises sim racing hardware from what manufacturers and official shops publish. We aim to keep pages accurate and current, and we show the last check date on each page.</p>
<h2>Specs and prices</h2><p>All specs and prices come from the manufacturer or official shop on the date shown. Prices, stock and platform compatibility can change. The seller’s offer always wins.</p>
<h2>The match</h2><p>The setup match is a helper based on fixed rules and your answers. It is a first shortlist, not personal advice. Always confirm compatibility with the manufacturer.</p>
<h2>Partner links</h2><p>For some products we may earn a fee if you buy through us. Those links are always disclosed where they appear. They never affect the match or on-page order.</p>
<h2>No reviews or stars</h2><p>We do not show star ratings or invented tests we have not done.</p>
<h2>Brands</h2><p>Brand names belong to their owners. SimracingMatch is not affiliated with those brands.</p>
<h2>Spotted an error?</h2><p>Email <a href="mailto:${SITE.email}">${SITE.email}</a> and we will fix it with a source.</p></article>`,
};

export const contact = {
  path: '/contact/', title: 'Contact | SimracingMatch', h1: 'Contact', crumb: 'Contact', og: 'home',
  description: 'Question or error on SimracingMatch? Email the editorial team. We update specs and prices using manufacturer sources.',
  hreflangNl: '',
  schema: [{ '@context': 'https://schema.org', '@type': 'ContactPage', name: 'Contact SimracingMatch', about: ORG }],
  body: `<article class="prose"><h1>Contact</h1>
<p class="lead">A question, an error, or a price that changed? Email <a href="mailto:${SITE.email}" data-cta="contact_mail">${SITE.email}</a>.</p>
<ul><li><strong>Wrong or outdated price:</strong> send the source URL and we will update quickly.</li><li><strong>Manufacturer or shop?</strong> You may point us to new products. You cannot buy a place in the match or the order.</li><li><strong>Personal buying advice</strong> is not something we provide.</li></ul>
<p>The byline on this site is always ${SITE.owner}. We do not put personal names or staff photos on the pages.</p></article>`,
};

export const notfound = {
  path: '/404.html', title: 'Page not found | SimracingMatch', h1: 'Not found', noindex: true, og: 'home',
  description: 'This page does not exist.',
  body: `<div class="notfound"><h1>This page does not exist</h1><div class="actions"><a class="btn" href="/" data-cta="404_home">Home</a><a class="btn ghost" href="/#setup-match" data-cta="404_match" data-quiz="start">${MATCH_CTA}</a></div></div>`,
};

/** All pages for the build: home, legal, blog index, posts (if any), 404. */
export function allPages() {
  const posts = loadPosts();
  return [home, privacy, disclaimer, contact, ...wheelBasePages(), blogIndexPage(posts), ...blogPostPages(posts), notfound];
}
