import { Router } from "express";
import {
  RegisterSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from "@sb/shared";
import { validate } from "../../middleware/validate";
import { authLimiter } from "../../middleware/rateLimit";
import { requireAuth } from "../../middleware/auth";
import * as authController from "./auth.controller";

export const authRouter = Router();

authRouter.post(
  "/register",
  authLimiter,
  validate({ body: RegisterSchema }),
  authController.register,
);

authRouter.post(
  "/login",
  authLimiter,
  validate({ body: LoginSchema }),
  authController.login,
);

authRouter.post(
  "/forgot-password",
  authLimiter,
  validate({ body: ForgotPasswordSchema }),
  authController.forgotPassword,
);

authRouter.post(
  "/reset-password",
  authLimiter,
  validate({ body: ResetPasswordSchema }),
  authController.resetPassword,
);

authRouter.post("/refresh", authController.refresh);
authRouter.post("/logout", authController.logout);
authRouter.get("/me", requireAuth, authController.me);
