import Link from "next/link";

const sections = [
  {
    title: "Getting Started",
    description: "Install the SDK and send your first trace in under 5 minutes.",
    links: [
      { title: "Installation", href: "/docs/installation" },
      { title: "Quickstart", href: "/docs/quickstart" },
    ],
  },
  {
    title: "Python SDK",
    description: "Full reference for the Python SDK: traces, steps, agents, metrics, and integrations.",
    links: [
      { title: "Traces & Steps", href: "/docs/python/traces" },
      { title: "Agents", href: "/docs/python/agents" },
      { title: "Integrations", href: "/docs/python/integrations" },
    ],
  },
  {
    title: "Node.js SDK",
    description: "Full reference for the Node.js/TypeScript SDK.",
    links: [
      { title: "Traces & Steps", href: "/docs/node/traces" },
      { title: "Agents", href: "/docs/node/agents" },
      { title: "Integrations", href: "/docs/node/integrations" },
    ],
  },
  {
    title: "API Reference",
    description: "REST API endpoints for traces, media, metrics, search, and admin operations.",
    links: [
      { title: "Traces API", href: "/docs/api/traces" },
      { title: "Search API", href: "/docs/api/search" },
      { title: "Metrics API", href: "/docs/api/metrics" },
    ],
  },
  {
    title: "Concepts",
    description: "Understand the trace schema, authentication model, and architecture.",
    links: [
      { title: "Trace Schema", href: "/docs/concepts/schema" },
      { title: "Authentication", href: "/docs/concepts/auth" },
    ],
  },
  {
    title: "Deployment",
    description: "Self-host Theta with Docker Compose or deploy to production.",
    links: [
      { title: "Self-Hosting Guide", href: "/docs/self-hosting" },
    ],
  },
];

export default function DocsHome() {
  return (
    <>
      <h1>Theta Observability Documentation</h1>
      <p>
        Theta Observability captures, searches, and replays every step of your multimodal AI agents.
        Text, images, audio, video, and robotics sensors -- all in one unified trace.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {sections.map((section) => (
          <div
            key={section.title}
            className="rounded-lg border border-zinc-200 p-5 transition-colors dark:border-zinc-800"
          >
            <h3 className="!mt-0 text-base font-semibold text-foreground">
              {section.title}
            </h3>
            <p className="!mt-1 text-sm text-muted-foreground">
              {section.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {section.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-foreground no-underline transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                >
                  {link.title}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
