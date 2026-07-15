"use client";

import { useState } from "react";
import { Scale, TrendingUp, TrendingDown, Minus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { BodyWeightOverviewDTO } from "@/types/bodyweight";
import { useUnit } from "@/hooks/use-unit";
import { Card, CardContent } from "@/components/ui/card";
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
import { LogWeightDialog } from "@/components/bodyweight/log-weight-dialog";
import { GoalDialog } from "@/components/bodyweight/goal-dialog";
import { HeightPrompt } from "@/components/bodyweight/height-prompt";
import { WeightChart } from "@/components/bodyweight/weight-chart";
import { Pagination } from "@/components/ui/pagination";

const ENTRIES_PER_PAGE = 8;

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export function BodyweightTracker({ initialOverview }: { initialOverview: BodyWeightOverviewDTO }) {
  const [overview, setOverview] = useState(initialOverview);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);

  async function refresh() {
    const response = await fetch("/api/bodyweight");
    if (response.ok) {
      setOverview(await response.json());
      setPage(1);
    }
  }

  async function confirmDelete() {
    if (!pendingDeleteId) return;
    setDeleting(true);
    const response = await fetch(`/api/bodyweight/${pendingDeleteId}`, { method: "DELETE" });
    setDeleting(false);
    setPendingDeleteId(null);

    if (!response.ok) {
      toast.error("Impossible de supprimer cette pesée.");
      return;
    }
    toast.success("Pesée supprimée.");
    refresh();
  }

  const { unitLabel, toDisplay } = useUnit();
  const color = "var(--muscle-calves)";
  const reversedEntries = [...overview.entries].reverse();
  const totalPages = Math.max(1, Math.ceil(reversedEntries.length / ENTRIES_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const recentEntries = reversedEntries.slice(
    (currentPage - 1) * ENTRIES_PER_PAGE,
    currentPage * ENTRIES_PER_PAGE
  );
  const displaySeries = overview.entries.map((e) => ({ date: e.date, weight: toDisplay(e.weight) }));

  const TrendIcon = overview.trend > 0.02 ? TrendingUp : overview.trend < -0.02 ? TrendingDown : Minus;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Poids de corps</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {overview.entries.length > 0
              ? `${overview.entries.length} pesée${overview.entries.length > 1 ? "s" : ""} enregistrée${overview.entries.length > 1 ? "s" : ""}.`
              : "Ajoute ta première pesée pour commencer à suivre ta progression."}
          </p>
        </div>
        <LogWeightDialog onLogged={refresh} />
      </div>

      {overview.entries.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-20 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muscle-calves/10 text-muscle-calves">
            <Scale className="size-6" />
          </span>
          <div>
            <p className="font-medium">Pas encore de pesée</p>
            <p className="text-sm text-muted-foreground">
              Ajoute une pesée pour voir ta courbe de poids apparaître ici.
            </p>
          </div>
        </div>
      ) : (
        <>
          {!overview.heightCm && <HeightPrompt onSaved={refresh} />}

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <Card>
              <CardContent className="px-4 py-3">
                <p className="font-heading text-lg font-semibold">
                  {overview.latest ? `${toDisplay(overview.latest.weight)} ${unitLabel}` : "—"}
                </p>
                <p className="text-xs text-muted-foreground">Dernière pesée</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="px-4 py-3">
                <p className="font-heading text-lg font-semibold">
                  {overview.weeklyAverage != null ? `${toDisplay(overview.weeklyAverage)} ${unitLabel}` : "—"}
                </p>
                <p className="text-xs text-muted-foreground">Moyenne 7 jours</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="px-4 py-3">
                <p className="font-heading text-lg font-semibold">
                  {overview.monthlyAverage != null ? `${toDisplay(overview.monthlyAverage)} ${unitLabel}` : "—"}
                </p>
                <p className="text-xs text-muted-foreground">Moyenne 30 jours</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="px-4 py-3">
                <p className="font-heading text-lg font-semibold">
                  {overview.bmi != null ? overview.bmi : "—"}
                </p>
                <p className="text-xs text-muted-foreground">IMC</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-2 px-4 py-3">
                <TrendIcon className="size-4 text-muted-foreground" />
                <div>
                  <p className="font-heading text-lg font-semibold">
                    {overview.trend > 0 ? "+" : ""}
                    {toDisplay(overview.trend)} {unitLabel}
                  </p>
                  <p className="text-xs text-muted-foreground">Tendance / pesée</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-muted-foreground">Objectif</h2>
                <GoalDialog goal={overview.goal} onSaved={refresh} />
              </div>
              {overview.goal ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {overview.goal.remaining > 0
                        ? `${toDisplay(overview.goal.remaining)} ${unitLabel} à perdre`
                        : overview.goal.remaining < 0
                          ? `${toDisplay(Math.abs(overview.goal.remaining))} ${unitLabel} à prendre`
                          : "Objectif atteint"}
                    </span>
                    <span className="text-muted-foreground">
                      {toDisplay(overview.goal.targetWeight)} {unitLabel}
                      {overview.goal.targetDate ? ` · ${formatDate(overview.goal.targetDate)}` : ""}
                    </span>
                  </div>
                  <Progress value={overview.goal.progressPercent} />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Définis un poids cible pour suivre ta progression.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="mb-2 text-sm font-medium text-muted-foreground">Évolution</h2>
              <WeightChart
                series={displaySeries}
                color={color}
                unitLabel={unitLabel}
                goalWeight={overview.goal ? toDisplay(overview.goal.targetWeight) : undefined}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <h2 className="px-5 pt-4 text-sm font-medium text-muted-foreground">Pesées récentes</h2>
              <div className="divide-y">
                {recentEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium">{formatDate(entry.date)}</p>
                      {entry.note && <p className="text-xs text-muted-foreground">{entry.note}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">
                        {toDisplay(entry.weight)} {unitLabel}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Supprimer"
                        onClick={() => setPendingDeleteId(entry.id)}
                      >
                        <Trash2 className="size-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} className="py-4" />
            </CardContent>
          </Card>
        </>
      )}

      <AlertDialog open={pendingDeleteId != null} onOpenChange={(next) => !next && setPendingDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette pesée ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive/10 text-destructive hover:bg-destructive/20"
              onClick={confirmDelete}
              disabled={deleting}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
