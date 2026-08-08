"use client";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { ArrowUpRight, Menu, X } from "lucide-react";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const links = ["Install", "What it catches", "The audit"];
const linkHrefs: Record<string, string> = {
  Install: "#install",
  "What it catches": "#what-it-catches",
  "The audit": "#audit",
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-950";

export default function Navigation15() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const current = hovered;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const drawerStagger: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.06,
        delayChildren: shouldReduceMotion ? 0 : 0.2,
      },
    },
  };

  const drawerItem: Variants = {
    hidden: { opacity: 0, x: shouldReduceMotion ? 0 : 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: EASE } },
  };

  return (
    <header className="w-full bg-ink">
      <div className="w-full">
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="border-b border-line"
          aria-label="Primary"
        >
          <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <a
            href="/"
            className={`flex items-center gap-2.5 rounded-sm text-lg font-semibold tracking-tight text-paper ${focusRing}`}
          >
            <span className="h-2.5 w-2.5 rounded-full bg-signal" />
            agent-preflight
          </a>

          <div
            className="hidden items-center gap-8 md:flex"
            onMouseLeave={() => setHovered(null)}
          >
            {links.map((link) => (
              <a
                key={link}
                href={linkHrefs[link]}
                onMouseEnter={() => setHovered(link)}
                onFocus={() => setHovered(link)}
                onBlur={() => setHovered(null)}
                className={`relative rounded-sm py-2 text-sm font-medium transition-colors duration-200 ${focusRing} ${
                  current === link ? "text-paper" : "text-dim"
                }`}
              >
                {link}
                {current === link && (
                  <motion.span
                    layoutId="nav15-line"
                    className="absolute inset-x-0 bottom-0 h-px bg-signal"
                    transition={{ duration: 0.3, ease: EASE }}
                  />
                )}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <a
              href="https://github.com/arthursilas-ai/agent-preflight"
              className={`rounded-sm text-sm font-medium text-dim transition-colors duration-200 hover:text-paper ${focusRing}`}
            >
              GitHub
            </a>
            <a
              href="#audit"
              className={`inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-medium text-paper transition-colors duration-200 hover:bg-signal hover:text-ink hover:border-signal ${focusRing}`}
            >
              Book the audit
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="nav15-drawer"
            aria-label="Open menu"
            className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-neutral-200 text-neutral-950 transition-colors duration-200 hover:bg-neutral-50 dark:border-neutral-800 dark:text-white dark:hover:bg-neutral-900 md:hidden ${focusRing}`}
          >
            <Menu className="h-5 w-5" />
          </button>
          </div>
        </motion.nav>

        <AnimatePresence>
          {open && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="fixed inset-0 z-40 bg-neutral-950/40 backdrop-blur-[2px] md:hidden"
                onClick={() => setOpen(false)}
                aria-hidden="true"
              />
              <motion.aside
                id="nav15-drawer"
                role="dialog"
                aria-modal="true"
                aria-label="Menu"
                initial={
                  shouldReduceMotion ? { opacity: 0 } : { x: "100%" }
                }
                animate={shouldReduceMotion ? { opacity: 1 } : { x: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { x: "100%" }}
                transition={{
                  duration: shouldReduceMotion ? 0.2 : 0.5,
                  ease: EASE,
                }}
                className="fixed inset-0 z-50 flex w-full flex-col overflow-y-auto bg-white px-6 pb-8 pt-5 dark:bg-neutral-950 md:hidden"
              >
                <div className="flex items-center justify-between border-b border-neutral-200 pb-5 dark:border-neutral-800">
                  <span className="flex items-center gap-2.5 text-lg font-semibold tracking-tight text-neutral-950 dark:text-white">
                    <span className="h-2.5 w-2.5 rounded-[3px] bg-neutral-950 dark:bg-white" />
                    Plainform
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close menu"
                    className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-neutral-200 text-neutral-950 transition-colors duration-200 hover:bg-neutral-50 dark:border-neutral-800 dark:text-white dark:hover:bg-neutral-900 ${focusRing}`}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <motion.nav
                  initial="hidden"
                  animate="visible"
                  variants={drawerStagger}
                  className="mt-8 flex flex-col"
                  aria-label="Menu links"
                >
                  <motion.p
                    variants={drawerItem}
                    className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500"
                  >
                    Menu
                  </motion.p>
                  {links.map((link) => (
                    <motion.a
                      key={link}
                      href={linkHrefs[link]}
                      variants={drawerItem}
                      onClick={() => setOpen(false)}
                      className={`group flex items-center justify-between border-b border-line py-4 ${focusRing}`}
                    >
                      <span className="text-2xl font-semibold tracking-tight text-paper transition-colors duration-200 group-hover:text-dim">
                        {link}
                      </span>
                      <ArrowUpRight className="h-5 w-5 text-dim transition-colors duration-200 group-hover:text-paper" />
                    </motion.a>
                  ))}
                </motion.nav>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: shouldReduceMotion ? 0.1 : 0.5,
                    ease: EASE,
                  }}
                  className="mt-auto pt-10"
                >
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-dim">
                    Questions
                  </p>
                  <a
                    href="https://arthur-sandbox.vercel.app/log"
                    className={`mt-2 inline-block rounded-sm text-base font-medium text-paper transition-colors duration-200 hover:text-dim ${focusRing}`}
                  >
                    Reply to the build log
                  </a>
                  <div className="mt-6 grid gap-2">
                    <a
                      href="https://github.com/arthursilas-ai/agent-preflight"
                      className={`rounded-full border border-line px-5 py-3 text-center text-sm font-medium text-paper transition-colors duration-200 hover:bg-white/5 ${focusRing}`}
                    >
                      GitHub
                    </a>
                    <a
                      href="#audit"
                      className={`inline-flex items-center justify-center gap-1.5 rounded-full bg-signal px-5 py-3 text-sm font-medium text-ink transition-colors duration-200 hover:brightness-110 ${focusRing}`}
                    >
                      Book the audit
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>
                </motion.div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
