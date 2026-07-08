"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Plus, Timer } from "lucide-react";

import { Button } from "@/components/ui/button";

export function RestTimer({
  totalSeconds,
  onDone,
}: {
  totalSeconds: number | null;
  onDone: () => void;
}) {
  const [remaining, setRemaining] = useState(totalSeconds ?? 0);

  // Reset the countdown whenever a new rest period starts. Adjusting state
  // during render (rather than in an effect) avoids an extra render pass —
  // this is the pattern React recommends for "reset state when a prop changes".
  const [trackedTotal, setTrackedTotal] = useState(totalSeconds);
  if (totalSeconds !== trackedTotal) {
    setTrackedTotal(totalSeconds);
    if (totalSeconds !== null) setRemaining(totalSeconds);
  }

  useEffect(() => {
    if (totalSeconds === null) return;
    if (remaining <= 0) {
      const timeout = setTimeout(onDone, 400);
      return () => clearTimeout(timeout);
    }
    const interval = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(interval);
  }, [totalSeconds, remaining, onDone]);

  const minutes = Math.floor(Math.max(remaining, 0) / 60);
  const seconds = Math.max(remaining, 0) % 60;

  return (
    <AnimatePresence>
      {totalSeconds !== null && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-x-0 bottom-4 z-40 mx-auto flex w-fit items-center gap-3 rounded-full border bg-popover px-4 py-2.5 shadow-lg"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-brand/12 text-brand">
            <Timer className="size-4" />
          </span>
          <span className="font-heading text-lg tabular-nums font-semibold">
            {minutes}:{seconds.toString().padStart(2, "0")}
          </span>
          <span className="text-xs text-muted-foreground">repos</span>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Ajouter 15 secondes"
            onClick={() => setRemaining((r) => r + 15)}
          >
            <Plus className="size-3.5" />
          </Button>
          <Button size="icon-sm" variant="ghost" aria-label="Fermer" onClick={onDone}>
            <X className="size-3.5" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
