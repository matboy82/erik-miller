# Review and approve site pages

MR-06 page copy lives in `apps/web/src/content/pages/`. Each JSON record maps to one route and is checked against the schema in `scripts/page-content.mjs`.

## Prepare a page for Erik

Edit the page record and leave `status` as `draft`. Keep `draftReason` and the visible Draft label. Local builds are noindex. They show test copy for review; they do not accept customer copy approval, change the final brand, or close a production placeholder.

The required records cover the home page, six service pages, about/process, portfolio, contact, and the Eagle, Star, Meridian, Boise, Middleton, and Kuna area pages. Use only facts in the linked approved sources. Mark any detail that Erik has not confirmed as pending. Do not add prices, credentials, results, review counts, completed work, or actual service coverage as unverified facts. The existing stock portfolio example stays labeled as a substitute.

## Record Erik's exact approval

After Erik approves the exact rendered page, retain his dated sign-off under `docs/content/approvals/pages/`. For each page, add one `page-approval` JSON block with the page ID, content hash, approver, and approval date:

```json
{
  "pageId": "kitchen",
  "contentSha256": "<hash of the exact approved page record>",
  "approvedBy": "Erik Miller",
  "approvedOn": "YYYY-MM-DD"
}
```

Use `pageContentHash` from `scripts/page-content.mjs` to calculate the hash. Then set that record to `status: "approved"`, remove `draftReason`, and add its approval metadata pointing to the evidence file. Any later edit changes the required hash and needs renewed approval.

Close `CONTENT-PAGES-01` only after every public page has matching approval evidence and Erik has confirmed the service-area facts. The production build also requires the approved brand lock, eligible project content, and every root placeholder closed. Fixture approvals in `npm run check:production` are synthetic and never change canonical records.

## Verify locally

Use `npm run build` for the noindex review build and `npm run check` for repository checks and isolated production guards. The configured `npm run lighthouse` measures the home page. For a representative route, keep the same configuration and use:

```sh
node_modules/.bin/lhci autorun --collect.url=http://localhost/portfolio/ --collect.numberOfRuns=3 --upload.target=filesystem --upload.outputDir=.lighthouseci/mr06/portfolio
node scripts/check-lighthouse.mjs .lighthouseci/mr06/portfolio /portfolio/
```

Review routes manually at 320px and 390px, at desktop 200% zoom, and with keyboard navigation. Automated Lighthouse does not prove full WCAG 2.1 AA conformance.
