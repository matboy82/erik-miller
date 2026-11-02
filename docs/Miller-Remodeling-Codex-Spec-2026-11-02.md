# Miller Remodeling — Codex Build Spec — 2026-11-02

**Project status: ACTIVE again (Nov 2, 2026).** Erik re-engaged with demo feedback after the Oct 12 park. Demo: erik-miller-web.pages.dev (Cloudflare Pages). Production: millerremodelingidaho.com (DNS switch only when Erik is ready).

**Gates (hard):**
- Matt does ONE review before production. Do not deploy to production or switch DNS without Matt's explicit go-ahead.
- Do NOT post Erik's street address anywhere on the site, ever.
- Do NOT invent content: no fake featured project, no made-up design fees, no made-up hours. Placeholders that cannot be filled from a verified source stay visibly flagged for Erik — never silently filled with guesses.
- All copy changes below land as reviewable drafts for Matt's pre-production review.

## 1. Erik's demo feedback — required changes

1. **Renderings, NOT 3D walkthrough.** Erik does not offer a 3D walkthrough. He offers renderings in the "new package" (accurate renderings / project renderings). Rewrite every 3D-walkthrough claim on the site (homepage plan copy, design-phase copy, process page) to renderings.
2. **No design fees on the process page.** The "Design investment: [Design fee and package]" line must NOT be filled with a number. Fees vary by project size and scope. Replace with language that design investment is discussed at consult, or drop the line. No figure on the page.
3. **Footer contact: phone + hours yes, address no.** Post phone (208.608.4439, confirmed on GBP) and business hours from GBP, verified Nov 2: Mon–Fri 8:30 AM–5:30 PM, Sat–Sun Closed. Remove the [Business address] placeholder. No street address on the site.
4. **Form-first contact; new Workspace email.** Visitors should use the inquiry form rather than seeing Erik's email posted in the footer. The form's destination updates to erik@millerremodelingidaho.com (Erik's new Google Workspace address; replaces millerremodelingidaho@gmail.com). Test that the first inquiry lands in the new Workspace inbox before launch.
5. **Footer service areas: drop Kuna.** Footer lists Eagle, Star, Middleton, Boise, Meridian. Kuna is OUT of the footer. McCall is NOT requested as a page (Erik's McCall remark was preference emphasis). Service-area pages themselves are untouched unless Erik says otherwise.
6. **Portfolio: liked, no star project yet.** Erik likes the portfolio page but has no star project with good photo/video worth posting. Do NOT invent a featured project. The homepage "Featured project story" slot (currently a [Project location] placeholder) stays unfilled until Erik supplies a real project.

## 2. Bathroom page — copy rewrite for his ICP

- Rewrite the bathroom-remodeling page copy to hit Miller's ICP: Treasure Valley homeowners planning kitchen/bath remodels and additions where thoughtful design pays for itself — people who want a plan (floorplans, selections, renderings) approved before demo day.
- The "quieter start, better end to the day" line is unclear — remove it or rewrite it in plain language that says what the project actually does. Explicitly do NOT use a "pooping in peace" angle or any bathroom-humor framing.
- Draft copy for Matt's review; do not publish unreviewed.

## 3. Job-walk booking — Google Calendar booking page

- Booking method DECIDED: a Google Calendar booking page (appointment schedule) on Erik's new Workspace calendar — calendar ID erik@millerremodelingidaho.com.
- Link it from the site's CTAs ("Start a conversation with Erik", "Tell us about your project", contact page). If the booking page cannot be created from the build side, flag it for Matt/Erik to create in Workspace and Codex links the resulting URL.
- Go-live item tied to this: Erik's calendar confirmation + sync test (booking must be confirmed working end-to-end before production).

## 4. Finish the prior work (in local workspace, NOT yet deployed)

Current state (Matt, Nov 2):
- The customer inquiry form now accepts BOTH an email address and a phone number and passes both through to JobTread.
- The review screen has grouped, readable project and contact details.
- Customers receive a shorter reference such as MR-ABCDE-23456, included in JobTread records. Calendar matching supports the new reference AND older UUIDs.
- Focused tests PASSED, including JobTread delivery and calendar matching.

Still to do before deploy:
- Visual review of the form + review screen changes.
- Resolve the malformed status entries in the go-live placeholder register — these are currently BLOCKING the full site checks. Fix the register entries, then re-run the full site checks.
- Resolve the Worker build's local permission restriction.
- Apply the database migration at deploy time (not before).

## 5. Go-live checklist — still open

- Erik's calendar confirmation + sync test (see §3).
- Final content and photos (including a real featured project if Erik supplies one; otherwise the slot stays empty per §1.6).
- Lead-funnel questions (open — list them for Matt if any block launch).
- A replacement for the operator page.
- Footer hours value: VERIFIED from GBP Nov 2: Mon–Fri 8:30 AM–5:30 PM, Sat–Sun Closed. Panel also confirms 5.0 stars, 16 reviews, phone (208) 608-4439, and no street address displayed — consistent with Erik not listing an address on GBP.

## 6. Deploy sequence

1. Visual review (§4) → 2. Fix placeholder-register entries → 3. Re-run full site checks → 4. Fix Worker permission issue → 5. Apply DB migration at deploy → 6. STOP for Matt's one pre-production review → 7. DNS switch only when Erik is ready.

Do not skip step 6. Do not switch DNS on Codex's own judgment.
