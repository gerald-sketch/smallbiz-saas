import { useNavigate } from "react-router-dom";
import { Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plan, PLAN_LABEL } from "@/lib/plan-utils";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  requiredPlan: Plan;
  featureName?: string;
}

const BENEFITS: Record<"STARTER" | "PRO", string[]> = {
  STARTER: [
    "Up to 500 products",
    "Up to 5 staff accounts",
    "Profit & Loss reports",
    "Top Products analytics",
    "Inventory valuation",
  ],
  PRO: [
    "Unlimited products",
    "Unlimited staff accounts",
    "Everything in Starter",
    "CSV export for all reports",
    "Priority support",
  ],
};

export function UpgradePrompt({
  open,
  onOpenChange,
  requiredPlan,
  featureName,
}: Props) {
  const navigate = useNavigate();

  // FREE can't be a target — the lowest upgrade is STARTER
  const target = requiredPlan === "FREE" ? "STARTER" : requiredPlan;
  const benefits = BENEFITS[target];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-3">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            {featureName
              ? `${featureName} requires ${PLAN_LABEL[target]}`
              : `Upgrade to ${PLAN_LABEL[target]}`}
          </DialogTitle>
          <DialogDescription className="text-center">
            Unlock this feature and more on the {PLAN_LABEL[target]} plan.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-2 my-2">
          {benefits.map((b) => (
            <div key={b} className="flex items-start gap-2 text-sm">
              <div className="h-4 w-4 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="h-2.5 w-2.5 text-primary" strokeWidth={3} />
              </div>
              <span>{b}</span>
            </div>
          ))}
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            Maybe later
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false);
              navigate("/billing");
            }}
            className="rounded-xl flex-1"
          >
            View plans
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
