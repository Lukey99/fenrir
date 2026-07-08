import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { workoutService } from "@/server/services/workoutService";
import { unauthorized, toErrorResponse } from "@/server/http";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const { id } = await params;
  try {
    const workoutSession = await workoutService.get(id, session.user.id);
    return NextResponse.json({ session: workoutSession });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const { id } = await params;
  try {
    await workoutService.remove(id, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
