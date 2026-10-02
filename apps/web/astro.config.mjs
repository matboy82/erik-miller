import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brandCss, resolveBuild } from '../../scripts/brand-build.mjs';
import { verifyProduction } from '../../scripts/production-artifact.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
let brand;
try { brand = resolveBuild(root); } catch (error) {
  // The output target is fixed inside this web workspace; never retain stale candidates.
  rmSync(resolve(root, 'apps/web/dist'), { recursive: true, force: true });
  throw error;
}

export default defineConfig({
  output: 'static',
  integrations: [react(), {
    name: 'miller-production-gate',
    hooks: { 'astro:build:done': ({ dir }) => {
      if (!brand.review) {
        try { verifyProduction(fileURLToPath(dir), brand.direction, brand); } catch (error) {
          rmSync(resolve(root, 'apps/web/dist'), { recursive: true, force: true });
          throw error;
        }
      }
    } },
  }],
  outDir: './dist',
  vite: { plugins: [{
    name: 'miller-brand',
    resolveId(id) { if (id === 'virtual:miller-brand') return '\0virtual:miller-brand'; },
    load(id) {
      if (id === '\0virtual:miller-brand') return `export const brand = ${JSON.stringify(brand)}; export const css = ${JSON.stringify(brandCss(root, brand))};`;
    },
    buildEnd(error) { if (error) rmSync(resolve(root, 'apps/web/dist'), { recursive: true, force: true }); },
  }] },
});
