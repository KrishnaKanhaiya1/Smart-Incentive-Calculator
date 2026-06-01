import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken, createAuthCookie } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { sanitizeEmail } from "@/lib/sanitize";
import { logAuditEvent } from "@/lib/auditLog";

export async function POST(request: NextRequest) {
  // Rate limiting: 10 login attempts per minute
  const limitResponse = rateLimit(request);
  if (limitResponse) return limitResponse;
  try {
    const body = await request.json();
    let { email, password } = body as { email: unknown; password: unknown };

    // Sanitize email input
    try {
      email = sanitizeEmail(email);
    } catch (err) {
      await logAuditEvent("system", "LOGIN", "user", null, { error: "Invalid email format" }, "FAILURE");
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || !password) {
      return NextResponse.json(
        { error: "Password is required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email.trim().toLowerCase(),
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        passwordHash: true,
      },
    });

    // Generic error message to prevent user enumeration
    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Issue JWT token and set httpOnly cookie
    const token = await signToken({
      userId: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    });

    // Log successful login
    await logAuditEvent(user.id, "LOGIN", "user", user.id, { email: user.email }, "SUCCESS");

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );

    response.headers.set("Set-Cookie", createAuthCookie(token));
    return response;
  } catch (error) {
    console.error("[POST /api/auth/login] Error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
