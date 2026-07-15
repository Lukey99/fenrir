"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Page précédente"
      >
        <ChevronLeft className="size-4" />
      </Button>
      <span className="min-w-20 text-center text-sm text-muted-foreground" aria-live="polite">
        Page {page} / {totalPages}
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Page suivante"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
