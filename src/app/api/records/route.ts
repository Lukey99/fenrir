import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { personalRecordService } from "@/server/services/personalRecordService";
import { createPersonalRecordSchema } from "@/server/validators/personalRecord";
import { unauthorized, toErrorResponse } from "@/server/http";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const body = await request.json();
  const parsed = createPersonalRecordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const record = await personalRecordService.create(session.user.id, parsed.data);
    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
