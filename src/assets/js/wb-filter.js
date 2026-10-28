// Platform filter for /wheel-bases/compare/. Without JS the full table shows; the filter only hides rows.
const box = document.querySelector('.wb-filter');
const rows = [...document.querySelectorAll('.wb-table tbody tr')];
if (box && rows.length) {
  box.hidden = false;
  const btns = [...box.querySelectorAll('button[data-wb]')];
  btns.forEach((b) => b.addEventListener('click', () => {
    const p = b.dataset.wb;
    btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    rows.forEach((r) => { r.hidden = p !== 'all' && !r.dataset.platforms.split(' ').includes(p); });
  }));
}
