import { fetchApi } from "./index";
import type { Message, Conversation, MessageAttachment } from "../types";

export async function getConversations(): Promise<{ conversations: Conversation[] }> {
  return fetchApi("/messages/conversations");
}

export interface ThreadResponse {
  messages: Message[];
  user: { id: string; name: string; role: string; businessName: string | null; image: string | null };
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export async function getThread(userId: string, page = 1, limit = 50): Promise<ThreadResponse> {
  return fetchApi(`/messages/${userId}?page=${page}&limit=${limit}`);
}

export async function sendMessage(
  userId: string,
  content: string,
  attachments?: MessageAttachment[]
): Promise<{ message: Message }> {
  return fetchApi(`/messages/${userId}`, {
    method: "POST",
    body: JSON.stringify({ content, attachments }),
  });
}

export async function markRead(userId: string): Promise<void> {
  await fetchApi(`/messages/${userId}/read`, { method: "PATCH" });
}

export async function getUnreadCount(): Promise<{ unread: number }> {
  return fetchApi("/messages/unread-count");
}
