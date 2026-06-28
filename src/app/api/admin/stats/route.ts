import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth-service';

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  try {
    const userCount = await prisma.user.count();
    const deploymentCount = await prisma.deployment.count({ where: { status: 'READY' } });
    const totalCredits = await prisma.user.aggregate({ _sum: { credits: true } });

    return NextResponse.json({
        userCount,
        deploymentCount,
        totalCredits: totalCredits._sum.credits || 0
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
