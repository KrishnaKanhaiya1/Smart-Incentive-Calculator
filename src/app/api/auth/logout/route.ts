import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

/** POST /api/auth/logout — Clears the JWT cookie. */
export async function POST() {
  const response = NextResponse.json(
    { message: "Logged out successfully." },
    { status: 200 }
  );
  response.headers.set("Set-Cookie", clearAuthCookie());
  return response;
}
