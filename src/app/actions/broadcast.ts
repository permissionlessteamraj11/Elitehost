"use server";

import { db } from "@/lib/db/json-db";
import { getUser } from "@/lib/auth-service";

export async function sendBroadcast(title: string, message: string) {
  const admin = await getUser();
  if (!admin || admin.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  await db.broadcasts.insert({
    title,
    message,
    timestamp: new Date().toISOString(),
  });

  return { success: true };
}

export async function getBroadcasts() {
  const broadcasts = await db.broadcasts.read();
  return { success: true, broadcasts: broadcasts.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) };
}
