# Changelog

All notable changes to this project. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

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
