import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

/** GET /api/auth/me — Returns the current authenticated user from the JWT cookie. */
export async function GET(request: Request) {
  try {
    const jwtPayload = await getUserFromRequest(request);
    if (!jwtPayload) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    // Verify user still exists in DB (could have been deleted after token was issued)
    const user = await prisma.user.findUnique({
      where: { id: jwtPayload.userId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User account no longer exists." },
        { status: 401 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/auth/me] Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
