# Miller Remodeling — Design Punch List (for Codex)

**Date:** 2026-10-02
**Purpose:** Get the review build from "labeled wireframe" to "feels like a real site" so Erik can react to actual design, not scaffolding.
**Context:** Matt is deleting the over-specified review/brand-lock plumbing. This doc is the single source of truth for the visual/content pass. Build from it; ignore any deleted spec docs.

## The quality bar (read this first)

This site sells $100k kitchens and additions to homeowners who are comparing Erik against
multiple bids. It must feel like the Prominent Homes proposal deck: calm, confident,
premium, considered. **It must NOT look like a neighborhood handyman WordPress template.**
If any section looks like it could belong to a generic contractor theme, it's wrong —
redesign it, don't ship it.

Art direction for this pass:
- **Imagery:** warm natural light, real job sites and finished rooms — never glossy catalog
  clichés (no handshakes, no hard hats pointing at blueprints, no smiling stock families).
  Consistent treatment: subtle warm grade, consistent aspect ratios per section.
- **Type:** let Fraunces do the work. Oversized headlines, generous line-height, short
  paragraphs. Restraint reads expensive.
- **Color:** ink + brass carry the site; clay is for CTAs and accents only. Beige-on-beige
  with no contrast reads cheap — keep text/ink contrast decisive.
- **Space:** generous whitespace, consistent spacing scale, no cramped cards. Premium is
  mostly empty space used with intent.
- **Details:** hover states on every card/link, subtle scroll reveals, sticky header CTA,
  mobile-first throughout. No dead-feeling static blocks.
- **Copy tone:** confident, plain-spoken contractor. Short sentences. No jargon, no lorem,
  no hedging. Write like someone who has built 25 years of kitchens and knows it.

Quality gate for every page: *would a homeowner comparing this against a $100k bid trust
it?* If not, keep working.

## Guiding principles

1. **Show a real site, not a spec.** Every visible word should read like finished copy a homeowner would trust. Draft status lives in code comments and a single small review badge — never inline in the page body.
2. **Layout is the design.** The token system (Fraunces serif, warm paper #F6F1E7, ink/brass/clay) is approved and fine. What's missing is visual rhythm: heroes, bands, grids, imagery cadence, real nav/footer.
3. **Sell the design process.** Erik's differentiator is not "we remodel" — it's in-house designer, 3D walkthroughs, design-before-demo. The site must make the *process* feel premium, because the process is the product he's trying to sell instead of giving away free.
4. **Real facts in [brackets].** Where a fact needs Erik (license #, years, review text, budget ranges), write the sentence as if true with the fact in [BRACKETS]. No "pending approval" prose anywhere visible.

## Global changes

- **Nav:** Replace the bare wordmark with a proper header: text logo lockup ("Miller Remodeling" in Fraunces, small "Treasure Valley, Idaho" kicker beneath), links: Services · Process · Portfolio · Reviews · Contact. Sticky. Right side: "Start Your Project" button. Mobile: hamburger.
- **Footer:** Contact info, service area list, [license #], hours, quick links, small print. Every page.
- **Review-meta removal:** Delete ALL visible draft scaffolding from rendered pages: the "DRAFT · Test copy" banners, "Development stock photo — not Miller Remodeling work" captions, "Draft example writeup" labels, "Draft prompt: …" questions, "not approved for production" disclaimers, "licensed stock photo … layout review" paragraphs. Keep a single small fixed "REVIEW BUILD" badge in a corner. Facts pending Erik's input are handled with [bracketed] placeholders (see principle 4).
- **Imagery:** Until Erik supplies photos, use high-quality stock (kitchens, baths, remodel-in-progress, designer at work). No disclaimers on the images — treat them as design placeholders in code comments only. One hero image per page minimum; no page should be text-only.
- **Logo mark:** No full logo design in this pass. A clean typographic lockup is enough. Note in code where a real mark will slot in.
- **Qualification/contact previews stay** — they're working components — but strip their demo-notice prose down to one short line.

## Homepage (`/`)

Target feel: premium local remodeler, calm and confident. Section order:

1. **Hero (full-bleed image, dark overlay):** Eyebrow: "Treasure Valley Remodeling & Design". H1: "Designed first. Built right." Sub: "Kitchens, baths, and additions — planned with an in-house designer and 3D walkthroughs before a single wall comes down." CTAs: "Start Your Project" (→ contact/qualify) + "See How We Work" (→ process). Trust line under CTAs: "[25] years · Licensed & insured [ID #] · [X] five-star Google reviews".
2. **Services grid (6 cards):** Kitchens, Bathrooms, Whole-Home Remodeling, Additions, ADUs, Home Repair. Each card: image, 1-line description, link. This is the lead-funnel entry — every card routes toward qualification.
3. **Design process band (the differentiator):** Headline: "You approve the design before demo day." Five-step visual timeline — Consult → Design → Selections → Build → Walkthrough — with 1–2 sentence descriptions each. Key copy point: design is a paid phase with real deliverables (floorplans, selections, 3D walkthrough), not free estimates. This is the single most important section on the site.
4. **Proof band:** Portfolio teaser — one featured project story tile (image + title + scope line), linking to /portfolio. Beside/below it: Google review strip — 3 real reviews from Erik's Business Profile with names and star ratings, once sourced.
5. **Ideal-project qualifier:** A short band that pre-qualifies: "Our best fits are kitchen and bath remodels and additions — projects where thoughtful design pays for itself." With a link into the project-fit quiz. This does Erik's "fewer driveways, bigger jobs" goal quietly.
6. **CTA / contact preview:** As built, minus demo prose.

## Portfolio (`/portfolio`)

This page must demonstrate the *format* Erik will use forever: writeup + before/after + video slot.

1. **Page hero:** Eyebrow "Project Stories". H1: "Proof, not promises." Intro line: "Every project, documented — the plan, the decisions, the finished space."
2. **Project story template (repeat per project):** Title (e.g., "A Kitchen Planned Around Morning Light"). Meta line: scope · [timeline] · [budget range]. Sections: **The challenge** (what the homeowner needed), **The design** (decisions, selections, 3D walkthrough note), **The result** (outcome in homeowner terms). Media: before/after image pair slots, finished-project video embed slot, homeowner quote slot. Write ONE full sample story in this format using realistic copy and stock images — no disclaimers, [bracketed] facts only.
3. **Story grid:** Cards for [6–9] projects. Real titles + images where available; designed placeholder cards ("Coming soon: [Project name]") for the rest — styled, not apology text.
4. **CTA band:** "Your project could be next." → qualification.

## Definition of done for this pass

- [ ] No visible draft/review meta-copy on any page; single corner badge only.
- [ ] Homepage has all 6 sections above with imagery; no text-only pages.
- [ ] Portfolio has one complete sample story + styled grid.
- [ ] Nav and footer real on every page.
- [ ] All Erik-dependent facts in [BRACKETS]; a single `erik-facts.md` in the repo lists every bracketed item for him to fill in.
- [ ] Review URL rebuilds clean and reads like a business site to a non-technical viewer.

## Explicitly out of scope

- Real logo design, real photos, real reviews (Erik supplies; slots are ready).
- JobTread integration (Phase 1 scope).
- The deleted brand-lock/review-gate specs — do not reintroduce them.

## BIS Design Differentiation Standard

This build must satisfy the BIS Design Differentiation Standard
(`00-System/Standards/Design Differentiation Standard.md` in BIS-Vault).
Read it before designing anything. Flag any requirement you cannot meet
before writing code. In particular: no banned default font pairings, no
stock photography at launch, no lorem-grade copy, the full SEO/AI ship list
(keyword title, real meta description, canonical, OG/Twitter, JSON-LD,
robots.txt, sitemap.xml, llms.txt), and the pre-ship differentiation review.
