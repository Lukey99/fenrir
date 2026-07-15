"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { Exercise } from "@/generated/prisma/client";
import {
  muscleGroupLabels,
  muscleGroupOrder,
  muscleGroupColorClasses,
  type MuscleGroupValue,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { CreateExerciseDialog } from "@/components/exercises/create-exercise-dialog";
import { EditExerciseDialog } from "@/components/exercises/edit-exercise-dialog";
import { Pagination } from "@/components/ui/pagination";

const EXERCISES_PER_PAGE = 9;

export function ExercisesBrowser({ initialExercises }: { initialExercises: Exercise[] }) {
  const [exercises, setExercises] = useState(initialExercises);
  const [search, setSearch] = useState("");
  const [activeGroup, setActiveGroup] = useState<MuscleGroupValue | null>(null);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [deletingExercise, setDeletingExercise] = useState<Exercise | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [pages, setPages] = useState<Record<string, number>>({});

  function handleExerciseCreated(exercise: Exercise) {
    // It's appended at the end of its category's list — jump straight to
    // the page that will actually contain it, or it silently lands on a
    // page the user never navigates to.
    const groupCount = exercises.filter((e) => e.muscleGroup === exercise.muscleGroup).length;
    const newPage = Math.ceil((groupCount + 1) / EXERCISES_PER_PAGE);
    setPages((prev) => ({ ...prev, [exercise.muscleGroup]: newPage }));
    setExercises((prev) => [...prev, exercise]);
  }

  async function handleDelete() {
    if (!deletingExercise) return;
    setDeleting(true);
    const response = await fetch(`/api/exercises/${deletingExercise.id}`, { method: "DELETE" });
    setDeleting(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      toast.error(data?.error ?? "Impossible de supprimer cet exercice.");
      setDeletingExercise(null);
      return;
    }

    setExercises((prev) => prev.filter((e) => e.id !== deletingExercise.id));
    toast.success("Exercice supprimé.");
    setDeletingExercise(null);
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return exercises.filter((exercise) => {
      const matchesQuery = query ? exercise.name.toLowerCase().includes(query) : true;
      const matchesGroup = activeGroup ? exercise.muscleGroup === activeGroup : true;
      return matchesQuery && matchesGroup;
    });
  }, [exercises, search, activeGroup]);

  // A new search/filter reshuffles what's in each category — start every
  // section back at page 1 rather than leaving it on a now-unrelated page.
  // Adjusting state during render (not in an effect) per React's own
  // guidance for "resetting state when a prop changes".
  const filterKey = `${search}|${activeGroup}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPages({});
  }

  const grouped = useMemo(() => {
    const groups = new Map<string, Exercise[]>();
    for (const group of muscleGroupOrder) groups.set(group, []);
    for (const exercise of filtered) {
      groups.get(exercise.muscleGroup)?.push(exercise);
    }
    return groups;
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Base d&apos;exercices
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {exercises.length} exercices disponibles.
          </p>
        </div>
        <CreateExerciseDialog onCreated={handleExerciseCreated} />
      </div>

      <div className="space-y-3">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher un exercice..."
            className="pl-8"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={activeGroup === null ? "secondary" : "ghost"}
            onClick={() => setActiveGroup(null)}
          >
            Tous
          </Button>
          {muscleGroupOrder.map((group) => {
            const isActive = activeGroup === group;
            return (
              <Button
                key={group}
                size="sm"
                variant="ghost"
                onClick={() => setActiveGroup(group)}
                className={cn(
                  "gap-1.5",
                  isActive ? muscleGroupColorClasses[group] : "text-muted-foreground"
                )}
              >
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: `var(--muscle-${group.toLowerCase()})` }}
                />
                {muscleGroupLabels[group]}
              </Button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          <Sparkles className="size-6" />
          <p className="text-sm">Aucun exercice ne correspond à ta recherche.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {muscleGroupOrder.map((group) => {
            const groupExercises = grouped.get(group) ?? [];
            if (groupExercises.length === 0) return null;

            const totalPages = Math.max(1, Math.ceil(groupExercises.length / EXERCISES_PER_PAGE));
            const currentPage = Math.min(pages[group] ?? 1, totalPages);
            const pagedExercises = groupExercises.slice(
              (currentPage - 1) * EXERCISES_PER_PAGE,
              currentPage * EXERCISES_PER_PAGE
            );

            return (
              <section key={group}>
                <h2 className="mb-3 flex items-center gap-2 font-heading text-sm font-medium">
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full text-[10px] font-semibold",
                      muscleGroupColorClasses[group]
                    )}
                  >
                    {groupExercises.length}
                  </span>
                  <span className="text-muted-foreground">{muscleGroupLabels[group]}</span>
                </h2>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {pagedExercises.map((exercise, index) => (
                    <motion.div
                      key={exercise.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: Math.min(index, 8) * 0.02 }}
                      whileHover={{ y: -2 }}
                      style={{ borderLeftColor: `var(--muscle-${group.toLowerCase()})` }}
                      className="flex items-center justify-between gap-2 rounded-lg border border-l-[3px] bg-card px-3 py-2.5 text-sm transition-shadow duration-200 hover:bg-accent/40 hover:shadow-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{exercise.name}</p>
                        {exercise.equipment && (
                          <p className="truncate text-xs text-muted-foreground">
                            {exercise.equipment}
                          </p>
                        )}
                      </div>
                      {exercise.isCustom && (
                        <div className="flex shrink-0 items-center gap-1">
                          <Badge className="border-transparent bg-brand/12 text-brand-ink">Perso</Badge>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            aria-label="Modifier l'exercice"
                            onClick={() => setEditingExercise(exercise)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            aria-label="Supprimer l'exercice"
                            onClick={() => setDeletingExercise(exercise)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  onPageChange={(next) => setPages((prev) => ({ ...prev, [group]: next }))}
                  className="mt-3"
                />
              </section>
            );
          })}
        </div>
      )}

      {editingExercise && (
        <EditExerciseDialog
          exercise={editingExercise}
          onOpenChange={(open) => !open && setEditingExercise(null)}
          onUpdated={(updated) => {
            setExercises((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
            // Same problem as creating one: editing into a different muscle
            // group moves it to that category's list — without this it can
            // land on a page the user never navigates to.
            if (editingExercise && editingExercise.muscleGroup !== updated.muscleGroup) {
              const groupCount = exercises.filter(
                (e) => e.muscleGroup === updated.muscleGroup && e.id !== updated.id
              ).length;
              const newPage = Math.ceil((groupCount + 1) / EXERCISES_PER_PAGE);
              setPages((prev) => ({ ...prev, [updated.muscleGroup]: newPage }));
            }
            setEditingExercise(null);
          }}
        />
      )}

      <AlertDialog open={Boolean(deletingExercise)} onOpenChange={(open) => !open && setDeletingExercise(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer &quot;{deletingExercise?.name}&quot; ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Un exercice utilisé dans un programme ou une séance ne
              peut pas être supprimé.
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
