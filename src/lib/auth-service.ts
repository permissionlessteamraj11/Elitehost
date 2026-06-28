import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret');

export async function createSession(userId: string, role: string) {
  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET);

  (await cookies()).set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  return token;
}

export async function createToken(payload: any) {
    return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET);
}

export async function verifyAuth() {
  const token = (await cookies()).get('auth-token')?.value;
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
        metadata: metadata || {},
      }
    });
  } catch (error) {
    console.error('Audit logging failed:', error);
  }
}
