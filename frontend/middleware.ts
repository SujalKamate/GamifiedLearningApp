import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
	// Mock mode: bypass auth redirects entirely
	return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: ["/dashboard", "/profile", "/quiz/:path*", "/leaderboard"],
};