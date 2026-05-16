import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.JWT_SECRET || "default_secret_key_change_me";
const key = new TextEncoder().encode(secretKey);

const protectedRoutes = ["/dashboard", "/notes", "/analytics", "/settings", "/archived", "/shared", "/ai-insights"];
const authRoutes = ["/login", "/signup"];

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
  const isAuthRoute = authRoutes.includes(path);

  const cookie = req.cookies.get("peblo-auth-token")?.value;

  let session = null;
  if (cookie) {
    try {
      const { payload } = await jwtVerify(cookie, key, {
        algorithms: ["HS256"],
      });
      session = payload;
    } catch (e) {
      console.error("JWT verification failed:", e);
    }
  }

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
