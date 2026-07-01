import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth-service";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await req.json();

    const request = await prisma.payment.create({
      data: {
        user_id: user.id,
        amount: payload.amount,
        transaction_id: payload.transactionId,
        credits: payload.credits || Math.floor(payload.amount / 20),
        customer_name: payload.customerName || user.username,
        customer_contact: payload.customerContact || user.email,
        status: 'PENDING',
      }
    });

    return NextResponse.json({ success: true, requestId: request.id });
  } catch (error: any) {
      console.error('Payment request error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
