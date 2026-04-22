import Link from "next/link"
import { AtlassianHeader } from "@/components/atlassian-header"
import { AtlassianFooter } from "@/components/atlassian-footer"
import { ExploreByRole } from "./explore-by-role"

const recommendedProducts = [
  {
    name: "Jira Service Management",
    description:
      "Unite teams on a single AI-powered platform to deliver service at scale.",
    icon: (
      <div className="flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-yellow-400 to-yellow-600">
        <svg className="size-5 text-white" viewBox="0 0 24 24" fill="white">
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
    ),
  },
  {
    name: "Loom",
    description:
      "Move work forward by sharing Loom video messages and AI-powered meeting recaps.",
    icon: (
      <div className="flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-blue-400 to-purple-600">
        <svg className="size-5 text-white" viewBox="0 0 24 24" fill="white">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      </div>
    ),
  },
  {
    name: "Jira Product Discovery",
    description:
      "Build the right thing with Jira Product Discovery. Capture feedback, prioritize ideas, and create roadmaps tied to delivery in Jira.",
    icon: (
      <div className="flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-purple-400 to-purple-600">
        <svg className="size-5 text-white" viewBox="0 0 24 24" fill="white">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      </div>
    ),
  },
]

const collections = [
  {
    name: "Teamwork",
    bold: true,
    description: "Supercharge teamwork seamlessly",
    products: "Jira \u00b7 Confluence \u00b7 Loom",
    cta: "Try now",
  },
  {
    name: "Strategy",
    bold: true,
    description: "Optimize strategy and outcomes confidently",
    products: "Focus \u00b7 Talent \u00b7 Align",
    cta: "Contact sales",
  },
  {
    name: "Service",
    bold: true,
    description: "Deliver service at high-velocity",
    products:
      "Jira Service Management \u00b7 Customer Service Management \u00b7 Assets",
    cta: "Try now",
  },
  {
    name: "Software",
    bold: true,
    description: "Ship high-quality software fast",
    products:
      "Rovo Dev \u00b7 DX \u00b7 Pipelines \u00b7 Bitbucket \u00b7 Compass",
    cta: "Contact sales",
  },
]

export default function ProductsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <AtlassianHeader />

      <main className="flex-1">
        {/* Hero - Featured App: Confluence */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#f0f4ff] via-[#e8f0fe] to-[#dfe8f7]">
          <div className="mx-auto flex max-w-[1200px] items-center px-8 py-16">
            <div className="max-w-lg">
              <p className="mb-3 text-xs font-semibold tracking-widest text-[#6B778C] uppercase">
                Featured App &middot; Confluence
              </p>
              <h1 className="mb-4 text-4xl leading-tight font-bold text-[#253858]">
                Go from ideas to outcomes with Confluence
              </h1>
              <p className="mb-8 text-base leading-relaxed text-[#42526E]">
                Create and organize work documents in one AI-powered workspace
                to unlock knowledge and collaborate with clarity.
              </p>
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="rounded-md bg-[#0052CC] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0747A6]"
                >
                  Try now
                </Link>
                <Link
                  href="/products"
                  className="text-sm font-medium text-[#0052CC] hover:underline"
                >
                  Learn more →
                </Link>
              </div>
            </div>

            {/* Hero illustration - floating cards */}
            <div className="relative ml-auto hidden w-[500px] lg:block">
              <div className="relative h-[340px]">
                {/* Background shape */}
                <div className="absolute top-4 right-0 h-72 w-80 rounded-2xl bg-[#c9d8f0] opacity-40" />

                {/* Card 1 - top right */}
                <div className="absolute top-0 right-8 z-10 w-64 rounded-lg border border-[#dfe1e6] bg-white p-3 shadow-lg">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="size-2 rounded-full bg-green-500" />
                    <span className="text-[#0052CC]">
                      Set up a quarterly town hall event
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-[#6B778C]">
                    <span className="rounded bg-[#0052CC] px-1.5 py-0.5 text-[9px] font-bold text-white">
                      IN PROGRESS
                    </span>
                  </div>
                  <div className="mt-1 text-[10px] text-[#6B778C]">
                    Assigned to Jane Rotanson &middot; Updated 9 hours ago
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[10px] text-[#6B778C]">
                    <span>Medium</span>
                    <span className="flex items-center gap-0.5">
                      <svg
                        className="size-3"
                        viewBox="0 0 32 32"
                        fill="#2684FF"
                      >
                        <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
                      </svg>
                      Jira
                    </span>
                    <span className="text-[#0052CC]">Open preview</span>
                  </div>
                </div>

                {/* Card 2 - sticky note */}
                <div className="absolute top-16 left-8 z-10 w-44 rounded-lg bg-purple-100 p-3 shadow-md">
                  <p className="text-xs font-medium text-[#253858]">
                    Async weekly team kick-offs and stand-ups
                  </p>
                </div>

                {/* Card 3 - pink card */}
                <div className="absolute bottom-16 left-1/3 z-10 rounded-lg bg-pink-100 p-3 shadow-md">
                  <p className="text-xs font-medium text-[#253858]">
                    Regular team activities and team building
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    <div className="rounded-full bg-[#0052CC] px-2 py-0.5 text-[10px] font-medium text-white">
                      Matthew
                    </div>
                  </div>
                </div>

                {/* Thumbs up badge */}
                <div className="absolute top-1/2 left-1/2 z-20 flex items-center gap-1 rounded-full bg-white px-2 py-1 shadow-md">
                  <span className="text-sm">👍</span>
                  <span className="text-xs font-medium text-[#253858]">3</span>
                </div>

                {/* Ask Rovo badge */}
                <div className="absolute right-4 bottom-32 z-20 rounded-full border border-[#dfe1e6] bg-white px-3 py-1.5 shadow-sm">
                  <span className="text-xs font-medium text-[#42526E]">
                    Ask Rovo
                  </span>
                </div>

                {/* Bottom yellow curve */}
                <div className="absolute right-0 -bottom-4 h-24 w-64 rounded-tl-[100px] bg-[#F5A623] opacity-70" />

                {/* Toolbar at bottom */}
                <div className="absolute bottom-0 left-12 z-20 flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-lg">
                  <div className="size-5 rounded bg-yellow-100" />
                  <div className="size-5 rounded bg-orange-100" />
                  <span className="text-sm font-bold text-[#253858]">Aa</span>
                  <div className="size-5 rounded bg-gray-200" />
                  <div className="size-5 rounded bg-purple-200" />
                  <span className="text-lg text-[#6B778C]">+</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Explore Atlassian products */}
        <section className="py-16">
          <div className="mx-auto max-w-[1200px] px-8">
            <h2 className="mb-2 text-center text-4xl font-bold text-[#253858]">
              Explore Atlassian products
            </h2>
            <p className="mb-12 text-center text-base text-[#42526E]">
              For every team, from startup to enterprise
            </p>

            {/* Recommended */}
            <div className="mb-16">
              <h3 className="mb-1 text-xl font-bold text-[#253858]">
                Recommended
              </h3>
              <p className="mb-6 text-sm text-[#42526E]">
                Top apps to kickstart your productivity
              </p>

              <div className="grid grid-cols-3 gap-5">
                {recommendedProducts.map((product) => (
                  <div
                    key={product.name}
                    className="flex flex-col rounded-xl border border-[#dfe1e6] bg-white p-6 transition-shadow hover:shadow-md"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      {product.icon}
                      <h4 className="text-lg font-bold text-[#253858]">
                        {product.name}
                      </h4>
                    </div>
                    <p className="mb-6 flex-1 text-sm leading-relaxed text-[#42526E]">
                      {product.description}
                    </p>
                    <div className="flex items-center gap-4">
                      <Link
                        href="/dashboard"
                        className="rounded-md border-2 border-[#253858] px-4 py-2 text-sm font-medium text-[#253858] transition-colors hover:bg-[#253858] hover:text-white"
                      >
                        Try now
                      </Link>
                      <Link
                        href="/products"
                        className="text-sm font-medium text-[#0052CC] hover:underline"
                      >
                        Learn more →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Collections */}
            <div>
              <h3 className="mb-1 text-xl font-bold text-[#253858]">
                Collections
              </h3>
              <p className="mb-6 text-sm text-[#42526E]">
                Curated Atlassian apps and AI agents to help every team work
                better together
              </p>

              <div className="grid grid-cols-4 gap-5">
                {collections.map((col) => (
                  <div
                    key={col.name}
                    className="flex flex-col rounded-xl border border-[#dfe1e6] bg-white p-6 transition-shadow hover:shadow-md"
                  >
                    <h4 className="mb-3 text-lg text-[#253858]">
                      <span className="font-bold">{col.name}</span> Collection
                    </h4>
                    <p className="mb-2 text-sm text-[#42526E]">
                      {col.description}
                    </p>
                    <p className="mb-6 flex-1 text-xs text-[#6B778C]">
                      {col.products}
                    </p>
                    <div className="flex items-center gap-4">
                      <Link
                        href="/dashboard"
                        className="rounded-md border-2 border-[#253858] px-4 py-2 text-sm font-medium text-[#253858] transition-colors hover:bg-[#253858] hover:text-white"
                      >
                        {col.cta}
                      </Link>
                      <Link
                        href="/products"
                        className="text-sm font-medium text-[#0052CC] hover:underline"
                      >
                        Learn more →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Explore by role */}
        <div className="border-t border-[#dfe1e6]">
          <ExploreByRole />
        </div>
      </main>

      <AtlassianFooter />
    </div>
  )
}
