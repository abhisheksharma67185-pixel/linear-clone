"use client";

import * as React from "react";
import { Copy, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createKeyAction } from "@/actions/keys";

export function CreateKeyDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [secret, setSecret] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  async function create() {
    startTransition(async () => {
      const key = await createKeyAction(projectId, name || "Untitled key");
      setSecret(key.secret);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setSecret(null); setName(""); } }}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="size-3" /> New API key</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{secret ? "Copy your key now" : "Create API key"}</DialogTitle>
          <DialogDescription>
            {secret
              ? "This is the only time you'll see the full secret. Store it safely."
              : "Scoped to this project. Revocable at any time."}
          </DialogDescription>
        </DialogHeader>
        {secret ? (
          <div className="space-y-3">
            <code className="block break-all rounded-md border border-border bg-muted/60 p-3 font-mono text-[0.7rem]">
              {secret}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await navigator.clipboard.writeText(secret);
                toast.success("Copied to clipboard");
              }}
            >
              <Copy className="size-3" /> Copy
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="key-name">Name</Label>
              <Input
                id="key-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Production server"
                autoFocus
              />
            </div>
          </div>
        )}
        <DialogFooter>
          {secret ? (
            <Button onClick={() => { setOpen(false); setSecret(null); setName(""); }}>
              Done
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={create} disabled={pending}>Create key</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
