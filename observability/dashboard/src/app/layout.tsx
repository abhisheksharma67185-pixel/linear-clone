import "./globals.css";
import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "@/components/session-provider";
import { Toaster } from "sonner";

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-code",
});

export const metadata: Metadata = {
  title: {
    default: "Theta Observability — multimodal traces for AI agents",
    template: "%s · Theta Observability",
  },
  description:
    "Capture, search, and replay every step of your multimodal AI agents. Text, images, audio, and robotics sensors — one unified trace.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable} antialiased`}
    >
      <body>
        <SessionProvider>
          <ThemeProvider>
            {children}
            <Toaster position="bottom-right" richColors theme="system" />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
