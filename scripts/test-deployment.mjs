// Read-only artifact and HTTP checks; Cloudflare Git integration owns publication.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

function hasNoindex(value) { return /(?:^|[\s,;])noindex(?:$|[\s,;])/i.test(value ?? ''); }
function noindexMeta(html) {
  return (html.replace(/<!--[\s\S]*?-->/g, '').match(/<meta\s[^>]*>/gi) ?? []).some((tag) => {
    const name = tag.match(/\bname\s*=\s*["']([^"']+)["']/i)?.[1];
    const content = tag.match(/\bcontent\s*=\s*["']([^"']+)["']/i)?.[1];
    return name?.toLowerCase() === 'robots' && hasNoindex(content);
  });
}
function disallowsRobots(text) {
  const groups = text.replace(/#[^\n]*/g, '').split(/(?=^User-agent:)/im);
  return groups.some((group) => /^User-agent:\s*\*\s*$/im.test(group) && /^Disallow:\s*\/\s*$/im.test(group)
    && !/^Allow:\s*\//im.test(group));
}
export function verifyReviewArtifact(directory, credentials) {
  const html = readFileSync(join(directory, 'index.html'), 'utf8');
  const headers = readFileSync(join(directory, '_headers'), 'utf8');
  const wildcard = headers.match(/^\/\*\r?\n((?:[ \t]+[^\n]*(?:\n|$))*)/m)?.[1] ?? '';
  if (!noindexMeta(html) || !disallowsRobots(readFileSync(join(directory, 'robots.txt'), 'utf8'))
    || !hasNoindex(wildcard.match(/^\s+X-Robots-Tag:\s*(.+)$/im)?.[1])) throw new Error('Review noindex controls missing.');
  const scan = (path) => {
    for (const entry of readdirSync(path, { withFileTypes: true })) {
      const file = join(path, entry.name);
      if (entry.isSymbolicLink()) throw new Error('Symlink in published artifact.');
      if (entry.isDirectory()) scan(file);
      else {
        const bytes = readFileSync(file);
        if (credentials.some((value) => value && bytes.includes(value))) throw new Error('Published artifact contains credential material.');
      }
    }
  };
  scan(directory);
}
function testUrl(value, kind, project) {
  const url = new URL(value);
  const validHost = kind === 'pages'
    ? url.hostname === `${project}.pages.dev` || /^[a-z0-9-]+$/.test(url.hostname.split('.')[0]) && url.hostname.endsWith(`.${project}.pages.dev`)
    : /^erik-miller\.[a-z0-9-]+\.workers\.dev$/.test(url.hostname);
  if (url.protocol !== 'https:' || !validHost || url.port || url.username || url.password || url.search || url.hash || url.pathname !== '/') {
    throw new Error('Invalid test deployment URL.');
  }
  return url.origin;
}
const requestOptions = () => ({ redirect: 'error', signal: globalThis.AbortSignal.timeout(20000) });
export async function verifyLiveSite(value, project, fetchResponse = globalThis.fetch) {
  const url = testUrl(value, 'pages', project);
  const page = await fetchResponse(`${url}/`, requestOptions());
  if (page.status !== 200 || !hasNoindex(page.headers.get('x-robots-tag')) || !noindexMeta(await page.text())) throw new Error('Live site noindex check failed.');
  const robots = await fetchResponse(`${url}/robots.txt`, requestOptions());
  if (robots.status !== 200 || !disallowsRobots(await robots.text()) || !hasNoindex(robots.headers.get('x-robots-tag'))) {
    throw new Error('Live robots check failed.');
  }
}
export async function verifyLiveWorker(value, fetchResponse = globalThis.fetch) {
  const url = testUrl(value, 'worker');
  const health = await fetchResponse(`${url}/health`, requestOptions());
  if (health.status !== 200 || health.headers.get('cache-control') !== 'no-store') throw new Error('Live Worker health check failed.');
  const body = await health.json();
  if (body.status !== 'ok' || body.service !== 'miller-remodeling-intake' || body.stage !== 'scaffold') throw new Error('Live Worker scaffold mismatch.');
}
