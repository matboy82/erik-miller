# Portfolio authoring

**Status**: Draft operating guide — the demo editor is local-only.

The portfolio page includes an in-memory editor for visibly labeled sample copy. It does not save a draft, upload media, open a restricted branch preview, authenticate Erik, record approval, or publish. It is not an access-controlled authoring service. Use only generic sample text; never enter customer details or private project information.

For a real entry, Erik supplies the actual project scope, challenge, result, media, location/project tags, sources, permission, and any approved review link. Use only real Miller project media with the provenance required by Accepted [0004](../architecture/decisions/0004-project-content-eligibility.md). The local sample cannot close CONTENT-01 or any content placeholder.

The future owner publishing service is governed by Accepted [0008](../architecture/decisions/0008-mobile-portfolio-authoring-and-approval.md). Its Cloudflare Access application, GitHub App, repository permissions, branch preview, exact-hash approval, and automatic production build are not configured here. Do not claim that **Publish** is working; the demo button is disabled.
