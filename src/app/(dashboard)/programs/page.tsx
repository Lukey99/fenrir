import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { programService } from "@/server/services/programService";
import { ProgramsList } from "@/components/programs/programs-list";

export default async function ProgramsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const programs = await programService.list(session.user.id);

  return <ProgramsList initialPrograms={programs} />;
}
