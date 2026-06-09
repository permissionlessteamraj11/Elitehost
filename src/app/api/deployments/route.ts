import { NextResponse } from 'next/server';
import { db } from '@/lib/db/json-db';
import { getUser } from '@/lib/auth-service';

export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const deployments = await db.deployments.find((d: any) => d.user_id === user.id);
    return NextResponse.json({ success: true, deployments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await request.json();

    let expiresAt;
    let isFree = false;

    if (user.credit_balance >= 1) {
      // Paid deployment: 1 credit = 1 deployment for 1 month
      expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      await db.users.update((u: any) => u.id === user.id, {
        credit_balance: user.credit_balance - 1
      });
    } else {
      // Free trial deployment: 3 hours
      const existingFree = await db.deployments.find((d: any) => d.user_id === user.id && d.is_free === true);
      if (existingFree.length > 0) {
        return NextResponse.json({ error: "Free trial already used. Please buy credits." }, { status: 400 });
      }
      expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();
      isFree = true;
    }

    const deployment = await db.deployments.insert({
      user_id: user.id,
      name: payload.name || "Unnamed Project",
      status: 'ready',
      framework: payload.framework || 'Universal',
      config: payload.config || {},
      env_vars: payload.env_vars || [],
      expires_at: expiresAt,
      is_free: isFree,
    });

    return NextResponse.json({ success: true, deploymentId: deployment.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
