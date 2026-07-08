import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  exerciseService,
  DuplicateExerciseError,
  ExerciseInUseError,
} from "@/server/services/exerciseService";
import { createExerciseSchema } from "@/server/validators/exercise";
import { unauthorized, toErrorResponse } from "@/server/http";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const { id } = await params;
  const body = await request.json();
  const parsed = createExerciseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const exercise = await exerciseService.updateCustom(session.user.id, id, parsed.data);
    return NextResponse.json({ exercise });
  } catch (error) {
    if (error instanceof DuplicateExerciseError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return toErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const { id } = await params;
  try {
    await exerciseService.removeCustom(session.user.id, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ExerciseInUseError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return toErrorResponse(error);
  }
}
