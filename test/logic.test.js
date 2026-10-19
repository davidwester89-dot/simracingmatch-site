import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readConsent, saveConsent, createConsent, CONSENT_KEY, GA_ID_RE, cleanParams, cleanUrl } from '../src/lib/consent.js';
import { PARTNERLINKS, uitgaand, knop } from '../src/lib/partnerlinks.js';

test('consent: key is sm-consent, GA-id-patroon, opslaan en lezen', () => {
  assert.equal(CONSENT_KEY, 'sm-consent');
  assert.ok(GA_ID_RE.test('G-HJLSDLMDD0'));
  assert.ok(!GA_ID_RE.test('UA-123'));
  const store = { data: {}, getItem(k) { return this.data[k] ?? null; }, setItem(k, v) { this.data[k] = v; } };
  assert.equal(readConsent(store), null);
  saveConsent(store, 'granted');
  assert.equal(readConsent(store).choice, 'granted');
  assert.deepEqual(cleanParams({ a: 'x', n: 1, long: 'a'.repeat(200) }), { a: 'x', long: 'a'.repeat(100) });
  assert.equal(cleanUrl('https://simracingmatch.com/x?b=1#y'), 'https://simracingmatch.com/x');
});

test('consent: zonder ID geen start; met ID alleen na accept', () => {
  const loads = [];
  const doc = { cookie: '', referrer: '' };
  const win = { location: { href: 'https://simracingmatch.com/' } };
  const store = { data: {}, getItem(k) { return this.data[k] ?? null; }, setItem(k, v) { this.data[k] = v; } };
  const c0 = createConsent({ gaId: '', storage: store, doc, win, hostname: 'simracingmatch.com', load: (s) => loads.push(s) });
  assert.equal(c0.enabled, false);
  assert.equal(c0.init(), false);
  assert.equal(loads.length, 0);
  const c1 = createConsent({ gaId: 'G-HJLSDLMDD0', storage: store, doc, win, hostname: 'simracingmatch.com', load: (s) => loads.push(s) });
  assert.equal(c1.init(), true); // melding tonen
  assert.equal(loads.length, 0);
  c1.accept();
  assert.ok(loads[0].includes('gtag/js?id=G-HJLSDLMDD0'));
  assert.equal(c1.track('vendor_click', { vendor: 'moza' }), true);
});

test('partnerlinks: leeg; knop zonder partner heeft geen sponsored', () => {
  assert.deepEqual(PARTNERLINKS, {});
  const o = uitgaand('https://example.com/', { partner: false });
  assert.equal(o.rel, 'noopener');
  assert.equal(o.partner, false);
  const html = knop('https://example.com/', 'test', { partner: true, label: 'Naar Moza' });
  assert.match(html, /rel="sponsored nofollow noopener"/);
  assert.match(html, /<span class="partner">partnerlink<\/span>/);
});
