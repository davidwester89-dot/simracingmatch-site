// Setup match on the home page. Without JS the five questions stay visible as text; nothing is hidden.
import { matchBases, targetBand, MOUNT_NOTES } from './match-logic.js';
import { quizShopLink } from './match-exit.js';
const form = document.getElementById('match-form');
const out = document.getElementById('match-results');
const dataEl = document.getElementById('match-data');
if (form && out && dataEl) {
  const { bases, logos, checked } = JSON.parse(dataEl.textContent);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const eur = (n) => '€' + n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const card = (b) => {
    const l = logos[b.brand];
    return `<li class="mcard">${l ? `<img class="wb-logo" src="${l[0]}" width="${l[1]}" height="${l[2]}" alt="${esc(b.brand)} logo" loading="lazy" decoding="async">` : ''}
<strong>${esc(b.brand)} ${esc(b.model)}</strong>
<span>${esc(b.torque)}</span><span>Platforms: ${b.platforms.join(', ')}${b.note ? ` <span class="muted">(${esc(b.note)})</span>` : ''}</span>
<span>Regular price: ${eur(b.price)} · ${eur(Math.round(b.perNm * 100) / 100)} per Nm</span>
${quizShopLink(b)}</li>`;
  };
  form.hidden = false;
  let started = false;
  const markStart = () => {
    if (started) return;
    started = true;
    document.dispatchEvent(new CustomEvent('sm:quiz-start', { detail: { cta_type: 'match_form' } }));
  };
  form.addEventListener('change', markStart);
  document.addEventListener('sm:quiz-started', () => { started = true; }, { once: true });
  form.addEventListener('submit', (e) => {
    markStart();
    e.preventDefault();
    const f = new FormData(form);
    const a = Object.fromEntries(['budget', 'platform', 'space', 'experience', 'style'].map((k) => [k, f.get(k)]));
    if (Object.values(a).some((v) => !v)) { out.innerHTML = '<p class="muted">Please answer all five questions.</p>'; return; }
    const res = matchBases(bases, a);
    const [lo, hi] = targetBand(a.experience, a.style);
    const top = res.slice(0, 3), rest = res.slice(3);
    out.innerHTML = res.length
      ? `<h3>Your matches</h3><p class="muted">Aim for ${lo}–${hi} Nm based on your answers. ${res.length} wheel base${res.length > 1 ? 's' : ''} fit. Best fit first, then price per Nm. Base only: add a wheel, pedals and a mount. Prices checked on the manufacturers’ EU stores on ${esc(checked)}.</p>
<p class="muted">Mount: ${esc(MOUNT_NOTES[a.space])} See <a href="/wheel-bases/how-much-torque/">what your mount must hold</a>.</p>
<ol class="mlist">${top.map(card).join('')}</ol>${rest.length ? `<details><summary>Show the other ${rest.length}</summary><ol class="mlist">${rest.map(card).join('')}</ol></details>` : ''}
<p>Next: <a href="/blog/load-cell-pedals/">choose pedals</a> · <a href="/wheel-bases/how-much-torque/">what your mount must hold</a> · <a href="/wheel-bases/compare/">full comparison</a></p>`
      : `<h3>No exact match</h3><p>No wheel base in our <a href="/wheel-bases/compare/">comparison</a> fits all your answers. Try a higher budget or another platform. On console, check the platform notes in the table.</p>`;
    out.focus();
    document.dispatchEvent(new CustomEvent('sm:quiz', { detail: { platform: a.platform, budget: a.budget } }));
  });
}
