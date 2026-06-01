import { NextRequest, NextResponse } from "next/server";

const requests = new Map<string, number[]>();
const WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS = 30; // 30 requests per minute

/**
 * Rate limiting middleware to prevent abuse
 * Returns 429 if too many requests from same IP
 */
export function rateLimit(request: NextRequest): NextResponse | null {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const now = Date.now();

  const userRequests = requests.get(ip) || [];
  const recentRequests = userRequests.filter((time) => now - time < WINDOW_MS);

  if (recentRequests.length >= MAX_REQUESTS) {
    console.warn(`[Rate Limit] IP ${ip} exceeded rate limit`);
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  recentRequests.push(now);
  requests.set(ip, recentRequests);

  return null;
}
