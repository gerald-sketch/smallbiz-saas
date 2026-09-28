import { Request, Response, NextFunction } from "express";
import { AppError } from "./errorHandler";
import { Plan, getBusinessPlan, planAtLeast } from "../lib/plans";

/**
 * Rejects the request with 403 if the business's plan is below `minPlan`.
 * Requires `requireAuth` to have already run.
 */
export function requirePlan(minPlan: Plan) {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        return next(new AppError(401, "UNAUTHORIZED", "Not authenticated"));
      }

      const plan = await getBusinessPlan(req.user.businessId);

      if (!planAtLeast(plan, minPlan)) {
        return next(
          new AppError(
            403,
            "PLAN_REQUIRED",
            `This feature requires the ${minPlan} plan. You're currently on ${plan}.`,
            { requiredPlan: minPlan, currentPlan: plan },
          ),
        );
      }

      next();
    } catch (e) {
      next(e);
    }
  };
}
