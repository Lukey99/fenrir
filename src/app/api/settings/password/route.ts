import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { settingsService, InvalidPasswordError } from "@/server/services/settingsService";
import { changePasswordSchema } from "@/server/validators/settings";
import { unauthorized } from "@/server/http";
import { checkRateLimit } from "@/lib/rate-limit";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const { allowed } = checkRateLimit(`change-password:${session.user.id}`, 5, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Trop de tentatives. Réessaie dans un instant." }, { status: 429 });
  }

  const body = await request.json();
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { currentPassword, newPassword } = parsed.data;
  try {
    await settingsService.changePassword(session.user.id, currentPassword, newPassword);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof InvalidPasswordError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
