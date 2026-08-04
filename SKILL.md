---
name: agent-preflight
description: Pre-deployment safety and readiness checks for AI agent systems. Use before shipping an agent to production, when an agent pilot is stuck at security review, when adding a tool that writes data or moves money, when designing agent autonomy and approval boundaries, or when asked whether an agent is safe to deploy. Produces a deterministic pass/block verdict a reviewer can sign.
---

# Agent Preflight

Roughly 88% of enterprise agent pilots never reach production. The blockers
are consistently evaluation gaps, governance friction and reliability —
not model quality.

Observability tells you what happened *after* you shipped. This tells you
whether you should ship, and leaves an artefact a reviewer can sign.

Every check is deterministic: no model calls, no network. The same spec
always produces the same verdict, which is what makes it reviewable.

## Run it

```bash
python3 scripts/preflight.py path/to/agent-spec.yaml
```

- `--json` for machine-readable output (CI)
- `--strict` to fail on warnings too

Exit codes: `0` passed · `1` blocked · `2` spec unreadable.

Start from [assets/agent-spec.yaml](assets/agent-spec.yaml). Worked
examples: [passing](examples/passing-support-triage.yaml) ·
[blocked](examples/failing-refunds-bot.yaml).

Worked end-to-end example: [docs/walkthrough.md](docs/walkthrough.md).

## When to use it

- **Before any production deploy** of an agent — run it, fix blocks, attach the output to the review
- **When a pilot is stuck** at security or risk review — the blocks are usually the reviewer's unwritten objections
- **When adding a tool** that writes data, moves money, or cannot be undone
- **When designing autonomy** — what the agent may do alone vs. what needs a human
- **In CI**, with `--json --strict`, so a regression in safety posture fails the build

## The rule the checks encode

> Models handle ambiguity. Deterministic services handle authority,
> permissions, money, state transitions, and irreversible actions.

If a model can trigger something that moves money, grants access, or cannot
be undone, it belongs behind a deterministic service with an explicit
approval step.

## What gets blocked, and why

| Area | Blocked when | Because |
|---|---|---|
| **Purpose** | No acceptance metric | Nothing can be evaluated against "it seems better" |
| **Tenancy** | Multi-tenant without RLS, tenant propagation, or cross-tenant tests | Cross-tenant leakage ends contracts |
| **Credentials** | Privileged keys not server-only | A shipped service key is a breach with a delay |
| **Injection** | External content consumed, but consequential actions not gated | Fetched content is data, never instructions |
| **Tools** | Write/irreversible without idempotency; irreversible without approval | Retries are inevitable; money moves twice |
| **Agents** | No step limit, cost budget, or stop conditions | An unbounded agent is an unbounded liability |
| **Evaluation** | No cases, or no adversarial cases | A demo that looked right once is not evidence |
| **Operations** | No logging, no alerting, no rollback target | Silent failure is the enemy |
| **Liveness** | Scheduled, but no alert when a run *doesn't* happen | A job that silently never fires looks exactly like a job with nothing to do |
| **Billing** | Unverified webhooks, no event idempotency, unproven fulfilment | A charge without delivery is the worst outcome available |
| **Data handling** | Personal data with no retention or training statement; prompts logged unredacted | Logs become the breach; procurement rejects silence |
| **Resilience** | No run-level timeout; public endpoint with no rate limit | Per-tool timeouts don't bound a run; an abusive caller drains the budget |

Detail and threat model: [references/checks.md](references/checks.md).

## Working with an agent

When asked to make a system "production ready", do not start by adding
features. Fill in the spec honestly, run preflight, then work the blocking
list. The fields you cannot answer are the finding — those are the gaps a
reviewer will find anyway, only later and in public.

Two habits the checks assume:

1. **Verify, don't infer.** A successful build is not a working product. A
   screenshot is not proof. Inspect the actual artefact — the row written,
   the email delivered, the page as an unauthenticated visitor sees it.
2. **Alert on absence.** Most agent outages are not crashes. They are
   things that quietly stopped happening.

## Honest limits

This validates **declared design**, not running behaviour. A passing
verdict means the stated design has no known unsafe patterns — it is
evidence for a human reviewer, not a guarantee, and **not** a security
certification or compliance attestation. A spec that lies still passes.

Maintained by [Arthur](https://github.com/arthursilas-ai). MIT licensed.
