# Production DNS cutover

The site is published at https://erik-miller-web.pages.dev. The future business hostname is **millerremodelingidaho.com**. Business DNS is unchanged.

Pages production uses `SITE_BUILD=live`, `PUBLIC_INDEXING_ENABLED=false` and `PUBLIC_SITE_URL=https://millerremodelingidaho.com`. Update content through this repository and the existing Pages Git build. Indexing stays disabled until the content and domain are ready.

1. Finish content/images, confirm contact details and the existing URL redirect map, and complete the remaining calendar checks in [account status](account-connection-status.md).
2. Open Cloudflare **Workers & Pages > erik-miller-web > Custom domains > Set up a custom domain**. Add the business hostname and follow that dashboard's actual DNS instructions. Record existing web records and TTLs first. Preserve mail/MX/TXT and unrelated records.
3. Set up the desired www hostname and canonical redirect. Both hostnames are already permitted by the Worker and Turnstile. Verify domain HTTPS before enabling indexing.
4. In **erik-miller-web > Settings > Variables and Secrets > Production**, change `PUBLIC_INDEXING_ENABLED` to `true`. Keep `SITE_BUILD=live` and the canonical origin above. Redeploy and check canonicals, sitemap, robots and public pages. Qualification remains noindex.
5. Submit a marked test inquiry on the business domain and verify JobTread delivery, photos and booking reference synchronization. Check mobile navigation and old URL redirects.

Operator access stays on the Worker hostname. Exact DNS targets must come from this account's custom-domain setup.

If launch-critical checks fail, restore recorded prior web DNS and the known-good website deployment. Preserve accepted inquiries and staging objects. Disable `BOOKING_SYNC_ENABLED` to pause calendar processing. Use the existing inquiry receipt for recovery to avoid duplicate JobTread writes.
