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
        inter.variable,
      )}
    >
      <body className="bg-background text-foreground min-h-svh">
        <Providers>
          <div className="flex min-h-svh flex-col md:flex-row">
            <Sidebar />
            <div className="flex flex-1 min-w-0 flex-col">
              <MobileNav />
              <main className="flex-1 min-w-0">{children}</main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  )
}
