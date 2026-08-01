import type { ApiResponseOptions } from "@common/types/api-response";

export class ApiResponse<T = unknown> {
  public readonly success: boolean;
  public readonly timestamp: string;

  public readonly statusCode: number;
  public readonly message: string;
  public readonly data?: T;
  public readonly pagination?: ApiResponseOptions<T>["pagination"];
  public readonly meta?: ApiResponseOptions<T>["meta"];

  private constructor(options: ApiResponseOptions<T>) {
    this.statusCode = options.statusCode;
    this.message = options.message ?? "Success";

    if (options.data !== undefined) {
      this.data = options.data;
    }

    if (options.pagination) {
      this.pagination = options.pagination;
    }

    if (options.meta) {
      this.meta = options.meta;
    }

    this.success = options.statusCode < 400;
    this.timestamp = new Date().toISOString();
  }

  static success<T>(options: ApiResponseOptions<T>): ApiResponse<T> {
    return new ApiResponse(options);
  }
}
