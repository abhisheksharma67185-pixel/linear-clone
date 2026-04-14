"use client";

import { useEffect, useState } from "react";
import { SimplePageHeader } from "@/components/simple-page-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users } from "lucide-react";

type UserGroup = {
  id: string;
  handle: string;
  name: string;
  description: string;
  memberIds: string[];
  isEnabled: boolean;
};

export default function UserGroupsPage() {
  const [groups, setGroups] = useState<UserGroup[]>([]);
  useEffect(() => {
    fetch("/api/data/user-groups")
      .then((r) => r.json())
      .then(setGroups);
  }, []);

  return (
    <>
      <SimplePageHeader
        title="User groups"
        subtitle={`${groups.length} groups`}
      />
      <ScrollArea className="flex-1">
        <div className="flex flex-col divide-y divide-border">
          {groups.map((g) => (
            <div
              key={g.id}
              className="flex items-center gap-3 px-4 py-3"
            >
              <Users className="size-4 text-muted-foreground" />
              <div className="flex flex-1 flex-col">
                <span className="text-sm font-semibold">
                  @{g.handle}
                </span>
                <span className="text-xs text-muted-foreground">
                  {g.name} · {g.memberIds.length} members
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {g.isEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </>
  );
}
