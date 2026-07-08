"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { WorkoutSessionDTO, SessionExerciseDTO } from "@/types/workout";
import { muscleGroupLabels } from "@/lib/constants";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ExerciseTrackerCard } from "@/components/workout/exercise-tracker-card";
import { AddSessionExerciseDialog } from "@/components/workout/add-session-exercise-dialog";
import { RestTimer } from "@/components/workout/rest-timer";

type ExerciseOption = {
  id: string;
  name: string;
  muscleGroup: keyof typeof muscleGroupLabels;
  equipment: string | null;
};

function useElapsed(startedAt: string) {
  const [elapsed, setElapsed] = useState(() =>
    Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  return elapsed;
}

export function WorkoutTracker({
  initialSession,
  exercises,
}: {
  initialSession: WorkoutSessionDTO;
  exercises: ExerciseOption[];
}) {
  const router = useRouter();
  const [session, setSession] = useState(initialSession);
  const [restSeconds, setRestSeconds] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const elapsed = useElapsed(session.startedAt);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  function updateExercise(updated: SessionExerciseDTO) {
    setSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((e) => (e.id === updated.id ? updated : e)),
    }));
  }

  async function handleComplete() {
    setCompleting(true);
    const response = await fetch(`/api/workouts/sessions/${session.id}/complete`, {
      method: "POST",
    });
    setCompleting(false);
    if (!response.ok) {
      toast.error("Impossible de terminer la séance.");
      return;
    }
    toast.success("Séance terminée. Bravo !");
    router.push(session.programDay ? `/programs/${session.programDay.programId}` : "/dashboard");
  }

  async function handleDelete() {
    setDeleting(true);
    const response = await fetch(`/api/workouts/sessions/${session.id}`, {
      method: "DELETE",
    });
    setDeleting(false);
    if (!response.ok) {
      toast.error("Impossible de supprimer la séance.");
      return;
    }
    toast.success("Séance supprimée.");
    router.push(session.programDay ? `/programs/${session.programDay.programId}` : "/dashboard");
  }

  const activeCount = session.exercises.filter((e) => e.action !== "SKIPPED").length;
  const completedSets = session.exercises
    .flatMap((e) => e.sets)
    .filter((s) => s.completed).length;
  const totalSets = session.exercises
    .filter((e) => e.action !== "SKIPPED")
    .flatMap((e) => e.sets).length;

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {session.programDay ? session.programDay.name : "Séance libre"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeCount} exercice{activeCount > 1 ? "s" : ""} · {completedSets}/{totalSets} séries
            faites ·{" "}
            <span className="tabular-nums">
              {minutes}:{seconds.toString().padStart(2, "0")}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Supprimer la séance"
            onClick={() => setDeleteConfirmOpen(true)}
          >
            <Trash2 className="size-4" />
          </Button>
          <Button onClick={() => setConfirmOpen(true)}>
            <CheckCircle2 className="size-4" />
            Terminer la séance
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {session.exercises.map((sessionExercise) => (
          <ExerciseTrackerCard
            key={sessionExercise.id}
            sessionId={session.id}
            sessionExercise={sessionExercise}
            exercises={exercises}
            onChanged={updateExercise}
            onSetCompleted={(rest) => setRestSeconds(rest ?? 90)}
          />
        ))}

        {session.exercises.length === 0 && (
          <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
            Aucun exercice pour l&apos;instant. Ajoutes-en un pour commencer.
          </div>
        )}

        <AddSessionExerciseDialog
          sessionId={session.id}
          hasProgram={Boolean(session.programDayId)}
          exercises={exercises}
          onAdded={(sessionExercise) =>
            setSession((prev) => ({ ...prev, exercises: [...prev.exercises, sessionExercise] }))
          }
        />
      </div>

      <RestTimer totalSeconds={restSeconds} onDone={() => setRestSeconds(null)} />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Terminer la séance ?</AlertDialogTitle>
            <AlertDialogDescription>
              {completedSets}/{totalSets} séries complétées. Tu pourras encore consulter cette
              séance dans ton historique.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuer la séance</AlertDialogCancel>
            <AlertDialogAction onClick={handleComplete} disabled={completing}>
              {completing ? "..." : "Terminer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette séance ?</AlertDialogTitle>
            <AlertDialogDescription>
              Toutes les séries et exercices de cette séance seront définitivement supprimés.
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive/10 text-destructive hover:bg-destructive/20"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
