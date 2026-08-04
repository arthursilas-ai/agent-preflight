#!/usr/bin/env python3
"""
agent-preflight — deterministic pre-deployment checks for AI agent systems.

    python3 preflight.py path/to/agent-spec.yaml [--json] [--strict]

Exit codes:
    0  passed (warnings may exist)
    1  blocked — unsafe to deploy
    2  spec could not be read

Why this exists: industry surveys in 2026 put enterprise agent pilot-to-
production failure around 88%, with the top blockers being evaluation gaps,
governance friction and reliability — not model quality. Observability tools
tell you what happened after you shipped. This tells you whether you should
ship, and produces an artefact a reviewer can sign.

Every check is deterministic. No model calls, no network, no vendor lock-in.
The same spec always yields the same verdict, which is what makes it
reviewable.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

try:
    import yaml
except ImportError:  # pragma: no cover
    sys.exit("agent-preflight requires pyyaml:  pip install pyyaml")

BLOCK = "block"
WARN = "warn"

SIDE_EFFECTS = {"read", "write", "irreversible"}


class Report:
    def __init__(self) -> None:
        self.findings: list[dict] = []

    def add(self, level: str, check: str, message: str, fix: str) -> None:
        self.findings.append({"level": level, "check": check, "message": message, "fix": fix})

    @property
    def blocks(self) -> list[dict]:
        return [f for f in self.findings if f["level"] == BLOCK]

    @property
    def warns(self) -> list[dict]:
        return [f for f in self.findings if f["level"] == WARN]


def blank(v) -> bool:
    return not str(v or "").strip()


# --------------------------------------------------------------------------
# Checks
# --------------------------------------------------------------------------

def check_purpose(spec: dict, r: Report) -> None:
    """A system with no agreed definition of success cannot be evaluated."""
    if blank(spec.get("customer_job")):
        r.add(BLOCK, "purpose.job", "No customer_job declared.",
              "State the job to be done in the user's words, not the technology.")
    if blank(spec.get("acceptance_metric")):
        r.add(BLOCK, "purpose.acceptance", "No acceptance_metric declared.",
              "Define the number both you and the customer agree means success.")


def check_shape(spec: dict, r: Report) -> None:
    """Escalating to multi-agent before simpler shapes fail is the most
    common and most expensive architecture mistake."""
    shape = str(spec.get("shape") or "").strip()
    valid = {"deterministic", "single_model_step", "single_agent", "durable_workflow", "multi_agent"}
    if shape and shape not in valid:
        r.add(BLOCK, "shape.invalid", f"Unknown shape {shape!r}.",
              f"Use one of: {', '.join(sorted(valid))}.")
    if shape in {"durable_workflow", "multi_agent"} and blank(spec.get("why_this_shape")):
        r.add(WARN, "shape.unjustified",
              f"Shape is {shape} but no justification given.",
              "Explain why a single agent or a bounded model step is insufficient.")


def check_tenancy(spec: dict, r: Report) -> None:
    """Cross-tenant leakage is the failure mode that ends contracts."""
    t = spec.get("tenancy") or {}
    if t.get("multi_tenant") is not True:
        return
    if t.get("rls_enabled") is not True:
        r.add(BLOCK, "tenancy.rls", "Multi-tenant system without row-level security.",
              "Enable RLS (or equivalent per-row authorisation) before shipping.")
    if t.get("tenant_id_propagated") is not True:
        r.add(BLOCK, "tenancy.propagation", "tenant_id is not propagated through the call path.",
              "Thread the tenant identifier through every tool call and query.")
    if not (t.get("cross_tenant_tests") or []):
        r.add(BLOCK, "tenancy.tests", "No cross-tenant isolation tests.",
              "Add an adversarial test proving tenant A cannot read tenant B's data.")


def check_credentials(spec: dict, r: Report) -> None:
    c = spec.get("credentials") or {}
    if c.get("privileged_keys_server_only") is not True:
        r.add(BLOCK, "credentials.exposure",
              "Privileged credentials are not restricted to server-side only.",
              "Move service-role keys behind the server. Never ship them to a client.")


def check_tools(spec: dict, r: Report) -> set[str]:
    """Models handle ambiguity. Deterministic services handle authority."""
    names: set[str] = set()
    for t in spec.get("tools") or []:
        n = t.get("name") or "(unnamed)"
        names.add(n)
        side = str(t.get("side_effect") or "read").strip()

        if side not in SIDE_EFFECTS:
            r.add(BLOCK, "tool.side_effect", f"Tool {n}: invalid side_effect {side!r}.",
                  f"Declare one of: {', '.join(sorted(SIDE_EFFECTS))}.")
            continue

        if side in {"write", "irreversible"} and blank(t.get("idempotency")):
            r.add(BLOCK, "tool.idempotency", f"Tool {n}: {side} tool has no idempotency strategy.",
                  "Retries are inevitable. Add an idempotency key so a repeat call is safe.")

        if side == "irreversible" and t.get("approval_required") is not True:
            r.add(BLOCK, "tool.approval", f"Tool {n}: irreversible tool without an approval gate.",
                  "Anything that moves money, grants access or cannot be undone needs human approval.")

        if blank(t.get("auth_scope")):
            r.add(BLOCK, "tool.auth", f"Tool {n}: no auth_scope declared.",
                  "State the minimum scope this tool needs.")

        if t.get("timeout_s") in (None, ""):
            r.add(WARN, "tool.timeout", f"Tool {n}: no timeout declared.",
                  "An unbounded call can hang the whole run.")
    return names


def check_agents(spec: dict, tool_names: set[str], r: Report) -> None:
    """An agent without a step limit and a cost budget is an unbounded liability."""
    for a in spec.get("agents") or []:
        n = a.get("name") or "(unnamed)"

        if a.get("step_limit") in (None, ""):
            r.add(BLOCK, "agent.step_limit", f"Agent {n}: no step_limit.",
                  "Set a maximum number of steps. Without it a loop runs until something else breaks.")
        if blank(a.get("cost_budget")):
            r.add(BLOCK, "agent.cost_budget", f"Agent {n}: no cost_budget.",
                  "Set a per-run spend ceiling.")
        if not (a.get("stop_conditions") or []):
            r.add(BLOCK, "agent.stop", f"Agent {n}: no stop_conditions.",
                  "Define what 'done' means, and what forces an early exit.")
        if blank(a.get("context_boundary")):
            r.add(WARN, "agent.context", f"Agent {n}: no context_boundary declared.",
                  "State what this agent is allowed to see.")
        if not (a.get("escalation_conditions") or []):
            r.add(WARN, "agent.escalation", f"Agent {n}: no escalation_conditions.",
                  "Define when a human takes over — low confidence, repeated failure, unusual input.")

        for tool in a.get("permitted_tools") or []:
            if tool not in tool_names:
                r.add(BLOCK, "agent.unknown_tool", f"Agent {n}: references undeclared tool {tool!r}.",
                      "Every permitted tool must have a declared contract.")


def check_untrusted_input(spec: dict, r: Report) -> None:
    """Fetched content is data, never instructions."""
    u = spec.get("untrusted_input") or {}
    if u.get("consumes_external_content") is not True:
        return
    if u.get("treated_as_data_not_instructions") is not True:
        r.add(BLOCK, "injection.contract",
              "System consumes external content but does not treat it as data only.",
              "Web pages, documents, emails and uploads are untrusted. They must never issue instructions.")
    if u.get("consequential_actions_gated") is not True:
        r.add(BLOCK, "injection.gating",
              "Consequential actions are reachable from untrusted content.",
              "Route any consequential action behind an approval gate that fetched content cannot trigger.")


def check_evaluation(spec: dict, r: Report) -> None:
    """A demo that looked right once is not evidence."""
    e = spec.get("evaluation") or {}
    if not (e.get("cases") or []):
        r.add(BLOCK, "eval.cases", "No evaluation cases.",
              "Evaluate on real, representative inputs before shipping.")
    if not (e.get("adversarial_cases") or []):
        r.add(BLOCK, "eval.adversarial", "No adversarial cases.",
              "Add prompt-injection, malformed-input and (if multi-tenant) cross-tenant probes.")
    if e.get("run_on_real_inputs") is not True:
        r.add(WARN, "eval.real_inputs", "Evaluation not confirmed against real production-like inputs.",
              "Synthetic-only evaluation hides the failures that matter.")


def check_operations(spec: dict, r: Report) -> None:
    """Silent failure is the enemy. A job that never runs must be visible."""
    o = spec.get("observability") or {}
    if blank(o.get("logging")):
        r.add(BLOCK, "ops.logging", "No logging declared.",
              "Log every run, every tool call and every failure.")
    if blank(o.get("alerting")):
        r.add(BLOCK, "ops.alerting", "No alerting declared.",
              "Silence must not be indistinguishable from success. Alert on absence, not just errors.")
    if blank(o.get("cost_monitoring")):
        r.add(WARN, "ops.cost", "No cost monitoring declared.",
              "Track spend per run so a runaway loop is visible before the invoice.")

    if (spec.get("schedule") or {}).get("scheduled") is True:
        if (spec.get("schedule") or {}).get("liveness_alert") is not True:
            r.add(BLOCK, "ops.liveness",
                  "Scheduled system has no liveness alert for a run that never happens.",
                  "Alert when an expected run is missing. A cron that silently never fires looks "
                  "identical to a cron with nothing to do.")

    rb = spec.get("rollback") or {}
    if blank(rb.get("target")):
        r.add(BLOCK, "ops.rollback", "No rollback target.",
              "Name the exact version or state you would revert to.")
    if rb.get("verified") is not True:
        r.add(WARN, "ops.rollback_verified", "Rollback target not verified.",
              "An untested rollback is a hope, not a plan.")


def check_billing(spec: dict, r: Report) -> None:
    b = spec.get("billing") or {}
    if b.get("uses_payments") is not True:
        return
    if b.get("webhook_signature_verified") is not True:
        r.add(BLOCK, "billing.signature", "Payments enabled but webhook signatures are not verified.",
              "Verify signatures against the raw request body.")
    if b.get("event_ids_stored_for_idempotency") is not True:
        r.add(BLOCK, "billing.idempotency", "Payment event IDs are not stored for idempotency.",
              "Payment webhooks are at-least-once. Store event IDs and ignore repeats.")
    if b.get("fulfilment_verified_end_to_end") is not True:
        r.add(BLOCK, "billing.fulfilment",
              "Fulfilment not verified end to end.",
              "A successful payment must trigger real delivery, proven by an actual test run — "
              "not just a status flag flipped in a database.")


def check_data_handling(spec: dict, r: Report) -> None:
    """Where the data goes is a contract question, not an implementation detail."""
    d = spec.get("data_handling") or {}

    if d.get("processes_personal_data") is True:
        if d.get("retention_period"):
            pass
        else:
            r.add(BLOCK, "data.retention", "Personal data processed with no stated retention period.",
                  "State how long inputs and outputs are kept, and what deletes them.")
        if d.get("used_for_training") is None:
            r.add(BLOCK, "data.training", "No statement on whether customer data trains a model.",
                  "Say explicitly yes or no. Silence here fails every procurement review.")

    if d.get("prompts_logged") is True and d.get("log_redaction") is not True:
        r.add(BLOCK, "data.log_redaction",
              "Prompts are logged without redaction.",
              "Prompts carry whatever the user pasted, including secrets and personal data. "
              "Redact before writing to logs, or logs become the breach.")

    if not d:
        r.add(WARN, "data.undeclared", "No data_handling section declared.",
              "State what data is processed, how long it is kept, and whether it trains anything.")


def check_resilience(spec: dict, r: Report) -> None:
    """Agents fail on the boring things: an upstream outage, a runaway loop, an abusive caller."""
    res = spec.get("resilience") or {}

    if blank(res.get("model_fallback")):
        r.add(WARN, "resilience.fallback", "No model fallback declared.",
              "A single provider outage takes the whole system down. Name a fallback or accept the risk explicitly.")

    if res.get("run_timeout_s") in (None, ""):
        r.add(BLOCK, "resilience.run_timeout", "No overall run timeout.",
              "Per-tool timeouts do not bound the whole run. A slow loop can still hang for hours.")

    exposed = (spec.get("exposure") or {}).get("publicly_reachable")
    if exposed is True and res.get("rate_limited") is not True:
        r.add(BLOCK, "resilience.rate_limit",
              "Publicly reachable agent with no rate limiting.",
              "An unauthenticated caller can drain your model budget. Rate limit before exposing it.")

    if res.get("concurrency_limit") in (None, ""):
        r.add(WARN, "resilience.concurrency", "No concurrency limit declared.",
              "Unbounded parallel runs multiply spend and hit provider limits at the worst moment.")


CHECKS = (
    check_purpose,
    check_shape,
    check_tenancy,
    check_credentials,
    check_untrusted_input,
    check_evaluation,
    check_operations,
    check_billing,
    check_data_handling,
    check_resilience,
)


def run(spec: dict) -> Report:
    r = Report()
    for fn in CHECKS:
        fn(spec, r)
    tool_names = check_tools(spec, r)
    check_agents(spec, tool_names, r)
    return r


# --------------------------------------------------------------------------
# CLI
# --------------------------------------------------------------------------

def main(argv: list[str]) -> int:
    args = [a for a in argv if not a.startswith("--")]
    as_json = "--json" in argv
    strict = "--strict" in argv

    if len(args) != 1:
        print(__doc__)
        return 2

    path = Path(args[0])
    try:
        spec = yaml.safe_load(path.read_text()) or {}
    except FileNotFoundError:
        print(f"No such spec: {path}")
        return 2
    except yaml.YAMLError as e:
        print(f"Spec is not valid YAML: {e}")
        return 2

    r = run(spec)
    failed = bool(r.blocks) or (strict and bool(r.warns))

    if as_json:
        print(json.dumps({
            "system": spec.get("system_id") or path.stem,
            "passed": not failed,
            "blocking": r.blocks,
            "warnings": r.warns,
        }, indent=2))
        return 1 if failed else 0

    name = spec.get("system_id") or path.stem
    print(f"agent-preflight :: {name}")
    print()

    if r.warns:
        print(f"WARNINGS ({len(r.warns)})")
        for f in r.warns:
            print(f"  ~ [{f['check']}] {f['message']}")
            print(f"      fix: {f['fix']}")
        print()

    if r.blocks:
        print(f"BLOCKING ({len(r.blocks)})")
        for f in r.blocks:
            print(f"  x [{f['check']}] {f['message']}")
            print(f"      fix: {f['fix']}")
        print()
        print("VERDICT: BLOCKED — do not deploy until the above are resolved.")
        return 1

    if strict and r.warns:
        print("VERDICT: BLOCKED (--strict) — warnings must be resolved.")
        return 1

    print("VERDICT: PASSED — no blocking issues found.")
    print()
    print("This checks declared design, not running behaviour. It is evidence for a")
    print("reviewer, not a guarantee, and not a security certification.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
