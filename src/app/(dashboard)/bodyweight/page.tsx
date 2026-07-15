import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { bodyWeightService } from "@/server/services/bodyWeightService";
import { bodyMeasurementService } from "@/server/services/bodyMeasurementService";
import { BodyTrackingTabs } from "@/components/bodyweight/body-tracking-tabs";

export default async function BodyweightPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [weightOverview, measurementOverview] = await Promise.all([
    bodyWeightService.getOverview(session.user.id),
    bodyMeasurementService.getOverview(session.user.id),
  ]);

  return (
    <BodyTrackingTabs weightOverview={weightOverview} measurementOverview={measurementOverview} />
  );
}
