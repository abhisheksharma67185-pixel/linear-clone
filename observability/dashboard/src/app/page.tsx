import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  Brain,
  Check,
  Code2,
  Cpu,
  Github,
  Layers,
  Lock,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { InstallSnippet } from "@/components/install-snippet";
import { auth } from "@/lib/auth";
import { listOrgsForUser, listProjectsForOrg } from "@/lib/workspace";
import { redirect } from "next/navigation";

export default async function MarketingHome() {
  const session = await auth().catch(() => null);
  if (session?.user?.id) {
    const orgs = await listOrgsForUser(session.user.id);
    if (orgs.length) {
      const projects = await listProjectsForOrg(orgs[0].id);
      if (projects.length) {
        redirect(`/${orgs[0].slug}/${projects[0].slug}/traces`);
      } else {
        redirect(`/${orgs[0].slug}`);
      }
    }
  }
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader />
      <main>
        <Hero />
        <LogoCloud />
        <FeatureGrid />
        <HowItWorks />
        <InstallSection />
        <CTASection />
      </main>
      <SiteFooter />
    </div>
  );
}

/* ─── Header ─── */

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/25">
            <span className="font-serif text-base font-bold">θ</span>
          </div>
          <span className="text-sm font-semibold tracking-tight">
            Theta <span className="font-normal text-muted-foreground">Observability</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-[13px] text-muted-foreground md:flex">
          <Link href="#features" className="transition-colors hover:text-foreground">Features</Link>
          <Link href="#how-it-works" className="transition-colors hover:text-foreground">How it works</Link>
          <Link href="/pricing" className="transition-colors hover:text-foreground">Pricing</Link>
          <Link href="/docs" className="transition-colors hover:text-foreground">Docs</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/signup">Get Started <ArrowRight className="size-3.5" /></Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

/* ─── Hero ─── */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent" />
      <div className="absolute left-1/2 top-0 -z-10 size-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.04] blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-20 md:pb-28 md:pt-28">
        <div className="flex flex-col items-center text-center">
          <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs font-normal">
            <Sparkles className="size-3 text-primary" />
            Now with Claude-powered incident detection
          </Badge>

          <h1 className="mt-6 max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            AI Agent Reliability,{" "}
            <span className="bg-gradient-to-r from-primary via-primary to-chart-4 bg-clip-text text-transparent">
              Observed.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">
            Monitor, debug, and improve your AI agents in production. Trace every
            interaction across text, image, audio, video, and robotics — with
            automated evaluations and incident detection.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="xl" className="shadow-lg shadow-primary/20">
              <Link href="/signup">Get Started Free <ArrowRight className="size-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="xl">
              <Link href="/docs">
                <Terminal className="size-4" /> View Documentation
              </Link>
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            No credit card required · Self-host under Apache 2.0 · SOC 2 Type II
          </p>
        </div>

        {/* Product screenshot */}
        <div className="relative mx-auto mt-16 max-w-5xl">
          <div className="absolute -inset-4 rounded-2xl bg-gradient-to-b from-primary/10 to-transparent blur-xl" />
          <div className="relative rounded-xl border border-border/80 bg-card shadow-2xl shadow-primary/5">
            <div className="flex items-center gap-1.5 border-b border-border/50 px-4 py-2.5">
              <div className="size-2.5 rounded-full bg-red-400/60" />
              <div className="size-2.5 rounded-full bg-yellow-400/60" />
              <div className="size-2.5 rounded-full bg-green-400/60" />
              <span className="ml-3 text-[10px] text-muted-foreground/50">theta-observability — Live Traces</span>
            </div>
            <div className="p-1.5">
              <MockTracePreview />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MockTracePreview() {
  return (
    <div className="grid h-[340px] grid-cols-[200px_1fr] overflow-hidden rounded-lg border border-border/40 bg-background text-xs">
      <div className="border-r border-border/40 bg-muted/20 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Steps · 5</p>
        <ol className="mt-4 space-y-1.5">
          {[
            { n: 1, label: "plan", type: "llm", ms: 820, color: "bg-primary/15 text-primary" },
            { n: 2, label: "browser.click", type: "tool", ms: 140, color: "bg-chart-3/15 text-chart-3" },
            { n: 3, label: "screenshot", type: "tool", ms: 80, color: "bg-chart-3/15 text-chart-3" },
            { n: 4, label: "retrieve", type: "retrieval", ms: 320, color: "bg-chart-2/15 text-chart-2" },
            { n: 5, label: "arm.pick", type: "robotics", ms: 6130, color: "bg-chart-4/15 text-chart-4" },
          ].map((s) => (
            <li key={s.n} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/40">
              <span className={`grid size-5 place-items-center rounded-md text-[9px] font-bold ${s.color}`}>
                {s.n}
              </span>
              <span className="flex-1 truncate text-[11px] font-medium">{s.label}</span>
              <span className="text-[10px] tabular-nums text-muted-foreground">{s.ms}ms</span>
            </li>
          ))}
        </ol>
        <div className="mt-4 space-y-1">
          <div className="h-1.5 w-[60%] rounded-full bg-primary/30" />
          <div className="h-1.5 w-[10%] rounded-full bg-chart-3/30" />
          <div className="h-1.5 w-[5%] rounded-full bg-chart-3/30" />
          <div className="h-1.5 w-[25%] rounded-full bg-chart-2/30" />
          <div className="h-1.5 w-full rounded-full bg-chart-4/30" />
        </div>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2.5 border-b border-border/40 px-5 py-3">
          <Badge variant="success" className="text-[10px]">success</Badge>
          <span className="text-[12px] font-semibold">checkout-agent</span>
          <span className="font-mono text-[9px] text-muted-foreground/50">tr_01HW9...</span>
          <div className="ml-auto flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="tabular-nums font-medium text-foreground">7.41s</span>
            <span className="tabular-nums">2,232 tok</span>
            <span className="tabular-nums">$0.013</span>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-3 overflow-hidden p-5">
          <div className="rounded-lg border border-primary/20 bg-primary/[0.03] p-3">
            <div className="flex items-center gap-1.5">
              <div className="size-4 rounded-full bg-primary/15 grid place-items-center"><Brain className="size-2.5 text-primary" /></div>
              <span className="text-[10px] font-semibold text-primary">Step 1 · plan</span>
              <Badge variant="ghost" className="ml-auto h-4 text-[8px]">claude-sonnet-4-6</Badge>
            </div>
          </div>
          <div className="rounded-lg border border-border/60 bg-card p-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">user</p>
            <p className="mt-1 text-[12px] leading-relaxed">Buy a gallon of whole milk, cheapest option.</p>
          </div>
          <div className="rounded-lg border border-border/60 bg-card p-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">assistant</p>
            <p className="mt-1 text-[12px] leading-relaxed">Opening the Instacart homepage and searching for milk...</p>
          </div>
          <div className="mt-auto flex items-center gap-2">
            <div className="h-6 w-16 rounded-md bg-muted/40" />
            <div className="h-6 w-12 rounded-md bg-muted/40" />
            <div className="h-6 w-20 rounded-md bg-muted/40" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Logo Cloud ─── */

function LogoCloud() {
  return (
    <section className="border-y border-border/50 bg-muted/20">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
          Works with any LLM provider
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm font-medium text-muted-foreground/50">
          <span>Anthropic</span>
          <span>OpenAI</span>
          <span>Google DeepMind</span>
          <span>Meta Llama</span>
          <span>Mistral</span>
          <span>Cohere</span>
        </div>
      </div>
    </section>
  );
}

/* ─── Features ─── */

function FeatureGrid() {
  const features = [
    {
      icon: Layers, title: "Multimodal Traces", color: "bg-blue-500/10 text-blue-600",
      desc: "Track text, images, audio, video, and robotics sensor data in one unified timeline view.",
    },
    {
      icon: Sparkles, title: "Automated Evaluations", color: "bg-violet-500/10 text-violet-600",
      desc: "Define metrics like task adherence and user satisfaction. Get pass/fail on every trace automatically.",
    },
    {
      icon: Zap, title: "Incident Detection", color: "bg-amber-500/10 text-amber-600",
      desc: "Auto-group failures, surface root causes with Claude, and resolve incidents before users complain.",
    },
    {
      icon: Search, title: "Semantic Search", color: "bg-emerald-500/10 text-emerald-600",
      desc: "Find traces with natural language queries. No query language to learn.",
    },
    {
      icon: Boxes, title: "Cluster Discovery", color: "bg-rose-500/10 text-rose-600",
      desc: "Unsupervised pattern detection surfaces failure modes you didn't know to look for.",
    },
    {
      icon: Code2, title: "Two-Line SDK", color: "bg-cyan-500/10 text-cyan-600",
      desc: "Python and Node.js SDKs. wrapAgent() and you're done. First trace in under 5 minutes.",
    },
  ];
  return (
    <section id="features" className="bg-background">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4">Features</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to ship reliable agents
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From tracing to evaluation to incident response — one platform.
          </p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <Card key={title} className="group transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5">
              <CardHeader className="pb-3">
                <div className={`inline-flex size-11 items-center justify-center rounded-xl ${color}`}>
                  <Icon className="size-5" />
                </div>
                <CardTitle className="mt-3 text-base">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">{desc}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How it works ─── */

function HowItWorks() {
  const steps = [
    { n: "01", title: "Install the SDK", desc: "pip install or npm install. Two lines of code to start tracing.", icon: Terminal },
    { n: "02", title: "Wrap your agent", desc: "Use wrapAgent() to auto-trace every call. Returns a runId for feedback linking.", icon: Code2 },
    { n: "03", title: "See everything", desc: "Traces appear in real-time. Filter, search, and drill into every step.", icon: Search },
    { n: "04", title: "Ship with confidence", desc: "Automated evals catch regressions. Incidents surface before users complain.", icon: ShieldCheck },
  ];
  return (
    <section id="how-it-works" className="border-y border-border/50 bg-muted/10">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4">How it works</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            From zero to observability in 5 minutes
          </h2>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ n, title, desc, icon: Icon }) => (
            <div key={n} className="relative">
              <div className="mb-4 flex items-center gap-3">
                <span className="text-3xl font-bold text-primary/20">{n}</span>
                <div className="grid size-10 place-items-center rounded-xl bg-primary/8">
                  <Icon className="size-5 text-primary" />
                </div>
              </div>
              <h3 className="text-sm font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Install snippet ─── */

function InstallSection() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <Badge variant="outline" className="mb-4">Developer experience</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              One import. First trace in under 5 minutes.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Instrument any Python or Node.js agent with a context manager.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "First-class OpenAI, Anthropic, and Bedrock integrations",
                "Streams media directly to GCS/S3 via signed URLs",
                "Replay robotics sensor frames with synced video",
                "OTel GenAI-aligned schema, OSS, Apache 2.0",
              ].map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <div className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-success/10">
                    <Check className="size-3 text-success" />
                  </div>
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <InstallSnippet />
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ─── */

function CTASection() {
  return (
    <section className="bg-primary/[0.03]">
      <div className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Start tracing your agents today
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          Free to start. No credit card required. Self-host or use our hosted plan.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="xl" className="shadow-lg shadow-primary/20">
            <Link href="/signup">Get Started Free <ArrowRight className="size-4" /></Link>
          </Button>
          <Button asChild variant="outline" size="xl">
            <Link href="/docs/self-hosting">Self-hosting guide</Link>
          </Button>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><ShieldCheck className="size-3.5" /> SOC 2 Type II</span>
          <span className="flex items-center gap-1.5"><Lock className="size-3.5" /> AES-256</span>
          <span className="flex items-center gap-1.5"><Shield className="size-3.5" /> TLS 1.2+</span>
          <span className="flex items-center gap-1.5"><Cpu className="size-3.5" /> Self-hostable</span>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */

function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <div className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground">
              <span className="font-serif text-sm font-bold">θ</span>
            </div>
            <span className="text-sm font-semibold">Theta Observability</span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Multimodal trace platform for AI agents. Self-host or use our hosted plan.
          </p>
        </div>
        <FooterCol title="Product" links={[["Features", "#features"], ["Pricing", "/pricing"], ["Changelog", "/docs"]]} />
        <FooterCol title="Resources" links={[["Documentation", "/docs"], ["Python SDK", "/docs/python"], ["Node SDK", "/docs/node"], ["API Reference", "/docs/api"]]} />
        <FooterCol title="Company" links={[["About", "/about"], ["Privacy", "/privacy"], ["Terms", "/terms"]]} />
      </div>
      <Separator />
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-xs text-muted-foreground">
        <span>&copy; {new Date().getFullYear()} Theta Labs</span>
        <Link href="https://github.com" className="flex items-center gap-1.5 transition-colors hover:text-foreground">
          <Github className="size-3.5" /> Open source
        </Link>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="text-muted-foreground transition-colors hover:text-foreground">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
