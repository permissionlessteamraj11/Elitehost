import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: { price: 'asc' },
    });
    return NextResponse.json(plans);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const plan = await prisma.plan.create({
      data: {
        name: body.name,
        price: body.price,
        ram_mb: body.ram_mb,
        cpu_percent: body.cpu_percent,
        storage_gb: body.storage_gb,
        is_active: body.is_active ?? true,
      },
    });
    return NextResponse.json(plan);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
