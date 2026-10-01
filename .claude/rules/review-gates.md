# Review Gates Rule

- Apply [the provider-neutral artifact identity rules](../skills/_shared/sdd-artifact-identity.md) and [artifact contracts](../skills/_shared/sdd-artifact-contracts.md) to every persistent review result. Do not create a generic `review.md` or `review-notes.md` file.
- Any work package touching authorization, tenant isolation, persistence or migrations, a shared provider, or otherwise classified Medium or High blast radius by `explorer` or `code-review` requires an `adversarial-reviewer` verdict in addition to `code-review`, before the release gate.
- This makes `adversarial-reviewer`'s existing guidance mandatory rather than optional. There is no default exception; a reviewer who skips it must record why in the review artifact and get explicit human sign-off on that exception.
- Record both verdicts (`code-review`'s Approve/Approve with nits/Block and `adversarial-reviewer`'s Adversarial Pass/Adversarial Block) in the same story-keyed SDD review artifact before `/sdd-release` runs.
- A Low blast-radius change does not require `adversarial-reviewer` by default, but any reviewer or approver may still request it.
- This rule does not change what `adversarial-reviewer` reviews or how; it only makes its use non-optional for the change classes above.
