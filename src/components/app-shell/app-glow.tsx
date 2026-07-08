"use client";

import { motion } from "framer-motion";

export function AppGlow() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute -top-32 left-1/4 size-[36rem] rounded-full bg-(image:--brand-gradient) opacity-[0.07] blur-3xl dark:opacity-[0.14]"
        animate={{ scale: [1, 1.12, 1], x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 right-0 size-[30rem] rounded-full bg-(image:--brand-gradient) opacity-[0.05] blur-3xl dark:opacity-[0.1]"
        animate={{ scale: [1, 1.15, 1], x: [0, -25, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <div className="bg-noise absolute inset-0 opacity-[0.025] dark:opacity-[0.05]" />
    </div>
  );
}
