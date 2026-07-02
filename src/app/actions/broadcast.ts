"use server";

import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth-service";

export async function sendBroadcast(title: string, content: string) {
  const admin = await getUser();
  if (!admin || admin.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  await prisma.broadcast.create({
    data: {
      title,
      content,
    }
  });

  return { success: true };
}

export async function getBroadcasts() {
  const broadcasts = await prisma.broadcast.findMany({
    orderBy: { created_at: 'desc' }
  });
  return { success: true, broadcasts };
}
