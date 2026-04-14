"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SimplePageHeader } from "@/components/simple-page-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Canvas = {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  updatedAt: string;
};
type Channel = { id: string; name: string; canvasId: string | null };

export default function ChannelCanvasPage() {
  const params = useParams<{ channelName: string }>();
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch(`/api/data/channels/${params.channelName}`)
      .then((r) => r.json())
      .then(async (c: Channel) => {
        if (c.canvasId) {
          const res = await fetch(`/api/data/canvases/${c.canvasId}`);
          if (res.ok) {
            const canv = await res.json();
            setCanvas(canv);
            setContent(canv.content);
          }
        }
      });
  }, [params.channelName]);

  const save = async () => {
    if (!canvas) return;
    const res = await fetch(`/api/data/canvases/${canvas.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      setCanvas(await res.json());
      setEditing(false);
      toast.success("Canvas saved");
    }
  };

  return (
    <>
      <SimplePageHeader
        title={canvas?.title ?? "Canvas"}
        subtitle={
          canvas ? `Updated ${new Date(canvas.updatedAt).toLocaleDateString()}` : undefined
        }
        action={
          canvas ? (
            <Button
              variant={editing ? "default" : "outline"}
              size="sm"
              onClick={editing ? save : () => setEditing(true)}
            >
              {editing ? "Save" : "Edit"}
            </Button>
          ) : null
        }
      />
      <ScrollArea className="flex-1">
        {canvas ? (
          editing ? (
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[60vh] resize-none rounded-none border-0 p-6 font-mono text-sm focus-visible:ring-0"
            />
          ) : (
            <div className="mx-auto max-w-3xl whitespace-pre-wrap p-6 text-sm leading-relaxed text-foreground">
              {canvas.content}
            </div>
          )
        ) : (
          <div className="flex flex-1 items-center justify-center p-12 text-sm text-muted-foreground">
            This channel has no canvas yet.
          </div>
        )}
      </ScrollArea>
    </>
  );
}
