import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { auth } from "@/lib/auth";
import { progressService, type ProgressRange } from "@/server/services/progressService";
import { muscleGroupLabels } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RangeTabs } from "@/components/progress/range-tabs";
import { ExerciseProgressStats } from "@/components/progress/exercise-progress-stats";

const validRanges: ProgressRange[] = ["week", "month", "year", "all"];

export default async function ExerciseProgressPage({
  params,
  searchParams,
}: {
  params: Promise<{ exerciseId: string }>;
  searchParams: Promise<{ range?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { exerciseId } = await params;
  const { range: rawRange } = await searchParams;
  const range: ProgressRange = validRanges.includes(rawRange as ProgressRange)
    ? (rawRange as ProgressRange)
    : "month";

  const history = await progressService.getExerciseHistory(session.user.id, exerciseId, range);
  if (!history) notFound();

  const { exercise, series, metrics, insights } = history;
  const colorVar = `var(--muscle-${exercise.muscleGroup.toLowerCase()})`;

  return (
    <div className="flex flex-col gap-4 md:h-[calc(100vh-8rem)] md:overflow-hidden">
      <div className="shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="mb-2 -ml-2 text-muted-foreground"
          render={<Link href="/progress" />}
          nativeButton={false}
        >
          <ArrowLeft className="size-4" />
          Progression
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{exercise.name}</h1>
          <Badge
            className="border-transparent"
            style={{ backgroundColor: `color-mix(in oklch, ${colorVar} 12%, transparent)`, color: colorVar }}
          >
            {muscleGroupLabels[exercise.muscleGroup as keyof typeof muscleGroupLabels]}
          </Badge>
        </div>
      </div>

      <div className="shrink-0">
        <RangeTabs exerciseId={exerciseId} current={range} />
      </div>

      {series.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          Aucune séance sur cette période.
        </div>
      ) : (
        <div className="min-h-0 flex-1">
          <ExerciseProgressStats
            metrics={metrics}
            series={series}
            insights={insights}
            color={colorVar}
            compact
          />
        </div>
      )}
    </div>
  );
}
