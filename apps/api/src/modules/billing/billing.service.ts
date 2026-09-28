import { prisma } from "../../lib/prisma";
import { AppError } from "../../middleware/errorHandler";
import { createCheckoutSession, PLAN_PRICING } from "../../lib/paymongo";
import { CreateCheckoutInput } from "@sb/shared";

export async function getOrCreateSubscription(businessId: string) {
  let sub = await prisma.subscription.findUnique({ where: { businessId } });
  if (!sub) {
    sub = await prisma.subscription.create({
      data: { businessId, plan: "FREE", status: "ACTIVE" },
    });
  }
  return sub;
}

export async function status(businessId: string) {
  const sub = await getOrCreateSubscription(businessId);

  // Only ACTIVE subscriptions count toward the effective plan.
  // PENDING / CANCELED / EXPIRED / PAST_DUE all fall back to FREE
  // so plan gating stays consistent across every endpoint.
  const effectivePlan: "FREE" | "STARTER" | "PRO" =
    sub.status === "ACTIVE" ? (sub.plan as "FREE" | "STARTER" | "PRO") : "FREE";

  const priceCentavos =
    effectivePlan !== "FREE"
      ? PLAN_PRICING[effectivePlan as "STARTER" | "PRO"]
      : 0;

  return {
    plan: effectivePlan,
    status: sub.status,
    currentPeriodStart: sub.currentPeriodStart,
    currentPeriodEnd: sub.currentPeriodEnd,
    autoRenew: sub.autoRenew,
    priceCentavos,
    pricePesos: priceCentavos / 100,
  };
}

export async function createCheckout(
  businessId: string,
  input: CreateCheckoutInput,
) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { id: true, name: true },
  });
  if (!business) throw new AppError(404, "NOT_FOUND", "Business not found");

  const owner = await prisma.user.findFirst({
    where: { businessId, role: "OWNER", deletedAt: null },
    select: { email: true },
  });
  if (!owner) throw new AppError(500, "NO_OWNER", "Business has no owner");

  const { id, checkoutUrl } = await createCheckoutSession({
    plan: input.plan as "STARTER" | "PRO",
    businessId,
    businessName: business.name,
    customerEmail: owner.email,
  });

  await prisma.subscription.upsert({
    where: { businessId },
    create: {
      businessId,
      plan: input.plan,
      status: "PENDING",
      providerCheckoutId: id,
    },
    update: {
      plan: input.plan,
      status: "PENDING",
      providerCheckoutId: id,
    },
  });

  return { checkoutId: id, checkoutUrl };
}

interface PaymongoWebhookEvent {
  data: {
    id: string;
    type: string;
    attributes: {
      type: string;
      data: {
        id: string;
        attributes: Record<string, unknown> & {
          metadata?: { businessId?: string; plan?: string };
          reference_number?: string;
          payment_intent_id?: string;
          payments?: Array<{ id: string; attributes: { status: string } }>;
        };
      };
    };
  };
}

export async function processWebhookEvent(
  eventId: string,
  eventType: string,
  payload: PaymongoWebhookEvent,
): Promise<boolean> {
  try {
    await prisma.webhookEvent.create({
      data: {
        provider: "paymongo",
        eventId,
        eventType,
        payload: payload as unknown as object,
      },
    });
  } catch (e: unknown) {
    if ((e as { code?: string }).code === "P2002") return false;
    throw e;
  }

  try {
    const attrs = payload.data.attributes.data.attributes;
    const businessId = attrs.metadata?.businessId ?? attrs.reference_number;
    const plan = attrs.metadata?.plan;

    if (!businessId) {
      await markProcessed(eventId, "No businessId in payload");
      return true;
    }

    switch (eventType) {
      case "checkout_session.payment.paid":
      case "payment.paid": {
        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        await prisma.subscription.upsert({
          where: { businessId },
          create: {
            businessId,
            plan: (plan as "STARTER" | "PRO") ?? "STARTER",
            status: "ACTIVE",
            autoRenew: true,
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            providerCheckoutId: payload.data.attributes.data.id,
            providerPaymentId: attrs.payments?.[0]?.id ?? null,
          },
          update: {
            plan: (plan as "STARTER" | "PRO") ?? "STARTER",
            status: "ACTIVE",
            autoRenew: true,
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            providerCheckoutId: payload.data.attributes.data.id,
            providerPaymentId: attrs.payments?.[0]?.id ?? null,
          },
        });
        break;
      }
      default:
        break;
    }

    await markProcessed(eventId, null);
    return true;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    await markProcessed(eventId, msg);
    throw e;
  }
}

async function markProcessed(
  eventId: string,
  error: string | null,
): Promise<void> {
  await prisma.webhookEvent.update({
    where: { provider_eventId: { provider: "paymongo", eventId } },
    data: { processed: true, processedAt: new Date(), error },
  });
}

export async function listWebhookEvents() {
  return prisma.webhookEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}
