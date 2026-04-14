"use client";

import { useEffect, useState } from "react";
import { SimplePageHeader } from "@/components/simple-page-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Headphones } from "lucide-react";

type Huddle = {
  id: string;
  channelId: string | null;
  dmId: string | null;
  topic: string;
  startedAt: string;
  endedAt: string | null;
  participantIds: string[];
};

export default function HuddlesPage() {
  const [huddles, setHuddles] = useState<Huddle[]>([]);
  useEffect(() => {
    fetch("/api/data/huddles")
      .then((r) => r.json())
      .then(setHuddles);
  }, []);

  return (
    <>
      <SimplePageHeader
        title="Huddles"
        subtitle={`${huddles.filter((h) => h.endedAt === null).length} active`}
      />
      <ScrollArea className="flex-1">
        <div className="flex flex-col divide-y divide-border">
          {huddles.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              No huddles yet.
            </div>
          ) : (
            huddles.map((h) => (
              <div key={h.id} className="flex items-center gap-3 px-4 py-3">
                <Headphones className="size-4 text-muted-foreground" />
                <div className="flex flex-1 flex-col">
                  <span className="text-sm font-semibold">
                    {h.topic || "(no topic)"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {h.participantIds.length} participants ·{" "}
                    {new Date(h.startedAt).toLocaleString()}
                  </span>
                </div>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-semibold ${
                    h.endedAt === null
                      ? "bg-slack-presence-active/20 text-slack-presence-active"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {h.endedAt === null ? "Live" : "Ended"}
                </span>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </>
  );
}
