import { NextRequest, NextResponse } from "next/server";
import * as store from "../../../../lib/store";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const list = store.getListById(id);
  if (!list) {
    return NextResponse.json({ error: `List ${id} not found` }, { status: 404 });
  }
  return NextResponse.json(list);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const result = store.deleteList(id);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result.data);
}
