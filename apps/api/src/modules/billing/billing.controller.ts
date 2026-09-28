import { Request, Response, NextFunction } from "express";
import { AppError } from "../../middleware/errorHandler";
import * as service from "./billing.service";

function u(req: Request) {
  if (!req.user) throw new AppError(401, "UNAUTHORIZED", "Not authenticated");
  return req.user;
}

export async function status(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    res.json(await service.status(u(req).businessId));
  } catch (e) {
    next(e);
  }
}

export async function createCheckout(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    res.json(await service.createCheckout(u(req).businessId, req.body));
  } catch (e) {
    next(e);
  }
}

export async function listEvents(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    res.json({ items: await service.listWebhookEvents() });
  } catch (e) {
    next(e);
  }
}
