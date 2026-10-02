import { Request, Response, NextFunction } from "express";
import { AppError } from "../../middleware/errorHandler";
import * as service from "./dashboard.service";

export async function summary(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, "UNAUTHORIZED", "Not authenticated");
    res.json(await service.summary(req.user.businessId));
  } catch (e) {
    next(e);
  }
}

export async function staffOverview(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, "UNAUTHORIZED", "Not authenticated");
    const [staff, todayRevenue] = await Promise.all([
      service.staffOverview(req.user.businessId),
      service.todaySalesTotal(req.user.businessId),
    ]);
    res.json({ staff, todayRevenue });
  } catch (e) {
    next(e);
  }
}

export async function staffDetail(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, "UNAUTHORIZED", "Not authenticated");
    const userId = Array.isArray(req.params.userId)
      ? req.params.userId[0]
      : req.params.userId;
    if (!userId) throw new AppError(400, "INVALID_ID", "Missing user ID");
    const detail = await service.staffDetail(req.user.businessId, userId);
    res.json(detail);
  } catch (e) {
    next(e);
  }
}
