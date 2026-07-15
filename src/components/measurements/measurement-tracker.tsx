"use client";

import { useState } from "react";
import { Ruler, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { BodyMeasurementEntryDTO, BodyMeasurementOverviewDTO } from "@/types/bodymeasurement";
import { Card, CardContent } from "@/components/ui/card";
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
import { LogMeasurementDialog } from "@/components/measurements/log-measurement-dialog";
import { Pagination } from "@/components/ui/pagination";

const ENTRIES_PER_PAGE = 8;

const fields: { key: keyof BodyMeasurementEntryDTO; label: string }[] = [
  { key: "waistCm", label: "Taille" },
  { key: "chestCm", label: "Poitrine" },
  { key: "hipsCm", label: "Hanches" },
  { key: "armCm", label: "Bras" },
  { key: "thighCm", label: "Cuisse" },
  { key: "calfCm", label: "Mollet" },
];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function entrySummary(entry: BodyMeasurementEntryDTO) {
  return fields
    .filter((field) => entry[field.key] != null)
    .map((field) => `${field.label} ${entry[field.key]} cm`)
    .join(" · ");
}

export function MeasurementTracker({ initialOverview }: { initialOverview: BodyMeasurementOverviewDTO }) {
  const [overview, setOverview] = useState(initialOverview);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);

  async function refresh() {
    const response = await fetch("/api/bodymeasurements");
    if (response.ok) {
      setOverview(await response.json());
      setPage(1);
    }
  }

  async function confirmDelete() {
    if (!pendingDeleteId) return;
    setDeleting(true);
    const response = await fetch(`/api/bodymeasurements/${pendingDeleteId}`, { method: "DELETE" });
    setDeleting(false);
    setPendingDeleteId(null);

    if (!response.ok) {
      toast.error("Impossible de supprimer cette mesure.");
      return;
    }
    toast.success("Mesure supprimée.");
    refresh();
  }

  const reversedEntries = [...overview.entries].reverse();
  const totalPages = Math.max(1, Math.ceil(reversedEntries.length / ENTRIES_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const recentEntries = reversedEntries.slice(
    (currentPage - 1) * ENTRIES_PER_PAGE,
    currentPage * ENTRIES_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Mensurations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {overview.entries.length > 0
              ? `${overview.entries.length} entrée${overview.entries.length > 1 ? "s" : ""} enregistrée${overview.entries.length > 1 ? "s" : ""}.`
              : "Ajoute ta première mesure pour commencer à suivre ta progression."}
          </p>
        </div>
        <LogMeasurementDialog onLogged={refresh} />
      </div>

      {overview.entries.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-20 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muscle-calves/10 text-muscle-calves">
            <Ruler className="size-6" />
          </span>
          <div>
            <p className="font-medium">Pas encore de mesure</p>
            <p className="text-sm text-muted-foreground">
              Ajoute des mesures pour suivre l&apos;évolution de ta silhouette.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {fields.map((field) => (
              <Card key={field.key}>
                <CardContent className="px-4 py-3">
                  <p className="font-heading text-lg font-semibold">
                    {overview.latest && overview.latest[field.key] != null
                      ? `${overview.latest[field.key]} cm`
                      : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">{field.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="p-0">
              <h2 className="px-5 pt-4 text-sm font-medium text-muted-foreground">Mesures récentes</h2>
              <div className="divide-y">
                {recentEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{formatDate(entry.date)}</p>
                      <p className="truncate text-xs text-muted-foreground">{entrySummary(entry)}</p>
                      {entry.note && (
                        <p className="truncate text-xs text-muted-foreground italic">{entry.note}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Supprimer"
                      onClick={() => setPendingDeleteId(entry.id)}
                    >
                      <Trash2 className="size-3.5 text-muted-foreground" />
                    </Button>
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
            <AlertDialogTitle>Supprimer cette mesure ?</AlertDialogTitle>
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
