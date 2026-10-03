import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, relative } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'apps/web/dist');
const files = [];
function collect(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) collect(path);
    else if (entry.name.endsWith('.html')) files.push(path);
  }
}
collect(output);
const textOf = (html) => html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '').replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]*>/g, ' ');
const facts = readFileSync(resolve(root, 'erik-facts.md'), 'utf8');
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
  for (const match of textOf(html).matchAll(/\[([^\]]+)\]/g)) assert.ok(facts.includes(`[${match[1]}]`), `${name}: unregistered fact ${match[0]}`);
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
assert.equal((home.match(/class="review-card reveal"/g) ?? []).length, 3);
assert.match(home, /Design is a paid phase/);
const portfolio = readFileSync(resolve(output, 'portfolio/index.html'), 'utf8');
for (const heading of ['The challenge', 'The design', 'The result']) assert.ok(portfolio.includes(heading));
assert.equal((portfolio.match(/class="upcoming-card reveal"/g) ?? []).length, 6);
for (const slot of ['before-after', 'video-slot', 'homeowner-quote']) assert.ok(portfolio.includes(slot));
console.log(`Design checks passed: ${files.length} pages, all local links and anchors, registered facts, homepage sections, and portfolio slots.`);
