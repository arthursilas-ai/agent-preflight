# agent-preflight

**Deterministic pre-deployment checks for AI agent systems.**

[![ci](https://github.com/arthursilas-ai/agent-preflight/actions/workflows/ci.yml/badge.svg)](https://github.com/arthursilas-ai/agent-preflight/actions/workflows/ci.yml)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![python 3.9+](https://img.shields.io/badge/python-3.9%2B-blue.svg)](https://www.python.org/)

Your agent works in the demo. Will it pass review?

## Install

As an agent skill (works in Claude Code, Cursor, Copilot, Codex, Gemini, Zed and others):

```bash
npx skills add arthursilas-ai/agent-preflight
```

Or standalone — one file, no install, no account:

```bash
curl -O https://raw.githubusercontent.com/arthursilas-ai/agent-preflight/main/scripts/preflight.py
pip install pyyaml

python3 preflight.py --init                 # write a starter spec
python3 preflight.py agent-spec.yaml        # check it
python3 preflight.py --explain ops.liveness # why a check exists
```

Exit codes: `0` passed · `1` blocked · `2` spec unreadable. Add `--json` for
CI, `--strict` to fail on warnings too.

---

## Why

Around **88% of enterprise agent pilots never reach production**. The
reported blockers are evaluation gaps, governance friction and reliability —
not model quality.

There are excellent tools for watching an agent at runtime. There is very
little for the question that actually stalls a pilot:

> *Is this safe to ship, and can I show someone why?*

`agent-preflight` answers that with a deterministic verdict. No model calls,
no network, no vendor. The same spec always yields the same result, which is
what makes it reviewable — and what makes it usable in CI.

New here? [**Walkthrough: from blank spec to shippable**](docs/walkthrough.md) — a real pass over a small agent, about ten minutes.

Second example, different failure profile: [**a research agent**](docs/research-agent.md) that reads untrusted content but never touches money.

## What it catches

Run against a realistic refunds agent that demos perfectly:

```
BLOCKING (22)
  x [tenancy.rls]        Multi-tenant system without row-level security.
  x [credentials.exposure] Privileged credentials are not restricted to server-side only.
  x [injection.gating]   Consequential actions are reachable from untrusted content.
  x [tool.approval]      Tool issue_refund: irreversible tool without an approval gate.
  x [tool.idempotency]   Tool issue_refund: irreversible tool has no idempotency strategy.
  x [agent.step_limit]   Agent refund_agent: no step_limit.
  x [ops.liveness]       Scheduled system has no liveness alert for a run that never happens.
  ...

VERDICT: BLOCKED — do not deploy until the above are resolved.
```

Every finding carries a fix, not just a complaint.

## The check areas

Purpose · Architecture shape · Tenancy isolation · Credential exposure ·
Prompt-injection gating · Tool contracts (idempotency, approval, scope) ·
Agent bounds (step limit, cost budget, stop conditions) · Evaluation
(including adversarial cases) · Operations (logging, alerting, rollback) ·
Liveness · Billing and fulfilment.

Full rationale and threat model: [references/checks.md](references/checks.md).

## One check that exists because it bit us

```
x [ops.liveness] Scheduled system has no liveness alert for a run that never happens.
```

We built an agent with scheduled daily routines. The jobs were declared
correctly and registered correctly on the platform. They simply never fired
— for two days — and nothing alerted, because *nothing had gone wrong*.
There were no errors to catch. The absence of runs looked exactly like a
quiet day.

We only found it by querying the database and noticing that every event had
come from a manual test.

Most agent outages are not crashes. They are things that quietly stopped
happening. If your monitoring only watches for errors, it cannot see this
class of failure at all.

## Honest limits

This validates **declared design**, not running behaviour.

A passing verdict means the stated design contains no known unsafe patterns.
It is **evidence for a human reviewer** — not a guarantee, not a security
certification, and not a compliance attestation. A spec that lies still
passes. It complements runtime observability; it does not replace it.

## Contributing

New checks are welcome, with one requirement: a check must encode a failure
that has actually happened to someone, and must ship with a fix line telling
the reader what to do. Speculative checks make the tool noisy and get it
ignored.

## Licence

MIT © [Arthur](https://github.com/arthursilas-ai)
