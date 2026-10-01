import { performance } from "node:perf_hooks";
import { RequestHandler } from "express";

const SLOW_REQUEST_THRESHOLD_MS = 1_000;

export const logSlowRequests: RequestHandler = (req, res, next) => {
  const startedAt = performance.now();

  res.on("finish", () => {
    const durationMs = performance.now() - startedAt;
    if (durationMs < SLOW_REQUEST_THRESHOLD_MS) return;

    console.warn(
      "[Slow Request]",
      JSON.stringify({
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        durationMs: Math.round(durationMs),
      }),
    );
  });

  next();
};
