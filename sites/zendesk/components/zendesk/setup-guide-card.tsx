import {
  IconCheck,
  IconChevronRight,
  IconCircle,
  IconCircleCheckFilled,
  IconCircleDashed,
  IconConfetti,
  IconLock,
} from "@tabler/icons-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

type StepState = "done" | "in-progress" | "open" | "locked"

interface Step {
  id: string
  title: string
  state: StepState
  cta: "Start" | "View" | "Continue" | null
}

const STEPS: Step[] = [
  { id: "invite", title: "Invite team", state: "open", cta: "Start" },
  { id: "content", title: "Add content", state: "done", cta: "View" },
  { id: "tone", title: "Name and tone of voice", state: "done", cta: "View" },
  { id: "test", title: "Test AI agent", state: "done", cta: "View" },
  {
    id: "kb",
    title: "Expand knowledge base",
    state: "in-progress",
    cta: "Continue",
  },
  { id: "email", title: "Connect email", state: "open", cta: "Start" },
  { id: "launch", title: "Launch AI agent", state: "locked", cta: null },
]

function StepIcon({ state }: { state: StepState }) {
  if (state === "done") {
    return <IconCircleCheckFilled className="size-4 text-emerald-500" />
  }
  if (state === "in-progress") {
    return <IconCircleDashed className="size-4 text-emerald-500" />
  }
  if (state === "locked") {
    return <IconLock className="size-4 text-muted-foreground" />
  }
  return <IconCircle className="size-4 text-muted-foreground" />
}

function StepCta({ cta }: { cta: Step["cta"] }) {
  if (!cta) return null
  const tone =
    cta === "Continue"
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-sky-600 dark:text-sky-400"
  return <span className={cn("text-xs font-medium", tone)}>{cta}</span>
}

export function SetupGuideCard() {
  return (
    <Card className="gap-1 py-3" size="sm">
      <CardHeader className="px-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <CardDescription className="text-xs">Setup guide</CardDescription>
            <CardTitle className="text-base">AI agents</CardTitle>
          </div>
          <div
            aria-hidden
            className="flex size-9 items-center justify-center rounded-md bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200"
          >
            <IconConfetti className="size-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-0.5 px-1.5">
        {STEPS.map((step) => (
          <div
            key={step.id}
            className={cn(
              "flex items-center justify-between gap-3 rounded-md px-2 py-0.5 text-[13px] leading-6",
              step.state === "locked"
                ? "text-muted-foreground"
                : "text-foreground hover:bg-muted/50"
            )}
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <StepIcon state={step.state} />
              <span className="truncate">{step.title}</span>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <StepCta cta={step.cta} />
              {step.cta && (
                <IconChevronRight className="size-3.5 text-muted-foreground" />
              )}
              {step.state === "done" && !step.cta ? (
                <IconCheck className="size-4 text-emerald-500" />
              ) : null}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
