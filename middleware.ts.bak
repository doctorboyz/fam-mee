import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple auth check middleware
// For full auth, use auth() in server components
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Protected routes
  const protectedRoutes = ['/dashboard', '/wallet', '/tasks', '/calendar', '/settings']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  // Check if user has session token
  const sessionToken = request.cookies.get('authjs.session-token') || 
                       request.cookies.get('__Secure-authjs.session-token')
  
  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Redirect to dashboard if logged in user tries to access login
  if (pathname === '/login' && sessionToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/wallet/:path*',
    '/tasks/:path*',
    '/calendar/:path*',
    '/settings/:path*',
    '/login',
  ],
}
