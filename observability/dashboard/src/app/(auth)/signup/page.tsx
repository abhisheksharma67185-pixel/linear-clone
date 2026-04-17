import Link from "next/link";
import { GoogleSignInButton } from "../login/google-button";

export default function SignupPage() {
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
          <h1 className="text-lg font-semibold">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Free forever up to 50k traces / month. No credit card.
          </p>
          <div className="mt-6">
            <GoogleSignInButton callbackUrl="/onboarding" />
          </div>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          By signing up you agree to the{" "}
          <Link href="/terms" className="underline">Terms</Link> and{" "}
          <Link href="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
