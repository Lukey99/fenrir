"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MoreVertical, Copy, Archive, ArchiveRestore, Trash2, Layers } from "lucide-react";
import { toast } from "sonner";

import type { Program } from "@/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

type ProgramWithCount = Program & { _count: { days: number } };

export function ProgramCard({
  program,
  index,
  onDuplicated,
  onStatusChanged,
  onDeleted,
}: {
  program: ProgramWithCount;
  index: number;
  onDuplicated: (program: ProgramWithCount) => void;
  onStatusChanged: (program: ProgramWithCount) => void;
  onDeleted: (id: string) => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const isArchived = program.status === "ARCHIVED";

  async function handleDuplicate() {
    setBusy(true);
    const response = await fetch(`/api/programs/${program.id}/duplicate`, { method: "POST" });
    setBusy(false);
    if (!response.ok) {
      toast.error("Impossible de dupliquer le programme.");
      return;
    }
    const data = await response.json();
    toast.success(`"${program.name}" dupliqué.`);
    onDuplicated({ ...data.program, _count: { days: data.program.days?.length ?? 0 } });
  }

  async function handleToggleStatus() {
    setBusy(true);
    const response = await fetch(`/api/programs/${program.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: isArchived ? "ACTIVE" : "ARCHIVED" }),
    });
    setBusy(false);
    if (!response.ok) {
      toast.error("Impossible de mettre à jour le programme.");
      return;
    }
    const data = await response.json();
    toast.success(isArchived ? "Programme réactivé." : "Programme archivé.");
    onStatusChanged({ ...program, ...data.program });
  }

  async function handleDelete() {
    setBusy(true);
    const response = await fetch(`/api/programs/${program.id}`, { method: "DELETE" });
    setBusy(false);
    setConfirmOpen(false);
    if (!response.ok) {
      toast.error("Impossible de supprimer le programme.");
      return;
    }
    toast.success(`"${program.name}" supprimé.`);
    onDeleted(program.id);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.04, ease: "easeOut" }}
      whileHover={{ y: -3 }}
    >
      <Card className="h-full transition-shadow duration-300 hover:shadow-lg hover:shadow-foreground/5">
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="truncate">
              <Link href={`/programs/${program.id}`} className="hover:underline">
                {program.name}
              </Link>
            </CardTitle>
            {program.description && (
              <CardDescription className="mt-1 line-clamp-2">
                {program.description}
              </CardDescription>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon-sm" aria-label="Actions" />}
              disabled={busy}
            >
              <MoreVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="size-4" />
                Dupliquer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleStatus}>
                {isArchived ? (
                  <ArchiveRestore className="size-4" />
                ) : (
                  <Archive className="size-4" />
                )}
                {isArchived ? "Réactiver" : "Archiver"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
                <Trash2 className="size-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          <Badge variant={isArchived ? "outline" : "secondary"} className="gap-1">
            {isArchived ? "Archivé" : "Actif"}
          </Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Layers className="size-3.5" />
            {program._count.days} jour{program._count.days > 1 ? "s" : ""}
          </span>
        </CardContent>
      </Card>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce programme ?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{program.name}&quot; et tous ses jours/exercices seront définitivement
              supprimés. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive/10 text-destructive hover:bg-destructive/20"
              onClick={handleDelete}
              disabled={busy}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
