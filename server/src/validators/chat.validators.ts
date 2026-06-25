import { z } from 'zod';

/**
 * Body schema for POST /api/chat/sessions.
 */
export const createSessionSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
  })
  .strict();

/**
 * Body schema for POST /api/chat/sessions/:id/messages.
 * Strips HTML tags and trims whitespace, then enforces a non-empty,
 * length-capped message to mitigate stored-XSS and oversized payloads.
 */
export const sendMessageSchema = z
  .object({
    content: z
      .string()
      .min(1)
      .max(4000)
      .transform((value) => value.replace(/<[^>]*>/g, '').trim())
      .refine((value) => value.length > 0, {
        message: 'Message cannot be empty',
      }),
  })
  .strict();

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
