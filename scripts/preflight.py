#!/usr/bin/env python3
"""
agent-preflight — deterministic pre-deployment checks for AI agent systems.

    python3 preflight.py --init                       # write a starter spec
    python3 preflight.py --explain <check-id>         # why a check exists
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

STARTER_SPEC = """# agent-preflight spec. Fill this in honestly.
# The fields you cannot answer are the finding — those are the gaps a
# reviewer will find anyway, only later and in public.
#
#   python3 preflight.py agent-spec.yaml

system_id: ""
customer_job: ""                 # the job to be done, in the user's words
acceptance_metric: ""             # the number both sides agree means success

# deterministic | single_model_step | single_agent | durable_workflow | multi_agent
shape: "single_agent"
why_this_shape: ""

tenancy:
  multi_tenant: false
  rls_enabled: false
  tenant_id_propagated: false
  cross_tenant_tests: []

credentials:
  privileged_keys_server_only: true

untrusted_input:
  consumes_external_content: false
  treated_as_data_not_instructions: false
  consequential_actions_gated: false

agents:
  - name: ""
    purpose: ""
    context_boundary: ""
    model_policy: ""
    permitted_tools: []
    output_schema: ""
    step_limit: null               # required
    cost_budget: ""                # required
    stop_conditions: []            # required
    escalation_conditions: []

tools:
  - name: ""
    input_schema: ""
    output_schema: ""
    auth_scope: ""
    tenant_context: ""
    side_effect: "read"            # read | write | irreversible
    timeout_s: null
    retry_policy: ""
    idempotency: ""                # required for write and irreversible
    approval_required: false       # required true for irreversible
    audit_fields: []

evaluation:
  cases: []
  adversarial_cases: []
  run_on_real_inputs: false

schedule:
  scheduled: false
  liveness_alert: false            # alert when an expected run does NOT happen

observability:
  logging: ""
  tracing: ""
  cost_monitoring: ""
  alerting: ""

billing:
  uses_payments: false
  webhook_signature_verified: false
  event_ids_stored_for_idempotency: false
  fulfilment_verified_end_to_end: false

rollback:
  target: ""
  verified: false

exposure:
  publicly_reachable: false

data_handling:
  processes_personal_data: false
  retention_period: ""
  used_for_training: false
  prompts_logged: false
  log_redaction: false

resilience:
  model_fallback: ""
  run_timeout_s: null
  rate_limited: false
  concurrency_limit: null
"""


def write_starter(path: Path) -> int:
    if path.exists():
        print(f"{path} already exists — refusing to overwrite.")
        return 1
    path.write_text(STARTER_SPEC)
    print(f"Wrote {path}")
    print("Fill it in, then run:")
    print(f"  python3 {Path(__file__).name} {path}")
    return 0


# Why each check exists. Shown by --explain, so the reasoning is available
# without leaving the terminal or reading the repo.
RATIONALE = {
    "agent.context":
        "An undeclared context boundary means you cannot answer what the agent can see. "
        "That is the first question any reviewer asks about data access.",
    "agent.escalation":
        "Agents meet inputs their designer never imagined. Without escalation "
        "conditions the fallback is a confident wrong answer instead of a human.",
    "agent.stop":
        "Without stop conditions, 'done' is whatever the model decides. Define "
        "completion and what forces an early exit.",
    "agent.unknown_tool":
        "A tool with no declared contract has unknown side effects, unknown scope and "
        "unknown approval status. You cannot review what is not written down.",
    "billing.idempotency":
        "Payment webhooks are at-least-once, never exactly-once. Without stored event "
        "ids you will fulfil the same order twice.",
    "billing.signature":
        "An unverified webhook endpoint accepts forged payment events. Verify against "
        "the raw body, before any parsing.",
    "data.retention":
        "Every enterprise review asks how long you keep the data. 'We had not decided' "
        "is a failed review, not a neutral answer.",
    "data.undeclared":
        "If no one has written down what data this touches, no one has thought about "
        "it. That conversation happens now or in the security review.",
    "eval.cases":
        "A demo that looked right once is not evidence. Evaluate on inputs that "
        "resemble production, or you are shipping on vibes.",
    "eval.real_inputs":
        "Synthetic evaluation hides the messy failures production surfaces first: "
        "encodings, truncation, missing fields, unexpected languages.",
    "injection.contract":
        "Fetched content is data, never instructions. The moment it can issue commands, "
        "your threat model includes every page your agent reads.",
    "ops.alerting":
        "If nobody is watching, the mean time to detection is however long it takes "
        "someone to complain.",
    "ops.cost":
        "Model spend is the failure mode nobody instruments until the invoice arrives. "
        "A runaway loop is cheap to catch and expensive to miss.",
    "ops.logging":
        "Without logs, a failure is discovered by a customer and diagnosed by "
        "guesswork.",
    "ops.rollback_verified":
        "A rollback you have never executed is a hope. Verify it before you need it at "
        "2am.",
    "purpose.job":
        "If you cannot state the job in the user's words, you are describing a "
        "technology, not a product. Reviewers notice.",
    "resilience.concurrency":
        "Unbounded parallel runs multiply spend and hit provider rate limits exactly "
        "when load is highest.",
    "resilience.fallback":
        "A single provider outage should degrade the system, not stop it. Name the "
        "fallback or accept the dependency explicitly.",
    "shape.invalid":
        "An undeclared architecture shape means nobody agreed what this thing is. Pick "
        "one of the five and say why the simpler one below it does not work.",
    "shape.unjustified":
        "Multi-agent and durable workflows carry real operational cost. Reaching for "
        "them before a single bounded agent has provably failed is the most expensive "
        "common mistake.",
    "tenancy.propagation":
        "Row-level security only works if the tenant identity reaches the query. An "
        "unpropagated tenant id turns your isolation policy into decoration.",
    "tool.auth":
        "An undeclared scope is an unbounded scope. Tools accumulate permissions nobody "
        "revisits.",
    "tool.side_effect":
        "Every other tool rule depends on this classification. Getting it wrong "
        "silently disables the idempotency and approval checks.",
    "tool.timeout":
        "One unbounded call hangs the whole run. The caller cannot distinguish slow "
        "from dead.",
    "purpose.acceptance":
        "Reviewers reject what they cannot measure, and teams ship things nobody agrees "
        "worked. Name the number both sides accept before you build.",
    "tenancy.rls":
        "Cross-tenant leakage ends contracts rather than causing a bad week. Row-level "
        "authorisation is the control; a passing integration test is not.",
    "tenancy.tests":
        "Isolation you have not attacked is isolation you are guessing at. Write the probe "
        "that tries to read another tenant's row.",
    "credentials.exposure":
        "A privileged key that reaches a client is a breach with a delay. It will be found.",
    "injection.gating":
        "The danger is not the model being fooled — it is a consequential action being "
        "reachable from fooled output. Gate the action, not the prompt.",
    "tool.idempotency":
        "Retries are inevitable: timeouts, at-least-once delivery, double clicks. Without an "
        "idempotency key the write eventually runs twice. When it moves money, it moves it twice.",
    "tool.approval":
        "Models handle ambiguity. Deterministic services handle authority, money, and anything "
        "that cannot be undone. Irreversible actions need a human in the path.",
    "agent.step_limit":
        "An agent without a step limit is an unbounded loop. It stops when something else breaks, "
        "usually a bill or a rate limit.",
    "agent.cost_budget":
        "Spend is the failure mode nobody instruments until the invoice arrives.",
    "eval.adversarial":
        "A suite with no failing-by-design cases proves nothing about robustness. Include "
        "injection, malformed input, and cross-tenant probes.",
    "ops.liveness":
        "The check that exists because it bit us. Scheduled jobs were declared and registered "
        "correctly, then never fired for two days. Nothing alerted, because nothing errored — "
        "silence and success were indistinguishable. Alert on absence, not just on errors.",
    "ops.rollback":
        "An untested rollback is a hope. Name the version and prove you can reach it.",
    "data.log_redaction":
        "Prompts contain whatever the user pasted — keys, customer records, personal data. "
        "Logging them unredacted turns your observability stack into the breach.",
    "data.training":
        "Every procurement review asks whether customer data trains a model. Silence is not "
        "neutrality; it is a failed review. Answer explicitly, including 'no'.",
    "resilience.run_timeout":
        "Per-tool timeouts do not bound a run. An agent looping between two fast tools can run "
        "for hours while staying inside its step limit.",
    "resilience.rate_limit":
        "A public agent with no rate limit is a metered API someone else controls. The first "
        "abusive caller drains the model budget.",
    "billing.fulfilment":
        "A charge with a flipped status flag and no delivery is the worst outcome available to a "
        "business. Prove delivery with a real run.",
}


def explain(check_id: str | None) -> int:
    if not check_id:
        print("Checks with recorded rationale:\n")
        for k in sorted(RATIONALE):
            print(f"  {k}")
        print("\nRun:  preflight.py --explain <check-id>")
        return 0
    text = RATIONALE.get(check_id)
    if not text:
        print(f"No rationale recorded for {check_id!r}.")
        print("Run --explain with no argument to list the ones that have it.")
        return 1
    print(f"{check_id}\n")
    for line in text.split(". "):
        line = line.strip()
        if line:
            print(f"  {line.rstrip('.')}.")
    return 0


def main(argv: list[str]) -> int:
    args = [a for a in argv if not a.startswith("--")]
    as_json = "--json" in argv
    strict = "--strict" in argv

    if "--explain" in argv:
        return explain(args[0] if args else None)

    if "--init" in argv:
        return write_starter(Path(args[0]) if args else Path("agent-spec.yaml"))

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
