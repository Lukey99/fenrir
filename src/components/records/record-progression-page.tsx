"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { muscleGroupLabels } from "@/lib/constants";
import { useUnit } from "@/hooks/use-unit";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { RecordProgressionChart } from "@/components/records/record-progression-chart";
import type { PersonalRecordExerciseProgression } from "@/types/personalRecord";

const RECORDS_PER_PAGE = 10;

function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

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

export function RecordProgressionPage({
  progression,
}: {
  progression: PersonalRecordExerciseProgression;
}) {
  const router = useRouter();
  const { unitLabel, toDisplay } = useUnit();
  const colorVar = `var(--muscle-${progression.muscleGroup.toLowerCase()})`;
  const [page, setPage] = useState(1);

  const records = progression.records;
  const displayRecords = records.map((r) => ({
    ...r,
    weight: toDisplay(r.weight),
    estimated1RM: toDisplay(r.estimated1RM),
  }));

  const bestWeight = records.length ? Math.max(...records.map((r) => r.weight)) : 0;
  const best1RM = records.length ? Math.max(...records.map((r) => r.estimated1RM)) : 0;
  let progressionPercent: number | null = null;
  if (records.length >= 2) {
    const first = records[0].estimated1RM;
    const last = records[records.length - 1].estimated1RM;
    if (first > 0) progressionPercent = Math.round(((last - first) / first) * 1000) / 10;
  }

  const sortedRecords = [...records].sort((a, b) => (a.achievedAt < b.achievedAt ? 1 : -1));
  const totalPages = Math.max(1, Math.ceil(sortedRecords.length / RECORDS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pagedRecords = sortedRecords.slice(
    (currentPage - 1) * RECORDS_PER_PAGE,
    currentPage * RECORDS_PER_PAGE
  );

  const stats = [
    { label: "1RM estimé", value: `${toDisplay(best1RM)} ${unitLabel}` },
    { label: "Meilleur poids", value: `${toDisplay(bestWeight)} ${unitLabel}` },
    { label: "Records", value: String(records.length) },
    {
      label: "Progression",
      value:
        progressionPercent !== null
          ? `${progressionPercent > 0 ? "+" : ""}${progressionPercent}%`
          : "—",
    },
  ];

  async function deleteRecord(id: string) {
    const response = await fetch(`/api/records/${id}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("Impossible de supprimer ce record.");
      return;
    }
    toast.success("Record supprimé.");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-2 -ml-2 text-muted-foreground"
          render={<Link href="/records" />}
          nativeButton={false}
        >
          <ArrowLeft className="size-4" />
          Records
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {progression.exerciseName}
          </h1>
          <Badge
            className="border-transparent"
            style={{
              backgroundColor: `color-mix(in oklch, ${colorVar} 12%, transparent)`,
              color: colorVar,
            }}
          >
            {muscleGroupLabels[progression.muscleGroup]}
          </Badge>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          Aucun record enregistré pour cet exercice.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="px-4 py-3">
                  <p className="font-heading text-lg font-semibold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent>
              <ChartLegend color={colorVar} />
              <RecordProgressionChart records={displayRecords} color={colorVar} unitLabel={unitLabel} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2">
              {pagedRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between gap-3 rounded-xl border bg-muted/40 px-4 py-3"
                >
                  <div>
                    <p className="font-medium">
                      {toDisplay(record.weight)} {unitLabel} × {record.reps}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(record.achievedAt)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Supprimer ce record"
                    onClick={() => deleteRecord(record.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
              <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} className="pt-2" />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
