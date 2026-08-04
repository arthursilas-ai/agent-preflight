# Walkthrough: from blank spec to shippable

A real pass over a small agent, start to finish. About ten minutes.

The agent: **an internal support bot** that reads a customer's ticket, looks up
their order, and can issue a refund under £50 without asking anyone. It works.
It demos well. Security has not signed it off.

## 1. Start

```bash
curl -O https://raw.githubusercontent.com/arthursilas-ai/agent-preflight/main/scripts/preflight.py
pip install pyyaml

python3 preflight.py --init
```

You now have `agent-spec.yaml`. Fill in what you know. **Leave blank anything
you genuinely do not know** — that is the point. Guessing here just moves the
discovery to the review meeting.

## 2. First run

```bash
python3 preflight.py agent-spec.yaml
```

Expect a wall of findings. A first run on an honest spec usually returns
fifteen to twenty-five blocks. That is not a judgement on your engineering; it
is the list your reviewer has in their head but has never written down.

## 3. Work the list, hardest first

Three findings will show up on almost every agent that touches money.

### `tool.approval` — the refund tool

```
x [tool.approval] Tool issue_refund: irreversible tool without an approval gate.
```

The £50 threshold felt safe in design review. It is not a gate — it is a
number the model can reach on its own. Either the action moves behind a
deterministic service that a human confirms, or you accept that a
sufficiently-confused run can refund every eligible order at once.

```bash
python3 preflight.py --explain tool.approval
```

Fix: `approval_required: true`. If that makes the product unusable, the
product needed a different shape.

### `tool.idempotency` — the same refund, twice

```
x [tool.idempotency] Tool issue_refund: irreversible tool has no idempotency strategy.
```

Your retry policy and your payment provider's at-least-once delivery will
eventually collide. Fix: an idempotency key on `order_id + refund_version`.

### `ops.liveness` — the failure nobody instruments

```
x [ops.liveness] Scheduled system has no liveness alert for a run that never happens.
```

Error alerting cannot see this. A job that stops firing produces no errors,
and silence looks exactly like a quiet day. Fix: alert when an expected run is
*missing*.

## 4. Answer the two procurement questions

```
x [data.retention] Personal data processed with no stated retention period.
x [data.training]  No statement on whether customer data trains a model.
```

Both are one line each, and both are asked in every enterprise review. Writing
`used_for_training: false` takes seconds. Leaving it blank costs a week.

## 5. Re-run until it passes

```bash
python3 preflight.py agent-spec.yaml
```

```
VERDICT: PASSED — no blocking issues found.
```

## 6. Keep it honest

Add it to CI so the posture cannot quietly regress:

```yaml
- run: pip install pyyaml
- run: python3 preflight.py agent-spec.yaml --json --strict
```

`--strict` fails on warnings too. Use it once the blocks are clear.

## What you now have

A completed spec, a list of what changed and why, and a passing run you can
attach to the review. The spec is the artefact — it re-runs on every change,
and it answers the reviewer's questions before they are asked.

## What you do not have

A guarantee. This validates **declared design, not running behaviour**. A spec
that lies still passes. It is evidence for a human reviewer — not a security
certification, not a compliance attestation, and no substitute for testing the
thing you actually built.
