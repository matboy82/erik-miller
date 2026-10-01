(() => {
  const theme = document.querySelector('#review-theme');
  const tagline = document.querySelector('#review-tagline');
  const variants = JSON.parse(document.querySelector('#review-copy').textContent);
  const key = 'miller-design-review';
  function apply() {
    const direction = theme.value;
    document.documentElement.dataset.theme = direction;
    const content = variants[direction];
    for (const field of ['tagline', 'headline', 'description', 'process']) {
      document.querySelector(`[data-copy="${field}"]`).textContent =
        field === 'tagline' && tagline.value !== 'default' ? tagline.value : content[field];
    }
    document.querySelector('#review-status').textContent = `Direction ${direction} · Draft copy`;
    try { localStorage.setItem(key, JSON.stringify({ theme: direction, tagline: tagline.value })); } catch { /* Review works when storage is disabled. */ }
  }
  try {
    const saved = JSON.parse(localStorage.getItem(key) ?? 'null');
    if (saved && Object.hasOwn(variants, saved.theme)) theme.value = saved.theme;
    if (saved && Array.from(tagline.options).some((option) => option.value === saved.tagline)) tagline.value = saved.tagline;
  } catch { /* Ignore unavailable or invalid saved preferences. */ }
  theme.addEventListener('change', () => { tagline.value = 'default'; apply(); });
  tagline.addEventListener('change', apply);
  apply();
})();
