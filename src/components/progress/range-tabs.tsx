import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ProgressRange } from "@/server/services/progressService";

const ranges: { value: ProgressRange; label: string }[] = [
  { value: "week", label: "Semaine" },
  { value: "month", label: "Mois" },
  { value: "year", label: "Année" },
  { value: "all", label: "Tout" },
];

export function RangeTabs({
  exerciseId,
  current,
}: {
  exerciseId: string;
  current: ProgressRange;
}) {
  return (
    <div className="inline-flex rounded-lg border p-1">
      {ranges.map((range) => (
        <Link
          key={range.value}
          href={`/progress/${exerciseId}?range=${range.value}`}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            current === range.value
              ? "bg-secondary text-secondary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {range.label}
        </Link>
      ))}
    </div>
  );
}
