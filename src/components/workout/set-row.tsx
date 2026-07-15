"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Trash2, Trophy } from "lucide-react";
import { toast } from "sonner";

import type { WorkoutSetDTO } from "@/types/workout";
import { cn, decimalNumber } from "@/lib/utils";
import { useUnit } from "@/hooks/use-unit";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SetRow({
  sessionId,
  set,
  onUpdated,
  onRemoved,
  onCompleted,
}: {
  sessionId: string;
  set: WorkoutSetDTO;
  onUpdated: (set: WorkoutSetDTO) => void;
  onRemoved: (id: string) => void;
  onCompleted: () => void;
}) {
  const { unitLabel, toDisplay, fromDisplay } = useUnit();
  const [weight, setWeight] = useState(set.weight ? String(toDisplay(Number(set.weight))) : "");
  const [reps, setReps] = useState(set.reps?.toString() ?? "");
  const [rpe, setRpe] = useState(set.rpe ?? "");

  async function patch(body: Record<string, unknown>) {
    const response = await fetch(`/api/workouts/sessions/${sessionId}/sets/${set.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      toast.error("Impossible d'enregistrer la série.");
      return;
    }
    const data = await response.json();
    onUpdated(data.set);
    if (data.newRecord) {
      toast.success(
        `Nouveau record : ${data.newRecord.exerciseName} à ${toDisplay(data.newRecord.weight)} ${unitLabel} × ${data.newRecord.reps} !`,
        { icon: <Trophy className="size-4" /> }
      );
    }
  }

  function commitWeight() {
    const value = weight === "" ? null : fromDisplay(decimalNumber(weight));
    if (value !== (set.weight ? Number(set.weight) : null)) patch({ weight: value });
  }

  function commitReps() {
    const value = reps === "" ? null : Number(reps);
    if (value !== set.reps) patch({ reps: value });
  }

  function commitRpe() {
    const value = rpe === "" ? null : decimalNumber(rpe);
    if (value !== (set.rpe ? Number(set.rpe) : null)) patch({ rpe: value });
  }

  async function toggleComplete() {
    const nextCompleted = !set.completed;
    const body: Record<string, unknown> = { completed: nextCompleted };
    if (nextCompleted) {
      // Weight/reps otherwise only commit independently on blur, which can
      // race this PATCH — bundle the current field values into the same
      // request so the server sees them at the exact moment it checks for a
      // new PR, instead of whatever was already saved before this click.
      body.weight = weight === "" ? null : fromDisplay(decimalNumber(weight));
      body.reps = reps === "" ? null : Number(reps);
    }
    await patch(body);
    if (nextCompleted) onCompleted();
  }

  async function handleRemove() {
    const response = await fetch(`/api/workouts/sessions/${sessionId}/sets/${set.id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      toast.error("Impossible de retirer la série.");
      return;
    }
    onRemoved(set.id);
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border p-2 transition-colors",
        set.completed ? "border-brand/30 bg-brand/5" : ""
      )}
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium">
        {set.setNumber}
      </span>
      <Input
        inputMode="decimal"
        placeholder={unitLabel}
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        onBlur={commitWeight}
        className="h-10 w-16 text-center"
      />
      <Input
        inputMode="numeric"
        placeholder="reps"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        onBlur={commitReps}
        className="h-10 w-16 text-center"
      />
      <Input
        inputMode="decimal"
        placeholder="RPE"
        value={rpe}
        onChange={(e) => setRpe(e.target.value)}
        onBlur={commitRpe}
        className="h-10 w-16 text-center"
      />
      <Button
        size="icon"
        variant={set.completed ? "default" : "outline"}
        aria-label="Marquer la série comme terminée"
        onClick={toggleComplete}
        className={cn("ml-auto overflow-hidden", set.completed && "bg-brand text-brand-foreground hover:bg-brand/85")}
      >
        {/* A repeatable pop, not just a static swap — this is the single most
            tapped control in the app, worth the extra frame of feedback. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={set.completed ? "done" : "todo"}
            initial={{ scale: 0.3, rotate: -25, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            className="flex"
          >
            <Check className="size-4" />
          </motion.span>
        </AnimatePresence>
      </Button>
      <Button size="icon" variant="ghost" aria-label="Retirer la série" onClick={handleRemove}>
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}
