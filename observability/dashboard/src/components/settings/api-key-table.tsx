"use client";

import * as React from "react";
import { Copy, MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRelative } from "@/lib/utils";
import { revokeKeyAction } from "@/actions/keys";
import type { ApiKey } from "@/lib/types";

export function ApiKeyTable({ projectId, keys }: { projectId: string; keys: ApiKey[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Key</TableHead>
          <TableHead>Scopes</TableHead>
          <TableHead>Last used</TableHead>
          <TableHead>Created</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {keys.map((k) => (
          <TableRow key={k.id}>
            <TableCell className="font-medium">{k.name}</TableCell>
            <TableCell>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(k.prefix + "•••••••");
                    toast.success("Copied prefix");
                  } catch {
                    /* ignore */
                  }
                }}
                className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 font-mono text-[0.7rem] text-muted-foreground hover:text-foreground"
              >
                {k.prefix}••••••• <Copy className="size-3" />
              </button>
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                {(k.scopes ?? []).map((s) => (
                  <Badge key={s} variant="outline" className="h-4 text-[0.55rem]">
                    {s}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell className="text-[0.625rem] text-muted-foreground">
              {k.last_used_at ? formatRelative(k.last_used_at) : "never"}
            </TableCell>
            <TableCell className="text-[0.625rem] text-muted-foreground">
              {formatRelative(k.created_at)}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-3" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onSelect={async () => {
                      await revokeKeyAction(projectId, k.id);
                      toast.success("Key revoked");
                    }}
                  >
                    <Trash2 className="size-3 text-destructive" />
                    <span className="text-destructive">Revoke</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
