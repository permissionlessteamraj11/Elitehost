import { db } from "@/lib/db/json-db";
import { getUser, comparePassword, hashPassword } from "@/lib/auth-service";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { currentPwd, newPwd } = await req.json();

    const isValid = await comparePassword(currentPwd, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
    }

    const hashed = await hashPassword(newPwd);
    await db.users.update((u: any) => u.id === user.id, {
      password: hashed,
      password_plain: newPwd
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
