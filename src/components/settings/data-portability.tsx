"use client";

import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DataPortability() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    const response = await fetch("/api/export");
    setExporting(false);

    if (!response.ok) {
      toast.error("Impossible d'exporter tes données.");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fenrir-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export téléchargé.");
  }

  async function handleImportFile(file: File) {
    setImporting(true);
    try {
      const text = await file.text();
      const payload = JSON.parse(text);

      const response = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data?.error ?? "Import impossible.");
        return;
      }

      const { summary } = data;
      toast.success(
        `Import terminé : ${summary.programsImported} programme(s), ${summary.sessionsImported} séance(s), ${summary.bodyWeightEntriesImported} pesée(s).`
      );
    } catch {
      toast.error("Fichier invalide : le JSON n'a pas pu être lu.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        size="sm"
        variant="outline"
        onClick={handleExport}
        disabled={exporting}
        className={cn(exporting && "opacity-70")}
      >
        <Download className="size-4" />
        {exporting ? "Export..." : "Exporter mes données"}
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={importing}
        className={cn(importing && "opacity-70")}
      >
        <Upload className="size-4" />
        {importing ? "Import..." : "Importer un export"}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleImportFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
