export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface Meta {
  requestId?: string;
  version?: string;
  executionTime?: number;
  [key: string]: unknown;
}
