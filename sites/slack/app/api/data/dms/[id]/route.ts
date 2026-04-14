import { NextRequest, NextResponse } from "next/server";
import * as store from "../../../../lib/store";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const dm = store.getDmById(id);
  if (!dm) {
    return NextResponse.json({ error: `DM ${id} not found` }, { status: 404 });
  }
  return NextResponse.json(dm);
}
