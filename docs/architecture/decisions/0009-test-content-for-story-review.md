# Draft test content for story review

**Status**: Accepted
**Date**: 2026-10-02
**Work items**: MR-07–MR-13
**Governing artifacts**: [MR-07 spec](../../specs/website-lead-qualification/mr-07.spec.md), [MR-08 spec](../../specs/website-lead-qualification/mr-08.spec.md), [MR-09 spec](../../specs/website-lead-qualification/mr-09.spec.md), [MR-10 spec](../../specs/website-lead-qualification/mr-10.spec.md), [MR-11 spec](../../specs/website-lead-qualification/mr-11.spec.md), [MR-12 spec](../../specs/website-lead-qualification/mr-12.spec.md), and [MR-13 spec](../../specs/website-lead-qualification/mr-13.spec.md).

## Context

Story implementations need visible content to exercise complete layouts, form states, explanations, and content workflows before Erik approves final customer-facing copy. Requiring final approved content before these review experiences exist prevents useful review. Accepted [0004](0004-project-content-eligibility.md) governs project photos, portfolio provenance, and production eligibility; it does not define a common allowance for visible Draft copy and illustrative examples across MR-07–MR-13.

## Proposed decision

Allow locally authored, clearly labeled Draft test copy and illustrative examples in the noindex review experience for MR-07–MR-13. Authors may use approved product and story requirements to demonstrate page structure, interaction states, and workflow output while final customer-facing copy and owner decisions are pending.

Draft content must:

- Be visibly identified as Draft or test content wherever a reviewer could mistake it for approved customer-facing material.
- Stay within facts in approved source artifacts. If a fact, policy, price, service area, result, credential, testimonial, or project detail is unverified, omit it or identify it as pending review; do not invent it.
- Use clearly illustrative examples that do not imply real customers, completed Miller work, endorsements, or approved business rules.
- Remain in the noindex review experience and be excluded from production output by build-time content eligibility checks. Runtime hiding or labels alone do not establish production exclusion.
- Be replaced or explicitly approved as exact content before production use. Draft content does not close root placeholders or satisfy Erik's approvals.

This decision concerns visible copy and examples only. It does not authorize synthetic lead/booking/review records, external writes, test messages, new media, or live account activity. Existing synthetic-data controls and the provenance, licensing, and production rules in 0004 remain in force.

## Alternatives considered

- Wait for final content before implementing review experiences: preserves a single content state but blocks review of layouts and interactions.
- Use unmarked filler copy: simplifies authoring but can be mistaken for approved facts or leak into production.

## Consequences and compatibility

The implementation must distinguish Draft review content from production-eligible content at build time and show its state clearly to reviewers. Content-specific facts and business decisions still require their named owner approval. The MR-07–MR-13 specs and work packages must identify where Draft visible content is allowed and how exclusion is verified.

No customer data, credentials, private project media, or synthetic integration records are authorized by this ADR. This ADR does not approve any specific copy, brand direction, project description, review, public deployment, or production use.

**Open decisions**: None for this policy.

**Approval recorded**: Matt, 2026-10-02 — “all are approved.” This ADR and the amended MR-07–MR-13 specs, work-package manifests, and release specs are approved for sequential implementation.
