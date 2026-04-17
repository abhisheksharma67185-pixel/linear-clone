import Link from "next/link";
import { GoogleSignInButton } from "./google-button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const error = sp.error;
  const callbackUrl = sp.callbackUrl ?? "/";

  return (
    <div className="grid min-h-dvh place-items-center bg-background px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground">
              <span className="font-serif text-sm font-bold">θ</span>
            </div>
            <span className="text-sm font-semibold">Theta Observability</span>
          </Link>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-lg font-semibold">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back. Continue with Google to reach your traces.
          </p>
          {error && error !== "MissingCSRF" ? (
            <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {describeError(error)}
            </p>
          ) : null}
          <div className="mt-6">
            <GoogleSignInButton callbackUrl={callbackUrl} />
          </div>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-foreground underline underline-offset-4">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function describeError(code: string) {
  switch (code) {
    case "OAuthAccountNotLinked":
      return "That email is already linked to another provider.";
    case "AccessDenied":
      return "Access denied. Add your email as a test user in Google Cloud Console → OAuth consent screen.";
    case "Configuration":
      return "Auth configuration error. Check the redirect URI and OAuth credentials.";
    default:
      return `Sign-in error: ${code}`;
  }
}
