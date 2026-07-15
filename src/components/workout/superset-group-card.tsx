import { Repeat } from "lucide-react";

export function SupersetGroupCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-brand/30 p-2">
      <div className="mb-2 flex items-center gap-1.5 px-1 text-xs font-medium text-brand-ink">
        <Repeat className="size-3.5" />
        Superset — enchaîne les exercices sans repos entre eux
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
