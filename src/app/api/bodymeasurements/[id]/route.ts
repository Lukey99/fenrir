import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { bodyMeasurementService } from "@/server/services/bodyMeasurementService";
import { unauthorized, toErrorResponse } from "@/server/http";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const { id } = await params;
  try {
    await bodyMeasurementService.deleteEntry(session.user.id, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
