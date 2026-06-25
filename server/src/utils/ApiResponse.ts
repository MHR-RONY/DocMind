import { Response } from 'express';
import {
  ApiSuccessResponse,
  PaginationMeta,
} from '../types/api.types';

/**
 * Helpers for emitting the standard success envelope. All non-error responses
 * should route through here so the response shape stays consistent.
 */
export class ApiResponse {
  static success<T>(
    res: Response,
    statusCode: number,
    message: string,
    data: T,
    pagination?: PaginationMeta
  ): Response {
    const body: ApiSuccessResponse<T> = {
      success: true,
      message,
      data,
      ...(pagination ? { pagination } : {}),
    };
    return res.status(statusCode).json(body);
  }

  static paginated<T>(
    res: Response,
    message: string,
    data: T[],
    pagination: PaginationMeta
  ): Response {
    const body: ApiSuccessResponse<T[]> = {
      success: true,
      message,
      data,
      pagination,
    };
    return res.status(200).json(body);
  }
}
