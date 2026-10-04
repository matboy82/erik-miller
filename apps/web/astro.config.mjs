import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brandCss, resolveBuild, writeBrandFonts } from '../../scripts/brand-build.mjs';
import { verifyProduction } from '../../scripts/production-artifact.mjs';
import { verifyLive } from '../../scripts/live-artifact.mjs';
import { readProjectContent, contentFile } from '../../scripts/project-content.mjs';
import { prepareProjectArtifacts } from '../../scripts/project-artifact.mjs';
import { readPageContent } from '../../scripts/page-content.mjs';
import { siteOrigin, prepareSocialImages, crawlerOutput, verifyLaunchFacts } from '../../scripts/site-seo.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
let brand;
let project;
let projectArtifacts;
let pageContent;
let publicSiteUrl;
try {
  brand = resolveBuild(root);
  pageContent = await readPageContent(root, { mode: brand.review || brand.live ? 'review' : 'production' });
  if (brand.live && brand.indexed) verifyLaunchFacts();
  if (brand.indexed) {
    const configuredUrl = process.env.PUBLIC_SITE_URL;
    if (!configuredUrl) throw new Error('Production SEO output requires PUBLIC_SITE_URL after the production domain is approved.');
    const parsedUrl = new URL(configuredUrl);
    if (parsedUrl.protocol !== 'https:' || parsedUrl.username || parsedUrl.password || parsedUrl.pathname !== '/' || parsedUrl.search || parsedUrl.hash) {
      throw new Error('PUBLIC_SITE_URL must be an HTTPS origin with no credentials, path, query, or fragment.');
    }
    publicSiteUrl = parsedUrl.origin;
    if (brand.live && publicSiteUrl !== siteOrigin) throw Error('Canonical domain must match site.json.');
  }
  project = await readProjectContent(root);
  if (!brand.review && !brand.live) projectArtifacts = await prepareProjectArtifacts(root, project);
} catch (error) {
  // The output target is fixed inside this web workspace; never retain stale candidates.
  rmSync(resolve(root, 'apps/web/dist'), { recursive: true, force: true });
  throw error;
}

export default defineConfig({
  output: 'static',
  build: { inlineStylesheets: 'always' },
  site: publicSiteUrl ?? siteOrigin,
  trailingSlash: 'always',
  integrations: [react(), {
    name: 'miller-production-gate',
    hooks: { 'astro:build:done': async ({ dir }) => {
      const escapeXml = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
      if (brand.indexed) {
        const headers = readFileSync(resolve(root, 'apps/web/public/_headers'), 'utf8').replace(/^\s+X-Robots-Tag:.*\r?\n/gm, '');
        writeFileSync(resolve(fileURLToPath(dir), '_headers'), headers + '\n/qualify/\n  X-Robots-Tag: noindex, nofollow\n\n/qualify/*\n  X-Robots-Tag: noindex, nofollow\n\n/404.html\n  X-Robots-Tag: noindex, nofollow\n');
      }
      writeFileSync(resolve(fileURLToPath(dir), 'robots.txt'), !brand.indexed
        ? 'User-agent: *\nDisallow: /\n'
        : `User-agent: *\nAllow: /\nSitemap: ${publicSiteUrl}/sitemap.xml\n`);
      if (brand.indexed) {
        try {
          const approvedPages = brand.live ? pageContent : pageContent.filter((page) => page.status === 'approved');
          const urlEntries = approvedPages.map((page) => `  <url><loc>${escapeXml(`${publicSiteUrl}${page.path}`)}</loc></url>`).join('\n');
          const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>\n`;
          writeFileSync(resolve(fileURLToPath(dir), 'sitemap.xml'), sitemap);
          const assistantText = [
            '# Miller Remodeling LLC',
            '',
            '> Source-backed site information. Use only facts present on the linked pages.',
            '',
            ...approvedPages.flatMap((page) => [
              `## ${page.title}`,
              '',
              `${publicSiteUrl}${page.path}`,
              '',
              page.description,
              '',
              page.intro,
              '',
              ...page.sections.flatMap((section) => [`### ${section.heading}`, '', ...section.paragraphs, '']),
              ...(page.processSteps ? ['### Process', '', ...page.processSteps, ''] : []),
            ]),
            ...(project.status === 'approved' ? [
              '## Approved portfolio story',
              '',
              project.title,
              '',
              ...project.paragraphs,
              '',
            ] : []),
          ].join('\n');
          writeFileSync(resolve(fileURLToPath(dir), 'llms.txt'), assistantText);
          if (!brand.live) verifyProduction(fileURLToPath(dir), brand.direction, { ...brand, projectArtifacts });
        } catch (error) {
          rmSync(resolve(root, 'apps/web/dist'), { recursive: true, force: true });
          throw error;
        }
      }
      if (brand.live || brand.review) {
        writeBrandFonts(fileURLToPath(dir), { ...brand, review: false });
        await prepareSocialImages(fileURLToPath(dir), pageContent);
        const crawlers = crawlerOutput(pageContent, brand.indexed);
        writeFileSync(resolve(fileURLToPath(dir), 'robots.txt'), crawlers.robots);
        writeFileSync(resolve(fileURLToPath(dir), 'sitemap.xml'), crawlers.sitemap);
        writeFileSync(resolve(fileURLToPath(dir), 'llms.txt'), crawlers.llms);
      }
      if (brand.live) {
        try { verifyLive(fileURLToPath(dir), brand); }
        catch (error) { rmSync(resolve(root, 'apps/web/dist'), { recursive: true, force: true }); throw error; }
      }
    } },
  }],
  outDir: './dist',
  vite: { plugins: [{
    name: 'miller-brand',
    resolveId(id) { if (['virtual:miller-brand', 'virtual:miller-project', 'virtual:miller-project-image'].includes(id)) return '\0' + id; },
    load(id) {
      // This design pass has one visual direction; omit unused theme tokens and fonts.
      if (id === '\0virtual:miller-brand') return `export const brand = ${JSON.stringify(brand)}; export const css = ${JSON.stringify(brandCss(root, { ...brand, review: false }, { externalFonts: brand.live || brand.review }))};`;
      if (id === '\0virtual:miller-project') return `export const project = ${JSON.stringify({ image: project.image, credit: project.credit, stockLabel: project.stockLabel, draftLabel: project.draftLabel })};`;
      if (id === '\0virtual:miller-project-image') return `export { default } from ${JSON.stringify(contentFile(root, project.image.path, 'apps/web/src/assets/projects').replaceAll('\\', '/'))};`;
    },
    buildEnd(error) { if (error) rmSync(resolve(root, 'apps/web/dist'), { recursive: true, force: true }); },
  }] },
});
