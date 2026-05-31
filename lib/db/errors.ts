export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code = "api_error",
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function databaseUnavailableError() {
  return new ApiError(
    503,
    "Phase 5 database integration requires DATABASE_URL. Configure PostgreSQL before using this endpoint in production.",
    "database_not_configured",
  );
}
