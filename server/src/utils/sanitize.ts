import { Types } from 'mongoose';
import { ApiError } from './ApiError';

const MAX_CHAT_MESSAGE_LENGTH = 4000;

/**
 * Recursively removes keys that begin with `$` or contain `.` to prevent
 * NoSQL/MongoDB operator injection. Returns a sanitized copy; primitives and
 * arrays are handled, the input is not mutated.
 */
export const stripDollarKeys = <T>(input: T): T => {
  if (Array.isArray(input)) {
    return input.map((item) => stripDollarKeys(item)) as unknown as T;
  }

  if (input !== null && typeof input === 'object') {
    const source = input as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(source)) {
      if (key.startsWith('$') || key.includes('.')) {
        continue;
      }
      result[key] = stripDollarKeys(source[key]);
    }
    return result as unknown as T;
  }

  return input;
};

export const validateObjectId = (id: string): boolean => {
  return Types.ObjectId.isValid(id);
};

/**
 * Strips HTML tags, trims whitespace, and hard-caps length. Throws when the
 * resulting message is empty.
 */
export const sanitizeChatMessage = (text: string): string => {
  const withoutHtml = text.replace(/<[^>]*>/g, '');
  const trimmed = withoutHtml.trim();

  if (trimmed.length === 0) {
    throw ApiError.badRequest('Message cannot be empty');
  }

  return trimmed.slice(0, MAX_CHAT_MESSAGE_LENGTH);
};
