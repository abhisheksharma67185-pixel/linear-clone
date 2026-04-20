export default function PrivacyPage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-6 py-16">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">Privacy</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Privacy Policy</h1>
        <div className="mt-6 space-y-4 text-sm leading-6 text-muted-foreground">
          <p>
            Theta Observability stores trace payloads, metadata, and attachments that you
            explicitly send through the SDK or API. You control which users, prompts,
            outputs, and media are captured.
          </p>
          <p>
            Data is scoped by organization and project. Access to dashboard routes and
            control-plane APIs is enforced through authenticated organization membership.
          </p>
          <p>
            For self-hosted deployments, you are responsible for the storage, retention,
            and governance policies applied to your own infrastructure.
          </p>
        </div>
      </div>
    </div>
  );
}
