import { db } from "@/lib/db/json-db";
import { getUser } from "@/lib/auth-service";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await req.json();

    const request = await (db as any).payment_requests.insert({
      user_id: user.id,
      planId: payload.planId,
      amount: payload.amount,
      transactionId: payload.transactionId,
      credits: payload.credits,
      status: 'pending',
    });

    return NextResponse.json({ success: true, requestId: request.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
