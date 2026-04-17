import { handlers } from "@/lib/auth";

// NextAuth v5 handlers — type assertion needed for Next.js 16 compatibility
export const GET = handlers.GET as unknown as (req: Request) => Promise<Response>;
export const POST = handlers.POST as unknown as (req: Request) => Promise<Response>;
