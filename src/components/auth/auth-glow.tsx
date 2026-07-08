"use client";

import { motion } from "framer-motion";

export function AuthGlow() {
  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 h-96 bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--brand)_18%,transparent),transparent)]"
        animate={{ scale: [1, 1.08, 1], opacity: [0.9, 1, 0.9] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.svg
        aria-hidden
        viewBox="0 0 120 120"
        className="pointer-events-none absolute top-10 right-10 size-16 text-brand/25 sm:top-14 sm:right-16 sm:size-20"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <mask id="auth-moon-mask">
          <rect width="120" height="120" fill="white" />
          <circle cx="70" cy="45" r="38" fill="black" />
        </mask>
        <circle cx="55" cy="55" r="40" fill="currentColor" mask="url(#auth-moon-mask)" />
      </motion.svg>
      {[
        { top: "18%", left: "22%", size: 3, delay: 0 },
        { top: "32%", left: "68%", size: 2, delay: 0.6 },
        { top: "10%", left: "46%", size: 2, delay: 1.1 },
      ].map((star, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="pointer-events-none absolute rounded-full bg-brand/40"
          style={{ top: star.top, left: star.left, width: star.size, height: star.size }}
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: star.delay }}
        />
      ))}
    </>
  );
}
