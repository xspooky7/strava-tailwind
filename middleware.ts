import { SessionData, sessionOptions } from "@/app/lib/auth/lib"
import { getIronSession } from "iron-session"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export default async function middleware(req: NextRequest) {
  const protectedRoutes = ["/dashboard", "/koms", "/koms/delta", "/koms/total", "/tailwind"]
  const currentPath = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.includes(currentPath)
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)

  if (isProtectedRoute && !session?.isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.nextUrl))
  }

  return NextResponse.next()
}
// Routes Middleware should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
}
