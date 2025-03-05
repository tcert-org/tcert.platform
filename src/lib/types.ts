export type ApiResponse<T> = {
  statusCode: number;
  data?: T | null;
  error?: string;
};
