"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SimplePageHeader } from "@/components/simple-page-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";

type Attachment = {
  id: string;
  type: "file" | "image" | "link";
  name: string;
  url: string;
};
type Message = { id: string; channelId: string | null; attachments: Attachment[] };
type Channel = { id: string; name: string };

export default function ChannelFilesPage() {
  const params = useParams<{ channelName: string }>();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [files, setFiles] = useState<Attachment[]>([]);

  useEffect(() => {
    fetch(`/api/data/channels/${params.channelName}`)
      .then((r) => r.json())
      .then(async (c: Channel) => {
        setChannel(c);
        const msgs: Message[] = await fetch(
          `/api/data/messages?channelId=${c.id}`,
        ).then((r) => r.json());
        setFiles(msgs.flatMap((m) => m.attachments));
      });
  }, [params.channelName]);

  return (
    <>
      <SimplePageHeader
        title={`Files in #${channel?.name ?? ""}`}
        subtitle={`${files.length} files`}
      />
      <ScrollArea className="flex-1">
        {files.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No files in this channel.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {files.map((f) => (
              <a
                key={f.id}
                href={f.url}
                className="flex items-start gap-3 rounded-md border border-border bg-card p-3"
              >
                <FileText className="size-5 text-muted-foreground" />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{f.name}</div>
                  <div className="text-xs text-muted-foreground uppercase">
                    {f.type}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </ScrollArea>
    </>
  );
}
