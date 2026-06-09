"use server";

import { db } from "@/lib/db/json-db";
import { getUser } from "@/lib/auth-service";

export async function sendMessage(content: string) {
  const user = await getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  await db.messages.insert({
    user_id: user.id,
    content,
    sender: "user",
    timestamp: new Date().toISOString(),
  });

  return { success: true };
}

export async function getMessages() {
  const user = await getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const messages = await db.messages.find((m: any) => m.user_id === user.id);
  return { success: true, messages: messages.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) };
}

export async function getAdminChats() {
  const admin = await getUser();
  if (!admin || admin.role !== "admin") return { success: false, error: "Unauthorized" };

  const allMessages = await db.messages.read();
  const userIds = Array.from(new Set(allMessages.map((m: any) => m.user_id)));

  const users = await db.users.read();
  const chats = userIds.map(userId => {
    const userMessages = allMessages.filter((m: any) => m.user_id === userId);
    const lastMessage = userMessages[userMessages.length - 1];
    const user = users.find((u: any) => u.id === userId);
    return {
      userId,
      username: user?.username || "Unknown User",
      lastMessage: lastMessage.content,
      timestamp: lastMessage.timestamp,
      unread: userMessages.filter((m: any) => m.sender === "user" && !m.read).length
    };
  }).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return { success: true, chats };
}

export async function getConversationForAdmin(userId: string) {
  const admin = await getUser();
  if (!admin || admin.role !== "admin") return { success: false, error: "Unauthorized" };

  // Mark messages as read
  await db.messages.update((m: any) => m.user_id === userId && m.sender === "user", { read: true });

  const messages = await db.messages.find((m: any) => m.user_id === userId);
  return { success: true, messages: messages.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) };
}

export async function adminReply(userId: string, content: string) {
  const admin = await getUser();
  if (!admin || admin.role !== "admin") return { success: false, error: "Unauthorized" };

  await db.messages.insert({
    user_id: userId,
    content,
    sender: "admin",
    timestamp: new Date().toISOString(),
  });

  return { success: true };
}
