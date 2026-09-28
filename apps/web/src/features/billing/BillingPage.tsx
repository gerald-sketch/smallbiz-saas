import { toast } from "sonner";
import { Check, Sparkles, CreditCard } from "lucide-react";
import { useBillingStatus, useCreateCheckout, Plan } from "./use-billing";
import { apiErrorMessage } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const PLANS: {
  id: Plan;
  name: string;
  price: number;
  description: string;
  features: string[];
}[] = [
  {
    id: "FREE",
    name: "Free",
    price: 0,
    description: "Get started with the basics",
    features: [
      "Up to 50 products",
      "1 staff account",
      "POS + Inventory",
      "Basic reports",
    ],
  },
  {
    id: "STARTER",
    name: "Starter",
    price: 499,
    description: "For growing small businesses",
    features: [
      "Unlimited products",
      "Up to 5 staff accounts",
      "Everything in Free",
      "Purchase orders",
      "Expense tracking",
      "Full reports & P&L",
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    price: 1499,
    description: "For multi-location operations",
    features: [
      "Everything in Starter",
      "Unlimited staff",
      "Priority support",
      "Advanced analytics",
      "Custom exports",
    ],
  },
];

function peso(n: number) {
  return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function BillingPage() {
  const { data, isLoading } = useBillingStatus();
  const checkout = useCreateCheckout();

  async function handleUpgrade(plan: "STARTER" | "PRO") {
    try {
      const { checkoutUrl } = await checkout.mutateAsync(plan);
      window.location.href = checkoutUrl;
    } catch (e) {
      toast.error(apiErrorMessage(e));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Billing</h2>
        <p className="text-sm text-muted-foreground">
          Manage your subscription plan
        </p>
      </div>

      {isLoading || !data ? (
        <Skeleton className="h-40" />
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Current Plan
              </CardTitle>
              <CardDescription>
                {data.plan === "FREE"
                  ? "You're on the free plan. Upgrade to unlock more features."
                  : `You're on the ${data.plan} plan.`}
              </CardDescription>
            </div>
            <Badge variant={data.status === "ACTIVE" ? "default" : "secondary"}>
              {data.status}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-medium">{data.plan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price</span>
              <span className="font-medium">
                {peso(data.pricePesos)} / month
              </span>
            </div>
            {data.currentPeriodEnd && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Renews on</span>
                <span className="font-medium">
                  {new Date(data.currentPeriodEnd).toLocaleDateString()}
                </span>
              </div>
            )}
            {data.autoRenew && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Auto-renew</span>
                <span className="font-medium">Enabled</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = data?.plan === plan.id;
          return (
            <Card
              key={plan.id}
              className={plan.id === "STARTER" ? "border-primary relative" : ""}
            >
              {plan.id === "STARTER" && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="gap-1">
                    <Sparkles className="h-3 w-3" /> Popular
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-2">
                  <span className="text-3xl font-bold">{peso(plan.price)}</span>
                  <span className="text-sm text-muted-foreground">
                    {" "}
                    / month
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.id === "STARTER" ? "default" : "outline"}
                  disabled={
                    plan.id === "FREE" || isCurrent || checkout.isPending
                  }
                  onClick={() =>
                    plan.id !== "FREE" &&
                    handleUpgrade(plan.id as "STARTER" | "PRO")
                  }
                >
                  {isCurrent
                    ? "Current plan"
                    : plan.id === "FREE"
                      ? "Free forever"
                      : checkout.isPending
                        ? "Loading..."
                        : `Upgrade to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Payment Methods</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          We accept GCash, Maya, and credit/debit cards via PayMongo. You'll be
          redirected to PayMongo's secure checkout when you upgrade.
        </CardContent>
      </Card>
    </div>
  );
}
