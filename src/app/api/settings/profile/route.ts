import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { settingsService } from "@/server/services/settingsService";
import { updateProfileSchema } from "@/server/validators/settings";
import { unauthorized } from "@/server/http";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const body = await request.json();
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  await settingsService.updateName(session.user.id, parsed.data.name);
  return NextResponse.json({ ok: true });
}
