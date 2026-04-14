"use client";

import { useEffect, useState } from "react";
import { SimplePageHeader } from "@/components/simple-page-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { FileText } from "lucide-react";

type Attachment = {
  id: string;
  type: "file" | "image" | "link";
  name: string;
  url: string;
};
type Message = { id: string; attachments: Attachment[]; authorId: string };

export default function FilesPage() {
  const [files, setFiles] = useState<Array<Attachment & { messageId: string }>>([]);
  useEffect(() => {
    fetch("/api/data/messages")
      .then((r) => r.json())
      .then((msgs: Message[]) => {
        const all = msgs.flatMap((m) =>
          m.attachments.map((a) => ({ ...a, messageId: m.id })),
        );
        setFiles(all);
      });
  }, []);

  return (
    <>
      <SimplePageHeader title="Files" subtitle={`${files.length} files`} />
      <ScrollArea className="flex-1">
        {files.length === 0 ? (
          <Empty className="flex-1">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileText />
              </EmptyMedia>
              <EmptyTitle>No files yet</EmptyTitle>
              <EmptyDescription>
                Files shared in messages will appear here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {files.map((f) => (
              <a
                key={f.id}
                href={f.url}
                className="flex items-start gap-3 rounded-md border border-border bg-card p-3 hover:bg-muted"
              >
                <FileText className="size-5 text-muted-foreground" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-semibold">
                    {f.name}
                  </span>
                  <span className="text-xs uppercase text-muted-foreground">
                    {f.type}
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </ScrollArea>
    </>
  );
}
