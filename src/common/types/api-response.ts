import type { Meta, PaginationMeta } from "@common/types/pagination";

export interface ApiResponseOptions<T> {
  statusCode: number;
  message?: string;
  data?: T;
  pagination?: PaginationMeta;
  meta?: Meta;
}
