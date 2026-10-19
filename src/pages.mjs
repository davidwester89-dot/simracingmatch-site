import { SITE, esc, ORG, GA_ID, ICONS } from './layout.mjs';

const faqSchema = (faq) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, '') } })) });
const faqHtml = (faq) => `<h2>Veelgestelde vragen</h2>${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${a}</p></details>`).join('')}`;

const homeFaq = [
  ['Wat is SimracingMatch?', 'Een Nederlandse site die je helpt een simrace-setup te kiezen. Binnenkort starten we een match met vijf vragen over budget, platform, ruimte, ervaring en rijstijl. Je krijgt dan setups die bij jouw antwoorden passen.'],
  ['Waar komen de gegevens vandaan?', 'Alleen van de fabrikant of de officiële shop, met de datum waarop we het controleerden. Geen verzonnen specs, prijzen of sterren.'],
  ['Verdient SimracingMatch aan aanbevelingen?', 'Soms, via een partnerlink. Zo\'n link heeft altijd het zichtbare label "partnerlink" en telt nooit mee in de match of de volgorde.'],
  ['Wanneer komt de match?', 'De setup-match met vijf vragen volgt spoedig. Tot die tijd staat hier hoe we werken. Mail <a href="mailto:info@simracingmatch.com">info@simracingmatch.com</a> bij vragen.'],
];

export const home = {
  path: '/',
  title: 'Simrace-setup kiezen | SimracingMatch',
  ogTitle: 'SimracingMatch: welke simrace-setup past bij jou?',
  h1: 'Welke simrace-setup past bij jou?',
  og: 'home',
  description: 'SimracingMatch: kies een simrace-setup. Binnenkort een match met 5 vragen (budget, platform, ruimte, ervaring, rijstijl). Alleen fabrikantgegevens.',
  schema: [faqSchema(homeFaq)],
  body: `<section class="hero"><div>
<p class="h1-brand">Simracing<b>Match</b>.com</p>
<h1 class="tagline">Welke simrace-setup past bij jou?</h1>
<p class="lead">Racestuur, pedalen of een complete cockpit: we helpen je kiezen op basis van jouw platform, budget en ruimte. Binnenkort start de match met vijf korte vragen. Tot die tijd lees je hier hoe we werken.</p>
<div class="actions"><a class="btn ghost" href="/contact/">Houd me op de hoogte</a><a class="btn ghost" href="/disclaimer/">Zo werken we</a></div>
</div>
<div class="hero-q"><p class="hero-q-step">Binnenkort</p><p class="hero-q-title" id="hq">De setup-match: 5 vragen</p><ul class="trust" style="margin:12px 0 0;list-style:none;padding:0;display:grid;gap:8px">
<li><strong>1. Budget</strong> — wat wil je uitgeven?</li>
<li><strong>2. Platform</strong> — PC, PS5 of Xbox</li>
<li><strong>3. Ruimte</strong> — bureau, inklapbaar of vaste cockpit</li>
<li><strong>4. Ervaring</strong> — beginner of serieus</li>
<li><strong>5. Rijstijl</strong> — casual of competitief</li>
</ul><p class="hero-q-foot">Gratis, zonder account. De volgorde hangt nooit van commissie af.</p></div>
</section>
<ul class="trustbar">
<li>${ICONS.bron}<span>Alleen fabrikantgegevens</span></li>
<li>${ICONS.schild}<span>Volgorde nooit betaald</span></li>
<li>${ICONS.kalender}<span>Datum bij elke prijs</span></li>
<li>${ICONS.gratis}<span>Gratis, zonder account</span></li>
</ul>
<h2>Hoe we werken</h2>
<ol class="steps">
<li><strong>Alleen de bron.</strong> Specs en prijzen komen van de fabrikant of de officiële shop. Bij elk bedrag zetten we de controledatum. Staat iets niet openbaar, dan schrijven we "onbekend".</li>
<li><strong>Geen sterren, geen reviews.</strong> We verzinnen geen scores en tonen geen sterren van kopers. De match volgt vaste regels op jouw antwoorden.</li>
<li><strong>Partnerlinks veranderen niets.</strong> Soms krijgen we een vergoeding via een partnerlink. Zo'n link heeft altijd het label "partnerlink" en <code>rel="sponsored nofollow"</code>. De match en de volgorde lezen die links niet.</li>
</ol>
<h2>Wat komt eraan</h2>
<p>Na de match volgen gidsen over racesturen per platform, complete sets, direct drive, pedalen, cockpits en een paar eerlijke vergelijkingen (zoals Fanatec versus Moza). Alles in het Nederlands, op simracingmatch.com.</p>
<section class="band method-band">
<h2>Voor wie is dit?</h2>
<p>Voor wie in Nederland of België een eerste racestuur zoekt, of een bestaande setup wil uitbreiden. We schrijven in gewoon Nederlands. Geen persoonsnamen of foto's van "experts" op de site: de auteur is altijd <a href="/contact/">${SITE.owner}</a>.</p>
</section>
${faqHtml(homeFaq)}
<p class="author">Door ${SITE.owner} · Vragen? <a href="mailto:${SITE.email}">${SITE.email}</a></p>`,
};

export const privacy = {
  path: '/privacy/', title: 'Privacy en cookies | SimracingMatch', h1: 'Privacy en cookies', crumb: 'Privacy', og: 'home',
  description: 'Hoe SimracingMatch met je gegevens omgaat: geen account, je antwoorden blijven in je browser en statistieken alleen na jouw toestemming.',
  body: `<article class="prose"><h1>Privacy en cookies</h1>
<p>Vragen? Mail naar <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>
<h2>Wie is verantwoordelijk?</h2><p>Verantwoordelijk voor de verwerking van persoonsgegevens op deze site: SimracingMatch, <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>
<h2>Welke gegevens?</h2><p>Antwoorden in de toekomstige match blijven in je browser. We slaan ze niet op en sturen ze nergens heen. We vragen geen naam, e-mailadres of andere persoonsgegevens via de site.</p>
${GA_ID ? `<h2 id="cookies">Cookies en statistieken</h2><p>We gebruiken geen advertentiecookies. Statistieken met Google Analytics zetten we alleen aan als je in de cookiemelding op "Accepteren" klikt. Zonder toestemming laden we Google Analytics niet en gaat er niets naar Google.</p>
<p>Geef je toestemming, dan plaatst Google Analytics cookies (zoals <code>_ga</code>) en meten we welke pagina's bezocht worden en op welke knoppen wordt geklikt. Invoer uit een match sturen we niet mee. Google Analytics 4 slaat geen IP-adressen op. We gebruiken de gegevens alleen voor statistieken en bewaren ze maximaal 14 maanden. Google verwerkt de gegevens als verwerker; zie het <a href="https://policies.google.com/privacy" rel="noopener">privacybeleid van Google</a>.</p>
<p>Je keuze bewaren we 12 maanden in je browser (localStorage). Je kunt je toestemming altijd intrekken via <a href="/privacy/#cookies" data-consent-open>Cookie-instellingen</a> (ook onderaan elke pagina). Dan stoppen we Google Analytics en wissen we de <code>_ga</code>-cookies.</p>
` : '<h2 id="cookies">Cookies en statistieken</h2><p>We plaatsen geen cookies: geen advertentiecookies en geen statistiekcookies. Zetten we later statistieken aan, dan vragen we eerst je toestemming in een cookiemelding en passen we deze pagina aan.</p>'}<h2>Links naar winkels</h2><p>Klik je door naar een fabrikant of shop, dan geldt hun privacyverklaring. Bij een partnerlink ziet de aanbieder dat je via SimracingMatch komt.</p>
<h2>Hosting</h2><p>De site draait op GitHub Pages. GitHub verwerkt technische gegevens zoals je IP-adres om de site te leveren.</p>
<h2>Je rechten</h2><p>Je mag vragen welke gegevens we van je hebben en die laten verwijderen. Een klacht kun je indienen bij de Autoriteit Persoonsgegevens.</p></article>`,
};

export const disclaimer = {
  path: '/disclaimer/', title: 'Disclaimer en voorwaarden | SimracingMatch', h1: 'Disclaimer en voorwaarden', crumb: 'Disclaimer', og: 'home',
  description: 'De voorwaarden van SimracingMatch: waar specs en prijzen vandaan komen, hoe partnerlinks werken en wat je met de match-uitkomst kunt doen.',
  body: `<article class="prose"><h1>Disclaimer en voorwaarden</h1>
<p>SimracingMatch geeft een overzicht van simrace-hardware op basis van wat fabrikanten en officiële shops publiceren. We doen ons best om alles juist en actueel te houden, en zetten bij elke pagina de datum van de laatste controle.</p>
<h2>Specs en prijzen</h2><p>Alle specs en prijzen komen van de fabrikant of de officiële shop, op de datum die bij de pagina staat. Prijzen, voorraad en compatibiliteit (PC, PS5, Xbox) kunnen wijzigen. Wat de verkoper je in een bestelling of offerte aanbiedt, gaat altijd voor.</p>
<h2>De match</h2><p>De setup-match (binnenkort) is een hulpmiddel op basis van vaste regels en je antwoorden. Het is een eerste selectie, geen persoonlijk advies. Compatibiliteit controleer je altijd bij de fabrikant.</p>
<h2>Partnerlinks</h2><p>Bij sommige producten kunnen we een vergoeding krijgen als je via ons bestelt. Zo'n link heeft altijd het zichtbare label "partnerlink" en <code>rel="sponsored nofollow noopener"</code>. Partnerlinks hebben geen invloed op de match of de volgorde op de site.</p>
<h2>Geen reviews of sterren</h2><p>We tonen geen sterren en geen scores van kopers. We verzinnen geen tests die we niet zelf hebben gedaan.</p>
<h2>Merken</h2><p>Merknamen zijn van de betreffende fabrikanten. SimracingMatch is niet verbonden aan een van deze merken.</p>
<h2>Fout gezien?</h2><p>Mail naar <a href="mailto:${SITE.email}">${SITE.email}</a>, dan passen we het aan met bron.</p></article>`,
};

export const contact = {
  path: '/contact/', title: 'Contact | SimracingMatch', h1: 'Contact', crumb: 'Contact', og: 'home',
  description: 'Vraag of fout gezien op SimracingMatch? Mail de redactie. We passen specs en prijzen aan met bron van de fabrikant.',
  schema: [{ '@context': 'https://schema.org', '@type': 'ContactPage', name: 'Contact SimracingMatch', about: ORG }],
  body: `<article class="prose"><h1>Contact</h1>
<p class="lead">Een vraag, een fout gezien of een prijs die veranderd is? Mail ons op <a href="mailto:${SITE.email}" data-cta="contact_mail">${SITE.email}</a>.</p>
<ul><li><strong>Fout of verouderde prijs:</strong> stuur de link naar de bron mee, dan passen we het snel aan.</li><li><strong>Fabrikant of shop?</strong> Je mag ons wijzen op nieuwe producten. Een plek in de match of de volgorde kun je niet kopen.</li><li><strong>Persoonlijk advies</strong> over aankopen of belastingen geven we niet.</li></ul>
<p>De auteur op deze site is altijd ${SITE.owner}. We zetten geen persoonsnamen of foto's van medewerkers op de pagina's.</p></article>`,
};

export const notfound = {
  path: '/404.html', title: 'Pagina niet gevonden | SimracingMatch', h1: 'Niet gevonden', noindex: true, og: 'home',
  description: 'Deze pagina bestaat niet.',
  body: `<div class="notfound"><h1>Deze pagina bestaat niet</h1><div class="actions"><a class="btn" href="/">Homepage</a><a class="btn ghost" href="/contact/">Contact</a></div></div>`,
};
