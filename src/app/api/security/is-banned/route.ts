import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

  const isBanned = await prisma.bannedIP.findUnique({ where: { ip } });

  if (isBanned) {
    return NextResponse.json({ banned: true });
  }

  return NextResponse.json({ banned: false });
}
