import { NextResponse } from "next/server";
import "../../lib/init-sim";
import { getTaskCount, getAllTasks, getCurriculum } from "@simbench/core";

export async function GET() {
  const tasks = getAllTasks();
  const domains = [...new Set(tasks.map((t) => t.domain))];
  const stages = getCurriculum();

  return NextResponse.json({
    status: "ok",
    version: "0.1.0",
    site: "shopify-admin",
    tasks: getTaskCount(),
    domains: domains.length,
    curriculum_stages: stages.length,
    domain_breakdown: Object.fromEntries(
      domains.map((d) => [d, tasks.filter((t) => t.domain === d).length]),
    ),
    timestamp: new Date().toISOString(),
  });
}
