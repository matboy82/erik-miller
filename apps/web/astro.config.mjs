import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brandCss, resolveBuild } from '../../scripts/brand-build.mjs';
import { verifyProduction } from '../../scripts/production-artifact.mjs';
import { readProjectContent, contentFile } from '../../scripts/project-content.mjs';
import { prepareProjectArtifacts } from '../../scripts/project-artifact.mjs';
import { readPageContent } from '../../scripts/page-content.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
let brand;
let project;
let projectArtifacts;
try {
  brand = resolveBuild(root);
  await readPageContent(root, { mode: brand.review ? 'review' : 'production' });
  project = await readProjectContent(root);
  if (!brand.review) projectArtifacts = await prepareProjectArtifacts(root, project);
} catch (error) {
  // The output target is fixed inside this web workspace; never retain stale candidates.
  rmSync(resolve(root, 'apps/web/dist'), { recursive: true, force: true });
  throw error;
}

export default defineConfig({
  output: 'static',
  integrations: [...(brand.review ? [react()] : []), {
    name: 'miller-production-gate',
    hooks: { 'astro:build:done': ({ dir }) => {
      if (!brand.review) {
        try { verifyProduction(fileURLToPath(dir), brand.direction, { ...brand, projectArtifacts }); } catch (error) {
          rmSync(resolve(root, 'apps/web/dist'), { recursive: true, force: true });
          throw error;
        }
      }
    } },
  }],
  outDir: './dist',
  vite: { plugins: [{
    name: 'miller-brand',
    resolveId(id) { if (['virtual:miller-brand', 'virtual:miller-project', 'virtual:miller-project-image'].includes(id)) return '\0' + id; },
    load(id) {
      if (id === '\0virtual:miller-brand') return `export const brand = ${JSON.stringify(brand)}; export const css = ${JSON.stringify(brandCss(root, brand))};`;
      if (id === '\0virtual:miller-project') return `export const project = ${JSON.stringify({ image: project.image, credit: project.credit, stockLabel: project.stockLabel, draftLabel: project.draftLabel })};`;
      if (id === '\0virtual:miller-project-image') return `export { default } from ${JSON.stringify(contentFile(root, project.image.path, 'apps/web/src/assets/projects').replaceAll('\\', '/'))};`;
    },
    buildEnd(error) { if (error) rmSync(resolve(root, 'apps/web/dist'), { recursive: true, force: true }); },
  }] },
});
