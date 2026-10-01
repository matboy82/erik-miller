import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  output: 'static',
  integrations: [react()],
  outDir: process.env.SITE_BUILD === 'production-check' ? './dist-production-check' : './dist',
});
