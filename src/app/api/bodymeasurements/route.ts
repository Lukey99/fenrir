import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { bodyMeasurementService } from "@/server/services/bodyMeasurementService";
import { logBodyMeasurementEntrySchema, hasAnyMeasurement } from "@/server/validators/bodymeasurement";
import { unauthorized } from "@/server/http";

export async function GET() {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const overview = await bodyMeasurementService.getOverview(session.user.id);
  return NextResponse.json(overview);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const body = await request.json();
  const parsed = logBodyMeasurementEntrySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  if (!hasAnyMeasurement(parsed.data)) {
    return NextResponse.json({ error: "Renseigne au moins une mesure." }, { status: 400 });
  }

  const entry = await bodyMeasurementService.logEntry(session.user.id, parsed.data);
  return NextResponse.json({ entry }, { status: 201 });
}
