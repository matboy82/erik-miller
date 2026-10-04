import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import { Buffer } from 'node:buffer';

const root = resolve(import.meta.dirname, '..');
import siteIdentity from '../apps/web/src/content/site.json' with { type: 'json' };
export const identity = siteIdentity;
export const siteOrigin = new URL(identity.url).origin;
const absolute = (path) => new URL(path, siteOrigin).href;
export function publicAddress() {
  const location = identity.publicLocation;
  if (location?.verified !== true) return '[Business address]';
  const address = location.address;
  return [address.streetAddress, address.addressLocality, address.addressRegion, address.postalCode].filter(Boolean).join(', ');
}

export function pageSeo(page, { qualification = false } = {}) {
  const path = qualification ? '/qualify/' : page.path;
  const url = absolute(path);
  const title = qualification ? 'Start Your Treasure Valley Remodel | Miller Remodeling' : page.title;
  const description = qualification ? 'Share your Treasure Valley remodeling goals, timing and photos with Erik at Miller Remodeling.' : page.description;
  const image = absolute(`/social/${qualification ? 'qualify' : page.id}.jpg`);
  const organization = {
    '@type': 'Organization', '@id': absolute('/#organization'), name: identity.name,
    url: siteOrigin, telephone: identity.telephone, email: identity.email,
    description: identity.description, logo: { '@type': 'ImageObject', '@id': absolute('/#logo'), url: absolute('/miller-logo.png') },
    ...(identity.officialProfiles.length ? { sameAs: identity.officialProfiles } : {}),
  };
  // Only a verified, public customer-facing location can promote the entity to LocalBusiness.
  const location = identity.publicLocation;
  if (location?.verified === true) {
    if (!location.address?.streetAddress || !location.address?.addressLocality || !location.address?.postalCode
      || !Number.isFinite(location.geo?.latitude) || !Number.isFinite(location.geo?.longitude)) throw Error('Verified public location requires a real address and coordinates.');
    organization['@type'] = 'GeneralContractor';
    organization.address = { '@type': 'PostalAddress', ...location.address };
    organization.geo = { '@type': 'GeoCoordinates', ...location.geo };
  }
  const webPage = {
    '@type': page.kind === 'contact' ? 'ContactPage' : page.id === 'process' ? 'AboutPage' : page.kind === 'portfolio' ? 'CollectionPage' : 'WebPage',
    '@id': `${url}#webpage`, url, name: title, description,
    isPartOf: { '@id': absolute('/#website') }, about: { '@id': organization['@id'] }, inLanguage: 'en-US',
    primaryImageOfPage: { '@id': `${url}#primaryimage` },
  };
  const graph = [organization,
    { '@type': 'WebSite', '@id': absolute('/#website'), url: siteOrigin, name: identity.displayName, publisher: { '@id': organization['@id'] } },
    webPage,
    { '@type': 'ImageObject', '@id': `${url}#primaryimage`, url: image, width: 1200, height: 630, caption: title },
  ];
  if (path !== '/') {
    webPage.breadcrumb = { '@id': `${url}#breadcrumb` };
    graph.push({ '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absolute('/') },
      { '@type': 'ListItem', position: 2, name: qualification ? 'Start your project' : page.heading, item: url },
    ] });
  }
  if (page.kind === 'service' && !qualification) graph.push({ '@type': 'Service', '@id': `${url}#service`, url,
    name: page.heading, description: page.description, provider: { '@id': organization['@id'] }, mainEntityOfPage: { '@id': webPage['@id'] } });
  if (page.faqs?.length && !qualification) graph.push({ '@type': 'FAQPage', '@id': `${url}#faq`, isPartOf: { '@id': webPage['@id'] },
    mainEntity: page.faqs.map(({ question, answer }) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) });
  return { url, title, description, image, graph: { '@context': 'https://schema.org', '@graph': graph } };
}

const xml = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
export async function prepareSocialImages(output, pages) {
  const require = createRequire(import.meta.url);
  const sharp = require('sharp');
  mkdirSync(resolve(output, 'social'), { recursive: true });
  const logo = readFileSync(resolve(root, 'apps/web/src/assets/brand/miller-remodeling-logo-white.png'));
  writeFileSync(resolve(output, 'miller-logo.png'), readFileSync(resolve(root, 'apps/web/src/assets/brand/miller-remodeling-logo.png')));
  for (const page of [...pages, { id: 'qualify', heading: 'Start your project', kind: 'contact' }]) {
    // Code-drawn brand artwork, not stock imagery or a claim of completed client work.
    const words = page.heading.split(' '); const lines = [''];
    for (const word of words) {
      if ((lines.at(-1) + word).length > 28) lines.push('');
      lines[lines.length - 1] += (lines.at(-1) ? ' ' : '') + word;
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
      <rect width="1200" height="630" fill="#1B2420"/>
      <path d="M60 60H1140V570H60Z M850 60V570 M850 210H1140 M970 210V410H1140" fill="none" stroke="#A8824A" stroke-width="2"/>
      <image href="data:image/png;base64,${logo.toString('base64')}" x="100" y="90" width="490" height="145"/>
      ${lines.map((line, i) => `<text x="100" y="${315 + i * 58}" fill="#F6F1E7" font-size="48" font-family="Georgia,serif">${xml(line)}</text>`).join('')}
      <text x="100" y="530" fill="#D7BE97" font-size="20" font-family="sans-serif">TREASURE VALLEY, IDAHO / DESIGN BEFORE DEMO</text>
      <text x="875" y="125" fill="#D7BE97" font-size="17" font-family="sans-serif">MILLER / ${xml(page.id.toUpperCase())}</text></svg>`;
    await sharp(Buffer.from(svg)).jpeg({ quality: 85 }).toFile(resolve(output, `social/${page.id}.jpg`));
  }
}

export function crawlerOutput(pages, indexed) {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(p => `  <url><loc>${xml(absolute(p.path))}</loc></url>`).join('\n')}\n</urlset>\n`;
  const llms = [`# ${identity.name}`, '', `> ${identity.description}`, '',
    `Contact: ${identity.telephone}. ${identity.email}.`, '', '## Pages', '',
    ...pages.map(p => `- [${p.title}](${absolute(p.path)}): ${p.description}`), '',
    '## Planning questions', '',
    ...pages.filter(p => p.faqs?.length).flatMap(p => [`### ${p.heading}`, '', ...p.faqs.flatMap(f => [`${f.question}`, '', f.answer, ''])]),
  ].join('\n');
  const robots = indexed ? `User-agent: *\nAllow: /\nDisallow: /qualify/\nSitemap: ${absolute('/sitemap.xml')}\n` : 'User-agent: *\nDisallow: /\n';
  return { sitemap, llms, robots };
}

export function verifyLaunchFacts(facts = identity) {
  const missing = [];
  if (!facts.launch.clientPhotographyVerified) missing.push('real client photography');
  if (!facts.launch.businessFactsVerified) missing.push('verified business facts');
  if (!facts.publicLocation?.verified) missing.push('verified public location and coordinates');
  if (missing.length) throw Error(`Business launch is not ready: ${missing.join('; ')}. Keep PUBLIC_INDEXING_ENABLED=false.`);
}
