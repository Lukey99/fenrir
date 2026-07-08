"use client";

import { Sparkles } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { useUnit } from "@/hooks/use-unit";
import { OneRmTrendChart, VolumeBarChart } from "@/components/progress/exercise-progress-chart";

type SeriesPoint = {
  date: string;
  best1RM: number;
  volume: number;
  bestWeight: number;
  avgReps: number;
};

export function ExerciseProgressStats({
  metrics,
  series,
  insights,
  color,
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
}) {
  const { unitLabel, toDisplay } = useUnit();
  const displaySeries = series.map((s) => ({
    ...s,
    best1RM: toDisplay(s.best1RM),
    bestWeight: toDisplay(s.bestWeight),
    volume: toDisplay(s.volume),
  }));

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "1RM estimé", value: `${toDisplay(metrics.best1RM)} ${unitLabel}` },
          { label: "Meilleur poids", value: `${toDisplay(metrics.bestWeight)} ${unitLabel}` },
          { label: "Volume total", value: `${toDisplay(metrics.totalVolume)} ${unitLabel}` },
          { label: "Reps moy.", value: metrics.avgReps },
          { label: "Poids moy.", value: `${toDisplay(metrics.avgWeight)} ${unitLabel}` },
          {
            label: "Progression",
            value:
              metrics.progressionPercent !== null
                ? `${metrics.progressionPercent > 0 ? "+" : ""}${metrics.progressionPercent}%`
                : "—",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="px-4 py-3">
              <p className="font-heading text-lg font-semibold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {insights.length > 0 && (
        <div className="space-y-2">
          {insights.map((insight) => (
            <div
              key={insight}
              className="flex items-start gap-2 rounded-lg border bg-brand/5 px-3 py-2 text-sm"
            >
              <Sparkles className="mt-0.5 size-4 shrink-0 text-brand" />
              {insight}
            </div>
          ))}
        </div>
      )}

      <Card>
        <CardContent>
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">1RM estimé</h2>
          <OneRmTrendChart series={displaySeries} color={color} unitLabel={unitLabel} />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">Volume par séance</h2>
          <VolumeBarChart series={displaySeries} color={color} unitLabel={unitLabel} />
        </CardContent>
      </Card>
    </>
  );
}
