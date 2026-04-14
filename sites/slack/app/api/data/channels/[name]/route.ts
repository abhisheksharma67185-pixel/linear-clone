import { NextRequest, NextResponse } from "next/server";
import * as store from "../../../../lib/store";

function resolve(name: string) {
  return store.getChannelById(name) ?? store.getChannelByName(name);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const channel = resolve(name);
  if (!channel) {
    return NextResponse.json(
      { error: `Channel ${name} not found` },
      { status: 404 },
    );
  }
  return NextResponse.json(channel);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const channel = resolve(name);
  if (!channel) {
    return NextResponse.json(
      { error: `Channel ${name} not found` },
      { status: 404 },
    );
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const result = store.updateChannel(channel.id, body);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result.data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const channel = resolve(name);
  if (!channel) {
    return NextResponse.json(
      { error: `Channel ${name} not found` },
      { status: 404 },
    );
  }
  const result = store.archiveChannel(channel.id);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result.data);
}
