import { NextResponse } from 'next/server';
import { db } from '@/lib/db/json-db';

export async function GET(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

  const isBanned = await db.banned_ips.findOne((b: any) => b.ip === ip);

  if (isBanned) {
    return NextResponse.json({ banned: true });
  }

  return NextResponse.json({ banned: false });
}
