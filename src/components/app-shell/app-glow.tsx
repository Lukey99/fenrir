"use client";

import { motion } from "framer-motion";

/** The contained energy behind the "chains" — a slow-breathing violet/ember/
 * frost aurora. Glass panels sit on top of this in both themes, so it needs
 * to be genuinely vivid in light mode too, not just a whisper — glassmorphism
 * only reads as glass when there's real color behind it to blur. */
export function AppGlow() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute -top-32 left-1/4 size-[36rem] rounded-full bg-(image:--brand-gradient) opacity-30 blur-3xl dark:opacity-40"
        animate={{ scale: [1, 1.15, 1], x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 right-0 size-[34rem] rounded-full bg-ember opacity-25 blur-3xl dark:opacity-28"
        animate={{ scale: [1, 1.2, 1], x: [0, -35, 0], y: [0, 20, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute top-1/3 right-1/4 size-[24rem] rounded-full bg-frost opacity-20 blur-3xl dark:opacity-14"
        animate={{ scale: [1, 1.25, 1], x: [0, 25, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
      <div className="bg-noise absolute inset-0 opacity-[0.025] dark:opacity-[0.06]" />
    </div>
  );
}
