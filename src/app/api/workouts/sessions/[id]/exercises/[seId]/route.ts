import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { workoutService } from "@/server/services/workoutService";
import { sessionExerciseActionSchema } from "@/server/validators/workout";
import { unauthorized, toErrorResponse } from "@/server/http";

type Params = { params: Promise<{ id: string; seId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const { seId } = await params;
  const body = await request.json();
  const parsed = sessionExerciseActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const sessionExercise = await workoutService.applyExerciseAction(
      seId,
      session.user.id,
      parsed.data
    );
    return NextResponse.json({ sessionExercise });
  } catch (error) {
    return toErrorResponse(error);
  }
}
