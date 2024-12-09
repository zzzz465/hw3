export interface CommonResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  code?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> extends CommonResponse<T[]> {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
}
