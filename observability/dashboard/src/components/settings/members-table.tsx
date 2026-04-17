import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatRelative } from "@/lib/utils";
import type { Member } from "@/lib/types";

export function MembersTable({ members }: { members: Member[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Added</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((m) => (
          <TableRow key={m.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarFallback>{(m.name ?? m.email)[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium">{m.name ?? m.email}</p>
                  <p className="truncate text-[0.625rem] text-muted-foreground">{m.email}</p>
                </div>
              </div>
            </TableCell>
            <TableCell><Badge variant="outline" className="capitalize">{m.role}</Badge></TableCell>
            <TableCell className="text-[0.625rem] text-muted-foreground">
              {formatRelative(m.added_at)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
