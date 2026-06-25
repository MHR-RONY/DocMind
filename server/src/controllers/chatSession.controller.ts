import { catchAsync } from '../utils/catchAsync';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import * as chatSessionService from '../services/chatSession.service';

/**
 * Chat-session HTTP layer. Each action delegates to a single session-service
 * call; ownership and id validation live entirely in the service.
 */

export const createSession = catchAsync(async (req, res) => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }
  const { title } = req.body;
  const session = await chatSessionService.createSession(req.user.id, title);
  ApiResponse.success(res, 201, 'Session created', { session });
});

export const listSessions = catchAsync(async (req, res) => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }
  const sessions = await chatSessionService.listSessions(req.user.id);
  ApiResponse.success(res, 200, 'Sessions retrieved', { sessions });
});

export const getSession = catchAsync(async (req, res) => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }
  const { session, messages } = await chatSessionService.getSession(
    req.params.id,
    req.user.id,
  );
  ApiResponse.success(res, 200, 'Session retrieved', { session, messages });
});

export const deleteSession = catchAsync(async (req, res) => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }
  await chatSessionService.deleteSession(req.params.id, req.user.id);
  ApiResponse.success(res, 200, 'Session deleted', {});
});
