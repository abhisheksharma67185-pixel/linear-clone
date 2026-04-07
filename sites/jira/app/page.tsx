import Link from "next/link"
import { WelcomeHeader } from "@/components/welcome-header"
import { AtlassianFooter } from "@/components/atlassian-footer"
import { CreateSiteDialog } from "@/components/create-site-dialog"

function SparkleDecoration() {
  return (
    <div className="flex items-center gap-1">
      {/* Small sparkle */}
      <svg className="size-5 text-[#F5A623]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2z" />
      </svg>
      {/* Large sparkle */}
      <svg className="size-8 text-[#F5A623]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2z" />
      </svg>
    </div>
  )
}

export default function WelcomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <WelcomeHeader />

      {/* Main content */}
      <main className="flex-1">
        <div className="mx-auto max-w-[800px] px-6 py-16">
          {/* Welcome heading */}
          <div className="mb-8">
            <h1 className="text-[40px] font-bold leading-tight text-[#253858]">
              <span className="relative inline-block">
                Welcome back, Abhishek.
                <svg
                  className="absolute -bottom-1 left-[340px] w-[120px]"
                  viewBox="0 0 120 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 6C12 2 22 10 32 6C42 2 52 10 62 6C72 2 82 10 92 6C102 2 112 10 118 6"
                    stroke="#F5A623"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
          </div>

          {/* Pick up where you left off */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[15px] text-[#42526E]">
              Pick up where you left off in
              <svg className="size-5" viewBox="0 0 32 32" fill="#2684FF">
                <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
              </svg>
              <span className="font-semibold text-[#253858]">Jira</span>
            </div>
            <CreateSiteDialog />
          </div>

          {/* Site card */}
          <div className="mb-6 rounded-lg border border-[#dfe1e6] p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Green avatar with Ab */}
                <div className="flex size-14 items-center justify-center rounded-md bg-[#B8D935] text-lg font-bold text-[#253858]">
                  Ab
                </div>
                <div>
                  <p className="text-base font-semibold text-[#253858]">
                    abhisheksharma67185
                  </p>
                  <div className="mt-1">
                    <span className="inline-flex size-6 items-center justify-center rounded bg-[#0052CC] text-[10px] font-bold text-white">
                      AS
                    </span>
                  </div>
                </div>
              </div>
              <Link
                href="/dashboard"
                className="rounded-sm bg-[#0052CC] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#0747A6] transition-colors"
              >
                Go to Jira
              </Link>
            </div>
          </div>

          {/* Sparkle decoration */}
          <div className="flex justify-end pr-12 py-4">
            <SparkleDecoration />
          </div>
        </div>

        {/* Explore features section */}
        <div className="bg-[#f4f5f7] py-16">
          <div className="mx-auto max-w-[800px] px-6 text-center">
            <h2 className="mb-6 text-xl font-semibold text-[#253858]">
              Want to find out more about Jira?
            </h2>
            <Link
              href="/products"
              className="inline-block rounded-sm border-2 border-[#253858] px-8 py-3 text-base font-medium text-[#253858] hover:bg-[#253858] hover:text-white transition-colors"
            >
              Explore features
            </Link>
          </div>
        </div>
      </main>

      <AtlassianFooter />
    </div>
  )
}
