import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  Brain,
  Check,
  Code2,
  Cpu,
  Eye,
  Github,
  Globe,
  Layers,
  Lock,
  Monitor,
  MousePointerClick,
  Search,
  Shield,
  ShieldCheck,
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
    <div className="theta-marketing relative min-h-dvh overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="theta-grid absolute inset-x-0 top-0 h-[44rem] opacity-60" />
        <div className="theta-noise absolute inset-0 opacity-40" />
        <div className="absolute -left-24 top-0 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,_color-mix(in_oklab,var(--primary)_55%,transparent)_0%,transparent_72%)] opacity-70 blur-3xl" />
        <div className="absolute right-[-8rem] top-12 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,_oklch(0.55_0.11_30_/_0.34)_0%,transparent_70%)] blur-3xl" />
      </div>
      <SiteHeader />
      <main className="relative">
        <Hero />
        <LogoCloud />
        <FeatureGrid />
        <OpenClawSection />
        <HowItWorks />
        <IntegrationsSection />
        <InstallSection />
        <OpenSourceSection />
        <CTASection />
      </main>
      <SiteFooter />
    </div>
  );
}

/* ─── Header ─── */

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="theta-glass grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/30">
            <span className="font-serif text-base font-bold">θ</span>
          </div>
          <span className="text-sm font-semibold tracking-tight">
            Theta <span className="font-normal text-muted-foreground">Observability</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-[13px] text-muted-foreground md:flex">
          <Link href="#features" className="transition-colors hover:text-foreground">Features</Link>
          <Link href="#openclaw" className="transition-colors hover:text-foreground">OpenClaw</Link>
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
    <section className="relative overflow-hidden border-b border-border/50">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,color-mix(in_oklab,var(--background)_88%,black)_100%)]" />

      <div className="relative mx-auto grid max-w-6xl gap-14 px-6 pb-20 pt-20 md:pb-24 md:pt-24 lg:grid-cols-[0.98fr_1.02fr] lg:items-center">
        <div className="max-w-2xl">
          <Badge variant="outline" className="theta-pill gap-2 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em]">
            <span className="size-1.5 rounded-full bg-primary" />
            Theta signal
          </Badge>

          <h1 className="mt-6 max-w-4xl text-balance text-5xl font-semibold tracking-[-0.05em] sm:text-6xl md:text-7xl lg:text-[5.35rem]">
            Observe the full
            <span className="block bg-[linear-gradient(118deg,color-mix(in_oklab,var(--foreground)_88%,white)_0%,var(--primary)_38%,oklch(0.88_0.06_95)_100%)] bg-clip-text text-transparent">
              behavior surface
            </span>
            of your agents.
          </h1>

          <p className="mt-6 max-w-xl text-balance text-base leading-7 text-muted-foreground sm:text-lg">
            Theta captures reasoning, screenshots, tool output, audio, video, and browser state in one
            operational canvas so teams can inspect failures with the same fidelity they debug code.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="xl" className="shadow-[0_20px_60px_color-mix(in_oklab,var(--primary)_20%,transparent)]">
              <Link href="/signup">Start tracing <ArrowRight className="size-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="xl" className="border-border/80 bg-card/60">
              <Link href="https://github.com/thetalab/observability" target="_blank" rel="noopener noreferrer">
                <Github className="size-4" /> GitHub
              </Link>
            </Button>
          </div>

          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Open source &middot; Self-hostable &middot; First trace in 5 minutes
          </p>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {[
              { label: "modalities", value: "text + image + audio + video" },
              { label: "debug loop", value: "replay, inspect, annotate" },
              { label: "signal path", value: "sdk, otel, raw ingest" },
            ].map((item) => (
              <div key={item.label} className="theta-glass rounded-2xl border border-border/70 px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-sm font-medium leading-6 text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute -left-8 top-12 hidden rounded-full border border-primary/25 bg-primary/8 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.2em] text-primary shadow-[0_12px_40px_rgba(0,0,0,0.3)] lg:block">
            Live traces
          </div>
          <div className="pointer-events-none absolute -right-4 bottom-8 hidden rounded-full border border-border/70 bg-card/80 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground shadow-[0_12px_40px_rgba(0,0,0,0.28)] lg:block">
            Browser + LLM + Media
          </div>

          <div className="relative rounded-[2rem] border border-border/70 bg-card/70 p-2 shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
            <div className="rounded-[1.65rem] border border-border/60 bg-[#09070a]/80 p-3">
              <div className="flex items-center gap-1.5 px-2 pb-3">
                <div className="size-2.5 rounded-full bg-[#ff7c6d]/70" />
                <div className="size-2.5 rounded-full bg-[#f9d278]/70" />
                <div className="size-2.5 rounded-full bg-[#7ddf99]/70" />
                <span className="ml-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  theta-observability / signal view
                </span>
              </div>
              <div className="overflow-hidden rounded-[1.2rem] border border-white/8 bg-black/20">
                <Image
                  src="/theta-observability-hero.svg"
                  alt="Theta Observability hero artwork showing a dark monitoring console with live traces, browser replay, and multimodal run details."
                  width={1600}
                  height={1200}
                  priority
                  className="h-auto w-full"
                />
              </div>
            </div>
          </div>

          <div className="theta-glass absolute -bottom-5 left-4 right-4 rounded-2xl border border-border/60 px-5 py-4 sm:left-auto sm:right-6 sm:w-72">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">incident sync</span>
              <Badge variant="secondary" className="h-5 rounded-full px-2 text-[9px] uppercase tracking-[0.16em]">
                healthy
              </Badge>
            </div>
            <p className="mt-3 text-sm leading-6 text-foreground">
              Session replay, structured trace events, and assistant reasoning stay aligned on a single
              timeline.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Logo Cloud ─── */

function LogoCloud() {
  return (
    <section className="border-y border-border/50 bg-muted/20">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
          Works with any AI system
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm font-medium text-muted-foreground/50">
          <span>Anthropic</span>
          <span>OpenAI</span>
          <span>LangChain</span>
          <span>OpenTelemetry</span>
          <span>Playwright</span>
          <span>Selenium</span>
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
      desc: "Track text, screenshots, audio, video, and robotics sensor data in one unified timeline. Built for computer-use agents from day one.",
    },
    {
      icon: Monitor, title: "Computer-Use Native", color: "bg-violet-500/10 text-violet-600",
      desc: "Replay desktop sessions frame by frame. See every click, scroll, and keystroke your agent made — synced to the LLM trace.",
    },
    {
      icon: Zap, title: "Incident Detection", color: "bg-amber-500/10 text-amber-600",
      desc: "Auto-group failures, surface root causes with Claude, and resolve incidents before users notice.",
    },
    {
      icon: Search, title: "Semantic Search", color: "bg-emerald-500/10 text-emerald-600",
      desc: "Find any trace with natural language. Search across screenshots, tool calls, and LLM outputs.",
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
            From tracing to evaluation to incident response — one platform, open source.
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

/* ─── OpenClaw ─── */

function OpenClawSection() {
  return (
    <section id="openclaw" className="border-y border-border/50 bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <Badge variant="outline" className="mb-4 gap-1.5">
              <MousePointerClick className="size-3 text-primary" />
              OpenClaw
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              The open standard for{" "}
              <span className="bg-gradient-to-r from-primary to-chart-4 bg-clip-text text-transparent">
                computer-use traces.
              </span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              OpenClaw is an open schema and SDK for capturing what computer-use agents do — every
              click, every screenshot, every DOM mutation, every tool call — in a portable,
              vendor-neutral format.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "Canonical event schema for mouse, keyboard, scroll, and navigation actions",
                "Screenshot artifacts with bounding-box annotations at every step",
                "DOM snapshots and accessibility tree diffs for debugging",
                "Session replay with frame-by-frame scrubbing synced to LLM reasoning",
                "Export to OpenTelemetry, Parquet, or raw JSON — no lock-in",
                "Works with Playwright, Selenium, Puppeteer, and native OS agents",
              ].map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <div className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/10">
                    <Check className="size-3 text-primary" />
                  </div>
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="https://github.com/thetalab/openclaw" target="_blank" rel="noopener noreferrer">
                  <Github className="size-4" /> View OpenClaw on GitHub
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/docs/openclaw">
                  Read the spec <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* OpenClaw trace mock */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-2xl bg-gradient-to-b from-primary/8 to-transparent blur-xl" />
            <div className="relative rounded-xl border border-border/80 bg-card shadow-xl">
              <div className="flex items-center gap-1.5 border-b border-border/50 px-4 py-2.5">
                <div className="size-2.5 rounded-full bg-red-400/60" />
                <div className="size-2.5 rounded-full bg-yellow-400/60" />
                <div className="size-2.5 rounded-full bg-green-400/60" />
                <span className="ml-3 text-[10px] text-muted-foreground/50">openclaw trace — desktop session</span>
              </div>
              <div className="p-4">
                <MockOpenClawTrace />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MockOpenClawTrace() {
  const events = [
    { time: "0.00s", action: "navigate", detail: "shopify.mystore.com/admin/orders", icon: Globe, color: "text-blue-500 bg-blue-500/10" },
    { time: "1.24s", action: "screenshot", detail: "1440x900 — orders list loaded", icon: Monitor, color: "text-violet-500 bg-violet-500/10" },
    { time: "1.82s", action: "click", detail: "Order #1042 — row element", icon: MousePointerClick, color: "text-amber-500 bg-amber-500/10" },
    { time: "2.10s", action: "screenshot", detail: "1440x900 — order detail view", icon: Monitor, color: "text-violet-500 bg-violet-500/10" },
    { time: "2.95s", action: "llm_reason", detail: "\"Customer wants refund. Clicking refund button.\"", icon: Brain, color: "text-primary bg-primary/10" },
    { time: "3.40s", action: "click", detail: "Refund button — top right", icon: MousePointerClick, color: "text-amber-500 bg-amber-500/10" },
    { time: "4.12s", action: "type", detail: "Refund reason: \"Customer request\"", icon: Terminal, color: "text-emerald-500 bg-emerald-500/10" },
    { time: "5.80s", action: "verify", detail: "Refund processed — $42.99 returned", icon: ShieldCheck, color: "text-green-500 bg-green-500/10" },
  ];

  return (
    <div className="space-y-1.5">
      {events.map((e) => (
        <div key={e.time} className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/40">
          <span className="w-10 shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground">{e.time}</span>
          <div className={`grid size-6 shrink-0 place-items-center rounded-md ${e.color}`}>
            <e.icon className="size-3.5" />
          </div>
          <span className="text-[11px] font-semibold">{e.action}</span>
          <span className="truncate text-[11px] text-muted-foreground">{e.detail}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── How it works ─── */

function HowItWorks() {
  const steps = [
    { n: "01", title: "Install the SDK", desc: "pip install or npm install. Two lines of code to start tracing.", icon: Terminal },
    { n: "02", title: "Wrap your agent", desc: "Use wrapAgent() to auto-trace every LLM call, tool use, and screenshot.", icon: Code2 },
    { n: "03", title: "See everything", desc: "Traces appear in real-time. Filter, search, replay desktop sessions, drill into every step.", icon: Eye },
    { n: "04", title: "Ship with confidence", desc: "Automated evals, monitors, and incident detection. Catch regressions before users do.", icon: ShieldCheck },
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
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Integrations ─── */

function IntegrationsSection() {
  const integrations = [
    { name: "Python SDK", desc: "pip install theta-observability", tag: "SDK" },
    { name: "Node.js SDK", desc: "npm i @theta/observability", tag: "SDK" },
    { name: "LangChain", desc: "Drop-in callback handler", tag: "Framework" },
    { name: "OpenTelemetry", desc: "OTLP export and ingest", tag: "Protocol" },
    { name: "Raw HTTP", desc: "POST JSON to /v1/traces", tag: "API" },
    { name: "MCP Server", desc: "IDE and agent tooling", tag: "Protocol" },
  ];
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4">Integrations</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Instrument anything. No vendor lock-in.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            SDKs, framework integrations, and raw HTTP ingest. Use what fits your stack.
          </p>
        </div>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {integrations.map((i) => (
            <div key={i.name} className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-sm">
              <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/8">
                <Code2 className="size-5 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{i.name}</span>
                  <Badge variant="secondary" className="text-[9px]">{i.tag}</Badge>
                </div>
                <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">{i.desc}</p>
              </div>
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
    <section className="border-y border-border/50 bg-muted/10">
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
                "Capture screenshots and DOM snapshots automatically",
                "Replay computer-use sessions with synced video",
                "OTel GenAI-aligned schema — OSS, Apache 2.0",
                "Export to Parquet, OTLP, or raw JSON anytime",
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

/* ─── Open Source ─── */

function OpenSourceSection() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 grid size-16 place-items-center rounded-2xl bg-primary/8">
            <Github className="size-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Open source. Self-host anywhere.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Theta Observability is open source under Apache 2.0. Run it on your own infrastructure,
            audit the code, and own your data. No telemetry, no lock-in.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "License", value: "Apache 2.0" },
              { label: "Self-host", value: "Docker / K8s" },
              { label: "Data export", value: "OTLP / Parquet" },
              { label: "Telemetry", value: "None" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</p>
                <p className="mt-1 text-sm font-semibold">{s.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="https://github.com/thetalab/observability" target="_blank" rel="noopener noreferrer">
                <Github className="size-4" /> View on GitHub
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/docs/self-hosting">
                Self-hosting guide <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ─── */

function CTASection() {
  return (
    <section className="border-t border-border/50 bg-primary/[0.03]">
      <div className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Start seeing what your agents actually do.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          Free to start. Open source forever. Self-host or use our managed cloud.
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
          <span className="flex items-center gap-1.5"><Github className="size-3.5" /> Apache 2.0</span>
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
            Open-source observability for AI agents, computer-use workflows, and LLM pipelines.
          </p>
        </div>
        <FooterCol title="Product" links={[["Features", "#features"], ["OpenClaw", "#openclaw"], ["Pricing", "/pricing"], ["Changelog", "/docs"]]} />
        <FooterCol title="Resources" links={[["Documentation", "/docs"], ["Python SDK", "/docs/python"], ["Node SDK", "/docs/node"], ["API Reference", "/docs/api"], ["OpenClaw Spec", "/docs/openclaw"]]} />
        <FooterCol title="Company" links={[["About", "/about"], ["GitHub", "https://github.com/thetalab/observability"], ["Privacy", "/privacy"], ["Terms", "/terms"]]} />
      </div>
      <Separator />
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-xs text-muted-foreground">
        <span>&copy; {new Date().getFullYear()} Theta Labs</span>
        <Link href="https://github.com/thetalab/observability" className="flex items-center gap-1.5 transition-colors hover:text-foreground">
          <Github className="size-3.5" /> Open source &middot; Apache 2.0
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
