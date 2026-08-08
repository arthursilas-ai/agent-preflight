"use client";

import { motion } from "motion/react";
import type { Variants } from "motion/react";
import { Bell, Lock, Workflow } from "lucide-react";

const cards = [
  {
    icon: Lock,
    statement: "Tenancy and credentials, checked.",
    description:
      "Row-level security on multi-tenant data, privileged keys kept server-side only, prompt-injection gating on anything that consumes untrusted content.",
    surface: "bg-cardsurface",
    heading: "text-paper",
    body: "text-dim",
  },
  {
    icon: Workflow,
    statement: "Tool contracts and agent bounds.",
    description:
      "Irreversible tools need an approval gate. Writes need an idempotency key. Every agent needs a step limit and a cost ceiling — not optional, not assumed.",
    surface: "bg-cardsurface",
    heading: "text-paper",
    body: "text-dim",
  },
  {
    icon: Bell,
    statement: "The silent failures, caught.",
    description:
      "A scheduled job that stops firing looks identical to success unless something alerts on its absence. We found this exact bug on ourselves, twice.",
    surface: "bg-signal",
    heading: "text-ink",
    body: "text-ink/70",
  },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export function Features12() {
  return (
    <section id="what-it-catches" className="w-full bg-ink px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="mx-auto w-full max-w-[1400px]">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">The problem</p>
          <motion.h2
            variants={fadeUp}
            className="mt-4 max-w-2xl text-3xl font-medium leading-[1.15] tracking-tight text-paper sm:text-4xl md:text-5xl"
          >
            Around 88% of enterprise agent pilots never reach production.
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mt-5 max-w-xl text-base leading-relaxed text-dim sm:text-lg"
          >
            The blockers are consistently evaluation gaps, governance friction
            and reliability — not model quality.
          </motion.p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-12 grid grid-cols-1 gap-5 sm:mt-16 md:grid-cols-3 lg:gap-6"
        >
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.article
                key={card.statement}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className={`flex min-h-[320px] flex-col rounded-3xl p-6 transition-shadow duration-200 hover:shadow-xl hover:shadow-neutral-900/10 dark:hover:shadow-black/40 sm:p-8 lg:min-h-[400px] ${card.surface}`}
              >
                <Icon className={`h-7 w-7 ${card.heading}`} strokeWidth={1.5} />

                <div className="mt-auto pt-14 sm:pt-16">
                  <h3
                    className={`text-2xl font-medium leading-snug tracking-tight lg:text-3xl ${card.heading}`}
                  >
                    {card.statement}
                  </h3>
                  <p
                    className={`mt-4 text-sm leading-relaxed sm:text-base ${card.body}`}
                  >
                    {card.description}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
