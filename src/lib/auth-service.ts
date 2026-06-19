import { db } from './db/json-db';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';
const isProd = process.env.NODE_ENV === 'production';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  if (isProd && !isBuildPhase) {
    throw new Error("JWT_SECRET environment variable is required and must be at least 32 characters in production.");
  }
  if (!isBuildPhase) {
    console.warn("WARNING: JWT_SECRET is missing or too short. Using a temporary insecure secret.");
  }
}

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-only-insecure-secret-placeholder-32chars-minimum');

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hashed: string) {
  return await bcrypt.compare(password, hashed);
}

export async function createToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('60m')
    .sign(SECRET_KEY);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload;
  } catch (err) {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function getUser() {
  const session: any = await getSession();
  if (!session) return null;
  const user = await db.users.findOne((u: any) => u.id === session.userId);
  if (user?.is_banned) return null;
  return user;
}
