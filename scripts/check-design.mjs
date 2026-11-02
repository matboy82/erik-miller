import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, relative } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'apps/web/dist');
const files = [];
function collect(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) collect(path);
    else if (entry.name.endsWith('.html') && entry.name !== '404.html') files.push(path);
  }
}
collect(output);
const textOf = (html) => html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '').replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]*>/g, ' ');
for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const name = relative(output, file);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `${name}: one page heading`);
  assert.equal((html.match(/class="review-badge"/g) ?? []).length, 1, `${name}: one review badge`);
  assert.match(html, /class="hero-image"/, `${name}: photo hero`);
  assert.match(html, /class="site-header"/, `${name}: header`);
  assert.match(html, /class="site-footer"/, `${name}: footer`);
  assert.match(html, /name="robots" content="noindex, nofollow"/, `${name}: noindex`);
  assert.doesNotMatch(textOf(html), /DRAFT|pending approval|not approved|Development stock|Draft prompt|licensed stock|site-map|MR-06/i, `${name}: no internal scaffolding`);
  for (const [, value] of html.matchAll(/aria-(?:labelledby|describedby)="([^"]+)"/g)) {
    for (const id of value.split(/\s+/)) assert.ok(html.includes(`id="${id}"`), `${name}: missing accessible reference ${id}`);
  }
  assert.doesNotMatch(textOf(html), /\[[^\]]+\]/, `${name}: visible placeholder`);
  for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
    if (!href.startsWith('/') && !href.startsWith('#')) continue;
    const url = new URL(href, `http://localhost/${name.replaceAll('\\', '/').replace(/index\.html$/, '')}`);
    const target = resolve(output, `.${url.pathname}`, url.pathname.endsWith('/') ? 'index.html' : '');
    assert.ok(existsSync(target), `${name}: broken link ${href}`);
    if (url.hash) assert.ok(readFileSync(target, 'utf8').includes(`id="${url.hash.slice(1)}"`), `${name}: broken anchor ${href}`);
  }
}
const home = readFileSync(resolve(output, 'index.html'), 'utf8');
assert.equal((home.match(/class="service-card reveal"/g) ?? []).length, 6);
assert.equal((home.match(/class="step-number"/g) ?? []).length, 5);
assert.equal((home.match(/class="review-card reveal"/g) ?? []).length, 0, 'no invented social proof');
assert.match(home, /Meet Erik/);
assert.match(home, /hero-datum/);
assert.doesNotMatch(home, /font-family:[^;}]*Fraunces/);
assert.ok(Buffer.byteLength(home) < 200_000, 'homepage HTML budget');
assert.match(home, /Design is a paid phase/);
assert.ok(!existsSync(resolve(output, 'portfolio/index.html')), 'portfolio is hidden');
assert.ok(!existsSync(resolve(output, 'service-areas/kuna/index.html')), 'Kuna page is hidden');
assert.doesNotMatch(home, /href="\/portfolio\//);
console.log(`Design checks passed: ${files.length} pages and hidden routes.`);
