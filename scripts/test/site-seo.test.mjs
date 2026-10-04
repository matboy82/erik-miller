import assert from 'node:assert/strict';
import test from 'node:test';
import { crawlerOutput, pageSeo, identity, verifyLaunchFacts } from '../site-seo.mjs';

const page = { id: 'kitchen', kind: 'service', path: '/kitchen-remodeling/', title: 'Kitchen Remodeling in Treasure Valley | Miller Remodeling',
  heading: 'Kitchen remodeling, designed first.', description: 'Plan your kitchen with Miller Remodeling.', faqs: [{ question: 'When do we design?', answer: 'Before construction.' }] };

test('SEO uses the production entity and route URLs while omitting unknown location and fake ratings', () => {
  const seo = pageSeo(page);
  assert.equal(seo.url, 'https://millerremodelingidaho.com/kitchen-remodeling/');
  const org = seo.graph['@graph'].find(n => n['@type'] === 'Organization');
  assert.equal(org.telephone, identity.telephone);
  for (const key of ['address', 'geo', 'aggregateRating', 'sameAs']) assert.equal(Object.hasOwn(org, key), false);
  const service = seo.graph['@graph'].find(n => n['@type'] === 'Service');
  assert.equal(service.provider['@id'], org['@id']);
  const faq = seo.graph['@graph'].find(n => n['@type'] === 'FAQPage');
  assert.deepEqual(faq.mainEntity.map(q => ({ question: q.name, answer: q.acceptedAnswer.text })), page.faqs);
});

test('qualification never inherits homepage FAQs or service assertions', () => {
  const seo = pageSeo(page, { qualification: true });
  assert.equal(seo.url, 'https://millerremodelingidaho.com/qualify/');
  assert.equal(seo.graph['@graph'].some(n => ['Service', 'FAQPage'].includes(n['@type'])), false);
});

test('development output is auditable without allowing crawling; launch excludes qualification from discovery', () => {
  const development = crawlerOutput([page], false);
  assert.match(development.robots, /Disallow: \/$/m);
  assert.match(development.sitemap, /https:\/\/millerremodelingidaho.com\/kitchen-remodeling\//);
  assert.match(development.llms, /\[Kitchen Remodeling.*\]\(https:\/\/millerremodelingidaho.com\/kitchen-remodeling\/\)/);
  const launch = crawlerOutput([page], true);
  assert.match(launch.robots, /Allow: \/\nDisallow: \/qualify\//);
  assert.doesNotMatch(launch.sitemap, /qualify/);
});

test('indexing cannot turn draft business facts and stock imagery into a launch', () => {
  assert.throws(() => verifyLaunchFacts(), /real client photography; verified business facts; verified public location/);
  const ready = JSON.parse(JSON.stringify(identity));
  ready.launch.clientPhotographyVerified = true;
  ready.launch.businessFactsVerified = true;
  assert.throws(() => verifyLaunchFacts(ready), /verified public location/);
});
