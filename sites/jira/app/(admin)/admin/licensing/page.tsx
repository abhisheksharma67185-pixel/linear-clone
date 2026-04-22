import type { Metadata } from "next"

export const metadata: Metadata = { title: "Licensing" }

export default function LicensingPage() {
  return (
    <div className="max-w-5xl p-8">
      <h1 className="mb-2 text-2xl font-semibold">Licensing</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Server and Data Center licensing
      </p>

      <div className="mb-6 rounded-lg border p-6">
        <h2 className="mb-4 text-base font-semibold">Active licenses</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 font-medium text-muted-foreground">
                  Product
                </th>
                <th className="pb-3 font-medium text-muted-foreground">Plan</th>
                <th className="pb-3 font-medium text-muted-foreground">
                  Users
                </th>
                <th className="pb-3 font-medium text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-700">
                      <svg
                        aria-hidden="true"
                        className="size-4 text-white"
                        viewBox="0 0 32 32"
                        fill="white"
                      >
                        <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
                      </svg>
                    </div>
                    <span className="font-medium">Jira Software</span>
                  </div>
                </td>
                <td className="py-4">Free</td>
                <td className="py-4">1 / 10</td>
                <td className="py-4">
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    Active
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded bg-gradient-to-br from-blue-400 to-purple-600">
                      <svg
                        aria-hidden="true"
                        className="size-4 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </div>
                    <span className="font-medium">Jira Service Management</span>
                  </div>
                </td>
                <td className="py-4">Free</td>
                <td className="py-4">1 / 3</td>
                <td className="py-4">
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    Active
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border p-6">
        <h2 className="mb-2 text-base font-semibold">Need more licenses?</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Upgrade your plan or add more users to your existing products.
        </p>
        <a
          href="https://www.atlassian.com/software/jira/pricing"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          View plans and pricing
        </a>
      </div>
    </div>
  )
}
