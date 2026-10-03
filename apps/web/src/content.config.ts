import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { projectSchema } from '../../../scripts/project-content.mjs';
import { pageSchema } from '../../../scripts/page-content.mjs';

export const collections = {
  pages: defineCollection({
    loader: glob({ pattern: '*.json', base: './src/content/pages' }),
    schema: pageSchema,
  }),
  projects: defineCollection({
    loader: glob({ pattern: '*.json', base: './src/content/projects' }),
    schema: projectSchema,
  }),
};
