import { apiRequest } from "@/lib/api";
import type { SafeDocument, SafeUser } from "@/lib/types";

export type { SafeDocument, SafeUser } from "@/lib/types";

/** Aggregate counters shown on the admin dashboard. */
export interface AdminStats {
  totalUsers: number;
  totalDocuments: number;
  totalMessages: number;
  totalTokensUsed: number;
}

/** Envelope returned by the block/unblock endpoint. */
interface UserMutationResponse {
  user: SafeUser;
}

/** Envelope returned by the document upload endpoint. */
interface DocumentMutationResponse {
  document: SafeDocument;
}

/** Fetches the aggregate platform counters for the admin dashboard. */
export async function fetchAdminStats(): Promise<AdminStats> {
  return apiRequest<AdminStats>("/api/admin/stats");
}

/**
 * Fetches the full user list. The list endpoint is paginated server-side, so
 * we request a large page and treat the unwrapped `data` array as the result
 * (apiRequest drops the pagination envelope).
 */
export async function fetchUsers(): Promise<SafeUser[]> {
  return apiRequest<SafeUser[]>("/api/admin/users?pageSize=100&page=1");
}

/** Blocks or unblocks a user and returns the updated record. */
export async function setUserBlocked(
  id: string,
  isBlocked: boolean,
): Promise<SafeUser> {
  const { user } = await apiRequest<UserMutationResponse>(
    `/api/admin/users/${id}/block`,
    {
      method: "PATCH",
      body: JSON.stringify({ isBlocked }),
    },
  );
  return user;
}

/**
 * Fetches the full document list. Same pagination handling as
 * {@link fetchUsers}.
 */
export async function fetchDocuments(): Promise<SafeDocument[]> {
  return apiRequest<SafeDocument[]>("/api/documents?pageSize=100&page=1");
}

/**
 * Uploads a single file as multipart/form-data under the `file` field and
 * returns the created document record. The backend responds 202 while
 * indexing continues asynchronously.
 */
export async function uploadDocument(file: File): Promise<SafeDocument> {
  const formData = new FormData();
  formData.append("file", file);
  const { document } = await apiRequest<DocumentMutationResponse>(
    "/api/documents/upload",
    {
      method: "POST",
      body: formData,
    },
  );
  return document;
}

/** Deletes a document and its indexed chunks. */
export async function deleteDocument(id: string): Promise<void> {
  await apiRequest<Record<string, never>>(`/api/documents/${id}`, {
    method: "DELETE",
  });
}
