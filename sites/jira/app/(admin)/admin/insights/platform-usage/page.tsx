"use client"

export default function PlatformUsagePage() {
  return (
    <div className="max-w-5xl p-8">
      <div className="mb-4 flex items-center gap-2">
        <h1 className="text-2xl font-semibold">Platform usage</h1>
        <span className="rounded border px-1.5 py-0.5 text-[10px] font-bold">
          NEW
        </span>
      </div>

      <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
        Track usage of Rovo credits and other usage types across your
        organization.{" "}
        <button type="button" className="text-blue-600 hover:underline">
          More information about platform usage
        </button>
      </p>

      {/* Table */}
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-2.5 text-left font-medium">Usage type</th>
              <th className="px-4 py-2.5 text-left font-medium">Used</th>
              <th className="px-4 py-2.5 text-left font-medium">Included</th>
              <th className="px-4 py-2.5 text-left font-medium">Used by</th>
              <th className="px-4 py-2.5 text-left font-medium">Time period</th>
              <th className="px-4 py-2.5 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={6}
                className="px-4 py-8 text-center text-sm text-muted-foreground italic"
              >
                Your platform usage data is coming soon
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
