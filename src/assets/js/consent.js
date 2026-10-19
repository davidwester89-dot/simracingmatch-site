// Cookie banner + GA4. Loads gtag.js only after Accept. Logic: ./lib/consent.js (tested).
import { createConsent } from './lib/consent.js';

const body = document.body;
const gaId = body.dataset.ga || '';
let store;
try { store = window.localStorage; } catch { store = { getItem: () => null, setItem() {} }; }

const consent = createConsent({
  gaId, storage: store, doc: document, win: window, hostname: location.hostname,
  load(src) { const s = document.createElement('script'); s.async = true; s.src = src; document.head.append(s); },
});

export const track = (name, params) => consent.track(name, params);

const BASE = body.dataset.base || '';
const MATCH_HASH = '#setup-match';

let banner = null;
let returnFocus = null;

function close() {
  if (!banner) return;
  banner.hidden = true;
  body.classList.remove('has-consent');
  const wasInside = banner.contains(document.activeElement) || document.activeElement === body;
  if (returnFocus && document.contains(returnFocus)) returnFocus.focus();
  else if (wasInside) { const m = document.getElementById('content'); if (m) { if (!m.hasAttribute('tabindex')) m.setAttribute('tabindex', '-1'); m.focus({ preventScroll: true }); } }
  returnFocus = null;
}

function choose(ok) {
  if (ok) consent.accept(); else consent.reject();
  const msg = banner.querySelector('.consent-status');
  if (msg) msg.textContent = ok ? 'Thanks — analytics are on.' : 'Analytics are off.';
  close();
}

function build() {
  const el = document.createElement('section');
  el.className = 'consent';
  el.setAttribute('role', 'region');
  el.setAttribute('aria-label', 'Cookie settings');
  el.hidden = true;
  el.innerHTML = '<div class="consent-in"><p id="consent-text">Cookies for analytics? See our <a href="' + BASE + '/privacy/#cookies">cookie policy</a></p>'
    + '<div class="consent-btns"><button type="button" class="consent-btn" data-c="yes" aria-describedby="consent-text">Accept</button>'
    + '<button type="button" class="consent-btn" data-c="no" aria-describedby="consent-text">Reject</button></div></div>';
  el.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-c]');
    if (b) choose(b.dataset.c === 'yes');
  });
  el.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  const skip = body.querySelector('.skip');
  if (skip) skip.after(el); else body.prepend(el);
  const status = document.createElement('p');
  status.className = 'consent-status sr';
  status.setAttribute('role', 'status');
  body.append(status);
  return el;
}

function open(focus) {
  banner = banner || build();
  banner.hidden = false;
  body.classList.add('has-consent');
  const c = consent.choice();
  banner.querySelectorAll('button[data-c]').forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.c === 'yes' && c === 'granted') || (b.dataset.c === 'no' && c === 'denied'))));
  if (focus) { returnFocus = document.activeElement; banner.querySelector('button').focus(); }
}

if (consent.enabled) {
  if (consent.init()) open(false);
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-consent-open], a[data-vendor], a[data-cta], a[data-quiz], [data-quiz]');
    if (!t) return;
    if (t.matches('[data-consent-open]')) { e.preventDefault(); open(true); return; }
    if (t.dataset.vendor) track('vendor_click', { vendor: t.dataset.vendor, page: location.pathname, position: t.dataset.pos || '', cta_type: t.dataset.cta || 'outbound' });
    if (t.dataset.quiz === 'start' || t.dataset.cta === 'home_hero' || t.dataset.cta === 'match_teaser' || t.dataset.cta === 'nav_match') {
      track('quiz_start', { page: location.pathname, cta_type: t.dataset.cta || 'quiz_start' });
    } else if (t.dataset.cta && (t.getAttribute('href') || '').includes(MATCH_HASH)) {
      track('match_cta', { page: location.pathname, cta_type: t.dataset.cta });
    }
  });
  // Stub: match results will dispatch sm:quiz with detail; sends quiz_complete after consent.
  document.addEventListener('sm:quiz', (e) => track('quiz_complete', {
    platform: e.detail && e.detail.platform,
    budget: e.detail && e.detail.budget,
  }));
}
