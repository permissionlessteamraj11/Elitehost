"use server";

import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth-service";

export async function sendMessage(content: string) {
  const user = await getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  await prisma.message.create({
    data: {
      user_id: user.id,
      content,
      is_from_admin: false,
    }
  });

  return { success: true };
}

export async function getMessages() {
  const user = await getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const messages = await prisma.message.findMany({
    where: { user_id: user.id },
    orderBy: { created_at: 'asc' }
  });
  return { success: true, messages };
}

export async function getAdminChats() {
  const admin = await getUser();
  if (!admin || admin.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  const usersWithMessages = await prisma.user.findMany({
    where: { messages: { some: {} } },
    include: {
        messages: {
            orderBy: { created_at: 'desc' },
            take: 1
        }
    }
  });

  const chats = usersWithMessages.map(user => {
      const lastMessage = user.messages[0];
      return {
          userId: user.id,
          username: user.username,
          lastMessage: lastMessage?.content || "",
          timestamp: lastMessage?.created_at || user.created_at,
          unread: 0 // Unread logic can be added with a 'is_read' field in Message model
      };
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return { success: true, chats };
}

export async function getConversationForAdmin(userId: string) {
  const admin = await getUser();
  if (!admin || admin.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  const messages = await prisma.message.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'asc' }
  });
  return { success: true, messages };
}

export async function adminReply(userId: string, content: string) {
  const admin = await getUser();
  if (!admin || admin.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  await prisma.message.create({
    data: {
      user_id: userId,
      content,
      is_from_admin: true,
    }
  });

  return { success: true };
}
