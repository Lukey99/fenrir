import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { workoutService } from "@/server/services/workoutService";
import { unauthorized, toErrorResponse } from "@/server/http";

type Params = { params: Promise<{ id: string; seId: string }> };

export async function POST(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const { seId } = await params;
  try {
    const set = await workoutService.addSet(seId, session.user.id);
    return NextResponse.json({ set }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
