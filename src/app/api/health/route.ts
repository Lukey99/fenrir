import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Unauthenticated liveness/readiness check for uptime monitoring — confirms
 * the app can actually reach Postgres, not just that the process is running. */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ status: "error" }, { status: 503 });
  }
}
