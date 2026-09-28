import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../config/env";
import { AppError } from "../middleware/errorHandler";

const BASE = "https://api.paymongo.com/v1";

export const PLAN_PRICING: Record<"STARTER" | "PRO", number> = {
  STARTER: 49900,
  PRO: 149900,
};

export const PLAN_NAMES: Record<"STARTER" | "PRO", string> = {
  STARTER: "Starter Plan — Monthly",
  PRO: "Pro Plan — Monthly",
};

/**
 * Sanitize the secret key — strip quotes, whitespace, and any trailing
 * characters that can sneak in from .env parsing or copy-paste.
 */
function getSecretKey(): string {
  const raw = env.PAYMONGO_SECRET_KEY ?? "";
  const key = raw.trim().replace(/^["']|["']$/g, "");

  if (!key) {
    throw new AppError(
      500,
      "PAYMONGO_NOT_CONFIGURED",
      "PAYMONGO_SECRET_KEY is not set in .env",
    );
  }

  if (!key.startsWith("sk_test_") && !key.startsWith("sk_live_")) {
    throw new AppError(
      500,
      "PAYMONGO_INVALID_KEY",
      `PAYMONGO_SECRET_KEY has an invalid prefix. Expected "sk_test_" or "sk_live_", got "${key.slice(0, 8)}..."`,
    );
  }

  // A valid key has no colon — the colon is appended separately for Basic auth
  if (key.includes(":")) {
    throw new AppError(
      500,
      "PAYMONGO_INVALID_KEY",
      "PAYMONGO_SECRET_KEY contains a colon — remove it and try again",
    );
  }

  return key;
}

function authHeader(): string {
  const key = getSecretKey();
  // Basic auth: base64(secretKey + ":")
  const encoded = Buffer.from(`${key}:`).toString("base64");
  return `Basic ${encoded}`;
}

interface CreateCheckoutParams {
  plan: "STARTER" | "PRO";
  businessId: string;
  businessName: string;
  customerEmail: string;
}

interface CheckoutResponse {
  data: {
    id: string;
    attributes: {
      checkout_url: string;
      reference_number: string;
      status: string;
    };
  };
}

interface PaymongoErrorResponse {
  errors?: Array<{
    code?: string;
    detail?: string;
    source?: { pointer?: string };
  }>;
}

export async function createCheckoutSession(
  params: CreateCheckoutParams,
): Promise<{ id: string; checkoutUrl: string }> {
  const amount = PLAN_PRICING[params.plan];

  const body = {
    data: {
      attributes: {
        send_email_receipt: true,
        show_description: true,
        show_line_items: true,
        description: `${PLAN_NAMES[params.plan]} for ${params.businessName}`,
        line_items: [
          {
            currency: "PHP",
            amount,
            name: PLAN_NAMES[params.plan],
            quantity: 1,
          },
        ],
        payment_method_types: ["gcash", "paymaya", "card"],
        success_url: env.PAYMONGO_SUCCESS_URL,
        cancel_url: env.PAYMONGO_CANCEL_URL,
        reference_number: params.businessId,
        metadata: {
          businessId: params.businessId,
          plan: params.plan,
        },
      },
    },
  };

  const res = await fetch(`${BASE}/checkout_sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: authHeader(),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    // Read the raw response so we can see exactly what PayMongo said
    const text = await res.text();

    let detail = text.slice(0, 300);
    try {
      const parsed = JSON.parse(text) as PaymongoErrorResponse;
      if (parsed.errors && parsed.errors.length > 0) {
        detail = parsed.errors
          .map((e) => e.detail ?? e.code ?? "Unknown error")
          .join(" · ");
      }
    } catch {
      // Not JSON — use the raw text
    }

    // Log full details server-side so the terminal shows the real cause
    console.error("[PayMongo] Request failed", {
      status: res.status,
      statusText: res.statusText,
      body: text.slice(0, 500),
    });

    // 401 = bad key. Surface this clearly rather than burying it in a 502.
    if (res.status === 401) {
      throw new AppError(
        500,
        "PAYMONGO_UNAUTHORIZED",
        `PayMongo rejected the API key (401). Check that PAYMONGO_SECRET_KEY is a valid test key and that it hasn't been revoked. Details: ${detail}`,
      );
    }

    throw new AppError(
      502,
      "PAYMONGO_ERROR",
      `PayMongo error ${res.status}: ${detail}`,
    );
  }

  const json = (await res.json()) as CheckoutResponse;
  return {
    id: json.data.id,
    checkoutUrl: json.data.attributes.checkout_url,
  };
}

/**
 * Verify the Paymongo-Signature header against the raw body.
 * Header format: t=<timestamp>,te=<test_sig>,li=<live_sig>
 * Signature = HMAC-SHA256(secret, `${timestamp}.${rawBody}`)
 */
export function verifyWebhookSignature(
  rawBody: Buffer,
  signatureHeader: string,
): boolean {
  const secret = env.PAYMONGO_WEBHOOK_SECRET?.trim().replace(
    /^["']|["']$/g,
    "",
  );
  if (!secret) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => p.split("=") as [string, string]),
  );
  const timestamp = parts.t;
  const testSig = parts.te;
  const liveSig = parts.li;
  const provided = liveSig ?? testSig;
  if (!timestamp || !provided) return false;

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody.toString("utf8")}`)
    .digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(provided, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
