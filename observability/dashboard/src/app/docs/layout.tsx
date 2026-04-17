"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

interface NavItem {
  title: string;
  href: string;
}

interface NavSection {
  heading: string;
  items: NavItem[];
}

const navigation: NavSection[] = [
  {
    heading: "Getting Started",
    items: [
      { title: "Overview", href: "/docs" },
      { title: "Installation", href: "/docs/installation" },
      { title: "Quickstart", href: "/docs/quickstart" },
    ],
  },
  {
    heading: "Python SDK",
    items: [
      { title: "Overview", href: "/docs/python" },
      { title: "Traces & Steps", href: "/docs/python/traces" },
      { title: "Agents", href: "/docs/python/agents" },
      { title: "Metrics", href: "/docs/python/metrics" },
      { title: "Attachments", href: "/docs/python/attachments" },
      { title: "Integrations", href: "/docs/python/integrations" },
    ],
  },
  {
    heading: "Node.js SDK",
    items: [
      { title: "Overview", href: "/docs/node" },
      { title: "Traces & Steps", href: "/docs/node/traces" },
      { title: "Agents", href: "/docs/node/agents" },
      { title: "Metrics", href: "/docs/node/metrics" },
      { title: "Attachments", href: "/docs/node/attachments" },
      { title: "Integrations", href: "/docs/node/integrations" },
    ],
  },
  {
    heading: "API Reference",
    items: [
      { title: "Overview", href: "/docs/api" },
      { title: "Traces", href: "/docs/api/traces" },
      { title: "Media", href: "/docs/api/media" },
      { title: "Metrics", href: "/docs/api/metrics" },
      { title: "Search", href: "/docs/api/search" },
      { title: "Incidents", href: "/docs/api/incidents" },
      { title: "Admin", href: "/docs/api/admin" },
    ],
  },
  {
    heading: "Concepts",
    items: [
      { title: "Trace Schema", href: "/docs/concepts/schema" },
      { title: "Authentication", href: "/docs/concepts/auth" },
    ],
  },
  {
    heading: "Deployment",
    items: [
      { title: "Self-Hosting", href: "/docs/self-hosting" },
    ],
  },
];

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronLeft className="size-4" />
              Back to app
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <Link href="/docs" className="text-sm font-semibold text-foreground">
              Theta Docs
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px]">
        {/* Sidebar */}
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-[240px] shrink-0 overflow-y-auto border-r border-zinc-200 px-4 py-6 scrollbar-thin md:block dark:border-zinc-800">
          <nav className="space-y-6">
            {navigation.map((section) => (
              <div key={section.heading}>
                <h4 className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  {section.heading}
                </h4>
                <ul className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "block rounded-md px-2 py-1.5 text-[13px] transition-colors",
                            isActive
                              ? "bg-zinc-100 font-medium text-foreground dark:bg-zinc-800"
                              : "text-muted-foreground hover:bg-zinc-50 hover:text-foreground dark:hover:bg-zinc-900",
                          )}
                        >
                          {item.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1 px-8 py-10 lg:px-16">
          <div className="mx-auto max-w-3xl">
            <article className="[&>h1]:text-3xl [&>h1]:font-semibold [&>h1]:tracking-tight [&>h1]:text-foreground [&>h2]:mt-10 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:tracking-tight [&>h2]:text-foreground [&>h3]:mt-8 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:text-foreground [&>h4]:mt-6 [&>h4]:text-base [&>h4]:font-semibold [&>h4]:text-foreground [&>hr]:my-8 [&>hr]:border-zinc-200 dark:[&>hr]:border-zinc-800 [&>p]:mt-3 [&>p]:text-[15px] [&>p]:leading-7 [&>p]:text-muted-foreground [&>ul]:mt-3 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:text-[15px] [&>ul]:leading-7 [&>ul]:text-muted-foreground [&>ol]:mt-3 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:text-[15px] [&>ol]:leading-7 [&>ol]:text-muted-foreground [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_:not(pre)>code]:rounded [&_:not(pre)>code]:bg-zinc-100 [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[13px] dark:[&_:not(pre)>code]:bg-zinc-800 [&_pre_code]:bg-transparent [&_pre_code]:p-0">
              {children}
            </article>
          </div>
        </main>
      </div>
    </div>
  );
}
