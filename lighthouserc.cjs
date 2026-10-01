module.exports = {
  ci: {
    collect: {
      staticDistDir: './apps/web/dist',
      url: ['http://localhost/'],
      numberOfRuns: 3,
      settings: { formFactor: 'mobile' },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9, aggregationMethod: 'optimistic' }],
        'categories:accessibility': ['error', { minScore: 0.9, aggregationMethod: 'optimistic' }],
        'categories:best-practices': ['error', { minScore: 0.9, aggregationMethod: 'optimistic' }],
        // The draft is deliberately noindex. Enforce SEO >=90 in WS-1 launch QA.
        'categories:seo': ['warn', { minScore: 0.9 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500, aggregationMethod: 'optimistic' }],
      },
    },
    upload: { target: 'filesystem', outputDir: '.lighthouseci/reports' },
  },
};
