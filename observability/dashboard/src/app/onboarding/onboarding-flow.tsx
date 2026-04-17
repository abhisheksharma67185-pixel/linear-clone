"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { InstallSnippet } from "@/components/install-snippet";
import { cn } from "@/lib/utils";
import { createOrgAction } from "@/actions/orgs";
import { createProjectAction } from "@/actions/projects";
import { createKeyAction } from "@/actions/keys";

type Step = "org" | "project" | "key" | "waiting";

export function OnboardingFlow() {
  const [step, setStep] = React.useState<Step>("org");
  const [orgName, setOrgName] = React.useState("");
  const [projectName, setProjectName] = React.useState("");
  const [apiKey, setApiKey] = React.useState<string | null>(null);
  const [org, setOrg] = React.useState<{ id: string; slug: string } | null>(null);
  const [project, setProject] = React.useState<{ id: string; slug: string } | null>(null);
  const [pending, startTransition] = React.useTransition();

  return (
    <div>
      <div className="mb-8 flex items-center justify-center gap-3 text-xs">
        <StepPill active={step === "org"} done={step !== "org"} index={1} label="Organization" />
        <Dash />
        <StepPill
          active={step === "project"}
          done={step === "key" || step === "waiting"}
          index={2}
          label="Project"
        />
        <Dash />
        <StepPill active={step === "key"} done={step === "waiting"} index={3} label="API key" />
        <Dash />
        <StepPill active={step === "waiting"} done={false} index={4} label="First trace" />
      </div>

      {step === "org" && (
        <Panel
          title="Welcome — let's set up your organization"
          subtitle="This is how your team will show up across the dashboard."
        >
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="org">Organization name</Label>
              <Input
                id="org"
                autoFocus
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="My Company"
              />
            </div>
            <Button
              size="lg"
              className="w-full"
              disabled={pending || !orgName.trim()}
              onClick={() => {
                startTransition(async () => {
                  try {
                    const created = await createOrgAction(orgName.trim());
                    setOrg({ id: created.id, slug: created.slug });
                    setStep("project");
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Failed to create organization");
                  }
                });
              }}
            >
              Continue <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </Panel>
      )}

      {step === "project" && (
        <Panel
          title="Create your first project"
          subtitle="Projects scope traces, keys, and teammates."
        >
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="project">Project name</Label>
              <Input
                id="project"
                autoFocus
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Checkout Agent"
              />
            </div>
            <Button
              size="lg"
              className="w-full"
              disabled={pending || !projectName.trim() || !org}
              onClick={() => {
                startTransition(async () => {
                  if (!org) return;
                  try {
                    const createdProject = await createProjectAction(org.id, projectName.trim());
                    setProject({ id: createdProject.id, slug: createdProject.slug });
                    const key = await createKeyAction(
                      createdProject.id,
                      `${projectName.trim()} SDK`
                    );
                    setApiKey(key.secret);
                    setStep("key");
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Failed to create project");
                  }
                });
              }}
            >
              Continue <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </Panel>
      )}

      {step === "key" && apiKey && (
        <Panel
          title="Here's your API key"
          subtitle="Copy it now — this is the only time we'll show it to you."
        >
          <div className="rounded-lg border border-border bg-muted/40 p-3 font-mono text-[0.7rem] break-all">
            {apiKey}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await navigator.clipboard.writeText(apiKey);
              }}
            >
              Copy key
            </Button>
            <Button size="sm" onClick={() => setStep("waiting")}>
              I&apos;ve copied it <ArrowRight className="size-3" />
            </Button>
          </div>
        </Panel>
      )}

      {step === "waiting" && apiKey && (
        <div className="space-y-6">
          <Panel
            title="Waiting for your first trace…"
            subtitle="Run the snippet below in your agent. We'll live-tail the ingest here."
            headerRight={<Badge variant="outline" className="gap-1"><Loader2 className="size-3 animate-spin" /> listening</Badge>}
          >
            <InstallSnippet apiKey={apiKey} project={project?.id ?? "your_project_id"} />
          </Panel>
          <LiveTail />
          <div className="flex items-center justify-end">
            <Button asChild variant="outline" size="sm">
              <Link href={org && project ? `/${org.slug}/${project.slug}/traces` : "/"}>
                Skip to dashboard <ArrowRight className="size-3" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function LiveTail() {
  const [events, setEvents] = React.useState<string[]>([]);
  React.useEffect(() => {
    const lines = [
      "listening on /v1/traces/tail …",
      "waiting for first event",
    ];
    let i = 0;
    const t = setInterval(() => {
      if (i < lines.length) {
        setEvents((e) => [...e, lines[i]!]);
        i++;
      }
    }, 600);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <Sparkles className="size-3 text-primary" />
        <p className="text-xs font-semibold">Live tail</p>
        <Badge variant="outline" className="ml-auto gap-1">
          <span className="size-1.5 animate-pulse rounded-full bg-success" />
          connected
        </Badge>
      </div>
      <div className="h-44 overflow-auto p-3 font-mono text-[0.7rem] text-muted-foreground scrollbar-thin">
        {events.map((e, i) => (
          <p key={i}>
            <span className="text-foreground/40">{new Date().toLocaleTimeString()} </span>
            {e}
          </p>
        ))}
      </div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  children,
  headerRight,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {headerRight}
      </div>
      {children}
    </div>
  );
}

function StepPill({
  active,
  done,
  index,
  label,
}: {
  active: boolean;
  done: boolean;
  index: number;
  label: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-transparent bg-muted/40 px-2.5 py-1 text-[0.625rem] text-muted-foreground",
        active && "border-primary/40 bg-primary/10 text-foreground",
        done && "border-success/30 bg-success/10 text-foreground"
      )}
    >
      <span className="grid size-4 place-items-center rounded-full bg-background text-[0.55rem] font-semibold">
        {done ? <Check className="size-2.5 text-success" /> : index}
      </span>
      {label}
    </div>
  );
}

function Dash() {
  return <span className="h-px w-6 bg-border" />;
}
