import { NextResponse, type NextRequest } from "next/server"
import { CSRF_COOKIE_NAME } from "@/app/api/auth/csrf/route"

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"])

export function middleware(request: NextRequest) {
  if (MUTATING_METHODS.has(request.method)) {
    const headerToken = request.headers.get("X-CSRF-Token")
    const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value

    if (!headerToken || !cookieToken || headerToken !== cookieToken) {
      return NextResponse.json({ error: "CSRF token mismatch" }, { status: 403 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/api/:path*",
}
