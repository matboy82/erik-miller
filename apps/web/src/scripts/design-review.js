(() => {
  const initialize = () => {
    const theme = document.querySelector('#review-theme');
    const copyDirection = document.querySelector('#review-copy-direction');
    const tagline = document.querySelector('#review-tagline');
    const { copy, taglines } = JSON.parse(document.querySelector('#review-copy').textContent);
    const key = 'miller-design-review';
    const validDirection = (value) => typeof value === 'string' && Object.hasOwn(copy, value);
    const validTagline = (value) => value === 'default' || (typeof value === 'string' && Object.hasOwn(taglines, value));
    function apply() {
      document.documentElement.dataset.theme = theme.value;
      const content = copy[copyDirection.value];
      for (const field of ['tagline', 'headline', 'description', 'process']) {
        document.querySelector(`[data-copy="${field}"]`).textContent =
          field === 'tagline' && tagline.value !== 'default' ? taglines[tagline.value] : content[field];
      }
      document.querySelector('#review-status').textContent = `Direction ${theme.value} · Copy ${copyDirection.value} · ${tagline.value === 'default' ? 'Default tagline' : 'Selected tagline'} · Draft`;
      try { localStorage.setItem(key, JSON.stringify({ theme: theme.value, copyDirection: copyDirection.value, taglineId: tagline.value })); } catch { /* Storage is optional. */ }
    }
    try {
      const saved = JSON.parse(localStorage.getItem(key) ?? 'null');
      if (saved !== null) {
        theme.value = validDirection(saved.theme) ? saved.theme : 'A';
        copyDirection.value = validDirection(saved.theme) && validDirection(saved.copyDirection) ? saved.copyDirection : theme.value;
        const legacyId = saved.tagline === 'default' ? 'default' : Object.keys(taglines).find((id) => taglines[id] === saved.tagline);
        const id = saved.taglineId ?? legacyId;
        tagline.value = validDirection(saved.theme) && validTagline(id) ? id : 'default';
      }
    } catch { theme.value = 'A'; copyDirection.value = 'A'; tagline.value = 'default'; }
    theme.addEventListener('change', () => { copyDirection.value = theme.value; tagline.value = 'default'; apply(); });
    copyDirection.addEventListener('change', () => { tagline.value = 'default'; apply(); });
    tagline.addEventListener('change', apply);
    apply();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
