/** A single field-level validation error returned by the API. */
export interface ApiFieldError {
  field: string;
  message: string;
}

/** Roles a user account can hold. */
export type UserRole = "user" | "admin";

/** API-safe user profile. Never contains password or refresh token. */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * API-safe user record returned by the admin endpoints. Fields match
 * {@link AuthUser} exactly, so this is an alias kept for naming clarity at
 * call sites that deal with the admin user list.
 */
export type SafeUser = AuthUser;

/** Document file types accepted and tracked by the RAG pipeline. */
export type DocumentFileType = "pdf" | "docx" | "txt";

/** Processing lifecycle state of an uploaded document. */
export type DocumentStatus = "processing" | "ready" | "failed";

/** API-safe document record. Never contains raw vector ids or storage paths. */
export interface SafeDocument {
  id: string;
  originalName: string;
  fileType: DocumentFileType;
  fileSize: number;
  uploadedBy: string;
  chunkCount: number;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
}
