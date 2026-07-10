import { Trophy } from "lucide-react";

import { AddRecordDialog } from "@/components/records/add-record-dialog";
import { RecordCategorySection } from "@/components/records/record-category-section";
import type { ExercisePickerOption } from "@/components/exercises/exercise-picker";
import type { PersonalRecordsOverview } from "@/types/personalRecord";

export function RecordsPage({
  overview,
  exercises,
}: {
  overview: PersonalRecordsOverview;
  exercises: ExercisePickerOption[];
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Records</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tes meilleures performances, par catégorie.
          </p>
        </div>
        <AddRecordDialog exercises={exercises} />
      </div>

      {!overview.hasAnyRecords ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-20 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Trophy className="size-6" />
          </span>
          <div>
            <p className="font-medium">Aucun record enregistré</p>
            <p className="text-sm text-muted-foreground">
              Ajoute ton premier record pour commencer à suivre ta progression.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {overview.categories.map((category) => (
            <RecordCategorySection key={category.category} category={category} />
          ))}
        </div>
      )}
    </div>
  );
}
