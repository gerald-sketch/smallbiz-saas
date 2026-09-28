import { Request, Response, NextFunction } from "express";
import { AppError } from "../../middleware/errorHandler";
import * as service from "./suppliers.service";

function u(req: Request) {
  if (!req.user) throw new AppError(401, "UNAUTHORIZED", "Not authenticated");
  return req.user;
}

export async function list(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;
    res.json({ items: await service.list(u(req).businessId, search) });
  } catch (e) {
    next(e);
  }
}

export async function getById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id;
    if (typeof id !== "string" || !id)
      throw new AppError(400, "INVALID_ID", "Missing ID");
    res.json(await service.getById(u(req).businessId, id));
  } catch (e) {
    next(e);
  }
}

export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    res.status(201).json(await service.create(u(req).businessId, req.body));
  } catch (e) {
    next(e);
  }
}

export async function update(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id;
    if (typeof id !== "string" || !id)
      throw new AppError(400, "INVALID_ID", "Missing ID");
    res.json(await service.update(u(req).businessId, id, req.body));
  } catch (e) {
    next(e);
  }
}

export async function remove(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id;
    if (typeof id !== "string" || !id)
      throw new AppError(400, "INVALID_ID", "Missing ID");
    await service.softDelete(u(req).businessId, id);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}
