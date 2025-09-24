import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get auth token from cookies (we'll sync localStorage to cookies)
  const token = request.cookies.get('auth_token')?.value

  // Protected routes
  const protectedPaths = ['/dashboard', '/portfolio', '/watchlist', '/alerts']
  const isProtectedRoute = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))

  // Redirect to login if accessing protected route without token
  if (isProtectedRoute && !token) {
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users away from auth pages
  const authPaths = ['/auth/login', '/auth/register']
  const isAuthRoute = authPaths.includes(request.nextUrl.pathname)

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}