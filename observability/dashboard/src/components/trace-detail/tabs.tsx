"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StepRail } from "./step-rail";
import { MessagesView } from "./messages-view";
import { Annotations } from "./annotations";
import { JsonViewer } from "./json-viewer";
import { TraceHeader } from "./header";
import type { Step, Trace } from "@/lib/types";

function stepHasRenderableContent(step?: Step): boolean {
  if (!step) {
    return false;
  }

  return Boolean(
    step.messages?.length ||
      step.tool_calls?.length ||
      step.events?.length ||
      step.attachments?.length ||
      step.sensor_frames?.length ||
      step.error_message
  );
}

function getPreferredStep(steps: Step[]): Step | undefined {
  return steps.find(stepHasRenderableContent) ?? steps[0];
}

const EMPTY_STEPS: Step[] = [];

export function TraceDetail({
  trace,
}: {
  trace: Trace;
}) {
  const steps = React.useMemo(() => trace.steps ?? EMPTY_STEPS, [trace.steps]);
  const preferredStep = React.useMemo(() => getPreferredStep(steps), [steps]);
  const [activeStepId, setActiveStepId] = React.useState(
    preferredStep?.step_id ?? ""
  );
  const [activeTab, setActiveTab] = React.useState("all");
  const [showJson, setShowJson] = React.useState(false);
  const activeStep = steps.find((s) => s.step_id === activeStepId) ?? preferredStep;

  React.useEffect(() => {
    setActiveStepId(preferredStep?.step_id ?? "");
  }, [preferredStep?.step_id, trace.trace_id]);

  React.useEffect(() => {
    setActiveTab("all");
  }, [trace.trace_id]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TraceHeader trace={trace} showJson={showJson} onToggleJson={setShowJson} />
      {showJson ? (
        <div className="flex-1 overflow-auto p-5">
          <JsonViewer value={trace} initialDepth={2} />
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-[300px_1fr]">
          <aside className="min-h-0 overflow-y-auto border-r border-border">
            <p className="sticky top-0 bg-background/95 px-4 py-3 text-[0.625rem] font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur">
              Steps · {steps.length}
            </p>
            <StepRail
              steps={steps}
              activeStepId={activeStepId}
              onSelect={setActiveStepId}
            />
          </aside>
          <section className="flex min-h-0 flex-col">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="border-b border-border px-5 py-3">
                <TabsList>
                  <TabsTrigger value="all">Show all</TabsTrigger>
                  <TabsTrigger value="messages">Messages</TabsTrigger>
                  <TabsTrigger value="annotations">Annotations</TabsTrigger>
                </TabsList>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <TabsContent value="all" className="mt-0">
                  <MessagesView trace={trace} showAll />
                </TabsContent>
                <TabsContent value="messages" className="mt-0">
                  <MessagesView
                    step={activeStep}
                    trace={trace}
                    preferredStep={preferredStep}
                    onSelectStep={setActiveStepId}
                  />
                </TabsContent>
                <TabsContent value="annotations" className="mt-0">
                  <Annotations
                    traceId={trace.trace_id}
                    projectId={trace.project_id}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </section>
        </div>
      )}
    </div>
  );
}
