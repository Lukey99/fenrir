"use client";

import { Sparkles } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { useUnit } from "@/hooks/use-unit";
import { SessionTrendChart } from "@/components/progress/exercise-progress-chart";

type SeriesPoint = {
  date: string;
  best1RM: number;
  volume: number;
  bestWeight: number;
  avgReps: number;
  setCount: number;
};

function ChartLegend({ color }: { color: string }) {
  return (
    <div className="mb-2 flex shrink-0 items-center gap-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <span className="inline-block size-2 rounded-full" style={{ backgroundColor: color }} />
        1RM estimé
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block size-2 rounded-full bg-muted-foreground" />
        Poids
      </span>
    </div>
  );
}

export function ExerciseProgressStats({
  metrics,
  series,
  insights,
  color,
  compact = false,
}: {
  metrics: {
    bestWeight: number;
    best1RM: number;
    totalVolume: number;
    avgReps: number;
    avgWeight: number;
    progressionPercent: number | null;
  };
  series: SeriesPoint[];
  insights: string[];
  color: string;
  /** Étire le graphique en hauteur disponible (colonne desktop du dashboard de
   * séance) plutôt qu'une hauteur fixe — sans effet hors contexte flex. */
  compact?: boolean;
}) {
  const { unitLabel, toDisplay } = useUnit();
  const displaySeries = series.map((s) => ({
    ...s,
    best1RM: toDisplay(s.best1RM),
    bestWeight: toDisplay(s.bestWeight),
    volume: toDisplay(s.volume),
  }));

  const stats = [
    { label: "1RM estimé", value: `${toDisplay(metrics.best1RM)} ${unitLabel}` },
    { label: "Meilleur poids", value: `${toDisplay(metrics.bestWeight)} ${unitLabel}` },
    { label: "Reps moy.", value: metrics.avgReps },
    {
      label: "Progression",
      value:
        metrics.progressionPercent !== null
          ? `${metrics.progressionPercent > 0 ? "+" : ""}${metrics.progressionPercent}%`
          : "—",
    },
  ];

  const metricCards = (
    <div className="grid shrink-0 grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="px-4 py-3">
            <p className="font-heading text-lg font-semibold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const insightsBlock = insights.length > 0 && (
    <div className="space-y-2">
      {insights.map((insight) => (
        <div key={insight} className="flex items-start gap-2 rounded-lg border bg-brand/5 px-3 py-2 text-sm">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-brand" />
          {insight}
        </div>
      ))}
    </div>
  );

  const chart = (
    <Card className={compact ? "h-full min-h-0" : undefined}>
      <CardContent className={compact ? "flex h-full min-h-0 flex-col" : undefined}>
        <ChartLegend color={color} />
        <div className={compact ? "min-h-0 flex-1" : undefined}>
          <SessionTrendChart
            series={displaySeries}
            color={color}
            unitLabel={unitLabel}
            height={compact ? "100%" : 220}
          />
        </div>
      </CardContent>
    </Card>
  );

  if (compact) {
    return (
      <div className="flex h-full min-h-0 flex-col gap-4">
        {metricCards}
        {insightsBlock && <div className="shrink-0">{insightsBlock}</div>}
        <div className="min-h-0 flex-1">{chart}</div>
      </div>
    );
  }

  return (
    <>
      {metricCards}
      {insightsBlock}
      {chart}
    </>
  );
}
