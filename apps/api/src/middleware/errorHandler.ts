import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public meta?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "VALIDATION_ERROR",
      details: err.flatten().fieldErrors,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
      ...(err.meta && { meta: err.meta }),
    });
    return;
  }

  if (err instanceof Error && err.name === "JsonWebTokenError") {
    res.status(401).json({ error: "INVALID_TOKEN", message: "Invalid token" });
    return;
  }
  if (err instanceof Error && err.name === "TokenExpiredError") {
    res.status(401).json({ error: "TOKEN_EXPIRED", message: "Token expired" });
    return;
  }

  console.error("[Unhandled Error]", err);
  res.status(500).json({
    error: "INTERNAL_ERROR",
    message: "Something went wrong",
  });
}
