import { readdirSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, relative } from 'node:path';
import { brandCss } from './brand-build.mjs';
import { copy, taglines } from '../apps/web/src/content/brand.ts';
import { verifyProjectArtifacts } from './project-artifact.mjs';

const repository = resolve(import.meta.dirname, '..');
const decode = (text) => text.replace(/\\u([\da-f]{4})/gi, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)))
  .replaceAll('&amp;', '&').replaceAll('&#39;', "'").replaceAll('&#x27;', "'").replaceAll('&apos;', "'").replaceAll('&quot;', '"').replaceAll('&gt;', '>').replaceAll('&lt;', '<');

export function verifyProduction(directory, direction, { copyDirection = direction, taglineId = 'default', projectArtifacts } = {}) {
  if (!Object.hasOwn(copy, direction) || !Object.hasOwn(copy, copyDirection) || !(taglineId === 'default' || Object.hasOwn(taglines, taglineId))) throw Error('Invalid verification selection.');
  const files = [];
  function visit(path) {
    for (const entry of readdirSync(path, { withFileTypes: true })) {
      const file = resolve(path, entry.name);
      if (entry.isSymbolicLink()) throw Error('Production output contains a symlink.');
      if (entry.isDirectory()) visit(file);
      else {
        const bytes = readFileSync(file);
        files.push({ path: relative(directory, file), bytes, sha256: createHash('sha256').update(bytes).digest('hex') });
      }
    }
  }
  visit(directory);
  // Text keeps its strict boundary; binary project assets require source-derived ownership.
  for (const file of files) {
    const textual = /\.(html|css|js|json|map|txt|xml|webmanifest)$/.test(file.path) || ['_headers', '_redirects'].includes(file.path);
    if (!textual && !projectArtifacts) throw Error(`Unexpected shipped asset: ${file.path}`);
    if (textual && file.bytes.includes(0)) throw Error(`Unexpected binary payload: ${file.path}`);
  }
  const output = decode(files.filter((file) => /\.(html|css|js|json|map|txt|xml|webmanifest)$/.test(file.path) || ['_headers', '_redirects'].includes(file.path)).map((file) => file.bytes.toString('utf8')).join('\n'));
  if (!output.includes('<html') || /data-design-review|review-toolbar|review-theme|review-copy|review-tagline|data-theme|miller-design-review|localStorage|sessionStorage/.test(output)) throw Error('Production includes review controls, theme switching, or no rendered page.');
  const css = brandCss(repository, { review: false, direction });
  const selectedTokens = [...css.matchAll(/(--brand-[\w-]+):\s*([^;]+);/g)];
  for (const [ , key, value] of selectedTokens) {
    if (!new RegExp(`${key}:\\s*${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i').test(output)) throw Error(`Missing selected token ${key}.`);
  }
  for (const candidate of ['A', 'B', 'C']) {
    if (candidate === direction) continue;
    const alternate = brandCss(repository, { review: false, direction: candidate });
    for (const [, key, value] of alternate.matchAll(/(--brand-[\w-]+):\s*([^;]+);/g)) {
      if (!selectedTokens.some(([, own, ownValue]) => own === key && ownValue === value) && new RegExp(`${key}:\\s*${value}`, 'i').test(output)) throw Error(`Unexpected token set ${candidate}.`);
      if (!selectedTokens.some(([, own]) => own === key) && new RegExp(`${key}(?![\\w-])`).test(output)) throw Error(`Unexpected token set ${candidate}.`);
    }
  }
  const expected = { ...copy[copyDirection], tagline: taglineId === 'default' ? copy[copyDirection].tagline : taglines[taglineId] };
  for (const [field, text] of Object.entries(expected)) {
    const element = new RegExp(`<[^>]+data-copy="${field}"[^>]*>([^<]*)<`).exec(output);
    if (!element || element[1] !== text) throw Error(`Selected ${field} does not render exactly.`);
  }
  const allowedCopy = new Set(Object.values(expected));
  for (const text of [...Object.values(copy).flatMap(Object.values), ...Object.values(taglines)]) {
    if (!allowedCopy.has(text) && output.includes(text)) throw Error('Production includes alternative copy.');
  }
  // Compare actual embedded font bytes, not only font-family labels.
  const allowedFonts = [...css.matchAll(/data:font\/woff2;base64,([A-Za-z0-9+/=]+)/g)].map((match) => match[1]);
  const htmlFiles = files.filter((file) => file.path.endsWith('.html'));
  const expectedFonts = [...allowedFonts].sort();
  for (const file of htmlFiles) {
    const pageFonts = [...file.bytes.toString('utf8').matchAll(/data:font\/woff2;base64,([A-Za-z0-9+/=]+)/g)].map((match) => match[1]).sort();
    if (pageFonts.length !== expectedFonts.length || pageFonts.some((font, index) => font !== expectedFonts[index])) throw Error('Production includes incorrect font assets.');
  }
  if (projectArtifacts) verifyProjectArtifacts(files, output, projectArtifacts);
  return files.map(({ path, sha256, bytes }) => ({ path, sha256, size: bytes.length }));
}
