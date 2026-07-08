"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function ProfileForm({ name, email }: { name: string | null; email: string | null }) {
  const [value, setValue] = useState(name ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (value.trim().length === 0) {
      setError("Nom requis.");
      return;
    }

    setError(null);
    setSubmitting(true);
    const response = await fetch("/api/settings/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: value.trim() }),
    });
    setSubmitting(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Une erreur est survenue.");
      return;
    }

    toast.success("Profil mis à jour.");
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="profile-email">E-mail</Label>
        <Input id="profile-email" value={email ?? ""} disabled />
      </div>
      <div className="space-y-2">
        <Label htmlFor="profile-name">Nom</Label>
        <Input id="profile-name" value={value} onChange={(e) => setValue(e.target.value)} />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
      <Button
        size="sm"
        onClick={submit}
        disabled={submitting}
        className={cn(submitting && "opacity-70")}
      >
        {submitting ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </div>
  );
}
