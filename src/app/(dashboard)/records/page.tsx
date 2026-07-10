import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { exerciseService } from "@/server/services/exerciseService";
import { personalRecordService } from "@/server/services/personalRecordService";
import { RecordsPage } from "@/components/records/records-page";

export default async function Records() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [overview, allExercises] = await Promise.all([
    personalRecordService.getOverview(session.user.id),
    exerciseService.listForUser(session.user.id),
  ]);

  const exerciseOptions = allExercises.map((exercise) => ({
    id: exercise.id,
    name: exercise.name,
    muscleGroup: exercise.muscleGroup,
    equipment: exercise.equipment,
  }));

  return <RecordsPage overview={overview} exercises={exerciseOptions} />;
}
