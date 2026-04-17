import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Param {
  name: string;
  type: string;
  required?: boolean;
  default?: string;
  description: string;
}

interface ParamTableProps {
  params: Param[];
}

export function ParamTable({ params }: ParamTableProps) {
  return (
    <div className="my-5 overflow-hidden rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="font-semibold">Parameter</TableHead>
            <TableHead className="font-semibold">Type</TableHead>
            <TableHead className="font-semibold">Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {params.map((p) => (
            <TableRow key={p.name}>
              <TableCell className="align-top">
                <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs font-medium text-foreground">
                  {p.name}
                </code>
                {p.required && (
                  <Badge variant="destructive" className="ml-2 text-[9px]">
                    required
                  </Badge>
                )}
              </TableCell>
              <TableCell className="align-top">
                <code className="font-mono text-xs text-primary/80">
                  {p.type}
                </code>
              </TableCell>
              <TableCell className="align-top text-muted-foreground">
                {p.description}
                {p.default && (
                  <span className="ml-1.5 text-xs text-muted-foreground/60">
                    Default: <code className="font-mono text-foreground/70">{p.default}</code>
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
