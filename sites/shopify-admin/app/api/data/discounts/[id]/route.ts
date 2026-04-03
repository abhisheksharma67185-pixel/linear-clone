import { NextRequest, NextResponse } from "next/server";
import * as store from "../../../../lib/store";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const discount = store.getDiscountById(id);
  if (!discount) {
    return NextResponse.json({ error: "Discount not found" }, { status: 404 });
  }
  return NextResponse.json(discount);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const fields = await request.json();
  const result = store.updateDiscount(id, fields);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result.data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const result = store.deleteDiscount(id);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }
  return NextResponse.json({ deleted: true });
}
