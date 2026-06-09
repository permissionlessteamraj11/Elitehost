import { db } from "@/lib/db/json-db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  const { data: deployment } = (await db.deployments.from().eq('id', id)).single();

  if (!deployment) {
    return NextResponse.json({ error: "Deployment not found" }, { status: 404 });
  }

  return NextResponse.json({ logs: deployment.logs || "", status: deployment.status });
}
