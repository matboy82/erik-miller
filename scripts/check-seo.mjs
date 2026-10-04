import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { createRequire } from 'node:module';
import { Buffer } from 'node:buffer';
import { siteOrigin } from './site-seo.mjs';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'apps/web/dist');
const sharp = createRequire(import.meta.url)('sharp');
const files = [];
function walk(dir) { for (const entry of readdirSync(dir, { withFileTypes: true })) {
  const file = resolve(dir, entry.name); if (entry.isDirectory()) walk(file); else if (entry.name === 'index.html') files.push(file);
} }
walk(output);
assert.equal(files.length, 17);
const titles = new Set(); const descriptions = new Set(); const urls = [];
for (const file of files) {
  const path = '/' + relative(output, file).replaceAll('\\', '/').replace(/index.html$/, '');
  const html = readFileSync(file, 'utf8');
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
  const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  assert.ok(title?.includes('Miller Remodeling') && /Treasure Valley|Idaho/.test(title), `${path}: keyword-bearing title`);
  assert.ok(description && !/concept|demo|placeholder/i.test(description), `${path}: substantive description`);
  assert.ok(!titles.has(title) && !descriptions.has(description), `${path}: unique metadata`);
  titles.add(title); descriptions.add(description);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  const expected = `${siteOrigin}${path}`;
  if (path !== '/qualify/') {
    assert.equal((html.match(/rel="canonical"/g) ?? []).length, 1);
    assert.ok(html.includes(`rel="canonical" href="${expected}"`));
    urls.push(expected);
  } else assert.doesNotMatch(html, /rel="canonical"/);
  assert.ok(html.includes(`property="og:url" content="${expected}"`));
  for (const key of ['og:title', 'og:description', 'og:image', 'og:image:alt']) assert.ok(html.includes(`property="${key}"`));
  for (const key of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) assert.ok(html.includes(`name="${key}"`));
  const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] ?? 'null');
  assert.equal(graph?.['@context'], 'https://schema.org');
  const faq = graph['@graph'].find(n => n['@type'] === 'FAQPage');
  if (faq) for (const question of faq.mainEntity) {
    const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '').replaceAll('&#39;', "'").replaceAll('&#x27;', "'");
    assert.ok(visible.includes(question.name) && visible.includes(question.acceptedAnswer.text), `${path}: FAQ matches visible copy`);
  }
  const image = html.match(/property="og:image" content="([^"]+)"/)?.[1];
  const imageFile = resolve(output, '.' + new URL(image).pathname);
  const dimensions = await sharp(imageFile).metadata();
  assert.equal(dimensions.width, 1200); assert.equal(dimensions.height, 630); assert.equal(dimensions.format, 'jpeg');
  assert.ok(statSync(imageFile).size < 250_000);
  assert.ok(Buffer.byteLength(html) < 200_000, `${path}: HTML budget`);
}
const sitemap = readFileSync(resolve(output, 'sitemap.xml'), 'utf8');
const llms = readFileSync(resolve(output, 'llms.txt'), 'utf8');
for (const url of urls) { assert.ok(sitemap.includes(`<loc>${url}</loc>`)); assert.ok(llms.includes(`](${url})`)); }
assert.doesNotMatch(sitemap, /qualify|404|workers\.dev|pages\.dev/);
const errorPage = readFileSync(resolve(output, '404.html'), 'utf8');
assert.match(errorPage, /noindex, nofollow/); assert.doesNotMatch(errorPage, /rel="canonical"/);
const home = readFileSync(resolve(output, 'index.html'), 'utf8');
const words = home.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/g, '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
assert.ok(words >= 300, 'homepage copy floor');
console.log(JSON.stringify({ routes: files.length, metadataAndSchema: 'passed', socialImages: 'passed', homeWords: words, homeHtmlBytes: Buffer.byteLength(home), errorDocument: 'passed' }));
