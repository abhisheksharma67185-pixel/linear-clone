export default function TermsPage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-6 py-16">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">Terms</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Terms of Service</h1>
        <div className="mt-6 space-y-4 text-sm leading-6 text-muted-foreground">
          <p>
            Use Theta Observability only for workloads you are authorized to inspect and
            monitor. Do not send unlawful content or data you are not permitted to store.
          </p>
          <p>
            You are responsible for configuring retention, access controls, and production
            safeguards that match your compliance and operational requirements.
          </p>
          <p>
            The service and SDKs are provided as observability tooling. They should be
            validated in your own environment before being relied on for critical workflows.
          </p>
        </div>
      </div>
    </div>
  );
}
