import { NextResponse, type NextRequest } from 'next/server'
import { ratelimit } from '@/lib/ratelimit'
import { jwtVerify } from 'jose'

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'elite-hosting-secret-key-2025')

// In-memory rate limiting fallback
const memoryLimit = new Map<string, { count: number; reset: number }>()

export async function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
  const url = request.nextUrl.clone()

  // 1. IP Ban Check (via Internal API call to bypass fs limitations in Edge)
  // Note: Middleware can fetch internal APIs if they are deployed.
  // However, for local development/simplicity, we check if the path is NOT the ban check itself to avoid recursion.
  if (!request.nextUrl.pathname.startsWith('/api/security/is-banned')) {
    try {
      const banCheck = await fetch(new URL('/api/security/is-banned', request.url), {
        headers: { 'x-forwarded-for': ip }
      })
      const { banned } = await banCheck.json()
      if (banned) {
        return new NextResponse('Your access has been revoked.', { status: 403 })
      }
    } catch (e) {
      console.error('Ban check failed', e)
    }
  }

  // 2. Rate Limiting
  if (request.nextUrl.pathname.startsWith('/api')) {
    if (process.env.UPSTASH_REDIS_REST_URL) {
      const { success } = await ratelimit.limit(ip)
      if (!success) {
        return new NextResponse('Too Many Requests', { status: 429 })
      }
    } else {
      // Fallback in-memory rate limiting (best effort)
      const now = Date.now()
      const limitInfo = memoryLimit.get(ip) || { count: 0, reset: now + 60000 }

      if (now > limitInfo.reset) {
        limitInfo.count = 0
        limitInfo.reset = now + 60000
      }

      limitInfo.count++
      memoryLimit.set(ip, limitInfo)

      if (limitInfo.count > 100) { // 100 requests per minute
        return new NextResponse('Too Many Requests (Fallback)', { status: 429 })
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

  // 3. Auth Check
  if (userPayload && (userPayload as any).is_banned) {
    return new NextResponse('Your account has been suspended.', { status: 403 })
  }

  if (!userPayload && (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  const response = NextResponse.next()

  // 4. Security Headers (Defense in Depth)
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')

  // Production-grade strict CSP
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com",
    "style-src 'self' 'unsafe-inline' https://api.fontshare.com",
    "img-src 'self' blob: data: https://images.unsplash.com https://grainy-gradients.vercel.app",
    "font-src 'self' data: https://api.fontshare.com https://fonts.gstatic.com",
    "connect-src 'self' https://api.github.com https://vitals.vercel-insights.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; ')

  response.headers.set('Content-Security-Policy', csp)

  return response
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*', '/admin/:path*'],
}
