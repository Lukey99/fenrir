"use client";

import { useState } from "react";
import { ArrowUp, ArrowDown, Trash2, Link2, X } from "lucide-react";
import { toast } from "sonner";

import type { ProgramDayDTO, ProgramDayExerciseDTO } from "@/types/program";
import { muscleGroupLabels } from "@/lib/constants";
import { groupBySupersetGroup } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DayFormDialog } from "@/components/programs/day-form-dialog";
import { AddExerciseDialog } from "@/components/programs/add-exercise-dialog";
import { ExerciseRow } from "@/components/programs/exercise-row";
import { SupersetGroup } from "@/components/programs/superset-group";
import { StartSessionButton } from "@/components/workout/start-session-button";

type ExerciseOption = {
  id: string;
  name: string;
  muscleGroup: keyof typeof muscleGroupLabels;
  equipment: string | null;
};

export function DayCard({
  programId,
  day,
  exercises,
  isFirst,
  isLast,
  onDayUpdated,
  onDayRemoved,
  onDayMove,
  onExercisesChange,
}: {
  programId: string;
  day: ProgramDayDTO;
  exercises: ExerciseOption[];
  isFirst: boolean;
  isLast: boolean;
  onDayUpdated: (day: ProgramDayDTO) => void;
  onDayRemoved: (id: string) => void;
  onDayMove: (id: string, direction: "up" | "down") => void;
  onExercisesChange: (dayId: string, exercises: ProgramDayExerciseDTO[]) => void;
}) {
  const [grouping, setGrouping] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  async function handleRemoveDay() {
    const response = await fetch(`/api/programs/${programId}/days/${day.id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      toast.error("Impossible de supprimer ce jour.");
      return;
    }
    onDayRemoved(day.id);
  }

  function handleExerciseAdded(dayExercise: ProgramDayExerciseDTO) {
    onExercisesChange(day.id, [...day.exercises, dayExercise]);
  }

  function handleExerciseUpdated(dayExercise: ProgramDayExerciseDTO) {
    onExercisesChange(
      day.id,
      day.exercises.map((e) => (e.id === dayExercise.id ? dayExercise : e))
    );
  }

  function handleExerciseRemoved(id: string) {
    onExercisesChange(
      day.id,
      day.exercises.filter((e) => e.id !== id)
    );
  }

  async function handleExerciseMove(id: string, direction: "up" | "down") {
    const index = day.exercises.findIndex((e) => e.id === id);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || swapIndex < 0 || swapIndex >= day.exercises.length) return;

    const current = day.exercises[index];
    const swap = day.exercises[swapIndex];

    const reordered = [...day.exercises];
    reordered[index] = swap;
    reordered[swapIndex] = current;
    onExercisesChange(day.id, reordered);

    await Promise.all([
      fetch(`/api/programs/${programId}/days/${day.id}/exercises/${current.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: swapIndex }),
      }),
      fetch(`/api/programs/${programId}/days/${day.id}/exercises/${swap.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: index }),
      }),
    ]);
  }

  function toggleSelected(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function cancelGrouping() {
    setGrouping(false);
    setSelectedIds([]);
  }

  async function handleCreateSuperset() {
    const nextGroup = Math.max(0, ...day.exercises.map((e) => e.supersetGroup ?? 0)) + 1;
    const results = await Promise.all(
      selectedIds.map((id) =>
        fetch(`/api/programs/${programId}/days/${day.id}/exercises/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ supersetGroup: nextGroup }),
        })
      )
    );
    if (results.some((r) => !r.ok)) {
      toast.error("Impossible de créer le superset.");
      return;
    }
    onExercisesChange(
      day.id,
      day.exercises.map((e) => (selectedIds.includes(e.id) ? { ...e, supersetGroup: nextGroup } : e))
    );
    toast.success("Superset créé.");
    cancelGrouping();
  }

  function handleUngrouped(ids: string[]) {
    onExercisesChange(
      day.id,
      day.exercises.map((e) => (ids.includes(e.id) ? { ...e, supersetGroup: null } : e))
    );
  }

  const grouped = groupBySupersetGroup(day.exercises);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <Button
              variant="ghost"
              size="icon-xs"
              disabled={isFirst}
              onClick={() => onDayMove(day.id, "up")}
              aria-label="Monter le jour"
            >
              <ArrowUp className="size-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              disabled={isLast}
              onClick={() => onDayMove(day.id, "down")}
              aria-label="Descendre le jour"
            >
              <ArrowDown className="size-3" />
            </Button>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-medium">{day.name}</h2>
              {day.label && (
                <Badge variant="secondary" className="text-xs">
                  {day.label}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {day.exercises.length} exercice{day.exercises.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {day.exercises.length >= 2 && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => (grouping ? cancelGrouping() : setGrouping(true))}
            >
              {grouping ? <X className="size-3.5" /> : <Link2 className="size-3.5" />}
              {grouping ? "Annuler" : "Grouper en superset"}
            </Button>
          )}
          <StartSessionButton programDayId={day.id} size="sm" variant="outline">
            Démarrer
          </StartSessionButton>
          <DayFormDialog mode="edit" programId={programId} day={day} onSaved={onDayUpdated} />
          <Button variant="ghost" size="icon-sm" aria-label="Supprimer le jour" onClick={handleRemoveDay}>
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {grouped.map((item) =>
          Array.isArray(item) ? (
            <SupersetGroup
              key={`group-${item[0].supersetGroup}`}
              programId={programId}
              dayId={day.id}
              exercises={item}
              isFirst={day.exercises[0]?.id === item[0].id}
              isLast={day.exercises[day.exercises.length - 1]?.id === item[item.length - 1].id}
              onUpdated={handleExerciseUpdated}
              onRemoved={handleExerciseRemoved}
              onMove={handleExerciseMove}
              onUngrouped={handleUngrouped}
            />
          ) : (
            <ExerciseRow
              key={item.id}
              programId={programId}
              dayId={day.id}
              dayExercise={item}
              isFirst={day.exercises[0]?.id === item.id}
              isLast={day.exercises[day.exercises.length - 1]?.id === item.id}
              onUpdated={handleExerciseUpdated}
              onRemoved={handleExerciseRemoved}
              onMove={handleExerciseMove}
              selectable={grouping}
              selected={selectedIds.includes(item.id)}
              onToggleSelect={toggleSelected}
            />
          )
        )}
        {day.exercises.length === 0 && (
          <p className="rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground">
            Aucun exercice pour ce jour.
          </p>
        )}
        {grouping && (
          <div className="flex items-center justify-between rounded-lg border border-dashed px-3 py-2">
            <span className="text-xs text-muted-foreground">
              {selectedIds.length} sélectionné{selectedIds.length > 1 ? "s" : ""}
            </span>
            <Button
              size="sm"
              className="text-xs"
              disabled={selectedIds.length < 2}
              onClick={handleCreateSuperset}
            >
              Créer le superset
            </Button>
          </div>
        )}
        <AddExerciseDialog
          programId={programId}
          dayId={day.id}
          exercises={exercises}
          onAdded={handleExerciseAdded}
        />
      </CardContent>
    </Card>
  );
}
