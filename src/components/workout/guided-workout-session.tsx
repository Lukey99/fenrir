"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { WorkoutSessionDTO, SessionExerciseDTO, WorkoutSetDTO } from "@/types/workout";
import { getNextStep, type WorkoutStep } from "@/lib/workout-flow";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
import { ExercisePickerScreen } from "@/components/workout/exercise-picker-screen";
import { SetLoggingScreen } from "@/components/workout/set-logging-screen";
import { RestConfigSheet } from "@/components/workout/rest-config-sheet";
import { RestScreen } from "@/components/workout/rest-screen";
import { SessionCompletingScreen } from "@/components/workout/session-completing-screen";
import { SessionRecapScreen, type NewRecordEvent } from "@/components/workout/session-recap-screen";
import { SessionExerciseRail } from "@/components/workout/session-exercise-rail";
import type { ExercisePickerOption } from "@/components/exercises/exercise-picker";

const DEFAULT_REST_SECONDS = 90;

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

export function GuidedWorkoutSession({
  initialSession,
  exercises,
}: {
  initialSession: WorkoutSessionDTO;
  exercises: ExercisePickerOption[];
}) {
  const router = useRouter();
  const [session, setSession] = useState(initialSession);
  const [step, setStep] = useState<WorkoutStep>({ kind: "picker" });
  const [restOverrides, setRestOverrides] = useState<Record<string, number>>({});
  const [restConfigFor, setRestConfigFor] = useState<string | null>(null);
  const [prsThisSession, setPrsThisSession] = useState<NewRecordEvent[]>([]);
  const [terminateConfirmOpen, setTerminateConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [submittingComplete, setSubmittingComplete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [closing, setClosing] = useState(false);

  const elapsed = useElapsed(session.startedAt);

  function findExercise(id: string) {
    return session.exercises.find((e) => e.id === id);
  }

  function updateExercise(updated: SessionExerciseDTO) {
    setSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((e) => (e.id === updated.id ? updated : e)),
    }));
  }

  function addExercise(added: SessionExerciseDTO) {
    setSession((prev) => ({ ...prev, exercises: [...prev.exercises, added] }));
  }

  function updateSet(sessionExerciseId: string, updatedSet: WorkoutSetDTO) {
    setSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((e) =>
        e.id === sessionExerciseId
          ? { ...e, sets: e.sets.map((s) => (s.id === updatedSet.id ? updatedSet : s)) }
          : e
      ),
    }));
  }

  function addSet(sessionExerciseId: string, newSet: WorkoutSetDTO) {
    setSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((e) =>
        e.id === sessionExerciseId ? { ...e, sets: [...e.sets, newSet] } : e
      ),
    }));
  }

  function handleSetValidated(sessionExerciseId: string, updatedSet: WorkoutSetDTO, newRecord: NewRecordEvent | null) {
    updateSet(sessionExerciseId, updatedSet);
    if (newRecord) {
      setPrsThisSession((prev) => [...prev, newRecord]);
      toast.success(
        `Nouveau record : ${newRecord.exerciseName} à ${newRecord.weight} kg × ${newRecord.reps} !`,
        { position: "top-center" }
      );
    }
    setRestConfigFor(sessionExerciseId);
  }

  function handleRestConfirm(seconds: number, keep: boolean) {
    if (!restConfigFor) return;
    if (keep) {
      setRestOverrides((prev) => ({ ...prev, [restConfigFor]: seconds }));
    }
    const sessionExerciseId = restConfigFor;
    setRestConfigFor(null);
    setStep({ kind: "resting", sessionExerciseId, seconds });
  }

  function proceedAfterRest(sessionExerciseId: string) {
    const exercise = findExercise(sessionExerciseId);
    setStep(exercise ? getNextStep(exercise) : { kind: "picker" });
  }

  async function handleTerminateConfirm() {
    setSubmittingComplete(true);
    setTerminateConfirmOpen(false);
    setStep({ kind: "completing" });
    const response = await fetch(`/api/workouts/sessions/${session.id}/complete`, {
      method: "POST",
    });
    setSubmittingComplete(false);
    if (!response.ok) {
      toast.error("Impossible de terminer la séance.");
      setStep({ kind: "picker" });
      return;
    }
    setStep({ kind: "recap" });
  }

  async function handleDeleteConfirm() {
    setDeleting(true);
    const response = await fetch(`/api/workouts/sessions/${session.id}`, { method: "DELETE" });
    setDeleting(false);
    setDeleteConfirmOpen(false);
    if (!response.ok) {
      toast.error("Impossible de supprimer la séance.");
      return;
    }
    toast.success("Séance supprimée.");
    router.push(session.programDay ? `/programs/${session.programDay.programId}` : "/dashboard");
  }

  function handleRecapClose() {
    setClosing(true);
    setTimeout(() => {
      router.push(session.programDay ? `/programs/${session.programDay.programId}` : "/dashboard");
    }, 250);
  }

  const activeExercise =
    step.kind === "logging" || step.kind === "resting" ? findExercise(step.sessionExerciseId) ?? null : null;
  const restConfigExercise = restConfigFor ? findExercise(restConfigFor) ?? null : null;

  const totalSets = session.exercises.filter((e) => e.action !== "SKIPPED").flatMap((e) => e.sets).length;
  const completedSets = session.exercises.flatMap((e) => e.sets).filter((s) => s.completed).length;

  const showTopBar = step.kind === "picker" || step.kind === "logging" || step.kind === "resting";
  const showRail = step.kind === "logging" || step.kind === "resting";

  return (
    <main className="fixed inset-0 z-50 flex items-stretch justify-center bg-background md:items-center md:bg-black/40 md:p-6">
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: closing ? "100%" : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
        className="flex w-full flex-col overflow-hidden bg-background md:h-auto md:max-h-[85vh] md:max-w-3xl md:flex-row md:rounded-2xl md:border md:shadow-2xl"
      >
        {showRail && (
          <SessionExerciseRail
            session={session}
            activeSessionExerciseId={activeExercise?.id ?? null}
            onSelectExercise={(id) => setStep({ kind: "logging", sessionExerciseId: id })}
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col md:max-h-[85vh]">
          {showTopBar && (
            <div className="shrink-0 border-b px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {session.programDay ? session.programDay.name : "Séance libre"}
                  </p>
                  <p className="text-xs tabular-nums text-muted-foreground">
                    {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, "0")} ·{" "}
                    {completedSets}/{totalSets} séries
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Supprimer la séance"
                  onClick={() => setDeleteConfirmOpen(true)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              {totalSets > 0 && (
                <Progress
                  value={(completedSets / totalSets) * 100}
                  aria-label="Progression de la séance"
                  className="mt-2"
                />
              )}
            </div>
          )}

          {step.kind === "picker" && (
            <ExercisePickerScreen
              session={session}
              exercises={exercises}
              onSelectExercise={(id) => setStep({ kind: "logging", sessionExerciseId: id })}
              onExerciseUpdated={updateExercise}
              onExerciseAdded={addExercise}
              onTerminate={() => setTerminateConfirmOpen(true)}
            />
          )}

          {step.kind === "logging" && activeExercise && (
            <SetLoggingScreen
              sessionId={session.id}
              sessionExercise={activeExercise}
              onValidated={(updatedSet, newRecord) =>
                handleSetValidated(activeExercise.id, updatedSet, newRecord)
              }
              onSetAdded={(set) => addSet(activeExercise.id, set)}
              onBackToList={() => setStep({ kind: "picker" })}
            />
          )}

          {step.kind === "resting" && activeExercise && (
            <RestScreen
              exerciseName={activeExercise.exercise.name}
              seconds={step.seconds}
              onDone={() => proceedAfterRest(activeExercise.id)}
              onStop={() => setTerminateConfirmOpen(true)}
              onBackToList={() => setStep({ kind: "picker" })}
            />
          )}

          {step.kind === "completing" && <SessionCompletingScreen />}

          {step.kind === "recap" && (
            <SessionRecapScreen
              session={session}
              elapsedSeconds={elapsed}
              prsThisSession={prsThisSession}
              onClose={handleRecapClose}
            />
          )}
        </div>
      </motion.div>

      {restConfigExercise && (
        <RestConfigSheet
          exerciseName={restConfigExercise.exercise.name}
          defaultSeconds={
            restOverrides[restConfigExercise.id] ?? restConfigExercise.restSeconds ?? DEFAULT_REST_SECONDS
          }
          onConfirm={handleRestConfirm}
        />
      )}

      <AlertDialog open={terminateConfirmOpen} onOpenChange={setTerminateConfirmOpen}>
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
            <AlertDialogAction onClick={handleTerminateConfirm} disabled={submittingComplete}>
              {submittingComplete ? "..." : "Terminer"}
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
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? "..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
