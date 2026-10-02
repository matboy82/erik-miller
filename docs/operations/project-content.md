# Review and replace project content

The home page reads `apps/web/src/content/projects/representative.json`. Edit that record and add local images under `apps/web/src/assets/projects/`; keep layouts and components unchanged. Rebuild or restart development after edits so image selection and provenance are revalidated.

The current photo and prose are development substitutes. Visible notices identify both, and every Open entry in [the root register](../../PLACEHOLDERS.md) blocks production. This workflow selects no CMS and authorizes no publication.

## Add a development substitute

1. Obtain a licensed photo. Record the exact source/download URL, creator, retrieval date and permission evidence under `docs/content/`. Strip EXIF/IPTC/XMP metadata and inspect for private material. Do not hotlink or use generated project photos.
2. Record the local path, actual dimensions, SHA-256 and meaningful alt text. Set `origin: stock` and `status: draft` without approval. Write illustrative plain-text paragraphs without invented customers, endorsements, prices or completed results. Use `credit` for voluntary or required attribution.
3. Create `docs/content/substitutes/content-sub-<number>.md` with one `content-substitute` JSON block: `id`, `status: Open`, `owner`, `unblockCondition`, `origin`, `source`, `creator`, `permission`, `retrievedOn`, `imageSha256`, `copySha256` and archived `paragraphs`. Point the content record at its ID/evidence path. Retain previous records.
4. Add a matching linked Open row to `PLACEHOLDERS.md`. Keep CONTENT-01 Open. Run `npm run check` and inspect the rendered page. Validation requires matching provenance, register status, image bytes/dimensions and copy identity.

The [wide substitute](../content/substitutes/content-sub-01.md) and [portrait substitute](../content/substitutes/content-sub-02.md) retain their sources and [Pexels permission evidence](../content/pexels-permission.md). Their stock and Draft notices are derived from validated content state.

## Rehearse replacement

`docs/content/rehearsal.json` holds the portrait image, alt text and longer writeup with matching provenance. The asset already exists locally. In a disposable copy, replace only `representative.json` with that record and rebuild. Both development notices and Open entries remain.

Run `node scripts/check-brand-lighthouse.mjs --project-content` for normal and replacement content across A/B/C. Each state gets three mobile reports under `.lighthouseci/project/<run>/<state>/<direction>/`. The runner changes only the fixture's initial theme and replacement record, records source/image/config/lockfile hashes, cleans fixtures and restores ordinary review A output. It adds no public variant parameter.

Manual review still needs 320px/390px, 200% zoom, keyboard/touch, focus, contrast, image alternatives and reflow evidence. Automated scores do not establish full WCAG 2.1 AA conformance.

## Replace with real Miller material

Obtain real Miller photography with usage permission and factual prose. Update the record's asset, exact dimensions/hash, alt text, title and paragraphs. Preserve the former substitute's original source, hashes and archived prose.

Only after Erik approves the exact content, set `origin: miller` and `status: approved`. Add `approval` with `approvedBy: Erik Miller`, the actual ISO date, and an evidence path under `docs/content/approvals/`. That file needs one `content-approval` JSON block containing `recordId`, `imageSha256`, `copySha256`, `approvedBy` and `approvedOn`. Retain the human sign-off alongside it; a repository assertion cannot authenticate Erik.

Use `contentCopyHash(record)` from `scripts/project-content.mjs` for the copy hash; it covers title, alt text and all paragraphs. Use SHA-256 for the asset. Changed content requires renewed approval. The substitute evidence must link the approval path and identify both replacement hashes while retaining the originals.

Verify the rendered replacement and provenance before closing only the matching substitute's structured status and root row. Record dated verification evidence. Other entries stay unchanged; CONTENT-01 closes only when all its covered substitutes are resolved. Validated approved Miller records remove the project Draft/stock notices. Required attribution remains independently governed by permission.

## Production checks and recovery

Both `npm run build:production` and web-workspace builds with `SITE_BUILD=production` require canonical brand approval, eligible project content and a valid root register without Open entries. Overrides and synthetic sign-off cannot approve canonical production. Failure identifies the boundary and clears stale web output.

`npm run check:production` verifies A/B/C and mixed brand choices with geometric images, synthetic approval and Closed register entries only inside isolated copies. It inspects every shipped file, derivative hash, selected copy/alt/dimensions and archived Draft exclusion. Success closes no real entry and does not establish production readiness.

Restore a broken replacement's prior record and matching asset together. Retain history and reopen its entry if approval no longer matches. Keep production blocked until checks pass. Publication, final brand, account changes and launch require separate authorization.
