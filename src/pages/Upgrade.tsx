import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Check, Sparkles, Zap, Crown, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type BillingCycle = "monthly" | "yearly";

interface Plan {
  id: string;
  name: string;
  tagline: string;
  price: number;
  yearlyPrice: number;
  icon: typeof Sparkles;
  accent: string;
  highlight?: boolean;
  badge?: string;
  features: string[];
  notIncluded?: string[];
  cta: string;
}

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For curious minds getting started",
    price: 10,
    yearlyPrice: 8,
    icon: Sparkles,
    accent: "text-blue-400",
    features: [
      "100 messages per day",
      "Access to Sonnet 4.6 model",
      "Standard response speed",
      "Up to 5 active projects",
      "Basic file uploads (10 MB)",
      "Web search integration",
      "Email support",
    ],
    notIncluded: [
      "Advanced reasoning models",
      "Priority queue access",
      "API access",
    ],
    cta: "Start with Starter",
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For builders who do more",
    price: 20,
    yearlyPrice: 16,
    icon: Zap,
    accent: "text-primary",
    highlight: true,
    badge: "Most Popular",
    features: [
      "Unlimited daily messages",
      "All models incl. Opus 4.6",
      "5x faster priority responses",
      "Unlimited projects & artifacts",
      "Advanced file uploads (100 MB)",
      "Code interpreter & analysis",
      "Computer use (beta)",
      "Custom system prompts",
      "Priority email + chat support",
    ],
    notIncluded: ["Dedicated account manager", "Custom integrations"],
    cta: "Upgrade to Pro",
  },
  {
    id: "max",
    name: "Max",
    tagline: "For power users & small teams",
    price: 50,
    yearlyPrice: 40,
    icon: Crown,
    accent: "text-amber-400",
    badge: "Best Value",
    features: [
      "Everything in Pro, plus:",
      "20x usage limits vs Pro",
      "Early access to new models",
      "Extended context (1M tokens)",
      "API access with 1M tokens/mo",
      "Team workspaces (up to 5 seats)",
      "SSO & advanced security",
      "Custom branding options",
      "Dedicated success manager",
      "24/7 priority phone support",
    ],
    cta: "Go Max",
  },
];

const COMPARE = [
  { label: "Daily messages", values: ["100", "Unlimited", "Unlimited"] },
  { label: "Model access", values: ["Sonnet 4.6", "All models", "All + early access"] },
  { label: "Response speed", values: ["Standard", "5x priority", "10x priority"] },
  { label: "File upload size", values: ["10 MB", "100 MB", "1 GB"] },
  { label: "Projects", values: ["5", "Unlimited", "Unlimited"] },
  { label: "API access", values: ["—", "—", "1M tokens/mo"] },
  { label: "Team seats", values: ["1", "1", "Up to 5"] },
  { label: "Support", values: ["Email", "Priority chat", "24/7 phone"] },
];

const FAQ = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. You can cancel or change your plan at any time from Settings → Billing. You'll keep access until the end of your current billing period.",
  },
  {
    q: "What happens if I exceed my limits?",
    a: "On Starter, you'll be prompted to upgrade once you hit your daily cap. Pro and Max plans have soft limits — we'll notify you well before any throttling kicks in.",
  },
  {
    q: "Do you offer refunds?",
    a: "We offer a 7-day money-back guarantee on all paid plans, no questions asked.",
  },
  {
    q: "Can I switch plans later?",
    a: "Absolutely. Upgrades are prorated and take effect immediately. Downgrades apply at the next billing cycle.",
  },
];

export default function Upgrade() {
  const navigate = useNavigate();
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <span className="text-sm font-medium tracking-tight">Research AI · Plans</span>
          <button
            onClick={() => navigate("/")}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-secondary/50 text-xs text-muted-foreground mb-6">
          <Sparkles className="h-3 w-3 text-primary" />
          Limited launch pricing — save up to 20% yearly
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4 font-sans-display">
          Choose the plan that <span className="text-primary">fits your work</span>
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-8">
          Unlock more messages, faster responses, and the most capable models. Cancel or change plans anytime.
        </p>

        {/* Billing toggle */}
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-border bg-secondary/30">
          <span className={cn("text-sm transition-colors", cycle === "monthly" ? "text-foreground" : "text-muted-foreground")}>
            Monthly
          </span>
          <Switch
            checked={cycle === "yearly"}
            onCheckedChange={(c) => setCycle(c ? "yearly" : "monthly")}
          />
          <span className={cn("text-sm transition-colors flex items-center gap-2", cycle === "yearly" ? "text-foreground" : "text-muted-foreground")}>
            Yearly
            <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
              -20%
            </span>
          </span>
        </div>
      </section>

      {/* Plans */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const displayPrice = cycle === "yearly" ? plan.yearlyPrice : plan.price;
            return (
              <div
                key={plan.id}
                className={cn(
                  "relative rounded-2xl border p-7 flex flex-col transition-all",
                  plan.highlight
                    ? "border-primary/50 bg-gradient-to-b from-primary/5 to-transparent shadow-[0_0_60px_-15px_hsl(var(--primary)/0.4)]"
                    : "border-border bg-card hover:border-border/80"
                )}
              >
                {plan.badge && (
                  <div className={cn(
                    "absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide",
                    plan.highlight
                      ? "bg-primary text-primary-foreground"
                      : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                  )}>
                    {plan.badge}
                  </div>
                )}

                <div className="flex items-center gap-2 mb-1">
                  <Icon className={cn("h-5 w-5", plan.accent)} />
                  <h3 className="text-lg font-semibold tracking-tight">{plan.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">{plan.tagline}</p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-semibold tracking-tight">${displayPrice}</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                  {cycle === "yearly" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Billed ${displayPrice * 12} yearly · save ${(plan.price - plan.yearlyPrice) * 12}
                    </p>
                  )}
                </div>

                <Button
                  className={cn(
                    "w-full mb-6",
                    plan.highlight ? "bg-primary hover:bg-primary/90" : ""
                  )}
                  variant={plan.highlight ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>

                <div className="space-y-3 flex-1">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className={cn("h-4 w-4 shrink-0 mt-0.5", plan.accent)} />
                      <span className="text-foreground/90">{f}</span>
                    </div>
                  ))}
                  {plan.notIncluded?.map((f) => (
                    <div key={f} className="flex items-start gap-2.5 text-sm">
                      <X className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground/50" />
                      <span className="text-muted-foreground/60 line-through">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust row */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> 7-day money-back guarantee</span>
          <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> Cancel anytime</span>
          <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> Secure payments by Stripe</span>
          <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> SOC 2 Type II compliant</span>
        </div>
      </section>

      {/* Comparison */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-semibold tracking-tight mb-2 text-center">Compare features</h2>
        <p className="text-sm text-muted-foreground text-center mb-10">A side-by-side look at what's included.</p>

        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-4 px-6 py-4 border-b border-border bg-secondary/30 text-sm font-medium">
            <div className="text-muted-foreground">Feature</div>
            <div>Starter</div>
            <div className="text-primary">Pro</div>
            <div>Max</div>
          </div>
          {COMPARE.map((row, i) => (
            <div
              key={row.label}
              className={cn(
                "grid grid-cols-4 px-6 py-4 text-sm",
                i !== COMPARE.length - 1 && "border-b border-border/50"
              )}
            >
              <div className="text-muted-foreground">{row.label}</div>
              {row.values.map((v, vi) => (
                <div key={vi} className={cn(vi === 1 && "text-primary font-medium")}>{v}</div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-semibold tracking-tight mb-2 text-center">Frequently asked</h2>
        <p className="text-sm text-muted-foreground text-center mb-10">Everything you need to know before upgrading.</p>

        <div className="space-y-3">
          {FAQ.map((item, i) => (
            <div
              key={item.q}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-secondary/30 transition-colors"
              >
                <span className="text-sm font-medium">{item.q}</span>
                <span className={cn(
                  "text-muted-foreground transition-transform",
                  openFaq === i && "rotate-45"
                )}>
                  +
                </span>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA footer */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-10 text-center">
          <h3 className="text-2xl font-semibold tracking-tight mb-3">Need something custom?</h3>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-6">
            Larger team, on-prem deployment, or custom SLAs? We work with organizations of every size.
          </p>
          <Button variant="outline">Talk to sales</Button>
        </div>
      </section>
    </div>
  );
}
