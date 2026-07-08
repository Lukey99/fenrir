"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function StartSessionButton({
  programDayId,
  size = "sm",
  variant = "default",
  children,
}: {
  programDayId?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "secondary" | "ghost";
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleStart() {
    setBusy(true);
    const response = await fetch("/api/workouts/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(programDayId ? { programDayId } : {}),
    });

    const data = await response.json();
    if (!response.ok) {
      setBusy(false);
      toast.error("Impossible de démarrer la séance.");
      return;
    }

    router.push(`/workout/${data.session.id}`);
  }

  return (
    <Button size={size} variant={variant} onClick={handleStart} disabled={busy}>
      <Play className="size-4" />
      {children ?? (busy ? "Démarrage..." : "Démarrer")}
    </Button>
  );
}
