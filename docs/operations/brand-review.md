# Compare the Miller Remodeling brand drafts

Erik uses the review page to compare proposed directions and words. Matt records evidence and maintains the build gate. A is the starting point; it is not the final choice. The [MR-02 spec](../specs/website-lead-qualification/mr-02.spec.md) and Accepted [ADR 0003](../architecture/decisions/0003-brand-selection-and-build-isolation.md) govern this behavior.

## Use the review controls

Run `npm run dev` and open the local URL it reports. Ordinary builds and Cloudflare's existing `SITE_BUILD=review` setting start at A.

- **Visual direction** changes the full palette, display font, and type treatment. It resets copy to the matching direction and tagline to default.
- **Hero and process copy** changes the tagline, headline, hero description, and process heading independently of the visual direction. It resets tagline to that copy set's default.
- **Tagline** overrides only the tagline. Six candidates are available, including C's default.

The status text identifies the current choices. These preferences survive reload in `miller-design-review` browser storage; they contain only choice IDs. Old theme/tagline preferences migrate when recognized. Invalid themes reset everything to A, invalid copy falls back to the valid theme, and invalid taglines reset to default. Controls remain usable when storage is blocked. Without JavaScript, the A draft remains readable and the toolbar explains the limitation.

The wordmark, statements, and preview copy remain Draft. Do not treat the kit's approval as factual proof or Erik's choice. The existing phone link works; the preview does not provide online booking.

## Record an actual brand choice later

MR-02 creates no real lock or Erik choice record. Once Erik explicitly signs off, Matt must:

1. Retain the actual dated sign-off in a nonempty document under `docs/brand/`, without private contact information or secrets.
2. Create and obtain acceptance of a separate brand-choice ADR under `docs/architecture/decisions/`. Link ADR 0003 and preserve normal amendment/supersession history.
3. Record the choice in a single fenced `brand-choice` JSON block in that ADR, using the shape below. Include a Markdown note `**Approval recorded**: Erik Miller, YYYY-MM-DD [sign-off](../../brand/<actual-evidence>.md)` with the real date/path. The link and metadata must resolve to the same evidence document.
4. Create `docs/brand/brand-lock.json` with the same fields, replacing `approvalEvidence` with the ADR's repository-relative `adr` path.

This is a schema example with deliberately invalid placeholders, not an approval record:

```json
{
  "version": 1,
  "direction": "A",
  "copyDirection": "A",
  "taglineId": "default",
  "approvedBy": "Erik Miller",
  "approvedOn": "YYYY-MM-DD",
  "approvalEvidence": "docs/brand/<actual-evidence>.md"
}
```

Directions and copy directions are A/B/C. Tagline IDs are `default`, `designed-first`, `see-it`, `one-process`, `your-life`, `paper-first`, and `calmer`. `default` means the selected copy direction's tagline. Dates must be real ISO calendar dates. Unknown/missing fields, unsupported versions, another approver, missing evidence, a Proposed/unrelated ADR, mismatched metadata, unsafe paths, or synthetic fixture records reject production. A direction-only legacy lock needs explicit migration, not guessed copy values. Custom copy outside this catalog needs an approved contract amendment.

Run `npm run build:production` after recording an actual eligible choice. `SITE_BUILD=production` through the web workspace enforces the same gate. `BRAND_DIRECTION`, arbitrary brand-lock environment paths, and `SITE_BUILD=production-check` cannot bypass it. Every production build also checks its complete output tree. Failed production builds remove stale web output; rebuild review mode before previewing again.

A valid brand lock is one prerequisite. BRAND-01 still requires the final logo; every Open root placeholder and the MR-03 content/placeholder guards remain release blockers. No lock, build, or ADR authorizes deployment, production SEO, analytics, or DNS cutover.

## Run disposable isolation checks

Run `npm run check:production`. It stages source/approval fixtures under `.tmp/brand-fixture-*`, builds A/B/C defaults plus a B/C copy-and-tagline combination, and prints full file inventories with SHA-256 hashes. Fixtures explicitly identify synthetic evidence. Only the copied fixture validator admits those synthetic records; ordinary canonical production entry points reject them. The real lock/ADRs remain unchanged.

The checker requires the selected tokens and four rendered copy fields, compares actual embedded Inter/display-font bytes, and rejects alternate tokens/copy, review markup/scripts, storage code, symlinks, and unexpected unused assets. Current fonts are self-hosted WOFF2 embedded in the selected CSS; no alternate standalone font files are copied. This scaffold has no approved production media inventory yet; MR-03 owns that extension. Fixture cleanup runs on failure as well as success.

Run `npm run check` for skills, lint, typecheck, Node tests, both workspace builds, and disposable isolation. Negative-control tests must fail for leaks; passing screenshot comparisons cannot establish artifact isolation.

## Measure each review direction

With Chrome installed, run `node scripts/check-brand-lighthouse.mjs`. It builds a disposable review-source fixture for each of A/B/C. Only the initial direction changes; all review controls, alternative tokens, and copy choices remain present. The generated page and selectors must visibly identify the direction before measurement.

Each direction uses the existing three-run mobile LHCI config and strict report checker. Preserve the optimistic aggregation: best score per category and lowest LCP across the three valid same-page runs. Performance, accessibility, and best-practices must each reach 90; LCP must be strictly below 2500ms. SEO stays warning-only for noindex previews. Keep all individual reports and variability, not just the aggregate result.

The command prints its unique `.lighthouseci/brand/<run>/` directory. Each direction retains fixture/catalog/page/lockfile/config hashes, OS/Node settings, individual reports, assertion results, and uploads. It continues to record other directions after a failure and exits nonzero if any gate fails. Fixture paths in metadata describe the tested build and are disposable; report directories remain. The command restores the ordinary A review output afterward. Default `npm run lighthouse` still measures ordinary A only.

Record candidate revision and uncommitted changes, Chrome/Lighthouse/npm versions, effective viewport/throttling, screenshots, and exact commands/exit codes. Missing Chrome, failed connections, incomplete reports, or absent variant evidence means Unverified. Use the same protocol for MR-03's replacement-media branch when that contract is implemented.

## Finish browser and remote evidence

Manually exercise every copy/tagline selection and all themes. Check reload, malformed/blocked storage, labels, keyboard focus/order, live status, touch controls, measured contrast, and no clipping/overflow at 320px, 390px, and desktop 200% zoom. Use the longest tagline. Compare computed palette/type values and text to branding-kit sections 5, 10, and 12. Applicable WCAG 2.1 AA results need a checklist; Lighthouse does not prove AA conformance.

After separately authorized publication through MR-01's configured test resource, record its actual URL and revision and repeat the comparison walkthrough. Local measurements do not prove remote deployment. Keep missing browser/remote branches Unverified in [MR-02 evidence](../project/mr-02-verification.md), then hand approved artifacts, raw diff, changed files, and verification output to fresh-session review. Do not include implementer reasoning in the independent adversarial packet.
