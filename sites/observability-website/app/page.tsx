import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  Binary,
  Bot,
  Braces,
  Camera,
  ChartNoAxesCombined,
  Eye,
  ShieldCheck,
  Waypoints,
} from "lucide-react";

const heroSignals = [
  "LLM responses, chain boundaries, and tool spans",
  "Browser screenshots, clicks, and UI drift",
  "Evaluations, incidents, and regression clusters",
  "Self-hosted review for operators and platform teams",
];

const metrics = [
  { value: "1 schema", label: "for traces, screenshots, tool calls, and eval signals" },
  { value: "Live replay", label: "for browser and multimodal runs that need visual context" },
  { value: "Searchable", label: "from raw event streams to operator-ready incident review" },
  { value: "Self-hosted", label: "for teams that need observability without losing data ownership" },
];

const layers = [
  {
    label: "01 / Capture",
    title: "Instrument the runtime once",
    body: "Send SDK spans, raw events, browser artifacts, and evaluation metadata through one ingest path that survives model and framework changes.",
    icon: Bot,
  },
  {
    label: "02 / Normalize",
    title: "Resolve every signal into one run record",
    body: "Theta aligns text completions, screenshots, tool activity, and policy events into a shared timeline instead of scattering context across logs.",
    icon: Binary,
  },
  {
    label: "03 / Operate",
    title: "Move from trace inspection to incident action",
    body: "Operators can search failures, compare runs, review multimodal evidence, and understand regressions without rebuilding the story by hand.",
    icon: Eye,
  },
];

const surfaces = [
  {
    title: "Run replay",
    body: "Inspect the exact sequence of model output, tool activity, browser state, and user-visible evidence on one surface.",
    icon: Camera,
  },
  {
    title: "Reliability views",
    body: "Track regressions across experiments, model switches, and deployment changes before they harden into user-facing incidents.",
    icon: ChartNoAxesCombined,
  },
  {
    title: "Search and routing",
    body: "Start with intent-level search, pivot into exact runs, then hand the same context to evaluation or incident workflows.",
    icon: Waypoints,
  },
  {
    title: "Controls",
    body: "Keep data ownership, exportability, and review discipline while still giving operators a clean investigative workflow.",
    icon: ShieldCheck,
  },
];

const runtimeRows = [
  "Trace ingestion / active",
  "Screenshot attachments / retained",
  "Tool spans / indexed",
  "Evaluation drift / visible",
  "Incident review / operator-ready",
];

const stackItems = [
  "Python and Node SDKs",
  "OpenTelemetry aligned event streams",
  "Playwright and browser-use sessions",
  "Raw HTTP ingest for custom runtimes",
  "MCP server instrumentation",
  "JSON and Parquet export paths",
];

const pythonExample = `from theta_observability import trace

with trace(name="checkout-agent") as run:
    run.event("browser.open", url="/cart")
    run.event("browser.click", target="buy-button")
    run.attachment("screenshot", "./theta.png")
    run.metric("task_success", 1.0)`;

const nodeExample = `import { trace } from "@theta/observability";

await trace("research-agent", async (run) => {
  await run.event("llm.response", { model: "gpt-5.4" });
  await run.event("tool.call", { name: "browser.snapshot" });
  await run.metric("latency.bucket", "p95");
});`;

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader />
      <main>
        <Hero />
        <SignalBand />

        <Section
          id="layers"
          eyebrow="Observability layer"
          title="One operating model for agents that touch more than text."
          intro="Theta brings traces, screenshots, tool activity, and evaluation context into one operating model for agent teams running production systems."
        >
          <div className="grid gap-4 md:grid-cols-3">
            {layers.map(({ label, title, body, icon: Icon }) => (
              <article key={title} className="tech-card">
                <div className="flex items-center justify-between gap-4">
                  <p className="tech-index">{label}</p>
                  <Icon className="size-4 text-[var(--brand)]" />
                </div>
                <h3 className="tech-title">{title}</h3>
                <p className="tech-copy">{body}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section
          id="surfaces"
          eyebrow="Operator surfaces"
          title="From raw run data to decisions operators can defend."
          intro="Theta is positioned as an observability layer, not a trace graveyard. The important shift is from seeing events to understanding what happened, why it happened, and what to do next."
        >
          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="grid gap-4 sm:grid-cols-2">
              {surfaces.map(({ title, body, icon: Icon }) => (
                <article key={title} className="tech-card">
                  <Icon className="size-4 text-[var(--brand)]" />
                  <h3 className="tech-title">{title}</h3>
                  <p className="tech-copy">{body}</p>
                </article>
              ))}
            </div>

            <aside className="theta-frame p-6">
              <div className="flex items-start justify-between gap-5 border-b border-border pb-5">
                <div>
                  <p className="mono-label">Runtime state</p>
                  <h3 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-foreground">
                    Operator review stays attached to the source evidence.
                  </h3>
                </div>
                <Activity className="mt-1 size-4 text-[var(--brand)]" />
              </div>

              <div className="mt-4">
                {runtimeRows.map((item) => (
                  <div key={item} className="runtime-row">
                    <span>{item.split(" / ")[0]}</span>
                    <span className="runtime-state">{item.split(" / ")[1]}</span>
                  </div>
                ))}
              </div>

              <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground">
                Multimodal runs need more than token logs. The operator surface is built to retain screenshots,
                browser transitions, tool spans, and evaluation results in the same review loop.
              </p>
            </aside>
          </div>
        </Section>

        <Section
          id="stack"
          eyebrow="Integration path"
          title="Attach Theta to the stack you already run."
          intro="The landing page keeps the integration story concrete: standard SDK entry points, browser instrumentation, and export paths for teams that need observability without surrendering control of the data plane."
        >
          <div className="stack-layout">
            <div className="theta-frame p-6">
              <p className="mono-label">Signal sources</p>
              <div className="stack-list mt-5">
                {stackItems.map((item) => (
                  <div key={item} className="stack-item">
                    <span>{item}</span>
                    <ArrowRight className="size-4 text-[var(--brand)]" />
                  </div>
                ))}
              </div>
            </div>

            <div className="code-grid">
              <CodePanel title="Python" code={pythonExample} />
              <CodePanel title="Node" code={nodeExample} />
            </div>
          </div>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/82 backdrop-blur-xl">
      <div className="page-shell flex items-center justify-between gap-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid size-10 place-items-center border border-border bg-white text-sm font-semibold">
            T
          </div>
          <div>
            <p className="theta-wordmark">
              <span>theta</span> <span>labs</span>
            </p>
            <p className="mono-label mt-1">observability layer</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <Link href="#layers" className="nav-link">
            Layers
          </Link>
          <Link href="#surfaces" className="nav-link">
            Surfaces
          </Link>
          <Link href="#stack" className="nav-link">
            Stack
          </Link>
        </nav>

        <Link
          href="https://cal.com/theta/30min"
          target="_blank"
          rel="noreferrer"
          className="theta-button theta-button-primary"
        >
          Book a Call
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="screen-line-after">
      <div className="page-shell section-pad pt-12 md:pt-20">
        <div className="narrow-shell">
          <p className="eyebrow">theta labs / observability layer</p>
          <h1 className="section-heading mt-6">
            Observe every agent step before it becomes a production issue.
          </h1>
          <p className="section-copy mt-6">
            Theta gives multimodal systems one operational layer for traces, screenshots, tool execution,
            evaluation drift, and incident review so operators can see what happened, why it happened, and
            where reliability breaks down.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="https://cal.com/theta/30min"
              target="_blank"
              rel="noreferrer"
              className="theta-button theta-button-primary"
            >
              Book a Call
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        <div className="mt-10 metric-strip">
          {metrics.map(({ value, label }) => (
            <div key={label} className="metric-card">
              <div className="metric-value">{value}</div>
              <div className="metric-label">{label}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 theta-frame overflow-hidden">
          <div className="frame-header">
            <div className="signal-dots">
              <span className="signal-dot" />
              <span className="signal-dot signal-dot-brand" />
              <span className="signal-dot" />
            </div>
            <span>Software preview / theta.png</span>
          </div>
          <div className="p-3 sm:p-4">
            <Image
              src="/theta.png"
              alt="Theta observability dashboard showing a traced agent run, metadata, and review tools."
              width={3002}
              height={1728}
              priority
              sizes="(max-width: 1200px) 100vw, 1120px"
              className="hero-image"
            />
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Review live runs, browser evidence, metadata, and tool activity from a single operator surface.
            </p>
          </div>
        </div>

        <div className="pill-row mt-6">
          {heroSignals.map((item) => (
            <div key={item} className="signal-pill">
              <Braces className="size-4 text-[var(--brand)]" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SignalBand() {
  return (
    <section className="band">
      <div className="page-shell band-track">
        <p className="band-label">stack coverage</p>
        <div className="band-items">
          <span>OpenAI</span>
          <span>Anthropic</span>
          <span>Playwright</span>
          <span>Browser-use</span>
          <span>OpenTelemetry</span>
          <span>MCP</span>
        </div>
      </div>
    </section>
  );
}

function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="section-pad screen-line-after">
      <div className="page-shell">
        <div className="max-w-4xl">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="subheading mt-5">{title}</h2>
          <p className="section-copy mt-5">{intro}</p>
        </div>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

function CodePanel({ title, code }: { title: string; code: string }) {
  return (
    <article className="code-panel">
      <div className="code-head">
        <span>{title}</span>
        <span>instrumentation</span>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </article>
  );
}

function SiteFooter() {
  return (
    <footer className="screen-line-before bg-background">
      <div className="page-shell footer-shell">
        <div className="footer-top">
          <div className="max-w-2xl">
            <p className="theta-wordmark">
              <span>theta</span> <span>labs</span>
            </p>
            <p className="mono-label mt-2">observability layer</p>
            <p className="section-copy mt-5 max-w-xl">
              Built for teams that need one clear operating layer across traces, tool execution, browser
              evidence, and multimodal run review.
            </p>
          </div>

          <div className="footer-links">
            <Link href="#layers" className="nav-link">
              Layers
            </Link>
            <Link href="#surfaces" className="nav-link">
              Surfaces
            </Link>
            <Link href="#stack" className="nav-link">
              Stack
            </Link>
            <Link
              href="https://cal.com/theta/30min"
              target="_blank"
              rel="noreferrer"
              className="theta-button theta-button-primary"
            >
              Book a Call
            </Link>
          </div>
        </div>

        <div className="footer-bottom">
          <span>Theta Labs</span>
          <span>Observability for production agents</span>
        </div>
      </div>
    </footer>
  );
}
