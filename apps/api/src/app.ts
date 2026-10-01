import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { routes } from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { generalLimiter } from "./middleware/rateLimit";
import { logSlowRequests } from "./middleware/logSlowRequests.js";

export const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(logSlowRequests);
app.use(
  cors({
    origin: env.CORS_ORIGINS.split(",").map((s) => s.trim()),
    credentials: true,
  }),
);

// Skip JSON parsing for the webhook path — it needs the raw body
app.use((req, res, next) => {
  if (req.originalUrl === "/api/billing/webhook") return next();
  return express.json({ limit: "1mb" })(req, res, next);
});

app.use(cookieParser());
app.use(generalLimiter);

app.use("/api", routes);

app.use(errorHandler);
