import { createHash } from 'node:crypto';
import { readFileSync, realpathSync, mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, isAbsolute, resolve, sep } from 'node:path';
import { copy, taglines, reviewInitialDirection } from '../apps/web/src/content/brand.ts';

// Only the disposable source-fixture runner changes this constant in its copied source.
const verificationOnly = false;
const directions = ['A', 'B', 'C'];
const keys = ['version', 'direction', 'copyDirection', 'taglineId', 'approvedBy', 'approvedOn', 'adr'];
const choiceKeys = keys.filter((key) => key !== 'adr');

function containedFile(root, name, boundary) {
  if (typeof name !== 'string' || isAbsolute(name) || name.includes('\\') || name.split('/').includes('..')) throw Error('Invalid approval path.');
  const directory = realpathSync(resolve(root, boundary));
  if (!directory.startsWith(realpathSync(root) + sep)) throw Error('Approval directory escapes its repository.');
  const file = realpathSync(resolve(root, name));
  if (!file.startsWith(directory + sep)) throw Error('Approval path escapes its boundary.');
  return file;
}

export function readBrandLock(root) {
  let lock;
  try { lock = JSON.parse(readFileSync(containedFile(root, 'docs/brand/brand-lock.json', 'docs/brand'), 'utf8')); } catch { throw Error('Production requires a valid canonical brand lock.'); }
  if (!lock || Array.isArray(lock) || Object.keys(lock).length !== keys.length || !keys.every((key) => Object.hasOwn(lock, key))
    || lock.version !== 1 || !directions.includes(lock.direction) || !directions.includes(lock.copyDirection)
    || typeof lock.taglineId !== 'string' || !(lock.taglineId === 'default' || Object.hasOwn(taglines, lock.taglineId)) || lock.approvedBy !== 'Erik Miller'
    || typeof lock.approvedOn !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(lock.approvedOn)
    || !Number.isFinite(Date.parse(lock.approvedOn)) || new Date(lock.approvedOn).toISOString().slice(0, 10) !== lock.approvedOn) {
    throw Error('Invalid version-1 brand lock schema or selection.');
  }
  const adrPath = containedFile(root, lock.adr, 'docs/architecture/decisions');
  const adr = readFileSync(adrPath, 'utf8');
  const status = adr.match(/^\*\*Status\*\*: ([^\r\n]+)/m)?.[1]?.trim();
  if (status !== 'Accepted') throw Error('Brand choice ADR must be Accepted.');
  if (/^\*\*Verification only\*\*: true\s*$/m.test(adr) && !verificationOnly) throw Error('A synthetic fixture cannot approve production.');
  const blocks = [...adr.matchAll(/^```brand-choice\s*\n([\s\S]*?)^```\s*$/gm)];
  let choice;
  try { if (blocks.length !== 1) throw Error(); choice = JSON.parse(blocks[0][1]); } catch { throw Error('ADR needs one valid structured brand-choice block.'); }
  if (!choice || Object.keys(choice).length !== choiceKeys.length + 1 || !choiceKeys.every((key) => choice[key] === lock[key])) throw Error('Brand lock and ADR choice must match exactly.');
  let evidence;
  try { evidence = containedFile(root, choice.approvalEvidence, 'docs/brand'); } catch { throw Error('Brand approval evidence is missing or outside docs/brand.'); }
  const notes = [...adr.matchAll(/^\*\*Approval recorded\*\*: Erik Miller, (\d{4}-\d{2}-\d{2})[^\n]*?\[[^\]]+\]\(([^)]+)\)/gm)];
  if (!notes.some((note) => note[1] === lock.approvedOn && resolve(dirname(adrPath), note[2]) === evidence)
    || readFileSync(evidence, 'utf8').trim().length === 0) throw Error('ADR needs a dated linked Erik approval note and nonempty evidence.');
  return lock;
}

export function resolveBuild(root, env = process.env) {
  const mode = env.SITE_BUILD ?? 'review';
  if (!['review', 'live', 'production'].includes(mode)) throw Error('Unknown site build mode.');
  if (env.BRAND_DIRECTION !== undefined || env.BRAND_LOCK_PATH !== undefined || env.BRAND_LOCK !== undefined) throw Error('Brand environment overrides are forbidden.');
  const review = mode === 'review';
  // Live hosting uses the current design while Erik's content review continues.
  // It does not manufacture an approval in the historical brand-lock workflow.
  const live = mode === 'live';
  const indexed = mode === 'production' || (live && env.PUBLIC_INDEXING_ENABLED === 'true');
  const choice = review || live ? { direction: reviewInitialDirection, copyDirection: reviewInitialDirection, taglineId: 'default' } : readBrandLock(root);
  const content = { ...copy[choice.copyDirection], tagline: choice.taglineId === 'default' ? copy[choice.copyDirection].tagline : taglines[choice.taglineId] };
  return { review, live, indexed, direction: choice.direction, copyDirection: choice.copyDirection, taglineId: choice.taglineId, content };
}

export function brandFonts(build) {
  const fonts = { A: 'newsreader', B: 'archivo', C: 'newsreader' };
  const selected = build.review ? directions : [build.direction];
  const require = createRequire(import.meta.url);
  return [...new Set(['archivo', ...selected.map(direction => fonts[direction])])].map(font => {
    const file = require.resolve(`@fontsource/${font}/latin-400.css`);
    const css = readFileSync(file, 'utf8');
    const asset = /url\(([^)]+\.woff2)\) format\('woff2'\)/.exec(css)?.[1];
    if (!asset) throw Error('Missing self-hosted font.');
    const bytes = readFileSync(resolve(dirname(file), asset.replaceAll("'", '')));
    const name = `${font}-latin-400-${createHash('sha256').update(bytes).digest('hex').slice(0, 12)}.woff2`;
    return { css, bytes, name };
  });
}

export function writeBrandFonts(output, build) {
  mkdirSync(resolve(output, 'fonts'), { recursive: true });
  for (const { name, bytes } of brandFonts(build)) writeFileSync(resolve(output, 'fonts', name), bytes);
}

export function brandCss(root, build, { externalFonts = false } = {}) {
  const files = { A: 'tokens.css', B: 'direction-b.css', C: 'direction-c.css' };
  const selected = build.review ? directions : [build.direction];
  const tokens = selected.map((direction) => {
    const css = readFileSync(resolve(root, 'apps/web/src/styles', files[direction]), 'utf8');
    return build.review && direction !== 'A' ? css.replace(':root', `:root[data-theme="${direction}"]`) : css;
  }).join('\n');
  const fontCss = brandFonts(build).map(({ css, bytes, name }) => {
    const url = externalFonts ? `/fonts/${name}` : `data:font/woff2;base64,${bytes.toString('base64')}`;
    return css.replace(/src:[^;]+;/, `src: url(${url}) format('woff2');`);
  }).join('\n');
  return tokens + fontCss;
}

