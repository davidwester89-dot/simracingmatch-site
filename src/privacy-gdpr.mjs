// Extra GDPR blocks for /privacy/ (security & legal audit 20-10-2026, A.6 / F1).
// Only established facts: cookie lifetime from consent.js (cookie_expires), GA4 retention from the property setting.
// "Who is responsible?" is deliberately NOT here: that follows the business-registration decision.
export const PRIVACY_UPDATED = '21 October 2026';

const NETWORKS = [
  { re: /(^|\.)pxf\.io$|impact\.com$/, name: 'Impact', privacy: 'https://impact.com/privacy-policy/' },
  { re: /(^|\.)mozaracing\.com$/, name: 'GoAffPro', privacy: 'https://goaffpro.com/privacy' },
  { re: /(^|\.)jf79\.net$|ds1\.nl$|daisycon\./, name: 'Daisycon', privacy: 'https://daisycon.com/en/legal-information/privacy-policy/' },
];
export const NETWORK_PRIVACY = NETWORKS.map((n) => n.privacy);

export function networksOf(urls) {
  const out = [];
  for (const url of urls) {
    const host = new URL(url).hostname;
    const n = NETWORKS.find((x) => x.re.test(host));
    if (!n) throw new Error(`Unknown affiliate network for ${host}: add it to privacy-gdpr.mjs`);
    if (!out.includes(n)) out.push(n);
  }
  return out;
}

export function cookieTable(gaId, storageKey) {
  return `<div class="table-wrap" tabindex="0" role="region" aria-label="Table: cookies and local storage"><table><thead><tr><th scope="col">Name</th><th scope="col">Set by</th><th scope="col">Purpose</th><th scope="col">Lifetime</th></tr></thead><tbody>
<tr><td><code>_ga</code></td><td>Google Analytics, only after consent</td><td>Recognises your browser with a random number so we can count visitors</td><td>365 days, renewed on each visit</td></tr>
<tr><td><code>_ga_${gaId.replace(/^G-/, '')}</code></td><td>Google Analytics, only after consent</td><td>Keeps track of your visit (session)</td><td>365 days, renewed on each visit</td></tr>
<tr><td><code>${storageKey}</code> (local storage, not a cookie)</td><td>This site</td><td>Remembers whether you accepted or rejected analytics</td><td>12 months</td></tr>
</tbody></table></div>`;
}

export function partnerNetwork(siteName, partnerUrls) {
  const nw = networksOf(partnerUrls);
  if (!nw.length) return `<p>There are no partner links on this site right now. When there are, they are disclosed where they appear and we will name here the affiliate network that sets a cookie when you click.</p>`;
  return `<p>Partner links are disclosed where they appear. When you click one, you pass through an affiliate network (${nw.map((n) => n.name).join(', ')}) to the shop. That network sets a cookie or click ID on its own domain to record that you came via ${siteName}. If you buy something, we may earn a fee. The network is responsible for that data; see the privacy policy of ${nw.map((n) => `<a href="${n.privacy}" rel="noopener">${n.name}</a>`).join(' and ')}.</p>`;
}

export function legalBasis() {
  return `<h2>Legal basis</h2><ul>
<li><strong>Analytics (Google Analytics):</strong> only with your consent (Article 6(1)(a) GDPR). Placing the cookies also requires your consent under the Dutch Telecommunications Act (Article 11.7a).</li>
<li><strong>Email to us:</strong> we use your message and email address to answer your question. This is our legitimate interest (Article 6(1)(f) GDPR).</li>
<li><strong>Hosting:</strong> technical data such as your IP address is needed to deliver the site securely. This is also legitimate interest (Article 6(1)(f) GDPR).</li></ul>`;
}

export function transfers() {
  return `<h2>Data outside the EU</h2><p>Google (Google Analytics) and GitHub (hosting) may process data in the United States. Google LLC and GitHub, Inc. take part in the EU-US Data Privacy Framework. The European Commission has decided that data at participating companies is adequately protected (<a href="https://eur-lex.europa.eu/eli/dec_impl/2023/1795/oj" rel="noopener">Decision (EU) 2023/1795</a>). You can look up participants in the <a href="https://www.dataprivacyframework.gov/list" rel="noopener">DPF list</a>.</p>`;
}

export function retention(eventMonths) {
  return `<h2 id="retention">Retention</h2><ul>
<li><strong>Google Analytics:</strong> Google keeps data about visits and clicks for ${eventMonths} months and user-level data for at most 14 months. After that it is deleted automatically. Totals in reports, without data per visitor, remain.</li>
<li><strong>Cookies:</strong> see the table above.</li>
<li><strong>Email:</strong> as long as needed to answer your question.</li></ul>`;
}

export function rights(email) {
  return `<h2>Your rights</h2><p>You have the right to access, rectify and erase your data, to restrict processing, to object and to data portability. If you consented to analytics, you can withdraw that at any time via <a href="/privacy/#cookies" data-consent-open>Cookie settings</a>. This applies from that moment on.</p>
<p>We hold little data that identifies you: analytics is tied to a random number in your browser, not to your name. Send a request to <a href="mailto:${email}">${email}</a>. We reply within one month. You can complain to your local data-protection authority or to the Dutch Data Protection Authority (Autoriteit Persoonsgegevens), which supervises this site.</p>`;
}
