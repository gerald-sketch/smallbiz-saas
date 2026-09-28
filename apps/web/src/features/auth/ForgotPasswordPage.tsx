import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,hsl(142_65%_38%_/_0.08),transparent_60%)]" />
      <Card className="w-full max-w-md border-border/60 shadow-sm">
        <CardHeader>
          <div className="flex justify-center mb-3">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              {sent ? (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              ) : (
                <Mail className="h-5 w-5 text-primary" />
              )}
            </div>
          </div>
          <CardTitle className="text-center text-xl">
            {sent ? "Check your email" : "Forgot password?"}
          </CardTitle>
          <CardDescription className="text-center">
            {sent
              ? `We sent a 6-digit code to ${email}. It expires in 10 minutes.`
              : "Enter your email and we'll send you a code to reset your password."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <>
              <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-muted-foreground mb-4">
                Didn't get the email? Check your spam folder, or{" "}
                <button
                  type="button"
                  className="text-primary underline"
                  onClick={() => setSent(false)}
                >
                  try again
                </button>
                .
              </div>
              <Button
                className="w-full h-11 rounded-xl"
                onClick={() =>
                  navigate(`/reset-password?email=${encodeURIComponent(email)}`)
                }
              >
                Enter reset code
              </Button>
              <Link
                to="/login"
                className="flex items-center justify-center mt-3 text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3 w-3 mr-1" />
                Back to sign in
              </Link>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@business.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="h-11 rounded-xl"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                type="submit"
                className="w-full h-11 rounded-xl"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send reset code"}
              </Button>
              <Link
                to="/login"
                className="flex items-center justify-center text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3 w-3 mr-1" />
                Back to sign in
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
