import { Request, Response, NextFunction } from "express";
import { AppError } from "../../middleware/errorHandler";
import * as service from "./forecasting.service";

export async function getInsights(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, "UNAUTHORIZED", "Not authenticated");
    }
    const insights = await service.getInsights(req.user.businessId);
    res.json(insights);
  } catch (e) {
    next(e);
  }
}
