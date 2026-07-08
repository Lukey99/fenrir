import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { workoutService } from "@/server/services/workoutService";
import { startSessionSchema } from "@/server/validators/workout";
import { unauthorized, toErrorResponse } from "@/server/http";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const body = await request.json().catch(() => ({}));
  const parsed = startSessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const workoutSession = await workoutService.start(session.user.id, parsed.data);
    return NextResponse.json({ session: workoutSession }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
