import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';

export default [
  { ignores: ['**/node_modules/**', '**/dist/**', '**/dist-production-check/**', '**/.astro/**', '**/.wrangler/**', '.lighthouseci/**', '.tmp/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    files: ['**/*.mjs', '**/*.js', '**/*.cjs', '**/*.ts', '**/*.astro'],
    languageOptions: { globals: {
      module: 'readonly', process: 'readonly', console: 'readonly', URL: 'readonly', Request: 'readonly', Response: 'readonly',
      document: 'readonly', localStorage: 'readonly', Event: 'readonly',
    } },
  },
];
