import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { exerciseService } from "@/server/services/exerciseService";
import { ExercisesBrowser } from "@/components/exercises/exercises-browser";

export default async function ExercisesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const exercises = await exerciseService.listForUser(session.user.id);

  return <ExercisesBrowser initialExercises={exercises} />;
}
