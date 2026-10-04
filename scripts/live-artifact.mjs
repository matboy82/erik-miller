import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export function verifyLive(output, { indexed }) {
  const files = [];
  function walk(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) throw Error('Live output cannot contain symbolic links.');
      const path = join(directory, entry.name);
      if (entry.isDirectory()) walk(path); else files.push(path);
    }
  }
  walk(output);
  const pages = files.filter(path => path.endsWith('.html'));
  if (pages.length !== 17) throw Error('Live output must include all 17 website routes.');
  for (const file of files.filter(path => /\.(html|js|css|json|map|txt|xml)$/.test(path))) {
    const text = readFileSync(file, 'utf8');
    if (/JOBTREAD_API_KEY|GOOGLE_CLIENT_SECRET|GOOGLE_TOKEN_ENCRYPTION_KEY|grantKey/.test(text)) throw Error('Server credential code found in public output.');
    if (file.endsWith('.html')) {
      if (text.includes('REVIEW BUILD')) throw Error('Review badge found in live output.');
      if (!indexed && !/<meta\s+name="robots"\s+content="noindex, nofollow"/.test(text)) throw Error('Unindexed live page is missing its robots control.');
    }
  }
  const robots = readFileSync(join(output, 'robots.txt'), 'utf8');
  const headers = readFileSync(join(output, '_headers'), 'utf8');
  if (!indexed && (!robots.includes('Disallow: /') || !headers.includes('X-Robots-Tag: noindex, nofollow'))) throw Error('Unindexed live hosting requires crawler and response-header controls.');
  if (indexed && headers.split('/qualify/*')[0].includes('X-Robots-Tag: noindex')) throw Error('Indexed live hosting cannot send a site-wide noindex header.');
}
