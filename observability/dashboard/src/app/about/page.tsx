import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-6 py-16">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">About</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Theta Observability</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Theta Observability helps teams capture, search, and debug multimodal AI agent
          executions across text, images, audio, video, and robotics sensors.
        </p>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          The platform combines SDK-based tracing, storage for raw executions and media,
          structured analytics, and an operational dashboard for incidents, metrics,
          clusters, and annotations.
        </p>
        <div className="mt-8 flex gap-3">
          <Link href="/signup" className="text-sm font-medium underline underline-offset-4">
            Create an account
          </Link>
          <Link href="/docs" className="text-sm font-medium underline underline-offset-4">
            Read the docs
          </Link>
        </div>
      </div>
    </div>
  );
}
