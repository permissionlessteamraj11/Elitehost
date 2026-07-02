import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth-service";
import { NextResponse } from "next/server";
import { deploymentSchema } from "@/lib/validation";

export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const deployments = await prisma.deployment.findMany({
        where: { user_id: user.id },
        orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({ success: true, deployments });
  } catch (error: any) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const result = deploymentSchema.safeParse(body);
    if (!result.success) {
        return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 });
    }
    const payload = result.data;

    // Credit Enforcement
    if (user.credits < 1 && user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Insufficient credits. Please claim trial or buy credits.", code: 'INSUFFICIENT_CREDITS' }, { status: 402 });
    }

    // Deduct Credit
    if (user.role !== 'ADMIN') {
        await prisma.user.update({
            where: { id: user.id },
            data: { credits: { decrement: 1 } }
        });
    }

    // Source Configuration
    const sourceConfig: any = {
        type: payload.method || "github",
        repoUrl: payload.repoUrl || "",
        branch: payload.branch || "main",
        rawCode: payload.rawCode || "",
    };

    const initialConfig = {
      name: payload.name || "My Awesome App",
      projectType: payload.framework?.toLowerCase() || "nodejs",
      runtime: { language: "nodejs", version: "22" },
      source: sourceConfig,
      build: {
        command: payload.build_command || null,
      },
      start: {
        command: payload.deploy_command || null,
        port: 3000
      },
      env: {
        public: (payload.env_vars || []).reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {}),
      }
    };

    const plan = await prisma.plan.findFirst();
    if (!plan) return NextResponse.json({ error: "No plans available" }, { status: 500 });

    const deployment = await prisma.deployment.create({
      data: {
        user_id: user.id,
        name: initialConfig.name,
        subdomain: `${payload.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Math.random().toString(36).substring(2, 6)}`,
        status: 'PENDING',
        config: JSON.stringify(initialConfig),
        plan_id: plan.id,
      }
    });

    try {
        const { buildQueue } = await import("@/services/queues/config");
        await buildQueue.add('build', { deploymentId: deployment.id, userId: user.id });
    } catch (queueError) {
        console.error("Failed to add to build queue:", queueError);
    }

    return NextResponse.json({ success: true, deploymentId: deployment.id });
  } catch (error: any) {
    console.error('Deployment error:', error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
