import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import { copy, taglines } from '../../apps/web/src/content/brand.ts';

// Browser-boundary substitute: exercise the shipped script and observable controls/text.
function page(saved = null, unavailable = false, loading = false) {
  const node = (value = '') => ({ value, textContent: '', listeners: {}, addEventListener(name, fn) { this.listeners[name] = fn; } });
  const theme = node('A');
  const content = node('A');
  const tagline = node('default');
  const elements = { '#review-theme': theme, '#review-copy-direction': content, '#review-tagline': tagline, '#review-status': node(),
    '#review-copy': { textContent: JSON.stringify({ copy, taglines }) },
    ...Object.fromEntries(['tagline', 'headline', 'description', 'process'].map((field) => [`[data-copy="${field}"]`, node()])),
  };
  let parsed = !loading;
  const ready = {};
  const document = { readyState: loading ? 'loading' : 'complete', documentElement: { dataset: {} },
    querySelector: (selector) => !parsed && selector.startsWith('[data-copy') ? null : elements[selector],
    addEventListener(name, fn) { ready[name] = fn; } };
  let stored;
  const localStorage = { getItem() { if (unavailable) throw Error('Blocked'); return saved; }, setItem(key, value) { if (unavailable) throw Error('Blocked'); stored = value; } };
  runInNewContext(readFileSync('apps/web/src/scripts/design-review.js', 'utf8'), { document, localStorage });
  return { elements, document, theme, content, tagline, saved: () => JSON.parse(stored ?? 'null'),
    finishParsing() { parsed = true; document.readyState = 'complete'; ready.DOMContentLoaded(); },
    select(control, value) { control.value = value; control.listeners.change(); },
    text: (field) => elements[`[data-copy="${field}"]`].textContent };
}

test('B1 toolbar initialization waits for the hero/process DOM to exist', () => {
  const p = page(null, false, true);
  assert.equal(p.text('headline'), '');
  p.finishParsing();
  assert.equal(p.text('headline'), "Kitchens and baths, designed before they're built.");
  p.select(p.content, 'C');
  assert.equal(p.text('headline'), 'Remodeling, handled.');
});

test('B1 independent hero/process copy, theme resets, and stable tagline choices', () => {
  const p = page();
  assert.equal(p.text('headline'), "Kitchens and baths, designed before they're built.");
  p.select(p.theme, 'B');
  assert.equal(p.document.documentElement.dataset.theme, 'B');
  assert.equal(p.text('process'), 'Five steps. Zero surprises.');
  p.select(p.content, 'C');
  assert.equal(p.theme.value, 'B');
  assert.equal(p.text('headline'), 'Remodeling, handled.');
  p.select(p.tagline, 'paper-first');
  assert.equal(p.text('tagline'), 'The remodel starts on paper — not in your kitchen.');
  assert.equal(p.text('headline'), 'Remodeling, handled.');
  assert.deepEqual(p.saved(), { theme: 'B', copyDirection: 'C', taglineId: 'paper-first' });
  p.select(p.content, 'B');
  assert.equal(p.tagline.value, 'default');
  assert.equal(p.text('tagline'), 'See it before we build it.');
  p.select(p.tagline, 'calmer');
  p.select(p.theme, 'A');
  assert.equal(p.content.value, 'A');
  assert.equal(p.tagline.value, 'default');
  assert.match(p.elements['#review-status'].textContent, /Direction A.*Copy A.*Draft/);
});

test('B1 reload, legacy values, malformed and unavailable storage', () => {
  const p = page(JSON.stringify({ theme: 'C', copyDirection: 'B', taglineId: 'designed-first' }));
  assert.equal(p.theme.value, 'C');
  assert.equal(p.text('headline'), 'The design-build remodeler for the Treasure Valley.');
  assert.equal(p.text('tagline'), 'Designed first. Built right.');
  const legacy = page(JSON.stringify({ theme: 'B', tagline: 'A calmer way to remodel.' }));
  assert.equal(legacy.content.value, 'B');
  assert.equal(legacy.tagline.value, 'calmer');
  for (const value of [null, '{broken', '42', '"C"', '[]', JSON.stringify({ theme: 'X', copyDirection: 'C', taglineId: 'calmer' })]) {
    const fallback = page(value);
    assert.equal(fallback.theme.value, 'A');
    assert.equal(fallback.content.value, 'A');
    assert.equal(fallback.text('tagline'), 'Designed first. Built right.');
  }
  const blocked = page(null, true);
  blocked.select(blocked.theme, 'C');
  assert.equal(blocked.text('headline'), 'Remodeling, handled.');
  const invalid = page(JSON.stringify({ theme: 'B', copyDirection: 'X', taglineId: '<script>' }));
  assert.equal(invalid.content.value, 'B');
  assert.equal(invalid.tagline.value, 'default');
});

test('B1 every exposed copy and tagline choice retains the independent visual theme', () => {
  const expected = { A: "Kitchens and baths, designed before they're built.", B: 'The design-build remodeler for the Treasure Valley.', C: 'Remodeling, handled.' };
  const candidates = {
    'designed-first': 'Designed first. Built right.', 'see-it': 'See it before we build it.',
    'one-process': '25 years. One process. Zero surprises.', 'your-life': 'Kitchens and baths, designed around your life.',
    'paper-first': 'The remodel starts on paper — not in your kitchen.', calmer: 'A calmer way to remodel.',
  };
  for (const visual of ['A', 'B', 'C']) for (const direction of ['A', 'B', 'C']) {
    const p = page();
    p.select(p.theme, visual); p.select(p.content, direction);
    assert.equal(p.document.documentElement.dataset.theme, visual);
    assert.equal(p.text('headline'), expected[direction]);
    for (const [id, text] of Object.entries(candidates)) {
      p.select(p.tagline, id);
      assert.equal(p.text('tagline'), text);
      assert.equal(p.text('headline'), expected[direction]);
    }
  }
});
