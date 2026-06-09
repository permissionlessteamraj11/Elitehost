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

    const freePlanEnabled = (await db.platform_settings.findOne((s: any) => s.key === 'free_plan_enabled'))?.value !== false;

    // Separate paid and free credits logic
    const paidCredits = Number(user.paid_credits || 0);
    const freeCredits = Number(user.credit_balance || 0);

    if (paidCredits >= 1) {
      // Prioritize paid credits
      expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      await db.users.update((u: any) => u.id === user.id, {
        paid_credits: paidCredits - 1
      });
    } else if (freePlanEnabled && freeCredits >= 1) {
      // Use free credits if enabled
      expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      await db.users.update((u: any) => u.id === user.id, {
        credit_balance: freeCredits - 1
      });
    } else {
      // Free trial deployment: 3 hours (only if free plan enabled)
      if (!freePlanEnabled) {
        return NextResponse.json({ error: "Free plan is disabled. Please buy credits to deploy." }, { status: 400 });
      }

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
      build_command: payload.build_command || null,
      deploy_command: payload.deploy_command || null,
      expires_at: expiresAt,
      is_free: isFree,
    });

    return NextResponse.json({ success: true, deploymentId: deployment.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
