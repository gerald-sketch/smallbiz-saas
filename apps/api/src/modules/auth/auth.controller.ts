import { Request, Response, NextFunction } from "express";
import { REFRESH_COOKIE, REFRESH_COOKIE_MAX_AGE_MS } from "../../lib/jwt";
import { env } from "../../config/env";
import * as authService from "./auth.service";

const isProd = env.NODE_ENV === "production";

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    domain: env.COOKIE_DOMAIN,
    path: "/api/auth",
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
  });
}

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await authService.register(req.body);
    setRefreshCookie(res, result.refreshToken);
    res.status(201).json({
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (e) {
    next(e);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await authService.login(req.body);
    setRefreshCookie(res, result.refreshToken);
    res.json({
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (e) {
    next(e);
  }
}

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) {
      res
        .status(401)
        .json({ error: "NO_REFRESH_TOKEN", message: "No refresh token" });
      return;
    }
    const result = await authService.refresh(token);
    setRefreshCookie(res, result.refreshToken);
    res.json({
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (e) {
    next(e);
  }
}

export function logout(_req: Request, res: Response): void {
  res.clearCookie(REFRESH_COOKIE, {
    domain: env.COOKIE_DOMAIN,
    path: "/api/auth",
  });
  res.json({ ok: true });
}

export function me(req: Request, res: Response): void {
  res.json({ user: req.user });
}
export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await authService.forgotPassword(req.body.email);
    res.json({
      ok: true,
      message: "If that email is registered, a reset link has been sent.",
    });
  } catch (e) {
    next(e);
  }
}

export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email, code, password } = req.body;
    await authService.resetPassword(email, code, password);
    res.json({
      ok: true,
      message: "Password has been reset. You can now sign in.",
    });
  } catch (e) {
    next(e);
  }
}
