import { NextResponse } from "next/server";

// Auth state lives in per-tab sessionStorage so multiple roles can be signed in
// simultaneously in the same browser. Route guarding is handled by the buyer/
// supplier layouts on the client. The API enforces auth + role on every call.
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
