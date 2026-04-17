"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface InstallSnippetProps {
  apiKey?: string;
  className?: string;
  project?: string;
}

export function InstallSnippet({
  apiKey = "tobs_live_YOUR_API_KEY",
  project = "proj_YOUR_PROJECT_ID",
  className,
}: InstallSnippetProps) {
  const python = `pip install theta-observability

from theta_observability import TraceClient

client = TraceClient(api_key="${apiKey}", project="${project}")

with client.trace(name="checkout", run_type="prod") as t:
    with t.step(type="llm", model="claude-opus-4.6") as s:
        s.log_message(role="user", text="Buy milk", images=["./screen.png"])
        s.log_message(role="assistant", text="Done.")
        s.set_token_usage(input=900, output=120)
`;

  const node = `npm i @theta/observability

import { TraceClient } from "@theta/observability";

const client = new TraceClient({
  apiKey: "${apiKey}",
  project: "${project}",
});

await client.trace({ name: "checkout", runType: "prod" }, async (t) => {
  await t.step({ type: "llm", model: "claude-opus-4.6" }, async (s) => {
    s.logMessage({ role: "user", text: "Buy milk", images: [buf] });
    s.setTokenUsage({ input: 900, output: 120 });
  });
});
`;

  const curl = `curl https://api.theta.dev/v1/traces \\
  -H "x-api-key: ${apiKey}" \\
  -H "content-type: application/json" \\
  -d '{
    "name": "checkout",
    "project_id": "${project}",
    "status": "success",
    "started_at": "2026-04-15T12:00:00Z",
    "ended_at":   "2026-04-15T12:00:07Z",
    "steps": [
      { "type": "llm", "model": "claude-opus-4.6",
        "messages": [{"role":"user","content":[{"type":"text","text":"Buy milk"}]}] }
    ]
  }'
`;

  return (
    <Tabs defaultValue="python" className={cn("w-full", className)}>
      <TabsList>
        <TabsTrigger value="python">Python</TabsTrigger>
        <TabsTrigger value="node">Node</TabsTrigger>
        <TabsTrigger value="curl">cURL</TabsTrigger>
      </TabsList>
      <TabsContent value="python">
        <CodeBlock code={python} language="python" />
      </TabsContent>
      <TabsContent value="node">
        <CodeBlock code={node} language="typescript" />
      </TabsContent>
      <TabsContent value="curl">
        <CodeBlock code={curl} language="bash" />
      </TabsContent>
    </Tabs>
  );
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = React.useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };
  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-3 py-1.5">
        <span className="text-[0.625rem] font-mono uppercase tracking-wider text-muted-foreground">
          {language}
        </span>
        <Button variant="ghost" size="xs" onClick={copy}>
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="overflow-auto p-3 font-mono text-[0.75rem] leading-relaxed scrollbar-thin rounded-lg">
        <code>{code}</code>
      </pre>
    </div>
  );
}
