import { NextResponse, type NextRequest } from 'next/server'
import { ratelimit } from '@/lib/ratelimit'
import { jwtVerify } from 'jose'

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'elite-hosting-secret-key-2025')

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
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
      user = payload
    } catch (err) {
      // Invalid token
    }
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
