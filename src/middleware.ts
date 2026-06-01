import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = () => new TextEncoder().encode(process.env.JWT_SECRET || "");

/**
 * Next.js middleware for route-level RBAC enforcement.
 * Runs on Edge runtime — uses jose (not jsonwebtoken).
 */
export async function middleware(request: NextRequest) {
  const token = request.cookies.get("nt_token")?.value;
  const { pathname } = request.nextUrl;

  // Protected page routes — redirect to login if not authenticated
  if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET());
      const role = payload.role as string;

      // Admin pages require ADMIN role
      if (pathname.startsWith("/admin") && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", request.url));
      }

      // Dashboard pages require SALES role
      if (pathname.startsWith("/dashboard") && role !== "SALES") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch {
      // Invalid/expired token — redirect to login
      const response = NextResponse.redirect(new URL("/", request.url));
      response.cookies.delete("nt_token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/dashboard", "/dashboard/:path*"],
};
