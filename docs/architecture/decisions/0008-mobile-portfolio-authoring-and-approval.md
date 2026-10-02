# Erik-approved direct portfolio publishing

**Status**: Accepted
**Approval recorded**: Matt, 2026-10-02 — “all approved.”
**Decision scope approved**: Matt approved on 2026-10-02: Erik previews and approves his own content; portfolio publication has no PR process and triggers an automatic rebuild/deploy.
**Technical boundary**: Accepted by Matt with the MR-09 spec/package on 2026-10-02.
**Date**: 2026-10-02
**Work item**: MR-09
**Governing artifacts**: [MR-09 story](../../product/stories/website-lead-qualification/mr-09.md), [spec](../../specs/website-lead-qualification/mr-09.spec.md), and [work packages](../../specs/website-lead-qualification/mr-09.work-packages.md)
**Amends**: Accepted [0004 content eligibility](0004-project-content-eligibility.md)

## Context

The current site stores schema-validated portfolio records in the Astro Content Layer and requires exact Erik sign-off, but no remote authoring/publishing workflow exists. Matt wants Erik to manage project stories from a phone, see the real rendered page before publication, personally approve it, and publish without a pull request. Publishing an approved content revision should trigger the site's automatic build/deployment path.

## Approved product decision and proposed mechanism

The approved product behavior is a two-step owner workflow:

1. Erik edits the portfolio entry and saves it to a controlled preview branch. Cloudflare builds the branch and provides a noindex, access-restricted preview of the exact site page. The form shows its build status and preview link. Saving a draft is not approval.
2. After reviewing that deployed rendering, Erik selects **Publish**. The publishing service records his authenticated identity, time, preview revision and hashes of the exact content/media he approved, then writes only the validated portfolio record, media and approval evidence directly to the production branch. It does not create a PR or require Matt/BIS to approve ordinary entries.

Cloudflare Pages automatically builds branch commits. The production build retains every accepted brand/content/placeholder guard; a failing build does not replace the last successful deployment. Before initial public launch, the approved content path may update only the authorized noindex review resource. Publishing to a live production resource remains unavailable until the existing release and launch authorization gates pass. After an authorized launch, an Erik-published content commit triggers the normal automatic production build/deploy.

The proposed implementation uses Cloudflare Access to authenticate Erik and a narrowly scoped GitHub App on a server-side Worker to create the preview branch and, after Erik's Publish action, commit the exact approved content directly to the production branch. The App may write only the approved content/media/approval paths; it cannot merge code, edit workflow/configuration files, alter brand locks, close unrelated placeholders, or publish arbitrary repository content. There is no PR in Erik's content workflow. Normal engineering code-review and CI workflows remain unchanged.

## Content approval and existing policy

The Publish action is Erik's explicit item-level approval for the exact revision. The service must validate the Access identity, bind the approval record to the preview revision and media/copy hashes, and retain a human-readable audit record. An edit after publication invalidates that approval and returns the entry to Draft. No authoring form or automated assertion can replace the existing factual, licensing, provenance, and production eligibility checks.

This amendment supersedes the publication/approval recording portion of 0004 only after 0008 is accepted and implemented. All source, exact-hash, eligible-content, selected-brand, unreferenced-asset and root Open-placeholder checks in 0004 remain in force. Preview and production artifacts remain distinct; a preview never proves release readiness.

## Alternatives considered

- PR-based Git publishing: rejected for Erik's portfolio submissions at Matt's direction; it adds an approval handoff after Erik has approved the rendered content. Engineering changes continue to use their normal PR/review process.
- Direct updates to the public site or an object store: rejected because it would bypass typed Content Layer records and the existing complete-output production guards.
- A separate headless CMS: not selected; it introduces another content store and an approval/provenance synchronization boundary.

## Consequences and safeguards

- The preview branch contains only publishable content and approved media; do not place customer PII/private photos or unapproved sensitive notes there. Preview deployments must be noindex and restricted to Erik/approved reviewers.
- Account setup must prove least-privilege Access identity and GitHub App installation. Direct production-branch content commits require a tightly scoped actor/path policy. No broad admin token, arbitrary path input, or browser credential is allowed.
- The site build validates schema, approval hashes, brand lock, media provenance and every root placeholder. A validation/build failure leaves published content unchanged and reports a safe status to Erik.
- Keep immutable approved versions or sufficient history for one-click restore. Revert content through the same owner approval path, retaining history and placeholder provenance.
- This proposal does not configure accounts, branch rules, Cloudflare Access, or GitHub Apps, nor does it authorize first launch, DNS, deployment or public posting.

## Sources

- [Cloudflare Pages Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/): branch commits trigger automatic builds/deployments and branch previews.
- [Cloudflare Pages branch deployment controls](https://developers.cloudflare.com/pages/configuration/branch-build-controls/): production and preview branches can be configured separately.
- [Cloudflare Pages preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/): preview builds are distinct from production and include noindex response headers by default.
- Accepted [0004](0004-project-content-eligibility.md) and [0002](0002-test-deployment-isolation.md).

**Implementation boundary**: Account setup, launch authorization, and production gates remain as specified.
