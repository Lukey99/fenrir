import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { programService } from "@/server/services/programService";
import { updateProgramDaySchema } from "@/server/validators/program";
import { unauthorized, toErrorResponse } from "@/server/http";

type Params = { params: Promise<{ id: string; dayId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const { dayId } = await params;
  const body = await request.json();
  const parsed = updateProgramDaySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const day = await programService.updateDay(dayId, session.user.id, parsed.data);
    return NextResponse.json({ day });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const { dayId } = await params;
  try {
    await programService.removeDay(dayId, session.user.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
