import { NextResponse, type NextRequest } from 'next/server'
import { ratelimit } from '@/lib/ratelimit'
import { jwtVerify } from 'jose'

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'elite-hosting-secret-key-2025')

export async function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    if (process.env.UPSTASH_REDIS_REST_URL) {
      const { success } = await ratelimit.limit(ip)
      if (!success) {
        return new NextResponse('Too Many Requests', { status: 429 })
      }
    }
  }

  const token = request.cookies.get('auth-token')?.value
  let user = null

  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY)
      user = payload as any
    } catch (err) {
      // Invalid token
    }
  }

  // Security Check: Ban System
  if (user && (user as any).is_banned) {
    return new NextResponse('Your account has been suspended.', { status: 403 })
  }

  // Protect dashboard and admin routes
  if (!user && (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*', '/admin/:path*'],
}
