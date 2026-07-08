import { NextResponse } from "next/server";
import { NotFoundError } from "@/server/errors";

export function unauthorized() {
  return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
}

/** Maps known service errors to HTTP responses; rethrows anything else. */
export function toErrorResponse(error: unknown) {
  if (error instanceof NotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  throw error;
}
