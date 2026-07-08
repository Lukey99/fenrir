import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { programService } from "@/server/services/programService";
import { unauthorized, toErrorResponse } from "@/server/http";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const { id } = await params;
  try {
    const program = await programService.duplicate(id, session.user.id);
    return NextResponse.json({ program }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
