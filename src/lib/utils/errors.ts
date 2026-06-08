export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 500,
    public readonly exposeMessage = true,
  ) {
    super(message);
    this.name = "AppError";
  }
}
