import { NextResponse } from "next/server"
import { sessions } from "@/lib/security-mocks"

export async function GET() {
  return NextResponse.json(sessions)
}
