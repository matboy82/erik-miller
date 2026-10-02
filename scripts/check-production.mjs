import { verifyProduction } from './production-artifact.mjs';
import { stageBrandFixture, buildBrandFixture, removeBrandFixture, fixtureProjectArtifacts } from './brand-fixture.mjs';
export { verifyProduction };

if (process.argv[1]?.endsWith('check-production.mjs')) {
  const choices = [
    ...['A', 'B', 'C'].map((direction) => ({ direction })),
    { direction: 'B', copyDirection: 'C', taglineId: 'paper-first' },
  ];
  for (const choice of choices) {
    const fixture = stageBrandFixture(choice.direction, choice);
    try {
      const output = buildBrandFixture(fixture);
      const inventory = verifyProduction(output, choice.direction, { ...choice, projectArtifacts: await fixtureProjectArtifacts(fixture) });
      console.log(`Production isolation passed: ${JSON.stringify(choice)}; inventory ${JSON.stringify(inventory)}`);
    } finally { removeBrandFixture(fixture.root); }
  }
  console.log('Disposable synthetic verification only; real brand approval is unchanged.');
}
