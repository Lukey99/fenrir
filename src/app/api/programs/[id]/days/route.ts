import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { programService } from "@/server/services/programService";
import { createProgramDaySchema } from "@/server/validators/program";
import { unauthorized, toErrorResponse } from "@/server/http";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const { id } = await params;
  const body = await request.json();
  const parsed = createProgramDaySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const day = await programService.addDay(id, session.user.id, parsed.data);
    return NextResponse.json({ day }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
