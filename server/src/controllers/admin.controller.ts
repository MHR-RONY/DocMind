import { catchAsync } from '../utils/catchAsync';
import { ApiResponse } from '../utils/ApiResponse';
import * as adminService from '../services/admin.service';
import { ListDocumentsQuery } from '../validators/document.validators';

/**
 * Admin HTTP layer. All routes are gated by `authenticate` + `requireRole`
 * (ADMIN) at the router level, so these handlers assume an authorized caller
 * and simply delegate to the admin service.
 */

export const listUsers = catchAsync(async (_req, res) => {
  const { page, pageSize } = res.locals.query as ListDocumentsQuery;
  const { users, pagination } = await adminService.listUsers(page, pageSize);
  ApiResponse.paginated(res, 'Users retrieved', users, pagination);
});

export const setBlock = catchAsync(async (req, res) => {
  const { isBlocked } = req.body;
  const user = isBlocked
    ? await adminService.blockUser(req.params.id)
    : await adminService.unblockUser(req.params.id);
  ApiResponse.success(res, 200, isBlocked ? 'User blocked' : 'User unblocked', {
    user,
  });
});

export const getStats = catchAsync(async (_req, res) => {
  const stats = await adminService.getStats();
  ApiResponse.success(res, 200, 'Stats retrieved', stats);
});
