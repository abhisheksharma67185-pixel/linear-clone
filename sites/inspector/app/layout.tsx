import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { StreamingPlaceholderCleanup } from "@/components/streaming-placeholder-cleanup"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`antialiased ${inter.className}`}
    >
      <body>
        {/* Wrap ThemeProvider (a Client Component) in a server-rendered div.
            This ensures the first body > * in the SSR HTML is a visible block
            element rather than Next.js's streaming placeholder <div hidden="">
            which would return null from Playwright's boundingBox(). */}
        <div className="min-h-screen min-w-full">
          <ThemeProvider>{children}</ThemeProvider>
        </div>
        {/* Strip the lingering `hidden` attribute from Next.js 16's
            streaming-placeholder div(s). Runs from a useEffect (post-
            hydration) instead of `DOMContentLoaded` (pre-hydration) so
            we don't desync the DOM from React's hydration tree — that
            mismatch was the source of the
            "hidden={true} vs hidden={null}" hydration error. */}
        <StreamingPlaceholderCleanup />
        {/*
         * Sonner anchors at bottom: 16px right: 16px by default. The
         * AskLinear floating pill lives at the same coordinate
         * (right-4 bottom-4 ≈ 16px), so unmodified Sonner toasts
         * paint directly behind / over it. Pushing the toaster up by
         * 48px clears the pill (32px tall + 16px gap) while keeping
         * toasts in the bottom-right region. On routes that don't
         * mount AskLinear (e.g. /settings) the larger offset is
         * harmless — toasts simply land slightly higher.
         */}
        <Toaster position="bottom-right" offset={64} />
      </body>
    </html>
  )
}
