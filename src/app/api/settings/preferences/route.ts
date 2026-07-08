import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { settingsService } from "@/server/services/settingsService";
import { updatePreferencesSchema } from "@/server/validators/settings";
import { unauthorized } from "@/server/http";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const body = await request.json();
  const parsed = updatePreferencesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  await settingsService.updateUnitPreference(session.user.id, parsed.data.unitPreference);
  return NextResponse.json({ ok: true });
}
