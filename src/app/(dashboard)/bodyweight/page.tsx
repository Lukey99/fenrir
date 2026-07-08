import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { bodyWeightService } from "@/server/services/bodyWeightService";
import { BodyweightTracker } from "@/components/bodyweight/bodyweight-tracker";

export default async function BodyweightPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const overview = await bodyWeightService.getOverview(session.user.id);

  return <BodyweightTracker initialOverview={overview} />;
}
