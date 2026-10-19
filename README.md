# SimracingMatch.com
Statische site (Node, geen frameworks), zelfde opbouw als KassaMatch (Inter, tokens, header, footer met "Ook van ons"); eigen accent racing-rood `#b42318`. `npm test`, `npm run build`.

- **Nu live in de repo:** homepage (uitleg + aankondiging match), privacy (consent/GA4), disclaimer/voorwaarden, contact, 404.
- **Nog niet in de build:** de overige URL's uit het launchplan (geen thin placeholders). Die komen na de briefing en content van Blogschrijver.
- Partnerlinks: `src/lib/partnerlinks.js`, LEEG tot Partnermanager een programma voor simracingmatch.com goedkeurt. Altijd `rel="sponsored nofollow noopener"` + label "partnerlink"; nooit invloed op match of volgorde.
- Analytics: `src/analytics.config.mjs` → `G-HJLSDLMDD0` (GA4-property 559605359). Consent eerst; gtag laadt pas na "Accepteren".
- IndexNow-sleutel: `src/root/<sleutel>.txt`. GSC-verificatie: `src/root/google78d915054efb904d.html`.
- Netwerkfooter: `src/network.mjs` (geen Goodfellas).

## Preview en livegang
- Preview (standaard in Actions): `BASE=/simracingmatch-site` → noindex, robots Disallow, geen CNAME.
- Live (pas na akkoord): in `.github/workflows/pages.yml` `BASE: ''` en `GO_LIVE: '1'` (schrijft CNAME `simracingmatch.com`). DNS bij Strato: zie briefing.

## Schrijfregels
Bylines "Redactie SimracingMatch". Geen namen of foto's van personen, geen verzonnen specs/prijzen/ratings, geen sterren. Nooit batterijmatch.nl, geen Reddit.
