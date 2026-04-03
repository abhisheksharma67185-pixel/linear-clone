import { NextResponse } from "next/server";
import { getCurriculum } from "../../../../lib/tasks/curriculum";

export async function GET() {
  const stages = getCurriculum();
  return NextResponse.json({
    total_stages: stages.length,
    stages,
  });
}
