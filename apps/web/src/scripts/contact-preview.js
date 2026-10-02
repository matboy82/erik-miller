export function initializeContactPreview(root) {
  const preview = root.querySelector('#contact-preview');
  const status = root.querySelector('#form-status');
  if (!preview || !status) return;

  preview.querySelectorAll('[data-preview]').forEach((button) => {
    button.addEventListener('click', () => {
      const isInvalid = button.dataset.preview === 'invalid';
      status.classList.toggle('is-error', isInvalid);
      status.textContent = isInvalid
        ? 'Preview validation: Add your name, one way to reach you, and a message.'
        : 'Preview only — Thanks, your test inquiry was received. No information was sent or saved.';
    });
  });
}
