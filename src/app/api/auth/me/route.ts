import { getUser } from "@/lib/auth-service";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const { password: _, password_plain: __, ...userWithoutPassword } = user;
  return NextResponse.json({ user: userWithoutPassword });
}
