# Verification Honesty Rule

- Never claim a command succeeded, a branch is clean, a test passes, or a review is approved without having just run the command or read the file. Show the actual output, not a summary of what it is expected to say.
- Do not treat a document header (story file, spec file) as the source of truth for status once it can go stale. Check the live source (git history, the tracker, CI) when status matters.
- When a human states a domain fact as ground truth (for example, tenancy scope or system ownership), accept it and update the analysis. Do not re-argue the point from a spec or ADR reading.
- Do the exact verification action requested. Do not substitute a cheaper proxy for it, such as reading API documentation instead of exercising the live endpoint.
- A code-review or adversarial-review finding is not resolved until the code and tests change. A spec, ADR, or documentation amendment alone does not close a finding unless the human explicitly asked for a documentation-only change.
- In an adversarial or code review, enumerate all findings in one pass and get human sign-off on the list before starting fixes, rather than fixing and re-reviewing round by round.
