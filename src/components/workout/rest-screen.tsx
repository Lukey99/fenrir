"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Plus, SkipForward, Square } from "lucide-react";

import { Button } from "@/components/ui/button";

export function RestScreen({
  exerciseName,
  seconds,
  onDone,
  onStop,
  onBackToList,
}: {
  exerciseName: string;
  seconds: number;
  onDone: () => void;
  onStop: () => void;
  onBackToList: () => void;
}) {
  const [remaining, setRemaining] = useState(seconds);

  // `onDone` is a fresh closure every render of the parent (which itself
  // re-renders every second for the elapsed-time ticker) — depending on it
  // directly would tear down and recreate this interval on every parent
  // tick, not just when `remaining` actually changes, making the countdown
  // drift/stall. A ref sidesteps that without needing `onDone` in the deps.
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const interval = setInterval(() => setRemaining((r) => (r > 0 ? r - 1 : r)), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (remaining <= 0) {
      const timeout = setTimeout(() => onDoneRef.current(), 300);
      return () => clearTimeout(timeout);
    }
  }, [remaining]);

  const minutes = Math.floor(Math.max(remaining, 0) / 60);
  const secs = Math.max(remaining, 0) % 60;

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="px-4 pt-4">
        <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground" onClick={onBackToList}>
          <ChevronLeft className="size-4" />
          Retour à la liste
        </Button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
        <div>
          <p className="text-sm text-muted-foreground">Repos — {exerciseName}</p>
          <p className="mt-2 font-heading text-6xl font-semibold tabular-nums">
            {minutes}:{secs.toString().padStart(2, "0")}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setRemaining((r) => Math.max(r, 0) + 15)}>
          <Plus className="size-4" />
          Ajouter 15 secondes
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 p-4">
        <Button variant="outline" size="lg" onClick={onStop}>
          <Square className="size-4" />
          Arrêter la séance
        </Button>
        <Button size="lg" onClick={onDone}>
          <SkipForward className="size-4" />
          Passer le temps de repos
        </Button>
      </div>
    </div>
  );
}
