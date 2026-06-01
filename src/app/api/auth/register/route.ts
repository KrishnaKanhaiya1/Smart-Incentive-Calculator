import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sanitizeEmail, sanitizeString } from "@/lib/sanitize";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
    }

    // Sanitize input
    try {
      email = sanitizeEmail(email);
      name = sanitizeString(name, 100);
      password = sanitizeString(password, 100);
    } catch (err: any) {
      return NextResponse.json({ error: err.message || "Invalid input format." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create SALES user
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: "SALES",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return NextResponse.json({ message: "Registration successful. Please log in.", user: newUser }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/auth/register] error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
