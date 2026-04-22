import Link from "next/link"

export default function SwitchAccountPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[#f0f4ff] to-[#deebff]" />

      {/* Bottom illustrations - left side */}
      <div className="absolute bottom-0 left-0 h-[320px] w-[300px]">
        <svg viewBox="0 0 300 320" fill="none" className="h-full w-full">
          {/* Person with clipboard */}
          <rect x="80" y="180" width="60" height="100" rx="4" fill="#FFB74D" />
          <circle cx="110" cy="160" r="20" fill="#FFB74D" />
          <rect x="140" y="200" width="40" height="60" rx="4" fill="#E3F2FD" />
          {/* Person pointing */}
          <rect x="160" y="200" width="50" height="90" rx="4" fill="#1868DB" />
          <circle cx="185" cy="180" r="18" fill="#1868DB" />
          {/* Chart board */}
          <rect
            x="30"
            y="100"
            width="80"
            height="100"
            rx="6"
            fill="white"
            stroke="#E0E0E0"
            strokeWidth="2"
          />
          <rect x="42" y="120" width="12" height="40" fill="#42A5F5" />
          <rect x="60" y="130" width="12" height="30" fill="#66BB6A" />
          <rect x="78" y="110" width="12" height="50" fill="#FFA726" />
        </svg>
      </div>

      {/* Bottom illustrations - right side */}
      <div className="absolute right-0 bottom-0 h-[320px] w-[300px]">
        <svg viewBox="0 0 300 320" fill="none" className="h-full w-full">
          {/* Magnifying glass */}
          <circle
            cx="220"
            cy="120"
            r="40"
            stroke="#1868DB"
            strokeWidth="6"
            fill="none"
          />
          <line
            x1="248"
            y1="148"
            x2="270"
            y2="170"
            stroke="#FF7043"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Documents */}
          <rect
            x="100"
            y="160"
            width="70"
            height="90"
            rx="6"
            fill="white"
            stroke="#E0E0E0"
            strokeWidth="2"
          />
          <rect x="110" y="175" width="40" height="4" rx="2" fill="#90CAF9" />
          <rect x="110" y="185" width="50" height="4" rx="2" fill="#E0E0E0" />
          <rect x="110" y="195" width="35" height="4" rx="2" fill="#E0E0E0" />
          {/* Person with pencil */}
          <rect x="180" y="200" width="50" height="90" rx="4" fill="#1868DB" />
          <circle cx="205" cy="180" r="18" fill="#1868DB" />
          <line
            x1="230"
            y1="170"
            x2="250"
            y2="140"
            stroke="#FFA726"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Card */}
      <div className="relative z-10 w-[400px] rounded-lg bg-white px-10 py-10 shadow-[0_0_10px_rgba(0,0,0,0.1)]">
        {/* Atlassian logo */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <svg className="h-7 w-7" viewBox="0 0 32 32" fill="#1868DB">
            <path
              d="M10.543 18.17a.86.86 0 0 0-1.478.147L4.076 28.204A.86.86 0 0 0 4.85 29.5h7.956a.86.86 0 0 0 .774-.491c1.806-3.763.62-8.928-3.037-10.839z"
              opacity="0.7"
            />
            <path d="M15.593 3.09a14.58 14.58 0 0 0-.98 14.79l4.56 9.13a.86.86 0 0 0 1.538 0l5.213-10.42a.86.86 0 0 0 0-.77L18.67 3.09a1.63 1.63 0 0 0-3.076 0z" />
          </svg>
          <span className="text-xl font-bold tracking-wide text-[#1868DB]">
            ATLASSIAN
          </span>
        </div>

        {/* Heading */}
        <h1 className="mb-6 text-center text-base font-semibold text-[#253858]">
          Choose or add another account
        </h1>

        {/* Current account */}
        <Link
          href="/"
          className="-mx-3 flex items-center gap-3 rounded border-b border-[#dfe1e6] px-3 py-4 transition-colors hover:bg-[#f4f5f7]"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#0052CC] text-xs font-bold text-white">
            AS
          </div>
          <div>
            <p className="text-sm font-semibold text-[#253858]">
              Abhishek Sharma
            </p>
            <p className="text-sm text-[#6B778C]">
              abhisheksharma67185@gmail.com
            </p>
          </div>
        </Link>

        {/* Add another account */}
        <Link
          href="/login"
          className="-mx-3 flex items-center gap-3 rounded border-b border-[#dfe1e6] px-3 py-4 transition-colors hover:bg-[#f4f5f7]"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#DFE1E6]">
            <svg
              className="size-5 text-[#6B778C]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <p className="text-sm text-[#253858]">Add another account</p>
        </Link>

        {/* Log out */}
        <div className="mt-4 border-b border-[#dfe1e6] pb-4 text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-[#0052CC] hover:underline"
          >
            Log out
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-6 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4" viewBox="0 0 32 32" fill="#B3BAC5">
              <path
                d="M10.543 18.17a.86.86 0 0 0-1.478.147L4.076 28.204A.86.86 0 0 0 4.85 29.5h7.956a.86.86 0 0 0 .774-.491c1.806-3.763.62-8.928-3.037-10.839z"
                opacity="0.7"
              />
              <path d="M15.593 3.09a14.58 14.58 0 0 0-.98 14.79l4.56 9.13a.86.86 0 0 0 1.538 0l5.213-10.42a.86.86 0 0 0 0-.77L18.67 3.09a1.63 1.63 0 0 0-3.076 0z" />
            </svg>
            <span className="text-xs font-bold tracking-wide text-[#B3BAC5]">
              ATLASSIAN
            </span>
          </div>
          <p className="text-xs text-[#6B778C]">
            One account for Jira, Confluence, Trello and{" "}
            <Link href="/products" className="text-[#0052CC] hover:underline">
              more
              <span className="ml-0.5 inline-block text-[10px]">↗</span>
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
