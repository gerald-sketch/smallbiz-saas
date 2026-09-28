import { useState } from "react";
import { Link } from "react-router-dom";
import { useRegister } from "./use-auth";
import { apiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Hexagon,
  ArrowRight,
  Shield,
  Zap,
  TrendingUp,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

function Rule({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs transition-colors",
        ok ? "text-primary" : "text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          ok ? "bg-primary" : "bg-muted-foreground/30",
        )}
      />
      {children}
    </div>
  );
}

const BENEFITS = [
  {
    icon: Zap,
    title: "Set up in minutes",
    description: "No installation, no training. Start ringing sales today.",
  },
  {
    icon: TrendingUp,
    title: "Know your numbers",
    description: "Real-time profit, top products, and cash flow at a glance.",
  },
  {
    icon: Shield,
    title: "Built to be reliable",
    description: "Every transaction is protected against double-charges.",
  },
];

export function RegisterPage() {
  const [businessName, setBusinessName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const register = useRegister();

  const rules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    digit: /[0-9]/.test(password),
  };
  const passwordValid = Object.values(rules).every(Boolean);

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ─── Left Panel: Brand & Benefits ─── */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 p-10 xl:p-14 text-white">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Brand */}
        <div className="relative flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20">
            <Hexagon className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-semibold text-lg leading-tight tracking-tight">
              SmallBiz
            </p>
            <p className="text-xs text-white/70 leading-tight">
              Business management platform
            </p>
          </div>
        </div>

        {/* Hero copy */}
        <div className="relative max-w-md space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-3 py-1 text-xs font-medium ring-1 ring-white/20">
              <Sparkles className="h-3 w-3" />
              <span>Free to get started</span>
            </div>
            <h1 className="text-3xl xl:text-4xl font-bold leading-tight tracking-tight">
              Everything your business needs, in one place.
            </h1>
            <p className="text-white/80 text-base leading-relaxed">
              Stop juggling spreadsheets. Start with a system that grows with
              you — from your first sale to your hundredth employee.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-5">
            {BENEFITS.map((b) => (
              <div key={b.title} className="flex gap-3.5">
                <div className="h-9 w-9 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 ring-1 ring-white/15">
                  <b.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm font-semibold leading-tight">
                    {b.title}
                  </p>
                  <p className="text-xs text-white/70 leading-snug mt-0.5">
                    {b.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-2 text-xs text-white/60">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>No credit card required · Free plan available forever</span>
        </div>
      </div>

      {/* ─── Right Panel: Register Form ─── */}
      <div className="flex flex-col justify-center px-6 py-12 lg:px-16 bg-background">
        <div className="lg:hidden mb-8 flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <Hexagon
              className="h-4 w-4 text-primary-foreground"
              strokeWidth={2.5}
            />
          </div>
          <span className="font-semibold text-lg tracking-tight">SmallBiz</span>
        </div>

        <div className="w-full max-w-sm mx-auto lg:mx-0">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">
              Create your account
            </h2>
            <p className="text-sm text-muted-foreground mt-1.5">
              Start managing your business in under a minute
            </p>
          </div>

          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              register.mutate({ businessName, name, email, password });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-[13px] font-medium">
                Business name
              </Label>
              <Input
                id="businessName"
                placeholder="Acme Store"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-[13px] font-medium">
                Your name
              </Label>
              <Input
                id="name"
                placeholder="Juan Dela Cruz"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[13px] font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@business.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[13px] font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="h-11 rounded-xl"
              />
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-1">
                <Rule ok={rules.length}>8+ characters</Rule>
                <Rule ok={rules.upper}>Uppercase letter</Rule>
                <Rule ok={rules.lower}>Lowercase letter</Rule>
                <Rule ok={rules.digit}>One number</Rule>
              </div>
            </div>

            {register.isError && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-3.5 py-2.5 text-sm text-destructive">
                {apiErrorMessage(register.error)}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 rounded-xl font-medium"
              disabled={register.isPending || !passwordValid}
            >
              {register.isPending ? (
                "Creating account..."
              ) : (
                <>
                  Create account <ArrowRight className="h-4 w-4 ml-1.5" />
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              By creating an account you agree to our{" "}
              <Link
                to="/terms"
                className="underline underline-offset-2 hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                className="underline underline-offset-2 hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-muted-foreground">
                Already registered?
              </span>
            </div>
          </div>

          <Link
            to="/login"
            className="flex items-center justify-center w-full h-11 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors"
          >
            Sign in to your account
          </Link>

          <div className="mt-6 flex items-center justify-center gap-3 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              <span>No credit card</span>
            </div>
            <span className="h-3 w-px bg-border" />
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              <span>Free forever</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
