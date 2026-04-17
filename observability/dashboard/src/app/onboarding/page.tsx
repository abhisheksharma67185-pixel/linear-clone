import Link from "next/link";
import { OnboardingFlow } from "./onboarding-flow";

export default function OnboardingPage() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="grid size-6 place-items-center rounded-md bg-gradient-to-br from-primary to-chart-4 text-primary-foreground">
              <span className="font-serif text-[0.8rem] font-bold">θ</span>
            </div>
            <span className="text-sm font-semibold">Theta Observability</span>
          </Link>
          <Link href="/docs" className="text-xs text-muted-foreground hover:text-foreground">Docs</Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-16">
        <OnboardingFlow />
      </main>
    </div>
  );
}
