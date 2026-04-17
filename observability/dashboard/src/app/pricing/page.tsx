import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const tiers = [
  {
    name: "Free",
    price: "$0",
    note: "Forever",
    desc: "For solo devs and hobby agents.",
    cta: "Start free",
    href: "/signup",
    features: [
      "50k traces / month",
      "5 GB media storage",
      "7-day retention",
      "Community support",
    ],
  },
  {
    name: "Pro",
    price: "$49",
    note: "/ project / month",
    desc: "For production agents at startups.",
    cta: "Start 14-day trial",
    href: "/signup?plan=pro",
    highlight: true,
    features: [
      "1M traces / month",
      "200 GB media storage",
      "90-day retention",
      "Role-based access",
      "Slack & email alerts",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    note: "Annual",
    desc: "SSO, self-host, invoicing, DPA.",
    cta: "Talk to sales",
    href: "mailto:sales@theta.dev",
    features: [
      "Unlimited traces & media",
      "Custom retention",
      "SSO (SAML, OIDC)",
      "On-prem / VPC deployment",
      "99.99% SLA",
      "Dedicated support",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="text-sm font-semibold">Theta Observability</Link>
          <Button asChild size="sm"><Link href="/signup">Start free</Link></Button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-3">Pricing</Badge>
          <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            Simple pricing, generous free tier
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            All plans include multimodal capture, SDKs, and OpenAPI access.
          </p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={cn(
                "flex flex-col rounded-xl border border-border bg-card p-6",
                t.highlight && "border-primary/50 bg-primary/5"
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">{t.name}</h3>
                {t.highlight && <Badge>Most popular</Badge>}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{t.desc}</p>
              <p className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-semibold">{t.price}</span>
                <span className="text-xs text-muted-foreground">{t.note}</span>
              </p>
              <Button asChild className="mt-4" variant={t.highlight ? "default" : "outline"}>
                <Link href={t.href}>{t.cta}</Link>
              </Button>
              <ul className="mt-5 space-y-2 text-xs text-muted-foreground">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-3 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
