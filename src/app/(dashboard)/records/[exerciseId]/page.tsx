import { redirect, notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { personalRecordService } from "@/server/services/personalRecordService";
import { NotFoundError } from "@/server/errors";
import { RecordProgressionPage } from "@/components/records/record-progression-page";

export default async function ExerciseRecordPage({
  params,
}: {
  params: Promise<{ exerciseId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { exerciseId } = await params;

  let progression;
  try {
    progression = await personalRecordService.getExerciseProgression(session.user.id, exerciseId);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  return <RecordProgressionPage progression={progression} />;
}
