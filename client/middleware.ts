import { type NextRequest, NextResponse } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const walletAddress = request.cookies.get("walletAddress");

  const privatePath =
    path === "/settings" ||
    path === "/" ||
    path === "/investments" ||
    path === "/withdraw" ||
    path === "/auth" ||
    path === "/auth/kyc" ||
    path === "referrals" ||
    path === "/plans";

  // Check if the path starts with /login or /register
  const publicPath = path === "/auth";

  if (!publicPath && !walletAddress?.value)
    return NextResponse.redirect(new URL("/auth", request.url));

  if (publicPath && walletAddress?.value)
    return NextResponse.redirect(new URL("/", request.url));
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/",
    "/settings",
    "/investments",
    "/withdraw",
    "/auth",
    "/auth/kyc",
    "/referrals",
    "/plans",
  ], // Match all paths to apply middleware dynamically
};
