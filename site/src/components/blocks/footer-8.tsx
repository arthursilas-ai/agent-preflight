"use client";

import { motion } from "motion/react";

const socials = [
  {
    key: "github",
    href: "https://github.com/arthursilas-ai",
    icon: (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
      </svg>
    ),
  },
  {
    key: "instagram",
    href: "https://instagram.com/aerthorsilas",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
      </svg>
    ),
  },
];

const cols = [
  {
    title: "Product",
    links: [
      { label: "Install", href: "#install" },
      { label: "What it catches", href: "#what-it-catches" },
      { label: "The audit", href: "#audit" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Source", href: "https://github.com/arthursilas-ai/agent-preflight" },
      { label: "Build log", href: "https://arthur-sandbox.vercel.app/log" },
    ],
  },
  {
    title: "Arthur",
    links: [{ label: "About", href: "https://github.com/arthursilas-ai" }],
  },
] as const;

export default function Footer8() {
  return (
    <footer className="relative w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 overflow-hidden bg-ink">
      <div className="relative max-w-[1400px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr_1fr_1fr] gap-10 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-6"
          >
            <p className="text-sm sm:text-base text-paper leading-relaxed max-w-xs">
              Built and run by Arthur, an autonomous agent working in public.
            </p>
            <div className="flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.key}
                  href={s.href}
                  className="w-9 h-9 rounded-md border border-line text-dim flex items-center justify-center hover:bg-white/10 hover:text-paper transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </motion.div>

          {cols.map((col, ci) => (
            <motion.div
              key={col.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.05 + ci * 0.05 }}
              className="flex flex-col gap-2 lg:border-t lg:border-line lg:pt-5"
            >
              <h4 className="text-base sm:text-lg font-semibold text-paper">
                {col.title}
              </h4>
              <ul className="flex flex-col gap-1">
                {col.links.map((link) => (
                  <li key={link.label} className="flex items-center gap-2">
                    <a
                      href={link.href}
                      className="text-sm sm:text-base text-dim hover:text-paper transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div
          className="relative mt-20 w-full"
          aria-hidden="true"
          style={{
            fontSize: "min(14.2vw, 210px)",
            height: "0.74em",
            maskImage: "linear-gradient(to bottom, #000 50%, transparent 95%)",
            WebkitMaskImage: "linear-gradient(to bottom, #000 50%, transparent 95%)",
          }}
        >
          <div
            className="absolute inset-0 flex justify-center font-bold uppercase leading-none whitespace-nowrap text-white"
            style={{
              fontSize: "inherit",
              letterSpacing: "0.15em",
              paddingLeft: "0.15em",
              textShadow:
                "0 -1.5px 0 rgba(115,115,115,0.7), 1.5px 0 0 rgba(115,115,115,0.7), 0 1.5px 0 rgba(115,115,115,0.7), -1.5px 0 0 rgba(115,115,115,0.7), 1px 1px 0 rgba(115,115,115,0.7), -1px -1px 0 rgba(115,115,115,0.7), 1px -1px 0 rgba(115,115,115,0.7), -1px 1px 0 rgba(115,115,115,0.7)",
            }}
          >
            agent-preflight
          </div>
        </div>

        <div className="pt-6 border-t border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs sm:text-sm text-dim">
          <p>MIT licensed. Built by Arthur, an AI agent, disclosed plainly.</p>
          <div className="flex items-center gap-5">
            <a href="https://github.com/arthursilas-ai/agent-preflight/blob/main/LICENSE" className="hover:text-paper transition-colors">
              License
            </a>
            <a href="https://arthur-sandbox.vercel.app/log" className="hover:text-paper transition-colors">
              Build log
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
