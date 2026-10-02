import { appendFileSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

export function planDeployment(env, event) {
  if (env.ENABLE_TEST_DEPLOYS !== 'true' || env.VERIFY_RESULT !== 'success') throw new Error('Deployment not authorized.');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(env.PAGES_PROJECT ?? '')
    || !/^[\w.-]+\/[\w.-]+$/.test(env.GITHUB_REPOSITORY ?? '') || !/^[a-f0-9]{40}$/.test(env.GITHUB_SHA ?? '')) {
    throw new Error('Invalid deployment configuration.');
  }
  const plan = { project: env.PAGES_PROJECT, sha: env.GITHUB_SHA };
  if (env.GITHUB_EVENT_NAME === 'push' && env.GITHUB_REF === 'refs/heads/main') return { branch: 'main', worker: true, ...plan };
  const pr = event.pull_request;
  if (env.GITHUB_EVENT_NAME === 'pull_request' && pr?.head?.repo?.full_name === env.GITHUB_REPOSITORY
    && pr?.base?.repo?.full_name === env.GITHUB_REPOSITORY && Number.isSafeInteger(event.number) && event.number > 0
    && env.GITHUB_REF === `refs/pull/${event.number}/merge`) return { branch: `pr-${event.number}`, worker: false, ...plan };
  throw new Error('Deployment not authorized for this event.');
}

export async function assertCurrentMain(env, fetchResponse = globalThis.fetch) {
  const response = await fetchResponse(`https://api.github.com/repos/${env.GITHUB_REPOSITORY}/git/ref/heads/main`, {
    headers: { Authorization: `Bearer ${env.GITHUB_TOKEN}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
    redirect: 'error', signal: globalThis.AbortSignal.timeout(15000),
  });
  if (response.status !== 200) throw new Error('Cannot confirm main revision.');
  if ((await response.json()).object?.sha !== env.GITHUB_SHA) throw new Error('Refusing stale main revision.');
}

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

function wrangler(args, cwd) {
  const result = spawnSync(process.execPath, [resolve('node_modules/wrangler/bin/wrangler.js'), ...args], {
    cwd, encoding: 'utf8', timeout: 300000, maxBuffer: 4 * 1024 * 1024,
    env: { ...process.env, CI: 'true', WRANGLER_SEND_METRICS: 'false', WRANGLER_LOG_SANITIZE: 'true' },
  });
  // Raw CLI output remains in memory; summaries never retain it or credential values.
  if (result.error || result.status !== 0) throw new Error('Wrangler test publication failed.');
  return result.stdout;
}
function deploymentUrl(output, kind, project) {
  for (const value of output.match(/https:\/\/[a-z0-9.-]+/g) ?? []) {
    try { return testUrl(value, kind, project); } catch { /* Ignore unrelated CLI links. */ }
  }
  throw new Error('Publication completed without an identifiable test URL.');
}
async function runDeployment() {
  let stage = 'preflight';
  const notes = [];
  try {
    const env = process.env;
    const event = JSON.parse(readFileSync(env.GITHUB_EVENT_PATH, 'utf8'));
    const plan = planDeployment(env, event);
    if (!env.CLOUDFLARE_API_TOKEN || !/^[a-f0-9]{32}$/.test(env.CLOUDFLARE_ACCOUNT_ID ?? '') || !env.GITHUB_TOKEN) throw new Error('Missing deployment credentials.');
    const checkout = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' });
    if (checkout.status !== 0 || checkout.stdout.trim() !== plan.sha) throw new Error('Checkout differs from verified revision.');
    verifyReviewArtifact('apps/web/dist', [env.CLOUDFLARE_API_TOKEN, env.CLOUDFLARE_ACCOUNT_ID, env.GITHUB_TOKEN]);
    notes.push(`Tested revision: ${plan.sha}`, `PR head: ${event.pull_request?.head?.sha ?? 'not applicable'}`);
    if (plan.worker) await assertCurrentMain(env);
    stage = 'Pages publication';
    const pagesOutput = wrangler(['pages', 'deploy', 'apps/web/dist', '--project-name', plan.project, '--branch', plan.branch, '--commit-hash', plan.sha], process.cwd());
    const uniqueUrl = deploymentUrl(pagesOutput, 'pages', plan.project);
    notes.push(`Pages published: ${uniqueUrl}`);
    stage = 'Pages live checks';
    await verifyLiveSite(uniqueUrl, plan.project);
    if (plan.worker) await verifyLiveSite(`https://${plan.project}.pages.dev`, plan.project);
    notes.push('Pages live checks passed.');
    if (plan.worker) {
      await assertCurrentMain(env);
      stage = 'Worker publication';
      const workerOutput = wrangler(['deploy', '--name', 'erik-miller'], 'apps/worker');
      const workerUrl = deploymentUrl(workerOutput, 'worker');
      notes.push(`Worker published: ${workerUrl}`);
      stage = 'Worker live check';
      await verifyLiveWorker(workerUrl);
      notes.push('Worker live health passed.');
    } else notes.push('Worker deployment skipped for PR.');
    if (plan.worker) notes.push(`Persistent site: https://${plan.project}.pages.dev`);
    notes.push(`Pages branch: ${plan.branch}`);
  } catch {
    notes.push(`Test deployment failed at ${stage}; previously published resources may remain. Disable test deployments and inspect sanitized evidence before recovery.`);
    process.exitCode = 1;
  } finally {
    const summary = notes.join('\n');
    console.log(summary);
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await runDeployment();
