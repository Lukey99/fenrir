import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { exerciseService, DuplicateExerciseError } from "@/server/services/exerciseService";
import { createExerciseSchema } from "@/server/validators/exercise";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const exercises = await exerciseService.listForUser(session.user.id);
  return NextResponse.json({ exercises });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createExerciseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const exercise = await exerciseService.createCustom(session.user.id, parsed.data);
    return NextResponse.json({ exercise }, { status: 201 });
  } catch (error) {
    if (error instanceof DuplicateExerciseError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}
