import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLogin } from "./use-auth";
import { apiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Hexagon,
  Package,
  ShoppingCart,
  BarChart3,
  Shield,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

const FEATURES = [
  {
    icon: ShoppingCart,
    title: "Point of Sale",
    description: "Ring sales, print receipts, track cash — all in one screen",
  },
  {
    icon: Package,
    title: "Inventory",
    description: "Real-time stock levels that update with every transaction",
  },
  {
    icon: BarChart3,
    title: "Reports",
    description: "Profit and loss, top products, sales trends at a glance",
  },
  {
    icon: Shield,
    title: "Role-based access",
    description: "Owners, managers, and staff each see what they need",
  },
];

export function LoginPage() {
  const [email, setEmail] = useState("gerald@acme.test");
  const [password, setPassword] = useState("Password123");
  const login = useLogin();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ─── Left Panel: Brand & Marketing ─── */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 p-10 xl:p-14 text-white">
        {/* Ambient glows */}
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        {/* Subtle grid pattern */}
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
              <span>Everything in one place</span>
            </div>
            <h1 className="text-3xl xl:text-4xl font-bold leading-tight tracking-tight">
              Run your entire business from a single system.
            </h1>
            <p className="text-white/80 text-base leading-relaxed">
              Inventory, sales, purchasing, staff, and reporting — unified, so
              you stop juggling spreadsheets and start seeing the whole picture.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex gap-3.5">
                <div className="h-9 w-9 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 ring-1 ring-white/15">
                  <f.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm font-semibold leading-tight">
                    {f.title}
                  </p>
                  <p className="text-xs text-white/70 leading-snug mt-0.5">
                    {f.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div className="relative flex items-center gap-2 text-xs text-white/60">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>
            Built for Philippine small businesses — VAT-inclusive, GCash & Maya
            ready
          </span>
        </div>
      </div>

      {/* ─── Right Panel: Login Form ─── */}
      <div className="flex flex-col justify-center px-6 py-12 lg:px-16 bg-background">
        {/* Mobile brand */}
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
          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-sm text-muted-foreground mt-1.5">
              Sign in to continue to your dashboard
            </p>
          </div>

          {/* Form */}
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              login.mutate({ email, password });
            }}
          >
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[13px] font-medium">
                  Password
                </Label>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="h-11 rounded-xl"
              />
            </div>

            {login.isError && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-3.5 py-2.5 text-sm text-destructive">
                {apiErrorMessage(login.error)}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 rounded-xl font-medium"
              disabled={login.isPending}
            >
              {login.isPending ? (
                "Signing in..."
              ) : (
                <>
                  Sign in <ArrowRight className="h-4 w-4 ml-1.5" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-muted-foreground">
                New to SmallBiz?
              </span>
            </div>
          </div>

          {/* Register CTA */}
          <Link
            to="/register"
            className="flex items-center justify-center w-full h-11 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors"
          >
            Create a new account
          </Link>

          {/* Stats row */}
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-lg font-bold text-primary">12</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Modules
              </p>
            </div>
            <div className="border-x border-border">
              <p className="text-lg font-bold text-primary">3</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Roles
              </p>
            </div>
            <div>
              <p className="text-lg font-bold text-primary">100%</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                VAT-ready
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
