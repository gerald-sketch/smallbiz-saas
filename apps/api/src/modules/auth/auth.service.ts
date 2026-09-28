import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma";
import { env } from "../../config/env";
import { AppError } from "../../middleware/errorHandler";
import { RegisterInput, LoginInput } from "@sb/shared";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  Role,
} from "../../lib/jwt";
import { createHash, randomBytes } from "node:crypto";

interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
    businessId: string;
    businessName: string;
  };
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });
  if (existing) {
    throw new AppError(409, "EMAIL_TAKEN", "Email is already registered");
  }

  const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_ROUNDS);

  const result = await prisma.$transaction(async (tx) => {
    const business = await tx.business.create({
      data: { name: input.businessName },
    });

    const user = await tx.user.create({
      data: {
        businessId: business.id,
        email: input.email,
        name: input.name,
        passwordHash,
        role: "OWNER",
      },
    });

    return { business, user };
  });

  const accessToken = signAccessToken({
    sub: result.user.id,
    businessId: result.business.id,
    role: result.user.role as Role,
  });
  const refreshToken = signRefreshToken({ sub: result.user.id });

  return {
    accessToken,
    refreshToken,
    user: {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      role: result.user.role as Role,
      businessId: result.business.id,
      businessName: result.business.name,
    },
  };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await prisma.user.findFirst({
    where: { email: input.email, deletedAt: null },
    include: { business: true },
  });

  if (!user) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  const accessToken = signAccessToken({
    sub: user.id,
    businessId: user.businessId,
    role: user.role as Role,
  });
  const refreshToken = signRefreshToken({ sub: user.id });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
      businessId: user.businessId,
      businessName: user.business.name,
    },
  };
}

export async function refresh(refreshToken: string): Promise<AuthResult> {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(401, "INVALID_REFRESH_TOKEN", "Invalid refresh token");
  }

  const user = await prisma.user.findFirst({
    where: { id: payload.sub, deletedAt: null },
    include: { business: true },
  });
  if (!user) {
    throw new AppError(401, "INVALID_REFRESH_TOKEN", "User no longer exists");
  }

  const newAccess = signAccessToken({
    sub: user.id,
    businessId: user.businessId,
    role: user.role as Role,
  });
  const newRefresh = signRefreshToken({ sub: user.id });

  return {
    accessToken: newAccess,
    refreshToken: newRefresh,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
      businessId: user.businessId,
      businessName: user.business.name,
    },
  };
}
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function forgotPassword(email: string): Promise<void> {
  const user = await prisma.user.findFirst({
    where: { email, deletedAt: null },
    select: { id: true, email: true, name: true },
  });

  if (!user) {
    console.log(`[Password Reset] Requested for unknown email: ${email}`);
    return;
  }

  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id, usedAt: null },
  });

  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  const resetUrl = `${env.APP_URL}/reset-password?token=${token}`;

  console.log("\n─────────────────────────────────────────────────────");
  console.log("  PASSWORD RESET LINK");
  console.log("─────────────────────────────────────────────────────");
  console.log(`  User:  ${user.name} <${user.email}>`);
  console.log(`  Link:  ${resetUrl}`);
  console.log(`  Expires: ${expiresAt.toISOString()}`);
  console.log("─────────────────────────────────────────────────────\n");
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<void> {
  const tokenHash = hashToken(token);

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, deletedAt: true } } },
  });

  if (!record)
    throw new AppError(400, "INVALID_TOKEN", "Reset link is invalid");
  if (record.usedAt)
    throw new AppError(
      400,
      "TOKEN_USED",
      "This reset link has already been used",
    );
  if (record.expiresAt < new Date())
    throw new AppError(400, "TOKEN_EXPIRED", "This reset link has expired");
  if (record.user.deletedAt)
    throw new AppError(400, "INVALID_TOKEN", "Reset link is invalid");

  const passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);
}
