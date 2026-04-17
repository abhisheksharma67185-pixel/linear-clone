"use client";

import { LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function UserMenu() {
  const { data: session } = useSession();
  const name = session?.user?.name ?? "User";
  const email = session?.user?.email ?? "";
  const image = session?.user?.image;
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-2.5 overflow-hidden">
      <div className="size-7 shrink-0 overflow-hidden rounded-full bg-muted">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={name} className="size-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <div className="grid size-full place-items-center text-[10px] font-semibold text-muted-foreground">
            {initials}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 overflow-hidden">
        <p className="truncate text-xs font-medium leading-tight">{name}</p>
        <p className="truncate text-[10px] leading-tight text-muted-foreground">{email}</p>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        className="shrink-0"
        onClick={() => signOut({ callbackUrl: "/login" })}
        title="Sign out"
        aria-label="Sign out"
      >
        <LogOut className="size-3.5" />
      </Button>
    </div>
  );
}
