"use client";

import { useState } from "react";
import { Ruler } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function HeightPrompt({ onSaved }: { onSaved: () => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    const heightCm = Number(value.trim());
    if (!Number.isInteger(heightCm) || heightCm < 100 || heightCm > 250) {
      setError("Renseigne une taille valide, en cm (ex : 178).");
      return;
    }

    setError(null);
    setSubmitting(true);
    const response = await fetch("/api/bodyweight/height", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ heightCm }),
    });
    setSubmitting(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Une erreur est survenue.");
      return;
    }

    toast.success("Taille enregistrée.");
    onSaved();
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed px-4 py-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muscle-calves/12 text-muscle-calves">
        <Ruler className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">Renseigne ta taille pour voir ton IMC</p>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
      <div className="flex items-center gap-2">
        <Input
          inputMode="numeric"
          placeholder="cm"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-20"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={submit}
          disabled={submitting}
          className={cn(submitting && "opacity-70")}
        >
          {submitting ? "..." : "Valider"}
        </Button>
      </div>
    </div>
  );
}
