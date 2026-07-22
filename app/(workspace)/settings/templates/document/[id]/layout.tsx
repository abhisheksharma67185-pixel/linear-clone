import type { Metadata } from "next"

// Static fallback title for the document-template editor. We could
// fetch the template's name in `generateMetadata` for a more specific
// title, but the editor lives behind the same in-memory mock store the
// page reads — and a generic "Edit document template" is a strict
// improvement over the URL fallback.
export const metadata: Metadata = { title: "Edit document template" }

export default function DocumentTemplateEditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
