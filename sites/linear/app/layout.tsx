import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

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
      <head>
        {/* Next.js 16 streaming SSR always emits <div hidden=""> as the first
            body child (the streaming boundary placeholder). $RC resolves it but
            does NOT remove the hidden attribute, so Playwright's boundingBox()
            returns null for body > * queries. Remove it via JS after parsing. */}
        {/* eslint-disable-next-line react/no-danger */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              `document.addEventListener('DOMContentLoaded',function(){` +
              `document.querySelectorAll('body>div[hidden]').forEach(function(el){el.removeAttribute('hidden')});` +
              `});`,
          }}
        />
      </head>
      <body>
        {/* Wrap ThemeProvider (a Client Component) in a server-rendered div.
            This ensures the first body > * in the SSR HTML is a visible block
            element rather than Next.js's streaming placeholder <div hidden="">
            which would return null from Playwright's boundingBox(). */}
        <div className="min-h-screen min-w-full">
          <ThemeProvider>{children}</ThemeProvider>
        </div>
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
