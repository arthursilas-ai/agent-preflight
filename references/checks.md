# Checks and threat model

Every check below encodes a failure that has actually happened to someone.
Each is deterministic and each ships with a fix.

## Purpose

**`purpose.job` / `purpose.acceptance`** — A system with no agreed success
metric cannot be evaluated, only argued about. Reviewers reject what they
cannot measure, and teams ship things nobody agrees worked.

## Architecture shape

**`shape.unjustified`** — Reaching for multi-agent before simpler shapes have
provably failed is the most common and most expensive architecture mistake.
Order of preference: deterministic software → one bounded model step → a
single agent with tools → a durable workflow → multiple agents. Most
"agent problems" are the first three.

## Tenancy

**`tenancy.rls` / `tenancy.propagation` / `tenancy.tests`** — Cross-tenant
leakage is the failure that ends contracts rather than causing a bad week.
Row-level authorisation must exist, tenant identity must be threaded through
every call, and an adversarial test must prove isolation. Note that semantic
retrieval needs an explicit permission filter: *"the vector search found it"
is not authorisation*.

## Credentials

**`credentials.exposure`** — A privileged key that reaches a client is a
breach with a delay. Service-role credentials stay server-side, always.

## Prompt injection

**`injection.contract` / `injection.gating`** — Content fetched from outside
(web pages, documents, emails, uploads) is untrusted **data**, never
instructions. The dangerous pattern is not the model being fooled; it is a
consequential action being reachable from fooled output. Gate the action,
not just the prompt.

## Tool contracts

**`tool.idempotency`** — Retries are inevitable: timeouts, at-least-once
delivery, user double-clicks. A write without an idempotency key eventually
runs twice. When the tool moves money, it moves it twice.

**`tool.approval`** — Irreversible actions need a human. The control
principle: *models handle ambiguity, deterministic services handle
authority, permissions, money, state transitions and irreversible actions.*

**`tool.auth`** — An undeclared scope is an unbounded scope.

## Agent bounds

**`agent.step_limit` / `agent.cost_budget` / `agent.stop`** — An agent
without a step limit is an unbounded loop; without a cost budget it is an
unbounded invoice. Stop conditions define what "done" means, which is
otherwise left to the model's judgement.

**`agent.unknown_tool`** — Referencing a tool with no declared contract means
its side effects, scope and approval status are all unknown.

## Evaluation

**`eval.cases` / `eval.adversarial`** — A demo that looked right once is not
evidence. An evaluation suite with no failing-by-design cases proves nothing
about robustness. Adversarial cases should include prompt injection,
malformed input, and cross-tenant probes where applicable.

**`eval.real_inputs`** — Synthetic-only evaluation hides exactly the messy
failures that production surfaces first.

## Operations

**`ops.logging` / `ops.alerting`** — If nobody is watching, an agent's
failure is discovered by a customer.

**`ops.liveness`** — *The check that exists because it bit us.* A scheduled
system needs an alert for a run that **did not happen**. We had daily
routines correctly declared and correctly registered that simply never fired
for two days. Nothing alerted, because nothing errored. Silence and success
were indistinguishable. Alert on absence, not just on errors.

**`ops.rollback`** — Name the exact version you would revert to, and verify
it. An untested rollback is a hope.

## Billing

**`billing.signature`** — Verify webhook signatures against the raw request
body. An unverified endpoint accepts forged payment events.

**`billing.idempotency`** — Payment webhooks are at-least-once, never
exactly-once. Store event IDs and ignore repeats.

**`billing.fulfilment`** — A successful payment must trigger real delivery,
proven by an actual end-to-end run. A charge with a flipped status flag and
no delivery is the worst outcome available to a business.

## Data handling

**`data.retention` / `data.training`** — Two questions every procurement review
asks: how long do you keep it, and does it train anything? Leaving either blank
is not neutrality, it is a failed review. State them explicitly, including
"no".

**`data.log_redaction`** — Prompts contain whatever the user pasted, which
routinely includes API keys, customer records and personal data. Logging them
unredacted turns your observability stack into the breach. Redact at write
time, not at read time.

## Resilience

**`resilience.run_timeout`** — Per-tool timeouts do not bound the whole run. An
agent that loops between two fast tools can run for hours inside its step
limit. Bound the run itself.

**`resilience.rate_limit`** — A publicly reachable agent with no rate limit is
a metered API someone else controls. The first abusive caller drains the model
budget.

**`resilience.fallback` / `resilience.concurrency`** — A single provider outage
should degrade the system, not stop it. Unbounded parallelism multiplies spend
and hits provider limits exactly when load is highest.

## What this does not do

It validates declared design, not running behaviour. It cannot detect a spec
that lies, it does not inspect source code, and it is not a substitute for
runtime observability, penetration testing, or a security audit by people.

It is evidence to bring to a reviewer. It is not the reviewer.
