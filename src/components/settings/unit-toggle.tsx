"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WeightUnit } from "@/lib/units";

export function UnitToggle({ initialUnit }: { initialUnit: WeightUnit }) {
  const { update } = useSession();
  const [unit, setUnit] = useState<WeightUnit>(initialUnit);
  const [submitting, setSubmitting] = useState(false);

  async function select(next: WeightUnit) {
    if (next === unit || submitting) return;

    setSubmitting(true);
    const response = await fetch("/api/settings/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unitPreference: next }),
    });
    setSubmitting(false);

    if (!response.ok) {
      toast.error("Impossible de mettre à jour l'unité.");
      return;
    }

    setUnit(next);
    await update({ unitPreference: next });
    toast.success(`Unité changée pour ${next === "KG" ? "les kilogrammes" : "les livres"}.`);
  }

  return (
    <div className="inline-flex rounded-lg border p-1">
      {(["KG", "LBS"] as const).map((option) => (
        <Button
          key={option}
          size="sm"
          variant={unit === option ? "default" : "ghost"}
          className={cn("min-w-16", unit !== option && "text-muted-foreground")}
          onClick={() => select(option)}
          disabled={submitting}
        >
          {option === "KG" ? "kg" : "lb"}
        </Button>
      ))}
    </div>
  );
}
