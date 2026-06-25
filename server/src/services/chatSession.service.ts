import { ChatSession, IChatSessionDocument } from '../models/ChatSession.model';
import { Message, IMessageDocument } from '../models/Message.model';
import { ApiError } from '../utils/ApiError';
import { validateObjectId } from '../utils/sanitize';

/**
 * ChatSession service.
 *
 * Owns all session lifecycle logic: creation, ownership-checked retrieval,
 * listing, and deletion (cascading to the session's messages). Every read or
 * mutation that targets a specific session validates the id shape (400) and
 * enforces that the caller owns the session (404 if missing, 403 if owned by
 * someone else) so that controllers never have to reason about authorization.
 */

/**
 * Loads a session by id, enforcing id validity and caller ownership.
 *
 * @throws ApiError.badRequest if `sessionId` is not a valid ObjectId.
 * @throws ApiError.notFound if no session exists with that id.
 * @throws ApiError.forbidden if the session is owned by a different user.
 */
const findOwnedSession = async (
  sessionId: string,
  userId: string,
): Promise<IChatSessionDocument> => {
  if (!validateObjectId(sessionId)) {
    throw ApiError.badRequest('Invalid session id');
  }

  const session = await ChatSession.findById(sessionId);
  if (session === null) {
    throw ApiError.notFound('Chat session not found');
  }

  if (session.userId.toString() !== userId) {
    throw ApiError.forbidden('You do not have access to this chat session');
  }

  return session;
};

/**
 * Creates a new chat session for a user. When no title is supplied the model's
 * default title applies.
 */
export const createSession = async (
  userId: string,
  title?: string,
): Promise<IChatSessionDocument> => {
  const session = new ChatSession(
    title === undefined ? { userId } : { userId, title },
  );
  return session.save();
};

/**
 * Lists a user's sessions, most recently updated first.
 */
export const listSessions = async (
  userId: string,
): Promise<IChatSessionDocument[]> => {
  return ChatSession.find({ userId }).sort({ updatedAt: -1 }).exec();
};

/**
 * Retrieves a single owned session together with its full message history
 * (oldest → newest).
 */
export const getSession = async (
  sessionId: string,
  userId: string,
): Promise<{ session: IChatSessionDocument; messages: IMessageDocument[] }> => {
  const session = await findOwnedSession(sessionId, userId);
  const messages = await Message.find({ sessionId: session.id })
    .sort({ createdAt: 1 })
    .exec();

  return { session, messages };
};

/**
 * Deletes an owned session and all of its messages.
 */
export const deleteSession = async (
  sessionId: string,
  userId: string,
): Promise<void> => {
  const session = await findOwnedSession(sessionId, userId);
  await Message.deleteMany({ sessionId: session.id });
  await session.deleteOne();
};
