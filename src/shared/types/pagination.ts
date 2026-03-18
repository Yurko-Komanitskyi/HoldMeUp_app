export interface PaginatedListResponse<T> {
  data: T[];
  hasNextPage: boolean;
}

export interface BaseListParams {
  page?: number;
  limit?: number;
}
