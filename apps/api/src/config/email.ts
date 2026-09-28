import nodemailer from "nodemailer";
import { env } from "../config/env";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_APP_PASSWORD,
  },
  tls: {
    // Windows antivirus proxies intercept the SSL chain with a
    // self-signed cert, which Node refuses by default. Render's
    // environment doesn't have this issue, so this is a no-op there.
    rejectUnauthorized: false,
  },
});

export async function sendPasswordResetCode(
  email: string,
  code: string,
  recipientName?: string,
): Promise<void> {
  if (!env.EMAIL_USER || !env.EMAIL_APP_PASSWORD) {
    throw new Error(
      "Email is not configured. Set EMAIL_USER and EMAIL_APP_PASSWORD in .env",
    );
  }

  const greeting = recipientName ? `Hi ${recipientName},` : "Hi,";

  await transporter.sendMail({
    from: `"SmallBiz" <${env.EMAIL_USER}>`,
    to: email,
    subject: `${code} is your SmallBiz password reset code`,
    text: `${greeting}\n\nYour password reset code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, ignore this email.`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="margin: 0 0 16px; font-size: 20px; color: #111;">Password reset code</h2>
        <p style="margin: 0 0 20px; color: #555;">${greeting}</p>
        <p style="margin: 0 0 20px; color: #555;">Use this code to reset your SmallBiz password:</p>
        <div style="background: #f4f4f5; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 20px;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #111;">${code}</span>
        </div>
        <p style="margin: 0 0 12px; color: #555; font-size: 14px;">This code expires in <strong>10 minutes</strong>.</p>
        <p style="margin: 0; color: #999; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}
