# Pinned Quality Bars — Integration Team

Candidate reference bars for `/gauntlet-loop` in this team's domain. Fill in the placeholders with a real pinned reference (commit, capture, benchmark run, or document edition) before using one. An unfilled or stale entry is not usable as a bar — refresh or remove it rather than let it go stale.

None of these apply automatically. Per the normal Gauntlet Loop rules, a bar is `Required` only when an approved QA plan or developer spec makes its threshold part of the contract; otherwise it's `Target` and non-blocking.

## Integration event throughput baseline

- Reference: `[pin: environment, load profile, commit/version, date measured]`
- Protocol: `[same input volume/shape, same environment, same measurement window as the pin]`
- Threshold: `[fill in once measured — e.g., events/sec sustained, or a % regression tolerance vs. the pin]`
- Classification: Target until an approved QA plan or spec promotes it to Required.

## Partner API contract-conformance

- Reference: `[pin: the specific contract suite or spec version being conformed to]`
- Protocol: `[run the suite against the target environment; compare pass/fail and response-shape diffs]`
- Threshold: `[fill in — e.g., 100% of Required contract assertions, or a named allowlist of accepted deviations]`
- Classification: Target until an approved QA plan or spec promotes it to Required.

## Latency SLO

- Reference: `[pin: the SLO document or dashboard capture and date]`
- Protocol: `[measure p95/p99 under the same load profile and environment as the pin]`
- Threshold: `[fill in — the actual SLO number]`
- Classification: Target until an approved QA plan or spec promotes it to Required.

## Maintenance

- Update the pin (version, date, commit, or capture) whenever the underlying system or contract changes meaningfully.
- Remove an entry rather than let it silently go stale; a wrong bar is worse than no bar.
- Add new entries here as the team identifies other reusable comparison points, so `/gauntlet-loop` starts from a real reference instead of inventing one cold each time.
