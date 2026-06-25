/**
 * Pagination metadata included on paginated list responses.
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * Standard successful API response envelope.
 */
export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  pagination?: PaginationMeta;
}

/**
 * A single field-level validation error.
 */
export interface ApiFieldError {
  field: string;
  message: string;
}

/**
 * Standard error API response envelope.
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: ApiFieldError[];
}
