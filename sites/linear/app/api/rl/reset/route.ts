import { NextResponse } from "next/server";
import * as store from "../../../lib/store";
import { resetRLState } from "../route";

export async function POST() {
  store.reset();
  resetRLState();

  const issues = store.getIssues();
  return NextResponse.json({
    message: "Environment reset",
    observation: {
      currentPage: "/board",
      stepCount: 0,
      totalIssues: issues.length,
      backlogIssues: issues.filter((i: Record<string, unknown>) => i.status === "backlog").length,
      todoIssues: issues.filter((i: Record<string, unknown>) => i.status === "todo").length,
      inProgressIssues: issues.filter((i: Record<string, unknown>) => i.status === "in_progress").length,
      doneIssues: issues.filter((i: Record<string, unknown>) => i.status === "done").length,
      cancelledIssues: issues.filter((i: Record<string, unknown>) => i.status === "cancelled").length,
      totalProjects: store.getProjects().length,
      totalCycles: store.getCycles().length,
      totalTeams: store.getTeams().length,
      totalLabels: store.getLabels().length,
    },
  });
}
