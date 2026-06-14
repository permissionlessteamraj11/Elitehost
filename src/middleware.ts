import { NextResponse, type NextRequest } from 'next/server'
import { authRateLimit, generalRateLimit, aiRateLimit, uploadRateLimit } from '@/lib/ratelimit'
import { jwtVerify } from 'jose'
import { LRUCache } from 'lru-cache'

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET)

// In-memory rate limiting fallback using lru-cache
const memoryCache = new LRUCache<string, { count: number; reset: number }>({
  max: 5000,
  ttl: 15 * 60 * 1000, // 15 mins max
})

async function checkRateLimit(ip: string, type: 'auth' | 'gen' | 'ai' | 'upload') {
  const limits = {
    auth: { count: 5, window: 15 * 60 * 1000 },
    gen: { count: 60, window: 60 * 1000 },
    ai: { count: 10, window: 60 * 1000 },
    upload: { count: 5, window: 60 * 1000 },
  }

  const { count, window } = limits[type]
  const key = `${type}:${ip}`
  const now = Date.now()

  let entry = memoryCache.get(key)
  if (!entry || now > entry.reset) {
    entry = { count: 0, reset: now + window }
  }

  entry.count++
  memoryCache.set(key, entry)

  return {
    success: entry.count <= count,
    remaining: Math.max(0, count - entry.count),
    reset: entry.reset
  }
}

export async function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
  const url = request.nextUrl.clone()

  // 1. IP Ban Check
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

  // 2. Rate Limiting Logic
  if (request.nextUrl.pathname.startsWith('/api')) {
    let limitResult = { success: true, reset: Date.now() + 60000 }
    const path = request.nextUrl.pathname
    const isAction = request.headers.get('Next-Action')

    if (path.startsWith('/api/auth/login') || path.startsWith('/api/auth/register')) {
      if (authRateLimit) {
        const { success, reset } = await authRateLimit.limit(ip)
        limitResult = { success, reset }
      } else {
        limitResult = await checkRateLimit(ip, 'auth')
      }
    } else if (path.startsWith('/api/deployments/zip')) {
      if (uploadRateLimit) {
        const { success, reset } = await uploadRateLimit.limit(ip)
        limitResult = { success, reset }
      } else {
        limitResult = await checkRateLimit(ip, 'upload')
      }
    } else if (isAction) {
        if (aiRateLimit) {
            const { success, reset } = await aiRateLimit.limit(ip)
            limitResult = { success, reset }
        } else {
            limitResult = await checkRateLimit(ip, 'ai')
        }
    } else {
      if (generalRateLimit) {
        const { success, reset } = await generalRateLimit.limit(ip)
        limitResult = { success, reset }
      } else {
        limitResult = await checkRateLimit(ip, 'gen')
      }
    }

    if (!limitResult.success) {
      const retryAfter = Math.ceil((limitResult.reset - Date.now()) / 1000)
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: { 'Retry-After': retryAfter.toString() }
      })
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

  // 4. Security Headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.delete('X-Powered-By')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')

  // Explicit CORS Whitelist
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []
  const origin = request.headers.get('origin')
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }

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
