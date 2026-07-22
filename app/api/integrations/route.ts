import { NextResponse } from "next/server"
import { integrations } from "@/lib/security-mocks"

export async function GET() {
  return NextResponse.json(Object.values(integrations))
}
