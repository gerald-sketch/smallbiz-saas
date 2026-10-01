import { Link } from "react-router-dom";
import { XCircle, ArrowLeft, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function BillingCancelPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-border/60 shadow-sm">
        <CardContent className="pt-10 pb-8 px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
              <XCircle className="h-10 w-10 text-muted-foreground" />
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight mb-2">
            Payment cancelled
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            No charge was made. You can upgrade anytime from the billing page.
          </p>

          <div className="flex flex-col gap-2">
            <Button asChild className="rounded-xl">
              <Link to="/billing">
                <CreditCard className="h-4 w-4 mr-1.5" />
                Try again
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Back to dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
