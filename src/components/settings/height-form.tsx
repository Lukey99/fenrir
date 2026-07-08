"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function HeightForm({ initialHeightCm }: { initialHeightCm: number | null }) {
  const [value, setValue] = useState(initialHeightCm ? String(initialHeightCm) : "");
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
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="settings-height">Taille (cm)</Label>
      <div className="flex items-center gap-2">
        <Input
          id="settings-height"
          inputMode="numeric"
          placeholder="Ex : 178"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-24"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={submit}
          disabled={submitting}
          className={cn(submitting && "opacity-70")}
        >
          {submitting ? "..." : "Enregistrer"}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">Utilisée pour calculer ton IMC.</p>
    </div>
  );
}
