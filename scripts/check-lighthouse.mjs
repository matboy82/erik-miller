import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

try {
  const directory = process.argv[2] ?? '.lighthouseci';
  const files = readdirSync(directory).filter((name) => /^lhr-\d+\.json$/.test(name));
  if (files.length !== 3) throw new Error('Expected exactly three Lighthouse reports.');
  const reports = files.map((name) => JSON.parse(readFileSync(join(directory, name), 'utf8')));
  const validPage = (value) => {
    const url = new URL(value);
    return url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname)
      && url.pathname === '/' && !url.search && !url.hash && !url.username && !url.password;
  };
  for (const report of reports) {
    if (!validPage(report.requestedUrl) || !validPage(report.finalDisplayedUrl ?? report.finalUrl)
      || report.runtimeError || report.configSettings?.formFactor !== 'mobile') {
      throw new Error('Invalid Lighthouse page or mobile settings.');
    }
    const lcp = report.audits?.['largest-contentful-paint']?.numericValue;
    if (typeof lcp !== 'number' || !Number.isFinite(lcp) || lcp < 0) throw new Error('Invalid LCP report.');
    for (const name of ['performance', 'accessibility', 'best-practices']) {
      const score = report.categories?.[name]?.score;
      if (typeof score !== 'number' || !Number.isFinite(score) || score < 0 || score > 1) {
        throw new Error('Incomplete Lighthouse category report.');
      }
    }
  }
  if (new Set(reports.map((r) => r.requestedUrl)).size !== 1) throw new Error('Reports must measure the same page.');
  for (const name of ['performance', 'accessibility', 'best-practices']) {
    if (Math.max(...reports.map((r) => r.categories[name].score)) < 0.9) throw new Error('Required mobile category score below 90.');
  }
  const lcp = Math.min(...reports.map((r) => r.audits['largest-contentful-paint'].numericValue));
  if (lcp >= 2500) throw new Error('LCP must be strictly below 2500 ms.');
  console.log(`Strict mobile gate passed: 3 reports, optimistic LCP ${lcp} ms < 2500 ms.`);
} catch {
  // Never retain raw reports or parser errors in command diagnostics.
  console.error('Strict mobile gate failed: expected three valid same-page mobile reports, category scores >=90, and LCP strictly below 2500 ms.');
  process.exitCode = 1;
}
