import { SITE, esc, ORG, GA_ID, ICONS, SVG, fmtDate } from './layout.mjs';
import { loadPosts, blogIndexPage, blogPostPages } from './blog.mjs';

const faqSchema = (faq) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, '') } })) });
const faqHtml = (faq) => `<h2>FAQ</h2>${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${a}</p></details>`).join('')}`;

const homeFaq = [
  ['What is SimracingMatch?', 'An English-language site that helps you choose a sim racing setup. Soon: a match with five questions about budget, platform, space, experience and driving style. You get setups that fit your answers.'],
  ['Where do the specs and prices come from?', 'Only from the manufacturer or the official shop, with the date we checked them. No invented specs, prices or stars.'],
  ['Do you earn from recommendations?', 'Sometimes, via a partner link. Those links always show the visible label "partnerlink" and never affect the match or the order.'],
  ['When does the match launch?', 'The five-question setup match is coming soon. Until then, this page explains how we work. Email <a href="mailto:info@simracingmatch.com">info@simracingmatch.com</a> with questions.'],
];

export const home = {
  path: '/',
  title: 'Find your sim racing setup | SimracingMatch',
  ogTitle: 'SimracingMatch: find the setup that fits you',
  h1: 'Find the sim racing setup that fits you',
  og: 'home',
  description: 'Match a sim racing wheel, pedals and rig to your budget, platform and space. Manufacturer data only. Partner links labelled — they never change the order.',
  schema: [faqSchema(homeFaq)],
  // hreflangNl left empty until /nl/ exists
  hreflangNl: '',
  body: `<section class="hero">
<div>
<p class="hero-brand">SimracingMatch.com</p>
<h1>Find the sim racing setup that fits you</h1>
<p class="lead">Answer five short questions. Get setups that match your platform, budget and space — ranked by fit, never by commission.</p>
<div class="actions">
<a class="btn lg" href="/#setup-match" data-cta="home_hero" data-quiz="start">Find your setup</a>
<a class="btn ghost" href="/blog/">Read the blog</a>
</div>
</div>
<div class="hero-art">
<div class="hero-a" aria-hidden="true"><svg viewBox="0 0 320 220" role="img"><title>Racing line</title>
<rect width="320" height="220" rx="12" fill="#12141a"/>
<path class="race-line" d="M20 180 C60 160,80 40,140 50 C200 60,200 170,260 140 C290 120,300 80,310 40"/>
<circle cx="140" cy="50" r="5" fill="#f5c518"/>
<circle cx="260" cy="140" r="5" fill="#e10600"/>
<text x="24" y="28" fill="#a3a8b5" font-size="12" font-family="system-ui">NIGHT RACE · BEST LINE</text>
</svg></div>
<div class="hero-b" aria-hidden="true"><svg class="telem" viewBox="0 0 320 220" role="img"><title>Telemetry</title>
<rect width="320" height="220" rx="12" fill="#151a22"/>
<g class="telem-grid" stroke="#2c3644" stroke-width="1">
<line x1="0" y1="20" x2="320" y2="20"/><line x1="0" y1="40" x2="320" y2="40"/><line x1="0" y1="60" x2="320" y2="60"/><line x1="0" y1="80" x2="320" y2="80"/><line x1="0" y1="100" x2="320" y2="100"/><line x1="0" y1="120" x2="320" y2="120"/><line x1="0" y1="140" x2="320" y2="140"/><line x1="0" y1="160" x2="320" y2="160"/><line x1="0" y1="180" x2="320" y2="180"/><line x1="0" y1="200" x2="320" y2="200"/>
<line x1="20" y1="0" x2="20" y2="220"/><line x1="40" y1="0" x2="40" y2="220"/><line x1="60" y1="0" x2="60" y2="220"/><line x1="80" y1="0" x2="80" y2="220"/><line x1="100" y1="0" x2="100" y2="220"/><line x1="120" y1="0" x2="120" y2="220"/><line x1="140" y1="0" x2="140" y2="220"/><line x1="160" y1="0" x2="160" y2="220"/><line x1="180" y1="0" x2="180" y2="220"/><line x1="200" y1="0" x2="200" y2="220"/><line x1="220" y1="0" x2="220" y2="220"/><line x1="240" y1="0" x2="240" y2="220"/><line x1="260" y1="0" x2="260" y2="220"/><line x1="280" y1="0" x2="280" y2="220"/><line x1="300" y1="0" x2="300" y2="220"/>
</g>
<path class="telem-line" d="M10 160 L40 150 L70 155 L100 120 L130 130 L160 90 L190 100 L220 70 L250 85 L280 50 L310 55"/>
<circle class="telem-dot" cx="310" cy="55" r="4"/>
<text x="16" y="24" fill="#f5c518" font-size="11" font-family="ui-monospace,monospace">PIT WALL · SPD 184 · THR 0.92</text>
</svg></div>
</div>
</section>

<ul class="trustbar">
<li>${ICONS.source}<span>Manufacturer data only, with check dates</span></li>
<li>${ICONS.shield}<span>Order never paid — partner links labelled</span></li>
<li>${ICONS.free}<span>Free, no account</span></li>
</ul>

<h2>How it works</h2>
<ol class="steps">
<li><strong>Answer 5 questions</strong><span class="muted"> Budget, platform, space, experience and driving style.</span></li>
<li><strong>See setups that fit</strong><span class="muted"> Filtered by compatibility and your budget. Missing prices stay “unknown”.</span></li>
<li><strong>Check the sources</strong><span class="muted"> Every figure links back to the manufacturer or official shop.</span></li>
</ol>

<section id="setup-match" class="band">
<h2>The setup match — 5 questions</h2>
<p class="muted">Coming soon as an interactive tool. Preview of what we ask:</p>
<div class="qgrid">
<article class="qcard">${SVG.budget}<strong>1. Budget</strong><span>Under €300 · €300–700 · €700–1,500 · Over €1,500</span></article>
<article class="qcard">${SVG.platform}<strong>2. Platform</strong><span>PC · PlayStation 5 · Xbox</span></article>
<article class="qcard">${SVG.space}<strong>3. Space</strong><span>Desk clamp · Foldable · Fixed cockpit</span></article>
<article class="qcard">${SVG.experience}<strong>4. Experience</strong><span>Beginner / casual · Serious upgrader</span></article>
<article class="qcard">${SVG.style}<strong>5. Driving style</strong><span>Casual (GT, F1, Forza) · Competitive (iRacing, ACC)</span></article>
</div>
<p class="actions"><a class="btn" href="/#setup-match" data-cta="match_teaser" data-quiz="start">Find your setup</a></p>
<p class="muted">Match logic never reads partner links. Commission cannot change the order.</p>
</section>

<h2>How we work</h2>
<ol class="steps">
<li><strong>Source only.</strong><span class="muted"> Specs and prices from the manufacturer or official shop, with a check date. If it is not public, we write “unknown”.</span></li>
<li><strong>No stars.</strong><span class="muted"> We do not invent scores or show buyer star ratings. The match follows fixed rules on your answers.</span></li>
<li><strong>Partner links change nothing.</strong><span class="muted"> When we earn a fee, the link shows the label “partnerlink” and <code>rel="sponsored nofollow"</code>.</span></li>
</ol>

${faqHtml(homeFaq)}
<p class="author">By ${SITE.owner} · Questions? <a href="mailto:${SITE.email}">${SITE.email}</a></p>`,
};

export const privacy = {
  path: '/privacy/', title: 'Privacy & cookies | SimracingMatch', h1: 'Privacy & cookies', crumb: 'Privacy', og: 'home',
  description: 'How SimracingMatch handles data: no account, answers stay in your browser, and analytics only after you consent.',
  hreflangNl: '',
  body: `<article class="prose"><h1>Privacy &amp; cookies</h1>
<p>Questions? Email <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>
<h2>Who is responsible?</h2><p>Controller for personal data on this site: SimracingMatch, <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>
<h2>What data?</h2><p>Answers in the future match stay in your browser. We do not store them or send them anywhere. We do not ask for your name, email or other personal data via the site forms.</p>
${GA_ID ? `<h2 id="cookies">Cookies &amp; analytics</h2><p>We do not use advertising cookies. We turn on Google Analytics only if you click “Accept” on the cookie banner. Without consent we never load Google Analytics.</p>
<p>If you consent, Google Analytics sets cookies (such as <code>_ga</code>) and we measure page views and button clicks. Match answers are not sent. Google Analytics 4 does not store IP addresses. We keep analytics data for at most 14 months. See the <a href="https://policies.google.com/privacy" rel="noopener">Google Privacy Policy</a>.</p>
<p>Your choice is stored for 12 months in localStorage. You can withdraw consent via <a href="/privacy/#cookies" data-consent-open>Cookie settings</a>. We then stop Analytics and clear <code>_ga</code> cookies.</p>
` : '<h2 id="cookies">Cookies &amp; analytics</h2><p>We set no cookies. If we enable analytics later, we will ask for consent first and update this page.</p>'}
<h2>Links to shops</h2><p>If you click through to a manufacturer or shop, their privacy policy applies. A partner link tells them you came via SimracingMatch.</p>
<h2>Hosting</h2><p>The site runs on GitHub Pages. GitHub processes technical data such as your IP address to deliver the site.</p>
<h2>Your rights</h2><p>You may ask what data we hold and request deletion. You can complain to your local data-protection authority.</p></article>`,
};

export const disclaimer = {
  path: '/disclaimer/', title: 'Disclaimer | SimracingMatch', h1: 'Disclaimer', crumb: 'Disclaimer', og: 'home',
  description: 'Terms for SimracingMatch: where specs and prices come from, how partner links work, and what the match result means.',
  hreflangNl: '',
  body: `<article class="prose"><h1>Disclaimer</h1>
<p>SimracingMatch summarises sim racing hardware from what manufacturers and official shops publish. We aim to keep pages accurate and current, and we show the last check date on each page.</p>
<h2>Specs and prices</h2><p>All specs and prices come from the manufacturer or official shop on the date shown. Prices, stock and platform compatibility can change. The seller’s offer always wins.</p>
<h2>The match</h2><p>The setup match (coming soon) is a helper based on fixed rules and your answers. It is a first shortlist, not personal advice. Always confirm compatibility with the manufacturer.</p>
<h2>Partner links</h2><p>For some products we may earn a fee if you buy through us. Those links always show the label “partnerlink” and <code>rel="sponsored nofollow noopener"</code>. They never affect the match or on-page order.</p>
<h2>No reviews or stars</h2><p>We do not show star scores or invented tests we have not done.</p>
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
  body: `<div class="notfound"><h1>This page does not exist</h1><div class="actions"><a class="btn" href="/" data-cta="404_home">Home</a><a class="btn ghost" href="/#setup-match" data-cta="404_match" data-quiz="start">Find your setup</a></div></div>`,
};

/** All pages for the build: home, legal, blog index, posts (if any), 404. */
export function allPages() {
  const posts = loadPosts();
  return [home, privacy, disclaimer, contact, blogIndexPage(posts), ...blogPostPages(posts), notfound];
}
