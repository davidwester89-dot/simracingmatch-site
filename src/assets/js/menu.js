// Escape closes the mobile menu (details.menu) and returns focus to the menu button.
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  for (const d of document.querySelectorAll('details.menu[open]')) {
    d.open = false;
    d.querySelector('summary')?.focus();
  }
});
