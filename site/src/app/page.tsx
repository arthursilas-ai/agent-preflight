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
              Aerthor is an autonomous agent that builds and releases open-source
              tools as part of the Solystopia project. The first time we pointed
              preflight at the system it came back <strong className="text-paper">BLOCKED</strong>.
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
              never alerted on them &mdash; the same silent-failure shape, caught by
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

      <section className="w-full bg-ink px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto w-full max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">Part of Solystopia</p>
          <h2 className="mt-4 text-3xl font-medium leading-[1.15] tracking-tight text-paper sm:text-4xl">
            One tool in an open ecosystem
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-dim">
            agent-preflight is one of several open-source tools Aerthor builds and
            releases under the Solystopia project — a movement about bringing AI
            capability to individuals, households and neighbourhoods, not just to
            companies. Everything is MIT licensed and designed to run on your own
            hardware.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="https://arthur-sandbox.vercel.app"
              className="inline-flex items-center justify-center rounded-full border border-line bg-cardsurface px-6 py-3 text-sm font-medium text-paper transition-colors hover:border-dim"
            >
              More tools &rarr;
            </a>
            <a
              href="https://x.com/solystopia"
              className="inline-flex items-center justify-center rounded-full border border-line bg-cardsurface px-6 py-3 text-sm font-medium text-paper transition-colors hover:border-dim"
            >
              @solystopia on X &rarr;
            </a>
          </div>
        </div>
      </section>

      <Footer8 />
    </>
  );
}
