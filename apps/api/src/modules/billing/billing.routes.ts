import { Router, Request, Response, NextFunction } from "express";
import express from "express";
import { CreateCheckoutSchema } from "@sb/shared";
import { validate } from "../../middleware/validate";
import { requireAuth, requireRole } from "../../middleware/auth";
import { verifyWebhookSignature } from "../../lib/paymongo";
import * as service from "./billing.service";
import * as c from "./billing.controller";

export const billingRouter = Router();

// ─── Webhook — raw body, no auth ───
billingRouter.post(
  "/webhook",
  express.raw({ type: "application/json", limit: "1mb" }),
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const rawBody = req.body as Buffer;
    const sigHeader = req.headers["paymongo-signature"] as string | undefined;

    if (!sigHeader) {
      res.status(400).json({ error: "NO_SIGNATURE" });
      return;
    }

    if (!verifyWebhookSignature(rawBody, sigHeader)) {
      res.status(401).json({ error: "INVALID_SIGNATURE" });
      return;
    }

    let payload: unknown;
    try {
      payload = JSON.parse(rawBody.toString("utf8"));
    } catch {
      res.status(400).json({ error: "INVALID_JSON" });
      return;
    }

    const evt = payload as {
      data: { id: string; attributes: { type: string } };
    };
    const eventId = evt.data?.id;
    const eventType = evt.data?.attributes?.type;

    if (!eventId || !eventType) {
      res.status(400).json({ error: "MALFORMED_EVENT" });
      return;
    }

    // Respond 200 FIRST — PayMongo retries non-2xx
    res.status(200).json({ received: true });

    // Process async
    service
      .processWebhookEvent(eventId, eventType, payload as never)
      .catch((err) => console.error("[Webhook processing error]", err));
  },
);

// ─── Authenticated billing ───
billingRouter.get("/status", requireAuth, c.status);

billingRouter.post(
  "/checkout",
  requireAuth,
  requireRole(["OWNER"]),
  validate({ body: CreateCheckoutSchema }),
  c.createCheckout,
);

billingRouter.get("/events", requireAuth, requireRole(["OWNER"]), c.listEvents);
