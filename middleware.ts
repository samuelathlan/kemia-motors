import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Protected routes - must be authenticated + active member
  const protectedRoutes = ['/dashboard', '/charter', '/outings', '/map', '/motorcycles', '/admin']
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // Check for auth cookie (Supabase session)
  const authCookie = request.cookies.get('sb-zvlmxsgvkdogbnnldauy-auth-token')
  const hasSession = !!authCookie?.value

  if (isProtectedRoute && !hasSession) {
    // Redirect to login with return URL
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from auth pages
  const authRoutes = ['/auth/login', '/auth/signup']
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
