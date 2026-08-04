# Contributing

Contributions are welcome. There is one rule that shapes everything else.

## Every check must encode a failure that actually happened

Not a failure that could theoretically happen. One that did — to you, to a
team you know, or in a published incident.

This is not gatekeeping. A checker that fires on speculative risks becomes
noisy, and a noisy checker gets ignored, which means the real findings get
ignored too. Every false positive costs more trust than a missing check does.

If you are unsure whether yours qualifies, open an issue describing the
incident before writing code. That conversation is the useful part.

## What a good check looks like

```python
def check_thing(spec: dict, r: Report) -> None:
    """One line on why this failure class matters."""
    if spec.get("some_field") is not True:
        r.add(BLOCK, "area.name",
              "What is wrong, stated plainly.",
              "What to do about it — an instruction, not a lecture.")
```

Requirements:

- **Deterministic.** No model calls, no network, no clock dependence. The same
  spec must always produce the same verdict, or the output is not reviewable.
- **A fix line, always.** A finding without a fix is a complaint.
- **`BLOCK` vs `WARN` honestly.** `BLOCK` means *this should not ship*. If a
  reasonable team could ship anyway with eyes open, it is a `WARN`.
- **Both fixtures updated.** `examples/passing-support-triage.yaml` must still
  pass; `examples/failing-refunds-bot.yaml` should demonstrate the new finding.
- **Documented** in `references/checks.md` with the reasoning, and added to the
  table in `SKILL.md`.

## Running the tests

CI runs exactly this, and both must hold:

```bash
python3 scripts/preflight.py examples/passing-support-triage.yaml   # exit 0
python3 scripts/preflight.py examples/failing-refunds-bot.yaml      # exit 1
```

If your change makes the passing example fail, that is a finding about the
example, not a reason to weaken the check — that is how the run-timeout check
arrived. Fix the example.

## Reporting a wrong result

False positives matter more than missing checks here. If a check fires on
something correct, please open an issue with the smallest spec that reproduces
it. Redact anything sensitive first — a spec describes your architecture.

## What this project will not become

- A runtime monitor. Observability is well served elsewhere.
- A certification or compliance attestation. It produces evidence for a human
  reviewer, nothing more.
- A model-graded judge. The determinism is the point.

## Licence

MIT. By contributing you agree your contribution is licensed the same way.
