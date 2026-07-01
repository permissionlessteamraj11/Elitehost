import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
    throw new Error("JWT_SECRET environment variable is missing in production");
}
const SECRET = new TextEncoder().encode(JWT_SECRET || 'dev-secret-at-least-32-chars-long-12345');

export async function createSession(userId: string, role: string, rememberMe: boolean = false) {
  const expiresIn = rememberMe ? '30d' : '24h';
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;

  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(SECRET);

  const refreshToken = await new SignJWT({ userId, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(SECRET);

  const expiresAt = new Date(Date.now() + maxAge * 1000);

  // Store session in DB
  await prisma.session.create({
    data: {
      user_id: userId,
      token: token,
      refresh_token: refreshToken,
      expires_at: expiresAt,
    }
  });

  const cookieStore = await cookies();
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: maxAge,
  });

  cookieStore.set('refresh-token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  });

  return { token, refreshToken };
}

export async function createToken(payload: any) {
    return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET);
}

export async function verifyAuth() {
  const cookieStore = await cookies();
  let token = cookieStore.get('auth-token')?.value;

  if (!token) {
    // Try refresh token
    const refreshToken = cookieStore.get('refresh-token')?.value;
    if (refreshToken) {
      try {
        const { payload } = await jwtVerify(refreshToken, SECRET);
        const userId = (payload as any).userId;
        const session = await prisma.session.findUnique({
          where: { refresh_token: refreshToken },
          include: { user: true }
        });

        if (session && session.expires_at > new Date()) {
          const { token: newToken } = await createSession(userId, session.user.role);
          token = newToken;
        }
      } catch (err) {
        return null;
      }
    }
  }

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as { userId: string; role: string };
  } catch (err) {
    return null;
  }
}

export async function getUser() {
    const session = await verifyAuth();
    if (!session) return null;
    return await prisma.user.findUnique({ where: { id: session.userId } });
}

export async function isAdmin() {
  const session = await verifyAuth();
  return session?.role === 'ADMIN';
}

export async function hashPassword(password: string) {
    return await bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
}

export async function logAudit(userId: string, action: string, metadata?: any) {
  try {
    await prisma.auditLog.create({
      data: {
        user_id: userId,
        action,
        metadata: metadata ? JSON.stringify(metadata) : null,
      }
    });
  } catch (error) {
    console.error('Audit logging failed:', error);
  }
}

export async function logout() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }
  cookieStore.delete('auth-token');
  cookieStore.delete('refresh-token');
}
