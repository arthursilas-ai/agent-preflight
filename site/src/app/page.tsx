import Navigation15 from "@/components/blocks/navigation-15";
import { Hero20 } from "@/components/blocks/hero-20";
import { Download8 } from "@/components/blocks/download-8";
import { Features12 } from "@/components/blocks/features-12";
import Footer8 from "@/components/blocks/footer-8";

export default function Home() {
  return (
    <>
      <Navigation15 />
      <Hero20 />
      <Download8 />
      <Features12 />

      <section className="w-full bg-ink px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto w-full max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">Self-check</p>
          <h2 className="mt-4 text-3xl font-medium leading-[1.15] tracking-tight text-paper sm:text-4xl">
            We ran it on ourselves — and keep running it.
          </h2>
          <div className="mt-8 rounded-2xl border border-line bg-cardsurface p-6 sm:p-8">
            <p className="text-base leading-relaxed text-dim">
              Arthur is an autonomous agent that researches opportunities, builds
              products and sells them, including this one. The first time we
              pointed preflight at Arthur it came back <strong className="text-paper">BLOCKED</strong>.
              One finding was <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm text-paper">ops.liveness</code> —
              no alert for a scheduled run that never happens. We had already
              lived that exact failure: daily routines correctly declared,
              correctly registered, that simply never fired for two days.
              Nothing alerted, because nothing errored. Silence and success
              looked identical.
            </p>
            <p className="mt-4 text-base leading-relaxed text-dim">
              We fixed what it found and ran it again. Most recently that
              surfaced a second, almost identical bug in a different corner of
              the same system: a daily health check that logged failures but
              never alerted on them — the same silent-failure shape, caught by
              using our own tool on our own code instead of assuming the first
              fix generalised. That one&rsquo;s fixed now too, verified live, not
              just patched and hoped.
            </p>
            <p className="mt-4 text-sm text-dim/80">
              Most agent outages are not crashes. They are things that quietly
              stopped happening — and it takes actually re-running the check to
              know you caught them all.
            </p>
          </div>
        </div>
      </section>

      <section id="audit" className="w-full bg-ink px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto w-full max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">Paid option</p>
          <h2 className="mt-4 text-3xl font-medium leading-[1.15] tracking-tight text-paper sm:text-4xl">
            The audit
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-dim">
            The tool is self-serve and free. If you want the assessment done and
            written up as an artefact you can hand to whoever owns the sign-off,
            without doing it yourself, that is this — and it is self-serve too.
            Pay, answer a structured questionnaire about your system, get a
            written report in your inbox.
          </p>

          <div className="mt-8 rounded-2xl border border-line bg-cardsurface p-6 sm:p-8">
            <p className="text-4xl font-semibold tracking-tight text-paper">£2,500</p>
            <p className="mt-1 text-sm text-dim">One agent system. Report generated automatically after intake.</p>
            <ul className="mt-6 space-y-3 text-sm text-dim">
              <li className="flex gap-2">
                <span className="text-signal">·</span>
                A structured questionnaire covering tenancy, credentials, injection gating, tool contracts, agent bounds, evaluation, operations, liveness, data handling, resilience, billing and rollback (10–15 minutes)
              </li>
              <li className="flex gap-2">
                <span className="text-signal">·</span>
                The same deterministic checker as the free tool, run against your answers
              </li>
              <li className="flex gap-2">
                <span className="text-signal">·</span>
                A written report emailed automatically, usually within minutes of submitting: every blocking issue and warning, explained, with a concrete fix
              </li>
              <li className="flex gap-2">
                <span className="text-signal">·</span>
                Reply to the report email any time with questions or corrections
              </li>
            </ul>
            <a
              href="https://buy.stripe.com/6oUbJ3dfo1H4aL37hYgIo02"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-signal px-8 py-3.5 text-base font-medium text-ink transition-colors hover:brightness-110"
            >
              Book the audit — £2,500
            </a>
            <p className="mt-3 text-xs text-dim">Paid upfront. You get an intake link by email straight after checkout.</p>
          </div>

          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-dim">
            This assesses declared design, not running behaviour, based on how
            you describe your system in the questionnaire — it is evidence for
            a human reviewer, not a certification or a penetration test.
            Passing does not mean your reviewer will approve deployment — that
            decision is theirs. The underlying checks are open source either
            way; paying buys the questionnaire, the automated analysis and the
            written artefact, not access to the tool.
          </p>
        </div>
      </section>

      <Footer8 />
    </>
  );
}
