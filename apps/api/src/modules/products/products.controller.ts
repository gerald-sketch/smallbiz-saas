import { Request, Response, NextFunction } from "express";
import { AppError } from "../../middleware/errorHandler";
import * as productsService from "./products.service";

function requireUser(req: Request) {
  if (!req.user) throw new AppError(401, "UNAUTHORIZED", "Not authenticated");
  return req.user;
}

function requireId(req: Request): string {
  const id = req.params.id;

  if (typeof id !== "string" || !id) {
    throw new AppError(400, "INVALID_ID", "Missing product ID");
  }

  return id;
}

export async function list(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = requireUser(req);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;
    const categoryId =
      typeof req.query.categoryId === "string"
        ? req.query.categoryId
        : undefined;

    const result = await productsService.list(
      user.businessId,
      page,
      limit,
      search,
      categoryId,
    );
    res.json(result);
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
    const user = requireUser(req);
    const product = await productsService.getById(
      user.businessId,
      requireId(req),
    );
    res.json(product);
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
    const user = requireUser(req);
    const product = await productsService.create(
      user.businessId,
      user.id,
      req.body,
    );
    res.status(201).json(product);
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
    const user = requireUser(req);
    const product = await productsService.update(
      user.businessId,
      requireId(req),
      req.body,
    );
    res.json(product);
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
    const user = requireUser(req);
    await productsService.softDelete(user.businessId, requireId(req));
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}
