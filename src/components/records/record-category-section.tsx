"use client";

import Link from "next/link";

import { muscleCategoryLabels, muscleGroupLabels, muscleGroupColorClasses } from "@/lib/constants";
import { useUnit } from "@/hooks/use-unit";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PersonalRecordCategory } from "@/types/personalRecord";

function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function RecordCategorySection({ category }: { category: PersonalRecordCategory }) {
  const { unitLabel, toDisplay } = useUnit();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{muscleCategoryLabels[category.category]}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {category.exercises.map((exercise) => (
          <Link
            key={exercise.exerciseId}
            href={`/records/${exercise.exerciseId}`}
            className="flex items-center justify-between gap-3 rounded-xl border bg-muted/40 px-4 py-3 transition-colors hover:bg-muted"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{exercise.exerciseName}</p>
              <span
                className={cn(
                  "mt-1 inline-block rounded-full px-2 py-0.5 text-xs",
                  muscleGroupColorClasses[exercise.muscleGroup]
                )}
              >
                {muscleGroupLabels[exercise.muscleGroup]}
              </span>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-heading text-lg font-semibold">
                {toDisplay(exercise.bestWeight)} {unitLabel} × {exercise.bestReps}
              </p>
              <p className="text-xs text-muted-foreground">
                {exercise.recordsCount} record{exercise.recordsCount > 1 ? "s" : ""} ·{" "}
                {formatDate(exercise.bestDate)}
              </p>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
