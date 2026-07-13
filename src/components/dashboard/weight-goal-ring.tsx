"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { MagneticButton } from "@/components/ui/magnetic-button";

export function WeightGoalRing({
  weightGoal,
}: {
  weightGoal: { targetWeight: number; remaining: number; progressPercent: number } | null;
}) {
  if (!weightGoal) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-muted-foreground">
          Définis un objectif de poids pour suivre ta progression ici.
        </p>
        <MagneticButton
          size="sm"
          variant="outline"
          render={<Link href="/bodyweight" />}
          nativeButton={false}
        >
          Définir un objectif
        </MagneticButton>
      </div>
    );
  }

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - weightGoal.progressPercent / 100);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2">
      <div className="relative flex size-24 items-center justify-center">
        <svg viewBox="0 0 96 96" className="size-24 -rotate-90">
          <circle cx="48" cy="48" r={radius} fill="none" strokeWidth="8" className="stroke-muted" />
          <motion.circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            className="stroke-brand"
            style={{ strokeDasharray: circumference }}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <span className="absolute font-heading text-xl font-bold">
          {weightGoal.progressPercent}%
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        {weightGoal.remaining > 0
          ? `${weightGoal.remaining} kg avant l'objectif`
          : "Objectif atteint !"}
      </p>
    </div>
  );
}
