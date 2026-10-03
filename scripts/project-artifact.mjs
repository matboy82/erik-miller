import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import sharpService from 'astro/assets/services/sharp';
import { contentFile, contentCopyHash, sha256 } from './project-content.mjs';
import { requiredPages } from './page-content.mjs';

export const projectWidths = (width) => [...new Set([320, 640, 960, 1280, width].filter((size) => size <= width))];
const requiredHtmlPages = Object.values(requiredPages).map(({ path }) => path === '/' ? 'index.html' : `${path.replace(/^\//, '')}index.html`).sort();

// Expected bytes come from the selected validated source, never from an output manifest.
export async function prepareProjectArtifacts(root, project) {
  if (project.origin !== 'miller' || project.status !== 'approved') throw Error('Only eligible project content can own production media');
  const input = readFileSync(contentFile(root, project.image.path, 'apps/web/src/assets/projects'));
  const media = [];
  for (const width of projectWidths(project.image.width)) {
    const height = Math.round(width * project.image.height / project.image.width);
    const result = await sharpService.transform(input, { src: project.image.path, width, height, format: 'webp', quality: 80 }, { service: { config: {} } }, { warn(message) { throw Error(message); } });
    media.push({ sha256: sha256(result.data), width, height });
  }
  const forbiddenCopy = [];
  for (const name of readdirSync(resolve(root, 'docs/content/substitutes'))) {
    if (!name.endsWith('.md')) continue;
    const evidence = readFileSync(contentFile(root, 'docs/content/substitutes/' + name, 'docs/content/substitutes'), 'utf8');
    const block = /^```content-substitute\s*\n([\s\S]*?)^```\s*$/m.exec(evidence);
    if (!block) throw Error('Missing archived substitute inventory');
    const data = JSON.parse(block[1]);
    if (data.paragraphs) forbiddenCopy.push(...data.paragraphs);
  }
  return { id: project.id, title: project.title, paragraphs: project.paragraphs, image: project.image, copySha256: contentCopyHash(project), media, forbiddenCopy };
}

export function verifyProjectArtifacts(files, output, project) {
  if (!project || !project.media?.length) throw Error('Missing selected project media ownership');
  const section = /<section\b[^>]*data-project="representative"[^>]*>([\s\S]*?)<\/section>/.exec(output)?.[1];
  if (!section) throw Error('Selected representative project does not render');
  if (/Development stock photo|Draft example writeup|stock-kitchen-|pexels|content-substitute|content-approval|permissionEvidence|substituteEvidence/i.test(output)) throw Error('Production includes development content or provenance');
  if (project.forbiddenCopy.some((paragraph) => output.includes(paragraph))) throw Error('Production includes archived development writeup');
  const shippedPages = files.filter((file) => file.path.endsWith('.html')).map((file) => file.path.replaceAll('\\', '/')).sort();
  if (shippedPages.length !== requiredHtmlPages.length || shippedPages.some((path, index) => path !== requiredHtmlPages[index])) throw Error('Production route inventory does not match the approved site map');
  for (const file of files) {
    const path = file.path.replaceAll('\\', '/');
    if (!requiredHtmlPages.includes(path) && !['robots.txt', 'sitemap.xml', 'llms.txt', '_headers', '_redirects'].includes(path) && !path.startsWith('_astro/')) throw Error(`Unexpected shipped file: ${path}`);
    if (path.startsWith('_astro/') && !/\.(?:webp|css)$/.test(path)) throw Error(`Unexpected shipped file: ${path}`);
  }
  // Embedded images evade file inventories and are not permitted project media.
  if (/data:image\//i.test(output)) throw Error('Production includes embedded media');
  if (/<script\b/i.test(output)) throw Error('Production project page cannot ship executable or opaque script payloads');
  const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  for (const value of [project.title, ...project.paragraphs]) {
    if (!new RegExp('>' + escape(value) + '<').test(section)) throw Error('Selected project copy does not render exactly');
  }
  const img = /<img\b[^>]*>/.exec(section)?.[0];
  for (const [name, value] of Object.entries({ alt: project.image.alt, width: project.image.width, height: project.image.height, loading: 'lazy', decoding: 'async' })) {
    if (!img?.includes(`${name}="${value}"`)) throw Error(`Selected project image ${name} is missing or incorrect`);
  }
  const binary = files.filter((file) => !/\.(html|css|js|json|map|txt|xml|webmanifest)$/.test(file.path) && !['_headers', '_redirects'].includes(file.path));
  const urls = [...(img?.matchAll(/(?:src="|,\s*|srcset=")([^"\s,]+\.webp)/g) ?? [])].map((match) => match[1]);
  for (const file of binary) {
    const path = file.path.replaceAll('\\', '/');
    if (!path.startsWith('_astro/') || !path.endsWith('.webp') || !project.media.some((media) => media.sha256 === file.sha256) || !urls.includes('/' + path)) throw Error(`Unexpected or unreferenced project media: ${path}`);
  }
  if (binary.length !== project.media.length || project.media.some((media) => !binary.some((file) => file.sha256 === media.sha256))) throw Error('Selected project media inventory is incomplete');
}
