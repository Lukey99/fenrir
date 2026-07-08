import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { dataPortabilityService } from "@/server/services/dataPortabilityService";
import { exportDataSchema } from "@/server/validators/dataPortability";
import { unauthorized } from "@/server/http";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const body = await request.json();
  const parsed = exportDataSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Fichier invalide ou format non reconnu." },
      { status: 400 }
    );
  }

  const summary = await dataPortabilityService.importData(session.user.id, parsed.data);
  return NextResponse.json({ summary });
}
