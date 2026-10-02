import assert from 'node:assert/strict';
import test from 'node:test';
import { initializeContactPreview } from '../../apps/web/src/scripts/contact-preview.js';

function fixture() {
  const buttons = ['success', 'invalid'].map((preview) => ({
    dataset: { preview },
    listeners: {},
    addEventListener(name, handler) { this.listeners[name] = handler; },
    click() { this.listeners.click(); },
  }));
  const classes = new Set();
  const status = {
    textContent: '',
    classList: { toggle(name, enabled) {
      if (enabled) classes.add(name);
      else classes.delete(name);
    } },
    hasClass(name) { return classes.has(name); },
  };
  const preview = { querySelectorAll: () => buttons };
  const document = { querySelector: (selector) => selector === '#contact-preview' ? preview : status };
  return { buttons, status, document };
}

test('contact preview announces its local-only success and validation examples', () => {
  const { buttons, status, document } = fixture();
  initializeContactPreview(document);

  buttons[0].click();
  assert.equal(status.textContent, 'Preview only — Thanks, your test inquiry was received. No information was sent or saved.');
  assert.equal(status.hasClass('is-error'), false);

  buttons[1].click();
  assert.equal(status.textContent, 'Preview validation: Add your name, one way to reach you, and a message.');
  assert.equal(status.hasClass('is-error'), true);

  buttons[0].click();
  assert.equal(status.hasClass('is-error'), false);
});

test('contact preview is inert when its review controls are absent', () => {
  assert.doesNotThrow(() => initializeContactPreview({ querySelector: () => null }));
});
