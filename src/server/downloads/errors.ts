import { NextResponse } from "next/server";

/**
 * Error response shape from spec §35.3: { error: { code, message, requestId } }.
 * User-facing messages should be helpful without revealing implementation details.
 */
export function errorResponse(code: string, message: string, status: number): NextResponse {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        requestId: crypto.randomUUID(),
      },
    },
    { status },
  );
}
