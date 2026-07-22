import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    status: "ok",
    version: "0.0.1",
    site: "linear",
    timestamp: new Date().toISOString(),
  })
}
