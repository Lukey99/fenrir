import { redirect, notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { programService } from "@/server/services/programService";
import { NotFoundError } from "@/server/errors";
import { toDisplayWeight, weightUnitLabel } from "@/lib/units";
import { muscleGroupLabels } from "@/lib/constants";
import { groupBySupersetGroup } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PrintToolbar } from "@/components/programs/print-toolbar";

export default async function ProgramPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  let program;
  try {
    program = await programService.get(id, session.user.id);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  const unit = session.user.unitPreference;
  const unitLabel = weightUnitLabel(unit);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 print:px-0 print:py-0">
      <PrintToolbar programId={program.id} />

      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">{program.name}</h1>
        {program.description && (
          <p className="mt-2 text-sm text-muted-foreground">{program.description}</p>
        )}
      </div>

      <div className="space-y-8">
        {program.days.map((day) => (
          <section key={day.id} className="break-inside-avoid">
            <div className="mb-3 flex items-center gap-2 border-b pb-2">
              <h2 className="font-heading text-lg font-semibold">{day.name}</h2>
              {day.label && (
                <Badge variant="secondary" className="text-xs">
                  {day.label}
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              {groupBySupersetGroup(day.exercises).map((item) => {
                const items = Array.isArray(item) ? item : [item];
                const isSuperset = items.length > 1;

                return (
                  <div
                    key={items[0].id}
                    className={
                      isSuperset ? "space-y-2 rounded-lg border border-dashed p-2" : undefined
                    }
                  >
                    {isSuperset && (
                      <p className="px-1 text-xs font-medium text-muted-foreground">
                        Superset — {items.length} exercices enchaînés
                      </p>
                    )}
                    {items.map((exercise) => {
                      const weight = exercise.targetWeight
                        ? toDisplayWeight(Number(exercise.targetWeight), unit)
                        : null;
                      return (
                        <div
                          key={exercise.id}
                          className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm"
                          style={{
                            borderLeftColor: `var(--muscle-${exercise.exercise.muscleGroup.toLowerCase()})`,
                            borderLeftWidth: 3,
                          }}
                        >
                          <div className="min-w-0">
                            <p className="font-medium">{exercise.exercise.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {muscleGroupLabels[exercise.exercise.muscleGroup]}
                              {exercise.exercise.equipment ? ` · ${exercise.exercise.equipment}` : ""}
                            </p>
                            {exercise.notes && (
                              <p className="mt-0.5 text-xs text-muted-foreground italic">
                                {exercise.notes}
                              </p>
                            )}
                          </div>
                          <p className="shrink-0 text-right text-sm font-medium tabular-nums">
                            {exercise.targetSets} × {exercise.targetRepsMin}-{exercise.targetRepsMax} reps
                            {weight ? (
                              <>
                                <br />
                                {weight} {unitLabel}
                              </>
                            ) : null}
                            {exercise.restSeconds ? (
                              <>
                                <br />
                                {exercise.restSeconds}s repos
                              </>
                            ) : null}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {day.exercises.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Aucun exercice pour ce jour.
                </p>
              )}
            </div>
          </section>
        ))}

        {program.days.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Ce programme n&apos;a pas encore de jour.
          </p>
        )}
      </div>
    </main>
  );
}
