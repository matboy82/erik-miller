# Google Workspace appointment schedules

**Status**: Accepted
**Approval recorded**: Matt, 2026-10-02 — selected Google Workspace appointment schedules for Erik-managed consultation bookings; no web conferences.
**Date**: 2026-10-02
**Work item**: MR-08
**Governing contract**: [MR-08 spec](../../specs/website-lead-qualification/mr-08.spec.md)
**Supersedes the provider portion of**: [0005](0005-jobtread-capability-verification-boundary.md)

## Context

Matt selected Google's own booking page because Erik can manage it in his existing Workspace, take phone calls or meet in person, and adjust the options as his availability changes. Calendly and web conferencing are not part of the selected booking experience. JobTread still owns customer/job records, and the epic still requires consultation appointments to be recorded against those records.

## Decision

Use Google Calendar Appointment Schedules as the homeowner-facing booking page and the source of availability and booked calendar events. Erik manages the schedule in Google Calendar. Configure appointment location as phone call or in-person; do not configure Google Meet. Erik may create separate schedules if he wants homeowners to choose between those modes. The website links to or embeds only the exact owner-approved booking page and explains the selected appointment mode and paid-design expectations.

MR-08 must verify the Workspace subscription and settings that apply to Erik's account, conflict calendars, buffers, minimum notice, timezone, confirmation/reminders, and cancellation/rescheduling before presenting booking as production-ready. Google's setup guide says schedules are created in a desktop browser; this is an operator setup step, not an application requirement.

This ADR does not select an API or automation for associating the Google calendar event with a JobTread customer/job. MR-08 must prove an approved supported path for that requirement. If no safe path is available, keep production booking blocked and return the story/epic for an explicit amendment; do not silently add Calendly, Zapier/Make, a custom booking engine, or unapproved manual data handling.

## Alternatives considered

- Calendly connected to Google Workspace: rejected by Matt's later selection of the native Google booking page.
- JobTread homeowner scheduling: unsupported for the required functions per Matt's MR-04 confirmation.
- Custom Google Calendar booking UI: unnecessary duplication of Google's appointment schedule and adds avoidable authentication, conflict, and availability behavior.
- Google Meet conferencing: excluded by Matt; the expected meeting modes are phone and in-person.

## Consequences and safeguards

- Google's feature availability depends on Erik's Workspace subscription and settings; verify them without upgrading or changing the account implicitly.
- Booked appointments appear on Erik's calendar and the page respects availability/conflict settings. Some features, including reminders, may depend on plan eligibility. Test the actual account behavior.
- The Google page collects booking identity/contact information. Use only fields needed for the appointment and do not copy attendee PII into public site content or logs.
- This ADR selects the provider and booking modes; it does not configure an account, publish a page, add a paid feature, or authorize a live booking test.

## Sources

- [Create a Google Calendar appointment schedule](https://support.google.com/calendar/answer/10729749?hl=en): availability, buffers, booking page, phone/in-person location choices, confirmations/reminders, and desktop setup.
- [Share a Google appointment schedule](https://support.google.com/calendar/answer/11608416?hl=en-GB): booking page may be linked or embedded; bookings appear on the calendar and respect availability.
- [Google appointment schedule availability and buffers](https://support.google.com/calendar/answer/11423292?hl=en): schedule windows, buffers, and minimum notice.
- [Accepted 0005](0005-jobtread-capability-verification-boundary.md): JobTread verification boundary and system ownership.

**Approval gate**: Provider and meeting-mode decision accepted. MR-08 integration details, JobTread association evidence, and its technical spec/package still require their own completion/approval gates.
