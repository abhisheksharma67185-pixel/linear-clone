"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SimplePageHeader } from "@/components/simple-page-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Hash, Lock } from "lucide-react";

type Message = {
  id: string;
  text: string;
  authorId: string;
  channelId: string | null;
  dmId: string | null;
  createdAt: string;
};
type Channel = {
  id: string;
  name: string;
  topic: string;
  type: "public" | "private";
};
type User = {
  id: string;
  name: string;
  displayName: string;
  email: string;
  title: string;
};

type Results = {
  query: string;
  totalResults: number;
  messages: Message[];
  channels: Channel[];
  users: User[];
  files: unknown[];
};

function SearchPageContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const [results, setResults] = useState<Results | null>(null);

  useEffect(() => {
    if (!q) return;
    fetch(`/api/data/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then(setResults);
  }, [q]);

  return (
    <>
      <SimplePageHeader
        title={`Search: "${q}"`}
        subtitle={results ? `${results.totalResults} results` : "Searching…"}
      />
      {!q ? (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Type a query in the top bar.
        </div>
      ) : results ? (
        <Tabs defaultValue="messages" className="flex min-h-0 flex-1 flex-col">
          <TabsList className="w-fit rounded-none border-b bg-transparent px-4">
            <TabsTrigger value="messages">
              Messages ({results.messages.length})
            </TabsTrigger>
            <TabsTrigger value="channels">
              Channels ({results.channels.length})
            </TabsTrigger>
            <TabsTrigger value="users">People ({results.users.length})</TabsTrigger>
            <TabsTrigger value="files">Files ({results.files.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="messages" className="flex-1">
            <ScrollArea className="h-full">
              <div className="flex flex-col divide-y divide-border">
                {results.messages.map((m) => (
                  <div key={m.id} className="px-4 py-3">
                    <div className="text-xs text-muted-foreground">
                      {m.authorId} ·{" "}
                      {new Date(m.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-foreground">{m.text}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="channels" className="flex-1">
            <ScrollArea className="h-full">
              <div className="flex flex-col divide-y divide-border">
                {results.channels.map((c) => {
                  const Icon = c.type === "private" ? Lock : Hash;
                  return (
                    <Link
                      key={c.id}
                      href={`/c/${c.name}`}
                      className="flex items-center gap-2 px-4 py-3 hover:bg-muted"
                    >
                      <Icon className="size-4" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">
                          {c.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {c.topic}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="users" className="flex-1">
            <ScrollArea className="h-full">
              <div className="flex flex-col divide-y divide-border">
                {results.users.map((u) => (
                  <Link
                    key={u.id}
                    href={`/people/${u.id}`}
                    className="flex flex-col gap-0.5 px-4 py-3 hover:bg-muted"
                  >
                    <span className="font-semibold text-foreground">
                      {u.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {u.title} · {u.email}
                    </span>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="files" className="flex-1">
            <div className="p-8 text-sm text-muted-foreground">
              File results coming soon.
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Searching…
        </div>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageContent />
    </Suspense>
  );
}
