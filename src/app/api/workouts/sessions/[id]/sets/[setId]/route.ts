import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { workoutService } from "@/server/services/workoutService";
import { updateWorkoutSetSchema } from "@/server/validators/workout";
import { unauthorized, toErrorResponse } from "@/server/http";

type Params = { params: Promise<{ id: string; setId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const { setId } = await params;
  const body = await request.json();
  const parsed = updateWorkoutSetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const { set, newRecord } = await workoutService.updateSet(setId, session.user.id, parsed.data);
    return NextResponse.json({ set, newRecord });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const { setId } = await params;
  try {
    await workoutService.removeSet(setId, session.user.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
