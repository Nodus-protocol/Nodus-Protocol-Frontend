import { randomBytes } from "crypto"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const CSRF_COOKIE_NAME = "csrf_token"

export async function GET() {
  const token = randomBytes(32).toString("hex")
  const cookieStore = await cookies()

  // Non-HttpOnly: must be readable by JS to satisfy the double-submit pattern.
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60,
    path: "/",
    httpOnly: false,
  })

  return NextResponse.json({ csrf_token: token })
}
