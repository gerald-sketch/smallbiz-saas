import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, Role } from "../lib/jwt";
import { AppError } from "./errorHandler";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: {
        id: string;
        businessId: string;
        role: Role;
      };
    }
  }
}

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(new AppError(401, "UNAUTHORIZED", "Missing access token"));
  }

  const token = header.slice("Bearer ".length);
  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      businessId: payload.businessId,
      role: payload.role,
    };
    next();
  } catch (e) {
    next(e);
  }
}

export function requireRole(allowed: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError(401, "UNAUTHORIZED", "Not authenticated"));
    }
    if (!allowed.includes(req.user.role)) {
      return next(new AppError(403, "FORBIDDEN", "Insufficient permissions"));
    }
    next();
  };
}
