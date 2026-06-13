"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db/json-db";
import { blockIP } from "./platform";

export async function validateAdminPassword(password: string) {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for") || "127.0.0.1";

  // Check if IP is already banned
  const isBanned = await db.banned_ips.findOne((b: any) => b.ip === ip);
  if (isBanned) {
    return { success: false, error: "Your device has been banned due to multiple failed attempts." };
  }

  // In a real production environment, this would check against process.env.ADMIN_PASSWORD
  const masterPassword = process.env.ADMIN_PASSWORD || "28@RajPapa";

  if (password === masterPassword) {
    // Reset attempts on successful login
    await db.admin_attempts.delete((a: any) => a.ip === ip);
    return { success: true };
  }

  // Track failed attempts
  const attempt = await db.admin_attempts.findOne((a: any) => a.ip === ip);
  const count = (attempt?.count || 0) + 1;

  if (count >= 3) {
    await blockIP(ip);
    await db.admin_attempts.delete((a: any) => a.ip === ip);
    return { success: false, error: "Too many failed attempts. Your device has been banned." };
  }

  if (attempt) {
    await db.admin_attempts.update((a: any) => a.ip === ip, { count, last_attempt: new Date().toISOString() });
  } else {
    await db.admin_attempts.insert({ ip, count, last_attempt: new Date().toISOString() });
  }

  return { success: false, error: `Invalid master password. ${3 - count} attempts remaining.` };
}
