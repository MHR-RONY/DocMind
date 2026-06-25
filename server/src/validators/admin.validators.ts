import { z } from 'zod';

/**
 * Body schema for PATCH /api/admin/users/:id/block.
 * `isBlocked: true` blocks the user, `false` unblocks.
 */
export const blockUserSchema = z
  .object({
    isBlocked: z.boolean(),
  })
  .strict();

export type BlockUserInput = z.infer<typeof blockUserSchema>;
