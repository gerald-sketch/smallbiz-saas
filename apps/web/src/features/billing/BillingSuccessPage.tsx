import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useBillingStatus } from "./use-billing";

export function BillingSuccessPage() {
  const qc = useQueryClient();
  const { data, refetch } = useBillingStatus();
  const [waited, setWaited] = useState(0);

  // Poll for the subscription to activate — the webhook arrives asynchronously
  useEffect(() => {
    if (data?.status === "ACTIVE" && data.plan !== "FREE") return;
    if (waited >= 10) return;

    const t = setTimeout(() => {
      qc.invalidateQueries({ queryKey: ["billing"] });
      refetch();
      setWaited((w) => w + 1);
    }, 1500);

    return () => clearTimeout(t);
  }, [data, waited, refetch, qc]);

  const isActive = data?.status === "ACTIVE" && data.plan !== "FREE";

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-border/60 shadow-sm">
        <CardContent className="pt-10 pb-8 px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-30" />
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight mb-2">
            Payment successful
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Thank you! Your subscription is being activated.
          </p>

          <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-semibold">
                {isActive ? data?.plan : "Processing..."}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="flex items-center gap-1.5 font-semibold">
                {isActive ? (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Active
                  </>
                ) : (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Activating
                  </>
                )}
              </span>
            </div>
            {isActive && data?.currentPeriodEnd && (
              <div className="flex justify-between text-sm pt-2 border-t border-border/60">
                <span className="text-muted-foreground">Renews on</span>
                <span className="font-medium">
                  {new Date(data.currentPeriodEnd).toLocaleDateString("en-PH", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>

          {!isActive && waited >= 10 && (
            <p className="text-xs text-muted-foreground mb-4">
              Still processing — your plan will activate automatically once the
              payment is confirmed. You can continue using the app.
            </p>
          )}

          <div className="flex flex-col gap-2">
            <Button asChild className="rounded-xl">
              <Link to="/billing">
                View billing <ArrowRight className="h-4 w-4 ml-1.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/">Back to dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
