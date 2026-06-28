import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret')

export async function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
  const path = request.nextUrl.pathname
  const token = request.cookies.get('auth-token')?.value

  // Protected routes check
  if (path.startsWith('/dashboard') || path.startsWith('/admin') || path.startsWith('/api/deployments')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY)

      // RBAC for Admin
      if (path.startsWith('/admin') && payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch (err) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  const response = NextResponse.next()

  // Security Headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.delete('X-Powered-By')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // CSP (Minimal for now to avoid breaking dashboard)
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
  ].join('; ')
  response.headers.set('Content-Security-Policy', csp)

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/api/:path*'],
}
