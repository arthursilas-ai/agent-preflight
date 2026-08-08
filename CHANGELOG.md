# Changelog

All notable changes to this project. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added
- `agents[].iterates` \u2014 an agent entry can now declare `iterates: false`
  for a fixed, bounded sequence (call A, then B, then C, return). Without it,
  every agent got the same step_limit/stop_conditions findings as a genuine
  unbounded loop, even a pipeline with no loop to bound. cost_budget still
  applies either way. Found by running the checker against our own daily
  routines and seeing findings that didn\u2019t map to anything real.
- `billing.replay` \u2014 flags a verified webhook signature with no check
  that the timestamp is recent. A captured valid signature can otherwise be
  replayed indefinitely and still pass. Found by red-teaming our own Stripe
  webhook: the timestamp was parsed out of the header and never actually
  checked against current time.

### Added
- `schema.unknown_key` — unrecognised keys are now reported with a
  did-you-mean suggestion. Found by typo-ing `tenant_id_propogated` and
  watching the checker silently ignore it, then block on the field as though
  it were never filled in. A field you believe you set, that no check reads,
  produces a verdict that looks wrong.

### Added
- `docs/research-agent.md` — a second worked example with a different failure
  profile: an agent that reads untrusted external content but never touches
  money. Injection gating and context boundaries dominate instead of approval
  gates and idempotency.

## [0.3.0]

### Added
- `--explain <check-id>` — the reasoning behind a check, in the terminal.
- Rationale for all 41 check ids. Previously 17 were documented and 24
  returned "no rationale recorded".
- CI gate enforcing rationale coverage, so a new check cannot ship without one.
- `CONTRIBUTING.md` — states the rule that shapes the project: a check must
  encode a failure that actually happened.
- Issue templates for false positives and proposed checks.
- `docs/walkthrough.md` — blank spec to shippable in one pass.

### Changed
- README restructured: badges, install in the first screen, exit codes
  documented, duplicate quick start removed.

## [0.2.0]

### Added
- `--init` — writes a commented starter spec and refuses to overwrite. The
  friction was never the checks; it was describing your system from an empty
  file.
- Data handling checks: retention period, model-training disclosure, and
  redaction of logged prompts.
- Resilience checks: run-level timeout, rate limiting on publicly reachable
  agents, model fallback, concurrency limit.

### Fixed
- The bundled passing example had no run-level timeout. The new check caught
  it, and the example was fixed rather than the check weakened.

## [0.1.0]

Initial release.

### Added
- Deterministic pre-deployment checks across purpose, architecture shape,
  tenancy isolation, credential exposure, prompt-injection gating, tool
  contracts, agent bounds, evaluation, operations, liveness, billing and
  rollback.
- `--json` for CI and `--strict` to fail on warnings.
- Worked passing and failing examples, exercised by CI on every push.
- MIT licence.

### Notes
The `ops.liveness` check exists because it bit us first: scheduled jobs
declared and registered correctly that never fired for two days, with nothing
alerting because nothing errored. Silence and success were indistinguishable.
