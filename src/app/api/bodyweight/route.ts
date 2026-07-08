import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { bodyWeightService } from "@/server/services/bodyWeightService";
import { logBodyWeightEntrySchema } from "@/server/validators/bodyweight";
import { unauthorized } from "@/server/http";

export async function GET() {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const overview = await bodyWeightService.getOverview(session.user.id);
  return NextResponse.json(overview);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const body = await request.json();
  const parsed = logBodyWeightEntrySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { date, weight, note } = parsed.data;
  const entry = await bodyWeightService.logEntry(session.user.id, date, weight, note);
  return NextResponse.json({ entry }, { status: 201 });
}
