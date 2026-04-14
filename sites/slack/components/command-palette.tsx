"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Hash, Users, AtSign } from "lucide-react";

type User = {
  id: string;
  name: string;
  displayName: string;
  avatar: string;
};
type Channel = { id: string; name: string; isArchived: boolean };

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  useEffect(() => {
    if (!open) return;
    Promise.all([
      fetch("/api/data/channels").then((r) => r.json()),
      fetch("/api/data/users").then((r) => r.json()),
    ]).then(([c, u]) => {
      setChannels(c);
      setUsers(u);
    });
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Search"
      description="Jump to a channel, person, or message"
    >
      <CommandInput placeholder="Jump to…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Channels">
          {channels
            .filter((c) => !c.isArchived)
            .slice(0, 10)
            .map((c) => (
              <CommandItem
                key={c.id}
                value={`channel-${c.name}`}
                onSelect={() => go(`/c/${c.name}`)}
              >
                <Hash className="size-4" />
                {c.name}
              </CommandItem>
            ))}
        </CommandGroup>
        <CommandGroup heading="People">
          {users.slice(0, 8).map((u) => (
            <CommandItem
              key={u.id}
              value={`user-${u.displayName}`}
              onSelect={() => go(`/people/${u.id}`)}
            >
              <Users className="size-4" />
              {u.name}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => go("/threads")}>
            <AtSign className="size-4" />
            Threads
          </CommandItem>
          <CommandItem onSelect={() => go("/mentions")}>
            <AtSign className="size-4" />
            Mentions
          </CommandItem>
          <CommandItem onSelect={() => go("/later")}>
            <AtSign className="size-4" />
            Later
          </CommandItem>
          <CommandItem onSelect={() => go("/preferences")}>
            <AtSign className="size-4" />
            Preferences
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
