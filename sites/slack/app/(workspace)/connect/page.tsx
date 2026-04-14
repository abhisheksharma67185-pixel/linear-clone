"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SimplePageHeader } from "@/components/simple-page-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Volume2 } from "lucide-react";

type Channel = {
  id: string;
  name: string;
  topic: string;
  isShared: boolean;
};

export default function ConnectPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  useEffect(() => {
    fetch("/api/data/channels")
      .then((r) => r.json())
      .then((c: Channel[]) => setChannels(c.filter((ch) => ch.isShared)));
  }, []);

  return (
    <>
      <SimplePageHeader
        title="Slack Connect"
        subtitle={`${channels.length} shared channels`}
      />
      <ScrollArea className="flex-1">
        <div className="flex flex-col divide-y divide-border">
          {channels.map((c) => (
            <Link
              key={c.id}
              href={`/c/${c.name}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-muted"
            >
              <Volume2 className="size-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="font-semibold text-foreground">{c.name}</span>
                <span className="text-xs text-muted-foreground">{c.topic}</span>
              </div>
            </Link>
          ))}
        </div>
      </ScrollArea>
    </>
  );
}
