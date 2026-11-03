import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

export function verifyLive(output, { indexed, paths, currentImageryApproved = false }) {
  const files = [];
  function walk(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) throw Error('Live output cannot contain symbolic links.');
      const path = join(directory, entry.name);
      if (entry.isDirectory()) walk(path); else files.push(path);
    }
  }
  walk(output);
  const pages = files.filter(path => path.endsWith('.html') && !path.endsWith('404.html'));
  if (!Array.isArray(paths) || !paths.length || new Set(paths).size !== paths.length) throw Error('Expected live routes are missing or duplicated.');
  const actual = pages.map((file) => `/${relative(output, file).replaceAll('\\', '/').replace(/index\.html$/, '')}`).sort();
  const expected = [...paths].sort();
  if (actual.length !== expected.length || actual.some((path, index) => path !== expected[index])) throw Error('Live output routes do not match the active website routes.');
  for (const file of files.filter(path => /\.(html|js|css|json|map|txt|xml)$/.test(path))) {
    const text = readFileSync(file, 'utf8');
    if (/JOBTREAD_API_KEY|GOOGLE_CLIENT_SECRET|GOOGLE_TOKEN_ENCRYPTION_KEY|grantKey/.test(text)) throw Error('Server credential code found in public output.');
    if (file.endsWith('.html')) {
      if (text.includes('REVIEW BUILD')) throw Error('Review badge found in live output.');
      if (!indexed && !/<meta\s+name="robots"\s+content="noindex, nofollow"/.test(text)) throw Error('Unindexed live page is missing its robots control.');
      if (indexed) {
        if (!currentImageryApproved && /\/_astro\/stock-[^" ]+/.test(text)) throw Error('Stock photography blocks the business launch until current imagery is approved.');
        const visible = text.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/g, '').replace(/<[^>]+>/g, ' ');
        if (/\[[^\]]+\]/.test(visible)) throw Error('Unresolved business facts block the business launch.');
      }
    }
  }
  const robots = readFileSync(join(output, 'robots.txt'), 'utf8');
  const headers = readFileSync(join(output, '_headers'), 'utf8');
  if (!indexed && (!robots.includes('Disallow: /') || !headers.includes('X-Robots-Tag: noindex, nofollow'))) throw Error('Unindexed live hosting requires crawler and response-header controls.');
  const wildcardHeaders = headers.match(/^\/\*\r?\n((?:[ \t]+[^\n]*(?:\n|$))*)/m)?.[1] ?? '';
  if (indexed && /^\s*X-Robots-Tag:\s*.*\bnoindex\b/im.test(wildcardHeaders)) throw Error('Indexed live hosting cannot send a site-wide noindex header.');
}
