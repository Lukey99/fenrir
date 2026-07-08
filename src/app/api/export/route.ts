import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { dataPortabilityService } from "@/server/services/dataPortabilityService";
import { unauthorized } from "@/server/http";

export async function GET() {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const data = await dataPortabilityService.exportData(session.user.id);
  return NextResponse.json(data, {
    headers: {
      "Content-Disposition": `attachment; filename="fenrir-export-${data.exportedAt.slice(0, 10)}.json"`,
    },
  });
}
