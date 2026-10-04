# SEO and AI citation readiness / domain launch checklist

Updated October 4, 2026. Domain: **https://millerremodelingidaho.com**. DNS is unchanged. The Pages development site remains deliberately noindex and crawler-blocked.

## Available and testable now

| Requirement | Implementation / evidence |
|---|---|
| Initial HTML | Astro static output, one H1, route copy and anchors in the response |
| Keyword titles and descriptions | All 17 routes have unique service/location/brand titles and useful descriptions |
| Canonical and social URL | Production-domain canonical on marketing routes; matching OG URL; qualification excluded from canonical discovery |
| Open Graph / Twitter | Route-specific 1200x630 JPEG brand artwork with title, description and image alt metadata |
| Stable entity graph | Organization, WebSite, page-specific WebPage/ContactPage/AboutPage/CollectionPage, Service, ImageObject and BreadcrumbList; stable production IDs |
| FAQ | Questions and direct answers visible in HTML; FAQPage emitted from the identical records; no rich-result promise |
| Business identity | `apps/web/src/content/site.json` is the shared website/schema contact source; unknown address/geo/profiles omitted |
| Sitemap | 16 marketing routes; no qualification, errors or private operator routes |
| llms.txt | Markdown links to canonical pages and the same planning answers; not a ranking or citation control |
| robots | Dev disallows crawling; launch allows public content and keeps qualification excluded |
| Error route | Dedicated noindex 404 document without homepage canonical; verify real HTTP status after deployment |
| Cache | Hashed Astro assets immutable; robots/sitemap/llms and stable social URLs have one-hour cache |
| Favicon / viewport | Existing client favicon set, responsive viewport and user zoom preserved |
| Safety | Launch check requires real client imagery and verified business facts/location; indexed HTML also rejects used stock assets and bracketed facts |

Run `npm run check:seo` after a live dev build. Run lint, type checks and the test suite for structural changes. The indexed launch cannot be enabled just to make an SEO audit green.

## Owner inputs before domain cutover

- [ ] Erik supplies real project photographs and permissioned before/after stories. Replace every used development stock image; do not merely set a verification boolean.
- [ ] Confirm legal/display name, published phone/email, license, hours, service coverage and every bracketed fact in `erik-facts.md`.
- [ ] Confirm a legitimate public customer-facing business address and coordinates before adding GeneralContractor/LocalBusiness. If this is a service-area business with a private home address, resolve that explicitly with Matt; do not publish the home address or invent a storefront to satisfy schema.
- [ ] Enter verified location in `site.json.publicLocation` as `{ verified: true, address: { streetAddress, addressLocality, addressRegion, postalCode, addressCountry }, geo: { latitude, longitude } }`. It must also be displayed in the site/footer. Only then is GeneralContractor emitted. With no verified location, Organization is deliberate and the full BIS location requirement remains open.
- [ ] Add only official verified profile URLs to `officialProfiles` and visible profile links. Check website/GBP/directories for consistent identity.
- [ ] Source real reviews with exact wording and permission. No review or aggregate-rating markup now. Self-serving LocalBusiness reviews are not a Google review-star entitlement.
- [ ] Check FAQs with Erik. Replace guessed local claims with actual service details and examples. Area pages need meaningful local evidence; do not add more town pages just for keywords.
- [ ] Supply current WordPress URL inventory and old-to-new redirect map; preserve inbound service links.
- [ ] Finalize privacy/contact-data notice and any required legal links. Analytics/pixels remain unconfigured; do not add them just to claim measurement readiness.
- [ ] Complete Erik's calendar consent and real booking-reference synchronization before claiming the booking integration ready.

## Switches with the domain move

1. **Before DNS:** keep Pages Production `SITE_BUILD=live` and `PUBLIC_INDEXING_ENABLED=false`. Leave forms enabled and calendar sync disabled until separately verified. Turnstile and Worker CORS already permit apex and www.
2. **Domain setup:** add apex/www through Cloudflare Pages Custom domains and follow actual provider targets. Record prior web DNS/TTLs; preserve mail records. Verify HTTPS on both hostnames and choose apex as canonical.
3. **Redirects:** verify www/protocol/slash normalization and old URL redirects; preserve path/query. Two invented paths must return genuine 404, not homepage 200. Pages fallback hostname must not become a duplicate indexed business site; verify provider canonical-host handling, or leave its responses noindex separately.
4. **Content/data readiness:** replace images and unresolved copy, display verified business details, then set `launch.clientPhotographyVerified` and `launch.businessFactsVerified` in `site.json`. The booleans record checks; they cannot replace the actual work.
5. **Indexing switch:** Pages Production `PUBLIC_SITE_URL=https://millerremodelingidaho.com`, `SITE_BUILD=live`, `PUBLIC_INDEXING_ENABLED=true`; rebuild. This permits public robots, removes the global noindex header, and activates index/follow meta. Qualification/error routes retain noindex. Indexed generation fails if launch facts or used stock/bracketed content remain.
6. **Verify actual domain:** raw HTML, canonical/OG/schema URLs, share images, robots/sitemap/llms, TLS, status codes, redirected variants, private Access protection, mobile/keyboard controls, form/photo delivery and booking.
7. **Validate schema:** Schema.org Validator on each template; Google's Rich Results Test where supported. Full Google LocalBusiness eligibility requires the real address; syntax does not establish visibility.
8. **Search registration:** verify Search Console and Bing ownership using the actual domain, submit sitemap and priority URLs after acceptance. Preserve mail/DNS records when adding verification TXT. No verification token is invented in code.
9. **Measurement:** record performance from the audience region and later field Core Web Vitals. Use the fixed query set below for dated search and AI observations. Do not claim citations while the site remains intentionally unindexed.

## Observation register

| Fixed query | Intended page | Baseline / after launch |
|---|---|---|
| Miller Remodeling Idaho | Home | Pending actual indexed-domain observation |
| Kitchen remodeling Eagle Idaho | Kitchen / Eagle | Pending |
| Bathroom remodeling Meridian Idaho | Bathroom / Meridian | Pending |
| Home additions Treasure Valley design process | Additions / Process | Pending |
| Does Miller Remodeling show a 3D design before construction? | Process | Pending |

Record exact prompt, surface/model, date/time, locale/account state, brand inclusion, cited URLs, factual accuracy and evidence. A generated answer is an observation, not a ranking. No automatic follow-up automation was created.

## Sources and limits

- [BIS canonical visibility playbook](https://drive.google.com/file/d/1fERNcR1jM9K-8h1TLPDvgfaNLFWw5-G_uaq6opTJU6w) and the local design standard govern implementation. Full factual and custom-domain acceptance remain open.
- [Google AI features](https://developers.google.com/search/docs/appearance/ai-features): ordinary SEO, accessible text, accurate schema and index/snippet eligibility matter; no special AI file or schema is required.
- [Google LocalBusiness](https://developers.google.com/search/docs/appearance/structured-data/local-business): valid markup must describe real business information; eligibility is not guaranteed.
- [Google noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing): robots blocking alone is not an indexing removal instruction. Dev has both meta/headers and robots protection; use Access if confidentiality is required.
- [OpenAI crawlers](https://developers.openai.com/api/docs/bots): OAI-SearchBot controls search access separately from GPTBot training. Decide crawler policy at launch; current dev blocks all. No citation guarantee follows from allowing a bot.

## Development evidence - October 4, 2026

- Full test suite: 87 passed. Lint and type checks passed.
- SEO artifact check: all 17 routes, unique metadata, canonical/OG URLs, graph/FAQ matching, 17 route-specific social JPEGs and dedicated noindex error document passed.
- Homepage HTML: approximately 99 KB, under the BIS 200 KB budget. Homepage contains more than 300 words of main content; no invented numerical proof.
- Mobile Lighthouse, three runs: performance 97/97/98, accessibility 100/100/100, best practices 100/100/100, LCP 2.195/2.191/2.055 seconds. SEO 69/69/69 with only the deliberate crawl/index block failing. Do not remove that block for a cosmetic score.
- Browser widths 360, 390, 768, 1024 and 1440: one H1 and no horizontal overflow. Mobile menu opens and closes, with expanded state exposed accessibly.
- Google consent, custom-domain TLS/redirects, production schema validators, indexing and external citation observations are not established by these dev checks.
