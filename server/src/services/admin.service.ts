import { User, IUserDocument } from '../models/User.model';
import { DocumentModel } from '../models/Document.model';
import { Message } from '../models/Message.model';
import { SafeUser } from '../types/user.types';
import { PaginationMeta } from '../types/api.types';
import { ApiError } from '../utils/ApiError';
import { validateObjectId } from '../utils/sanitize';

/**
 * Admin service.
 *
 * Owns administrative reads and mutations: paginated user listing, blocking /
 * unblocking users, and platform-wide statistics. All user representations are
 * mapped to `SafeUser` so secrets (password, refreshToken) never leave the
 * service, and the listing query additionally `.select`s them out at the DB
 * layer as defense in depth.
 */

/** Shape returned by the token-sum aggregation pipeline. */
interface TokenAggregateRow {
  _id: null;
  totalTokens: number;
}

/**
 * Maps a User document to its API-safe representation, omitting all secrets and
 * normalizing `_id` → `id`.
 */
const toSafeUser = (user: IUserDocument): SafeUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  isBlocked: user.isBlocked,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

/**
 * Narrows an aggregation result to the expected token-sum row shape.
 */
const isTokenAggregateRow = (value: unknown): value is TokenAggregateRow => {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const candidate = value as { totalTokens?: unknown };
  return typeof candidate.totalTokens === 'number';
};

/**
 * Returns a page of users (newest first) with pagination metadata. Secrets are
 * excluded at the query layer via `.select`.
 */
export const listUsers = async (
  page: number,
  pageSize: number,
): Promise<{ users: SafeUser[]; pagination: PaginationMeta }> => {
  const skip = (page - 1) * pageSize;

  const [docs, total] = await Promise.all([
    User.find()
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .exec(),
    User.countDocuments().exec(),
  ]);

  const pagination: PaginationMeta = {
    page,
    pageSize,
    total,
    totalPages: pageSize > 0 ? Math.ceil(total / pageSize) : 0,
  };

  return { users: docs.map(toSafeUser), pagination };
};

/**
 * Sets a user's blocked flag and returns the updated safe representation.
 *
 * @throws ApiError.badRequest if `userId` is not a valid ObjectId.
 * @throws ApiError.notFound if no user exists with that id.
 */
const setBlocked = async (
  userId: string,
  isBlocked: boolean,
): Promise<SafeUser> => {
  if (!validateObjectId(userId)) {
    throw ApiError.badRequest('Invalid user id');
  }

  const user = await User.findById(userId);
  if (user === null) {
    throw ApiError.notFound('User not found');
  }

  user.isBlocked = isBlocked;
  await user.save();

  return toSafeUser(user);
};

/**
 * Blocks a user, preventing further authenticated access.
 */
export const blockUser = async (userId: string): Promise<SafeUser> => {
  return setBlocked(userId, true);
};

/**
 * Unblocks a previously blocked user.
 */
export const unblockUser = async (userId: string): Promise<SafeUser> => {
  return setBlocked(userId, false);
};

/**
 * Returns platform-wide counts and total tokens consumed across all messages.
 * Token totals are computed via aggregation, summing input + output tokens and
 * defaulting missing `tokenUsage` fields to zero.
 */
export const getStats = async (): Promise<{
  totalUsers: number;
  totalDocuments: number;
  totalMessages: number;
  totalTokensUsed: number;
}> => {
  const [totalUsers, totalDocuments, totalMessages, tokenRows] =
    await Promise.all([
      User.countDocuments().exec(),
      DocumentModel.countDocuments().exec(),
      Message.countDocuments().exec(),
      Message.aggregate<TokenAggregateRow>([
        {
          $group: {
            _id: null,
            totalTokens: {
              $sum: {
                $add: [
                  { $ifNull: ['$tokenUsage.inputTokens', 0] },
                  { $ifNull: ['$tokenUsage.outputTokens', 0] },
                ],
              },
            },
          },
        },
      ]).exec(),
    ]);

  const firstRow: unknown = tokenRows[0];
  const totalTokensUsed = isTokenAggregateRow(firstRow)
    ? firstRow.totalTokens
    : 0;

  return { totalUsers, totalDocuments, totalMessages, totalTokensUsed };
};
