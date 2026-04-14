"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SimplePageHeader } from "@/components/simple-page-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserAvatar } from "@/components/user-avatar";

type User = {
  id: string;
  name: string;
  title: string;
  avatar: string;
  presence: "active" | "away" | "offline" | "dnd";
};
type Channel = { id: string; name: string };

export default function ChannelMembersPage() {
  const params = useParams<{ channelName: string }>();
  const [members, setMembers] = useState<User[]>([]);
  const [channel, setChannel] = useState<Channel | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/data/channels/${params.channelName}`).then((r) => r.json()),
      fetch(`/api/data/channels/${params.channelName}/members`).then((r) => r.json()),
    ]).then(([c, m]) => {
      setChannel(c);
      setMembers(m);
    });
  }, [params.channelName]);

  return (
    <>
      <SimplePageHeader
        title={`Members of #${channel?.name ?? ""}`}
        subtitle={`${members.length} members`}
      />
      <ScrollArea className="flex-1">
        <div className="flex flex-col divide-y divide-border">
          {members.map((u) => (
            <div key={u.id} className="flex items-center gap-3 px-4 py-3">
              <UserAvatar
                name={u.name}
                src={u.avatar}
                presence={u.presence}
                size="md"
                showPresence
              />
              <div className="flex flex-col">
                <span className="font-semibold text-foreground">{u.name}</span>
                <span className="text-xs text-muted-foreground">{u.title}</span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </>
  );
}
