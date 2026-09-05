"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, Copy, PackageCheck, ShieldCheck, Terminal } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const outputList: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const outputLine: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

const installers = [
  {
    id: "skills",
    label: "Agent skill",
    command: "npx skills add arthursilas-ai/agent-preflight",
    output: [
      "Cloning arthursilas-ai/agent-preflight",
      "Found 1 skill · agent-preflight",
      "Installed to Claude Code, Cursor, Codex, Gemini CLI +12 more",
    ],
  },
  {
    id: "curl",
    label: "Standalone",
    command: "curl -O https://raw.githubusercontent.com/arthursilas-ai/agent-preflight/main/scripts/preflight.py",
    output: [
      "One file, no dependencies beyond pyyaml",
      "python3 preflight.py --init      # writes a starter spec",
      "python3 preflight.py agent-spec.yaml",
    ],
  },
  {
    id: "action",
    label: "CI / GitHub Action",
    command: "uses: arthursilas-ai/agent-preflight@main",
    output: [
      "Runs the same checker in your pipeline",
      "Fails the build on any blocking finding",
      "Comments the report on the PR",
    ],
  },
];

const guarantees = [
  {
    icon: ShieldCheck,
    title: "No network calls",
    text: "The checker reads your spec and returns a verdict. It never calls a model and never phones home.",
  },
  {
    icon: Terminal,
    title: "Same input, same answer",
    text: "Fully deterministic — the exact property that makes a verdict something a reviewer can actually rely on.",
  },
  {
    icon: PackageCheck,
    title: "MIT licensed",
    text: "Free forever. The checks are open source and designed to run on your own hardware.",
  },
];

export function Download8() {
  const [activeId, setActiveId] = useState(installers[0].id);
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();

  const active = installers.find((installer) => installer.id === activeId) ?? installers[0];

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(active.command);
      setCopied(true);
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section id="install" className="w-full bg-ink px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="mx-auto flex w-full max-w-[1400px] flex-col items-center"
      >
        <motion.h2
          variants={item}
          className="max-w-3xl text-center text-3xl font-medium tracking-tight text-paper text-balance sm:text-4xl md:text-5xl lg:text-6xl"
        >
          One command. No account, no setup.
        </motion.h2>

        <motion.p
          variants={item}
          className="mt-6 max-w-xl text-center text-base leading-relaxed text-dim sm:text-lg"
        >
          Works as an agent skill in Claude Code, Cursor, Copilot, Codex, Gemini, Zed — or as one standalone Python file.
        </motion.p>

        <motion.div variants={item} className="mt-12 w-full max-w-3xl">
          <div className="overflow-hidden rounded-2xl border border-line bg-cardsurface shadow-xl shadow-black/40">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-3">
                <span className="flex gap-1.5" aria-hidden="true">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                </span>
                <span className="hidden font-mono text-xs text-dim sm:inline">agent-preflight · install</span>
              </div>
              <div className="flex rounded-full border border-white/10 bg-white/5 p-1">
                {installers.map((installer) => (
                  <button
                    key={installer.id}
                    type="button"
                    onClick={() => setActiveId(installer.id)}
                    aria-pressed={activeId === installer.id}
                    className="relative cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  >
                    {activeId === installer.id && (
                      <motion.span
                        layoutId="orbit-active-tab"
                        style={{ borderRadius: 9999 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-0 bg-white"
                      />
                    )}
                    <span
                      className={`relative z-10 transition-colors ${
                        activeId === installer.id ? "text-neutral-900" : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      {installer.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="px-5 py-6 sm:px-7 sm:py-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <p className="min-w-0 break-words font-mono text-sm leading-relaxed text-neutral-100 sm:text-[15px]">
                  <span className="select-none text-neutral-500">$ </span>
                  {active.command}
                  {reduceMotion ? (
                    <span
                      aria-hidden="true"
                      className="ml-1.5 inline-block h-[1.05em] w-[7px] align-middle bg-neutral-100"
                    />
                  ) : (
                    <motion.span
                      aria-hidden="true"
                      className="ml-1.5 inline-block h-[1.05em] w-[7px] align-middle bg-neutral-100"
                      animate={{ opacity: [1, 1, 0, 0] }}
                      transition={{ duration: 1.1, repeat: Infinity, times: [0, 0.5, 0.5, 1], ease: "linear" }}
                    />
                  )}
                </p>

                <button
                  type="button"
                  onClick={copyCommand}
                  className="inline-flex h-9 min-w-[104px] shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border border-white/15 px-4 text-xs font-medium text-neutral-300 transition-colors hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {copied ? (
                      <motion.span
                        key="copied"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                        className="inline-flex items-center gap-2"
                      >
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        Copied
                      </motion.span>
                    ) : (
                      <motion.span
                        key="copy"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                        className="inline-flex items-center gap-2"
                      >
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                        Copy
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>

              <div className="mt-6 border-t border-white/10 pt-5">
                <div className="min-h-[132px] sm:min-h-[120px]">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.ul
                      key={active.id}
                      variants={outputList}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, transition: { duration: 0.15 } }}
                      className="space-y-2.5 font-mono text-[13px]"
                    >
                      {active.output.map((line) => (
                        <motion.li key={line} variants={outputLine} className="flex items-center gap-2.5 text-neutral-400">
                          <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" aria-hidden="true" />
                          <span className="min-w-0 break-words">{line}</span>
                        </motion.li>
                      ))}
                      <motion.li variants={outputLine} className="pt-1.5 text-neutral-100">
                        → run <span className="rounded-md bg-white/10 px-1.5 py-0.5">preflight.py --init</span> to write a starter spec
                      </motion.li>
                    </motion.ul>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={item}
          className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 font-mono text-xs text-dim"
        >
          <span>MIT licensed</span>
          <span aria-hidden="true">·</span>
          <span>needs Python 3 + pyyaml</span>
          <span aria-hidden="true">·</span>
          <span>macos / linux / windows</span>
        </motion.div>

        <motion.a
          variants={item}
          href="https://melfavlboxvfvmyojyqu.supabase.co/storage/v1/object/public/content/agent-preflight/agent-preflight.tgz"
          className="mt-8 inline-flex cursor-pointer items-center gap-1.5 rounded-sm text-sm font-medium text-paper transition-colors hover:text-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        >
          Prefer the full package? Direct download
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </motion.a>

        <div className="mt-16 grid w-full max-w-4xl grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
          {guarantees.map((point) => (
            <motion.div key={point.title} variants={item}>
              <point.icon className="h-5 w-5 text-signal" aria-hidden="true" />
              <h3 className="mt-4 text-sm font-semibold text-paper">{point.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-dim">{point.text}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
