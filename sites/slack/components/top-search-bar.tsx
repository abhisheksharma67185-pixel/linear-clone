"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  HelpCircle,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function TopSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [workspaceName, setWorkspaceName] = useState("Theta HQ");

  useEffect(() => {
    fetch("/api/data/workspace")
      .then((r) => r.json())
      .then((d) => {
        if (d.name) setWorkspaceName(d.name);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="flex h-11 shrink-0 items-center gap-2 bg-slack-aubergine px-3 text-white">
      <div className="flex w-[calc(16rem-0.75rem)] shrink-0 items-center gap-1">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                size="icon"
                variant="ghost"
                className="size-7 text-white/80 hover:bg-white/10 hover:text-white"
                onClick={() => router.back()}
              >
                <ArrowLeft className="size-4" />
              </Button>
            }
          />
          <TooltipContent>Back</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                size="icon"
                variant="ghost"
                className="size-7 text-white/80 hover:bg-white/10 hover:text-white"
                onClick={() => router.forward()}
              >
                <ArrowRight className="size-4" />
              </Button>
            }
          />
          <TooltipContent>Forward</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                size="icon"
                variant="ghost"
                className="size-7 text-white/80 hover:bg-white/10 hover:text-white"
              >
                <Clock className="size-4" />
              </Button>
            }
          />
          <TooltipContent>History</TooltipContent>
        </Tooltip>
      </div>
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex min-w-0 max-w-xl flex-1 items-center"
      >
        <div className="relative flex w-full items-center">
          <Search className="absolute left-2.5 size-4 text-white/70" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${workspaceName}`}
            className="h-7 border-white/20 bg-white/10 pl-8 pr-14 text-sm text-white placeholder:text-white/70 focus-visible:border-white/40 focus-visible:ring-0"
          />
          <Kbd className="absolute right-2 bg-white/20 text-[10px] text-white/90">
            ⌘K
          </Kbd>
        </div>
      </form>
      <div className="flex w-28 shrink-0 justify-end">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                size="icon"
                variant="ghost"
                className="size-7 text-white/80 hover:bg-white/10 hover:text-white"
              >
                <HelpCircle className="size-4" />
              </Button>
            }
          />
          <TooltipContent>Help</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
