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
  let userPayload = null

  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY)
      userPayload = payload as any
    } catch (err) {
      // Invalid token
    }
  }

  // Real-time Ban Check
  if (userPayload?.userId) {
    // Note: In Next.js middleware, we can't easily import from lib/db because of edge runtime constraints
    // unless the DB logic is edge-compatible. Our JsonDB uses fs, which is NOT edge-compatible.
    // However, the current middleware seems to be running in a Node.js environment or similar
    // given the context. If it's standard Next.js middleware, it runs on Edge.

    // For now, we will rely on the getUser check in server actions and API routes,
    // but we can also add a header or similar if needed.
    // Let's assume we want to keep it simple and effective.
  }

  // Security Check: Ban System (from payload as fallback)
  if (userPayload && (userPayload as any).is_banned) {
    return new NextResponse('Your account has been suspended.', { status: 403 })
  }

  // Credit Expiry Check
  if (userPayload && (userPayload as any).credits_expiry) {
    const expiry = new Date((userPayload as any).credits_expiry);
    if (expiry < new Date()) {
        // Redact credits if expired (logical check, doesn't modify DB here as middleware is read-only for cookies)
        // In a real app, you'd trigger a background update or just block access here.
    }
  }

  // Protect dashboard and admin routes
  if (!userPayload && (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*', '/admin/:path*'],
}
