import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/ApiError';
import { streamChatResponse } from '../services/stream.service';

/**
 * Chat message HTTP layer — Server-Sent Events ONLY.
 *
 * This handler must NEVER use `ApiResponse`/`res.json()`; `streamChatResponse`
 * owns the entire SSE lifecycle (headers, deltas, done/error frames, client
 * disconnect handling). Ownership is verified inside the service BEFORE any
 * header is written, so a thrown ApiError here means failure occurred PRE-
 * stream and can safely propagate to the global error handler as JSON. Once the
 * stream is open the service reports failures via SSE `error` events itself and
 * does not throw.
 */
export const sendMessage = catchAsync(async (req, res) => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }
  await streamChatResponse({
    res,
    req,
    sessionId: req.params.id,
    userId: req.user.id,
    userMessage: req.body.content,
  });
});
