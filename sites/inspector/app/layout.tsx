/**
 * Root layout
 *
 * PURPOSE  Wraps every inspector route with: HTML shell, Inter + Geist Mono
 *          fonts, the React Query / theme / toaster providers, and the
 *          desktop sidebar + mobile nav.
 * USAGE    Next.js App Router calls this for every page; you don't render
 *          it directly. To add an app-wide provider, wrap `<Providers>` in
 *          components/providers.tsx — not here.
 * STRUCTURE  <Sidebar> (md+ only) | <MobileNav> + <main> children
 */

import type { Metadata } from "next"
import { Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { Providers } from "@/components/providers"
import { Sidebar, MobileNav } from "@/components/nav"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "ThetaBench Inspector",
  description:
    "Visual inspector for the @thetabench/core simulation engine across all running ThetaBench sites.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body className="min-h-svh bg-background text-foreground">
        <Providers>
          {/* Sidebar is position:fixed (md+); reserve the gutter with
              md:pl-56 so the main column doesn't slide under it. */}
          <Sidebar />
          <div className="flex min-h-svh flex-col md:pl-56">
            <MobileNav />
            <main className="min-w-0 flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
