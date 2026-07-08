import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { programService } from "@/server/services/programService";
import { createProgramSchema } from "@/server/validators/program";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const programs = await programService.list(session.user.id);
  return NextResponse.json({ programs });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createProgramSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const program = await programService.create(session.user.id, parsed.data);
  return NextResponse.json({ program }, { status: 201 });
}
