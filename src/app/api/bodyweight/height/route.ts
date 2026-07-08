import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { bodyWeightService } from "@/server/services/bodyWeightService";
import { setHeightSchema } from "@/server/validators/bodyweight";
import { unauthorized } from "@/server/http";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const body = await request.json();
  const parsed = setHeightSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  await bodyWeightService.setHeight(session.user.id, parsed.data.heightCm);
  return NextResponse.json({ ok: true });
}
