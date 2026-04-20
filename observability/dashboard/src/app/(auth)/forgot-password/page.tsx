import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { env } from "@/lib/env";

export default function ForgotPasswordPage() {
  const emailAuthEnabled = Boolean(env.AUTH_RESEND_KEY && env.AUTH_EMAIL_FROM);

  return (
    <div className="grid min-h-dvh place-items-center bg-background px-6">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-lg font-semibold">Reset your password</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          {emailAuthEnabled
            ? "We’ll email you a magic link to sign in. You can set a new password after signing in if desired."
            : "Email sign-in is not configured in this environment. Use Google sign-in instead."}
        </p>
        {emailAuthEnabled ? (
          <form className="mt-5 space-y-3" action="/api/auth/signin/resend" method="post">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <Button type="submit" size="lg" className="w-full">Send magic link</Button>
          </form>
        ) : (
          <div className="mt-5 space-y-3">
            <Button asChild size="lg" className="w-full">
              <Link href="/login">Continue to sign in</Link>
            </Button>
          </div>
        )}
        <p className="mt-4 text-xs text-muted-foreground">
          <Link href="/login" className="hover:underline">← Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
