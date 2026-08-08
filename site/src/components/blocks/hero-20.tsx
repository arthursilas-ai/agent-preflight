"use client";

import { ArrowRight } from "lucide-react";
import { motion, type Variants } from "motion/react";

// Real, verifiable facts about the tool — not vanity metrics. No customer
// logos or usage numbers: there are none yet, and identity.md forbids
// inventing them to fill the space a template expects.
const facts = [
  { value: "43", label: "Deterministic checks" },
  { value: "0", label: "Model calls to run it" },
  { value: "MIT", label: "License, free forever" },
  { value: "2", label: "Real bugs it caught on itself" },
];

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const headline: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(10px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const group: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05 },
  },
};

const groupItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export function Hero20() {
  return (
    <section className="relative flex min-h-screen w-full items-start overflow-hidden bg-ink px-4 py-16 sm:px-6 sm:py-20 lg:items-center lg:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_55%_100%_at_50%_0%,rgba(250,250,250,0.06),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-linear-to-t from-neutral-900/60 to-transparent" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col items-center text-center"
      >
        <motion.p
          variants={item}
          className="mb-8 inline-flex items-center gap-3 rounded-full border border-line px-4 py-1.5 font-mono text-xs tracking-wide text-dim"
        >
          <span className="text-signal">✓ PASSED</span>
          <span aria-hidden="true">/</span>
          <span className="text-alert">✗ BLOCKED</span>
        </motion.p>

        <motion.h1
          variants={headline}
          className="max-w-4xl text-5xl font-medium leading-[0.95] tracking-[-0.04em] text-paper sm:text-6xl md:text-7xl lg:text-8xl"
        >
          Your agent works in the demo.
          <br />
          Will it pass review?
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-7 max-w-2xl text-base leading-relaxed text-dim sm:text-lg"
        >
          Deterministic pre-deployment checks for AI agent systems. Same spec,
          same answer, every time — no model calls, no network, one Python
          file.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
        >
          <a
            href="#install"
            className="inline-flex w-full cursor-pointer items-center justify-center rounded-full bg-signal px-6 py-3 text-sm font-medium text-ink transition-colors duration-200 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ink sm:w-auto sm:px-8 sm:py-3.5 sm:text-base"
          >
            Get started
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
          <a
            href="https://github.com/arthursilas-ai/agent-preflight"
            className="inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-line bg-ink px-6 py-3 text-sm font-medium text-paper transition-colors duration-200 hover:bg-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dim focus-visible:ring-offset-2 focus-visible:ring-offset-ink sm:w-auto sm:px-8 sm:py-3.5 sm:text-base"
          >
            View source
          </a>
        </motion.div>

        <motion.div
          variants={group}
          className="mt-20 grid w-full max-w-5xl grid-cols-2 gap-y-10 border-y border-line py-10 lg:grid-cols-4 lg:divide-x lg:divide-line"
        >
          {facts.map((fact) => (
            <motion.div
              key={fact.label}
              variants={groupItem}
              className="flex flex-col items-center gap-2 px-4"
            >
              <span className="text-3xl font-semibold tracking-tight text-paper sm:text-4xl">
                {fact.value}
              </span>
              <span className="text-xs font-medium uppercase tracking-[0.15em] text-dim">
                {fact.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
