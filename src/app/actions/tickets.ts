"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTicket(userId: string, subject: string, description: string) {
  try {
    const ticket = await prisma.ticket.create({
      data: {
        user_id: userId,
        subject,
        description,
        status: 'OPEN'
      }
    });
    revalidatePath('/dashboard/support');
    return { success: true, ticket };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addTicketMessage(ticketId: string, content: string, isAdmin: boolean = false) {
  try {
    const message = await prisma.ticketMessage.create({
      data: {
        ticket_id: ticketId,
        content,
        is_admin: isAdmin
      }
    });

    await prisma.ticket.update({
      where: { id: ticketId },
      data: { updated_at: new Date() }
    });

    revalidatePath(`/dashboard/support/${ticketId}`);
    return { success: true, message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTicketStatus(ticketId: string, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED') {
    try {
        await prisma.ticket.update({
            where: { id: ticketId },
            data: { status }
        });
        revalidatePath('/admin/tickets');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
