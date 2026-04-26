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
      <body>
        <ThemeProvider>{children}</ThemeProvider>
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
