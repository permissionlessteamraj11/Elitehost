import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const stats = await prisma.payment.groupBy({
      by: ['status'],
      where: {
          created_at: {
              gte: new Date(new Date().setDate(new Date().getDate() - 30))
          }
      },
      _sum: {
        amount: true,
      },
    });

    // Fix queryRaw usage in Next.js build
    const dailyRevenue = await prisma.$queryRaw`
      SELECT DATE_TRUNC('day', created_at) as date, SUM(amount) as revenue
      FROM "Payment"
      WHERE status = 'APPROVED'
      GROUP BY date
      ORDER BY date DESC
      LIMIT 30
    `;

    return NextResponse.json({ stats, dailyRevenue });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
