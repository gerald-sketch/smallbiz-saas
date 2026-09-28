import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { AppError } from "./errorHandler";

const HEADER = "idempotency-key";

export function idempotent(endpoint: string) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const key = req.headers[HEADER] as string | undefined;

    // No key = no idempotency (client chose to skip it)
    if (!key) return next();

    if (key.length < 16 || key.length > 128) {
      return next(
        new AppError(
          400,
          "INVALID_IDEMPOTENCY_KEY",
          "Idempotency-Key must be 16-128 chars",
        ),
      );
    }

    const user = req.user;
    if (!user)
      return next(new AppError(401, "UNAUTHORIZED", "Not authenticated"));

    // Look up existing key
    const existing = await prisma.idempotencyKey.findUnique({
      where: { businessId_key: { businessId: user.businessId, key } },
    });

    if (existing) {
      // Replay the stored response
      res.status(existing.statusCode).json(existing.response);
      return;
    }

    // Capture the response on the way out
    const originalJson = res.json.bind(res);
    let capturedBody: unknown = null;

    res.json = (body: unknown) => {
      capturedBody = body;
      return originalJson(body);
    };

    res.on("finish", async () => {
      // Only store successful, non-5xx responses
      if (
        res.statusCode >= 200 &&
        res.statusCode < 300 &&
        capturedBody !== null
      ) {
        try {
          await prisma.idempotencyKey.create({
            data: {
              key,
              userId: user.id,
              businessId: user.businessId,
              endpoint,
              statusCode: res.statusCode,
              response: capturedBody as object,
            },
          });
        } catch (e: unknown) {
          // Duplicate insert = race condition; another request stored it first.
          // That's fine — this request already returned successfully.
          const code = (e as { code?: string }).code;
          if (code !== "P2002") console.error("[Idempotency store error]", e);
        }
      }
    });

    next();
  };
}
