"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { STATUS_META } from "./status";
import type { SearchResult } from "@/lib/types";
import type { TraceStatus } from "@/lib/types";

export function SemanticSearchResults({
  results,
  searching,
  orgSlug,
  projectSlug,
}: {
  results: SearchResult[];
  searching: boolean;
  orgSlug: string;
  projectSlug: string;
}) {
  if (searching) {
    return (
      <div className="flex flex-1 items-center justify-center p-10">
        <p className="text-xs text-muted-foreground animate-pulse">Searching...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-10">
        <div className="text-center">
          <p className="text-sm font-medium">No semantic results</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try rephrasing your query or switch back to keyword search.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8" />
            <TableHead>Name</TableHead>
            <TableHead>Trace ID</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="text-right">Relevance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((r) => {
            const meta = STATUS_META[r.status as TraceStatus] ?? STATUS_META.success;
            return (
              <TableRow key={r.trace_id}>
                <TableCell>
                  <meta.Icon className={`size-3.5 ${meta.color}`} />
                </TableCell>
                <TableCell>
                  <Link
                    href={`/${orgSlug}/${projectSlug}/traces/${r.trace_id}`}
                    className="font-medium text-foreground hover:underline"
                  >
                    {r.name}
                  </Link>
                </TableCell>
                <TableCell className="font-mono text-[0.625rem] text-muted-foreground">
                  {r.trace_id}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {r.user_id ?? "--"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {r.tags?.slice(0, 2).map((t) => (
                      <Badge key={t} variant="ghost" className="h-4 px-1.5 text-[0.55rem]">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={r.score >= 0.8 ? "success" : r.score >= 0.5 ? "default" : "ghost"}
                    className="tabular-nums"
                  >
                    {(r.score * 100).toFixed(0)}%
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
