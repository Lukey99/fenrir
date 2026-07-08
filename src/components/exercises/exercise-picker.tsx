"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { muscleGroupLabels, muscleGroupOrder, type MuscleGroupValue } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export type ExercisePickerOption = {
  id: string;
  name: string;
  muscleGroup: MuscleGroupValue;
  equipment: string | null;
};

function ExerciseRowButton({
  exercise,
  onSelect,
}: {
  exercise: ExercisePickerOption;
  onSelect: (exercise: ExercisePickerOption) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(exercise)}
      className="flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
    >
      <span className="min-w-0 truncate">{exercise.name}</span>
      {exercise.equipment && (
        <span className="shrink-0 text-xs text-muted-foreground">{exercise.equipment}</span>
      )}
    </button>
  );
}

export function ExercisePicker({
  exercises,
  onSelect,
}: {
  exercises: ExercisePickerOption[];
  onSelect: (exercise: ExercisePickerOption) => void;
}) {
  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!query) return null;
    return exercises.filter((exercise) => exercise.name.toLowerCase().includes(query));
  }, [exercises, query]);

  const grouped = useMemo(() => {
    const groups = new Map<MuscleGroupValue, ExercisePickerOption[]>();
    for (const group of muscleGroupOrder) groups.set(group, []);
    for (const exercise of exercises) {
      groups.get(exercise.muscleGroup)?.push(exercise);
    }
    return groups;
  }, [exercises]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Rechercher un exercice..."
          className="pl-8"
        />
      </div>

      <ScrollArea className="h-80 rounded-md border">
        {filtered ? (
          <div className="p-1">
            {filtered.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">Aucun exercice trouvé.</p>
            ) : (
              filtered.map((exercise) => (
                <ExerciseRowButton key={exercise.id} exercise={exercise} onSelect={onSelect} />
              ))
            )}
          </div>
        ) : (
          <Accordion className="px-2">
            {muscleGroupOrder.map((group) => {
              const groupExercises = grouped.get(group) ?? [];
              if (groupExercises.length === 0) return null;
              return (
                <AccordionItem key={group} value={group}>
                  <AccordionTrigger>
                    <span className="flex items-center gap-2">
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: `var(--muscle-${group.toLowerCase()})` }}
                      />
                      {muscleGroupLabels[group]}
                      <span className="text-xs font-normal text-muted-foreground">
                        ({groupExercises.length})
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    {groupExercises.map((exercise) => (
                      <ExerciseRowButton key={exercise.id} exercise={exercise} onSelect={onSelect} />
                    ))}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </ScrollArea>
    </div>
  );
}
