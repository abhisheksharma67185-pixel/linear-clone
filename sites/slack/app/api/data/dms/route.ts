import { NextRequest, NextResponse } from "next/server";
import * as store from "../../../lib/store";

export async function GET() {
  return NextResponse.json(store.getDirectMessages());
}

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const participantIds = body.participantIds as string[] | undefined;
  if (!participantIds || !Array.isArray(participantIds)) {
    return NextResponse.json(
      { error: "participantIds (string[]) required" },
      { status: 400 },
    );
  }
  const result = store.openDirectMessage(participantIds);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result.data, { status: 201 });
}
