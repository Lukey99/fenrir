"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Screenshot } from "@/components/marketing/screenshot";

/** The hero's visual thesis — the dashboard front and center, with the live
 * tracker and progress chart peeking from behind, like a hand of cards. Idle
 * float keeps it feeling alive without competing with the headline above. */
export function HeroShowcase() {
  const prefersReducedMotion = useReducedMotion();
  const idle = (delay: number) =>
    prefersReducedMotion
      ? undefined
      : { y: [0, -8, 0], transition: { duration: 5, repeat: Infinity, ease: "easeInOut" as const, delay } };

  return (
    <div className="relative mx-auto w-full max-w-4xl px-6 py-8 sm:py-12">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--brand)_20%,transparent),transparent)] blur-2xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 24, rotate: -8, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, rotate: -6, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        className="absolute top-10 left-0 hidden w-[38%] sm:block"
      >
        <motion.div animate={idle(0.4)}>
          <Screenshot
            name="progress"
            alt="Graphique de progression"
            className="ring-1 ring-black/5 dark:ring-white/10"
          />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24, rotate: 8, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, rotate: 6, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.38, ease: "easeOut" }}
        className="absolute top-10 right-0 hidden w-[38%] sm:block"
      >
        <motion.div animate={idle(0.9)}>
          <Screenshot
            name="workout"
            alt="Séance en direct"
            className="ring-1 ring-black/5 dark:ring-white/10"
          />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.22, ease: "easeOut" }}
        className="relative mx-auto w-full sm:w-[64%]"
      >
        <motion.div animate={idle(0)}>
          <Screenshot
            name="dashboard"
            alt="Tableau de bord Fenrir"
            className="ring-1 ring-black/5 dark:ring-white/10"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
