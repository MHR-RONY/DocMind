import { apiRequest } from "@/lib/api";

/**
 * A chat session as returned by the backend. The id field is `_id` (the raw
 * Mongoose document key); `userId` and `__v` are intentionally omitted.
 */
export interface ChatSession {
  _id: string;
  title: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SessionsResponse {
  sessions: ChatSession[];
}

interface SessionResponse {
  session: ChatSession;
}

/**
 * Fetches all chat sessions for the authenticated user.
 *
 * @throws ApiRequestError on a failed request or non-success envelope.
 */
export async function fetchSessions(): Promise<ChatSession[]> {
  const { sessions } = await apiRequest<SessionsResponse>("/api/chat/sessions");
  return sessions;
}

/**
 * Creates a new chat session, optionally with a title, and returns it.
 *
 * @throws ApiRequestError on a failed request or non-success envelope.
 */
export async function createSession(title?: string): Promise<ChatSession> {
  const { session } = await apiRequest<SessionResponse>("/api/chat/sessions", {
    method: "POST",
    body: JSON.stringify(title === undefined ? {} : { title }),
  });
  return session;
}

/**
 * Deletes a chat session by id.
 *
 * @throws ApiRequestError on a failed request or non-success envelope.
 */
export async function deleteSession(id: string): Promise<void> {
  await apiRequest<Record<string, never>>(`/api/chat/sessions/${id}`, {
    method: "DELETE",
  });
}
