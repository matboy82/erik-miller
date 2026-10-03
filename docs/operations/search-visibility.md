# Search and assistant-readable site output

## Review builds

Review builds stay `noindex, nofollow` and `robots.txt` disallows crawling. They do not publish canonicals, a sitemap, assistant-readable production files, or structured data based on Draft page copy.

## Production build inputs

After production domain approval, set `PUBLIC_SITE_URL` to the HTTPS origin only, for example `https://example.com/`. The build rejects a missing or malformed value. Production output derives canonicals and `sitemap.xml` from page records that pass the existing brand, page-content, project-content, and placeholder guards. `llms.txt` uses the same eligible page records; it is not a separate source of facts.

Production structured data currently emits a `WebPage` record for eligible pages and a `Service` record for eligible service pages. It does not invent review or FAQ records. Add those only when their exact content has an approved, schema-validated source. The service provider name comes from the approved project source and does not imply a location, rating, credential, or service-area claim.

## Redirects and business profiles

The approved old WordPress URL map and verified profile links have not been supplied. Do not invent redirect sources or profile destinations. Matt records each confirmed old path and its approved destination in the redirect map before adding Cloudflare-compatible 301 entries. Track the missing map in `PLACEHOLDERS.md`.

## Visibility baseline

Use the dated [MR-11 baseline worksheet](../project/mr-11-visibility-baseline-2026-10-02.md). Record exact queries, date, tool/source, locale, signed-out state, result links, observed citations, and limitations. Do not treat a single observation as a ranking or citation guarantee. Recheck quarterly using the same method. Analytics remains disabled until Matt approves a separate privacy and retention contract.
