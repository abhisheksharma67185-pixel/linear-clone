import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params;
  return (
    <div className="grid min-h-dvh place-items-center bg-background px-6">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm">
        <Badge variant="outline">Invitation</Badge>
        <h1 className="mt-3 text-lg font-semibold">You&apos;re invited to join Theta Observability</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Sign in to accept your invitation. Token <span className="font-mono">{token.slice(0, 8)}…</span>
        </p>
        <div className="mt-5 space-y-2">
          <Button asChild size="lg" className="w-full">
            <Link href={`/signup?invite=${token}`}>Accept &amp; create account</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href={`/login?invite=${token}`}>I already have an account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
