"use client";

import { useState } from "react";
import { Timer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function RestConfigSheet({
  exerciseName,
  defaultSeconds,
  onConfirm,
}: {
  exerciseName: string;
  defaultSeconds: number;
  onConfirm: (seconds: number, keepForSession: boolean) => void;
}) {
  const [seconds, setSeconds] = useState(defaultSeconds);
  const [keep, setKeep] = useState(false);

  return (
    <Sheet open disablePointerDismissal>
      <SheetContent side="bottom" showCloseButton={false} className="mx-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Timer className="size-4" />
            Temps de repos
          </SheetTitle>
          <SheetDescription>Après {exerciseName}, combien de temps de repos ?</SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4">
          <div className="flex items-center justify-center gap-2">
            {[60, 90, 120].map((preset) => (
              <Button
                key={preset}
                type="button"
                variant={seconds === preset ? "default" : "outline"}
                size="sm"
                onClick={() => setSeconds(preset)}
              >
                {preset}s
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rest-seconds">Durée (secondes)</Label>
            <Input
              id="rest-seconds"
              type="number"
              inputMode="numeric"
              className="h-12 text-center text-lg"
              value={seconds}
              onChange={(e) => setSeconds(Math.max(0, Number(e.target.value) || 0))}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 shrink-0 accent-brand"
              checked={keep}
              onChange={(e) => setKeep(e.target.checked)}
            />
            Garder ce temps de repos pour la suite de la séance
          </label>
        </div>

        <div className="p-4">
          <Button size="lg" className="w-full" onClick={() => onConfirm(seconds, keep)}>
            Confirmer
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
