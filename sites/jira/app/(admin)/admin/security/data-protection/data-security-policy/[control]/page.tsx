import Link from "next/link"
import { Button } from "@/components/ui/button"

const controlData: Record<
  string,
  { title: string; description: string; appliesTo: string[] }
> = {
  "export-data": {
    title: "Export data",
    description:
      "Prevent users from exporting content covered by this control. This blocks all formats, including XML, CSV, HTML, PDF, and Word.",
    appliesTo: ["Jira", "Confluence"],
  },
  "attachment-download": {
    title: "Attachment download",
    description:
      "Control whether users can download attachments from Jira or Confluence.",
    appliesTo: ["Jira", "Confluence"],
  },
  "public-links": {
    title: "Public links",
    description:
      "Control whether users can create public links to share Confluence content outside your organization.",
    appliesTo: ["Confluence"],
  },
  "anonymous-access": {
    title: "Anonymous access",
    description:
      "Control whether anonymous (unauthenticated) users can access your Jira projects and Confluence spaces.",
    appliesTo: ["Jira", "Confluence"],
  },
  "marketplace-and-custom-app-access": {
    title: "Marketplace and custom app access",
    description:
      "Control whether third-party Marketplace apps and custom-built apps can access data in your organization's Jira and Confluence instances.",
    appliesTo: ["Jira", "Confluence"],
  },
}

function AppBadge({ app }: { app: string }) {
  if (app === "Jira") {
    return (
      <span className="inline-flex items-center gap-1">
        <span className="flex size-5 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-700">
          <svg className="size-3" viewBox="0 0 32 32" fill="white">
            <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
          </svg>
        </span>
        <span className="text-sm">Jira</span>
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1">
      <span className="flex size-5 items-center justify-center rounded bg-gradient-to-br from-blue-400 to-blue-600">
        <svg className="size-3" viewBox="0 0 32 32" fill="white">
          <path d="M5.634 25.335c0 .873.708 1.58 1.582 1.58h17.568c.874 0 1.582-.708 1.582-1.58V15.21H5.634v10.125zM26.366 6.665H5.634A1.58 1.58 0 004.052 8.24v3.795h23.896V8.24a1.58 1.58 0 00-1.582-1.575z" />
        </svg>
      </span>
      <span className="text-sm">Confluence</span>
    </span>
  )
}

export default async function ControlDetailPage({
  params,
}: {
  params: Promise<{ control: string }>
}) {
  const { control } = await params
  const data = controlData[control]

  if (!data) {
    return (
      <div className="p-8">
        <p className="text-sm text-muted-foreground">Control not found.</p>
        <Link
          href="/admin/security/data-protection/data-security-policy"
          className="mt-2 inline-block text-sm text-blue-600 hover:underline"
        >
          Back to Data security policy
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl p-8">
      {/* Breadcrumb */}
      <Link
        href="/admin/security/data-protection/data-security-policy"
        className="text-sm text-muted-foreground hover:text-foreground hover:underline"
      >
        Data security policy
      </Link>

      <h1 className="mt-1 mb-4 text-2xl font-semibold">{data.title}</h1>

      <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
        {data.description}{" "}
        <Link
          href="/admin/security/security-guide"
          className="inline-flex items-center gap-0.5 text-blue-600 hover:underline"
        >
          How this control works
          <svg
            className="size-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </Link>
      </p>

      {/* Guard required banner */}
      <div className="mb-8 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-5 py-4 dark:border-blue-800 dark:bg-blue-950/20">
        <svg
          className="mt-0.5 size-5 shrink-0 text-blue-600"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <circle cx="12" cy="12" r="10" />
          <line
            x1="12"
            y1="16"
            x2="12"
            y2="12"
            stroke="white"
            strokeWidth="2"
          />
          <line
            x1="12"
            y1="8"
            x2="12.01"
            y2="8"
            stroke="white"
            strokeWidth="2"
          />
        </svg>
        <div>
          <h3 className="mb-1 text-sm font-semibold">
            Atlassian Guard required
          </h3>
          <p className="mb-3 text-sm text-muted-foreground">
            You need Atlassian Guard to manage these controls. Your existing
            controls remain enforced, but you cannot make changes without an
            active Guard subscription.
          </p>
          <Link href="/admin/security/security-guide">
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              Get Atlassian Guard
            </Button>
          </Link>
        </div>
      </div>

      {/* Default section */}
      <h2 className="mb-4 text-base font-semibold">Default</h2>
      <div className="mb-8 grid grid-cols-2 gap-0 border-t">
        <div className="border-r border-b py-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Configuration
          </p>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-green-500" />
            <span className="text-sm">Allowed</span>
          </div>
        </div>
        <div className="border-b py-4 pl-6">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Applies to
          </p>
          <div className="flex items-center gap-3">
            {data.appliesTo.map((app) => (
              <AppBadge key={app} app={app} />
            ))}
          </div>
        </div>
      </div>

      {/* Overrides section */}
      <h2 className="mb-4 text-base font-semibold">Overrides</h2>
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-2.5 text-left font-medium">
                Configuration
              </th>
              <th className="px-4 py-2.5 text-left font-medium">Type</th>
              <th className="px-4 py-2.5 text-left font-medium">Applies to</th>
              <th className="px-4 py-2.5 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={4}
                className="px-4 py-8 text-center text-sm text-muted-foreground"
              >
                No overrides added
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
