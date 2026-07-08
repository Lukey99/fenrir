import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { bodyWeightService } from "@/server/services/bodyWeightService";
import { setWeightGoalSchema } from "@/server/validators/bodyweight";
import { unauthorized } from "@/server/http";

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const body = await request.json();
  const parsed = setWeightGoalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { targetWeight, targetDate } = parsed.data;
  const goal = await bodyWeightService.setGoal(session.user.id, targetWeight, targetDate);
  return NextResponse.json({ goal });
}
