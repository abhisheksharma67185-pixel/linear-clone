import { getTrace } from "@/lib/api";
import { TraceDetail } from "@/components/trace-detail/tabs";

interface Props {
  params: Promise<{ org: string; project: string; traceId: string }>;
}

export default async function TraceDetailPage({ params }: Props) {
  const { traceId } = await params;
  const trace = await getTrace(traceId);
  return <TraceDetail trace={trace} />;
}
