import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';

const root = resolve('.agents');
function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });
}
const errors = [];
const names = new Set();
for (const path of files(root).filter((file) => file.endsWith('.md'))) {
  const text = readFileSync(path, 'utf8');
  if (basename(path) === 'SKILL.md') {
    const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const name = frontmatter?.[1].match(/^name: (.+)$/m)?.[1]?.trim();
    const description = frontmatter?.[1].match(/^description: (.+)$/m)?.[1]?.trim();
    if (!name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) || name.length >= 64 || basename(dirname(path)) !== name) errors.push(`${path}: invalid skill name`);
    if (!description || description.length > 1024) errors.push(`${path}: invalid description`);
    if (names.has(name)) errors.push(`${path}: duplicate name`);
    if (/^(model|tools):/m.test(frontmatter?.[1] ?? '')) errors.push(`${path}: Claude-only frontmatter`);
    names.add(name);
  }
  for (const match of text.replace(/```[\s\S]*?```/g, '').matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const target = match[1].split('#')[0];
    if (!target || /^(https?:|mailto:|app:)/.test(target) || target.includes('<')) continue;
    if (!existsSync(resolve(dirname(path), target))) errors.push(`${path}: missing link ${target}`);
  }
  if (/\.claude\/|\b(?:Haiku|Sonnet|Opus)\b/.test(text)) errors.push(`${path}: stale Claude dependency`);
}
if (errors.length) throw new Error(errors.join('\n'));
console.log(`Validated ${names.size} Codex skills and their Markdown references.`);
