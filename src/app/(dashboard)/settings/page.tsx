import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { settingsService } from "@/server/services/settingsService";
import { SettingsPage as SettingsPageClient } from "@/components/settings/settings-page";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await settingsService.getProfile(session.user.id);

  return <SettingsPageClient profile={profile} />;
}
