# Provision the test deployment

Prepared for Matt/BIS; no remote account/repository/deployment was created during bootstrap.

1. Confirm BIS GitHub org/repo and Cloudflare account. Keep DNS at Porkbun.
2. Create a Direct Upload Pages project `miller-remodeling-test`, primary branch `main`. The Pages production-branch term refers only to this isolated test project. Do not attach the business domain or mix Git integration with the CI upload path.
3. Create a GitHub `test` environment with secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Restrict token permissions to required Pages/Worker deployment in the BIS account.
4. Set repository variable `CLOUDFLARE_PAGES_PROJECT=miller-remodeling-test`. Set `ENABLE_TEST_DEPLOYS=true` only after authorization. Otherwise deployment remains off.
5. Authorize push. CI verifies before uploading `apps/web/dist` and deploying the test Worker. Same-repository PRs get Pages previews; forks get checks without secrets.
6. Capture returned URLs, 200 `/health`, draft A/B/C behavior, mobile layout, and PR preview evidence. Only then close infrastructure placeholders. Adding a test custom domain requires a separate DNS instruction.

The health scaffold requires no secrets. WS-2 will introduce approved intake secrets through Wrangler secret storage. Preview remains noindex through HTML, robots.txt, and headers. Private stakeholder content may require Cloudflare Access.

References: [Direct Upload CI](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/) and [Wrangler Pages commands](https://developers.cloudflare.com/workers/wrangler/commands/pages/).
