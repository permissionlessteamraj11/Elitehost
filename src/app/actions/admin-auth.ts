"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { blockIP } from "./platform";

export async function validateAdminPassword(password: string) {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for") || "127.0.0.1";

  const isBanned = await prisma.bannedIP.findUnique({ where: { ip } });
  if (isBanned) {
    return { success: false, error: "Your device has been banned." };
  }

  const masterPassword = process.env.ADMIN_PASSWORD || "28@RajPapa";

  if (password === masterPassword) {
    await prisma.adminAttempt.deleteMany({ where: { ip } });
    return { success: true };
  }

  const attempts = await prisma.adminAttempt.findMany({
      where: { ip, created_at: { gte: new Date(Date.now() - 15 * 60 * 1000) } }
  });
  const count = attempts.length + 1;

  await prisma.adminAttempt.create({ data: { ip, success: false } });

  if (count >= 3) {
    await blockIP(ip, "Too many admin login attempts");
    return { success: false, error: "Too many failed attempts. Your device has been banned." };
  }

  return { success: false, error: `Invalid master password. ${3 - count} attempts remaining.` };
}
