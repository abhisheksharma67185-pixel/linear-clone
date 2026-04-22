"use client"

import { useState } from "react"
import Link from "next/link"

const roles = [
  {
    id: "all",
    label: "All",
    icon: (
      <svg
        className="size-7"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#0052CC"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    ),
  },
  {
    id: "developers",
    label: "Developers",
    icon: (
      <svg
        className="size-7"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8" />
        <path d="M12 17v4" />
        <path d="M7 8l3 3-3 3" />
        <path d="M13 14h4" />
      </svg>
    ),
  },
  {
    id: "product-managers",
    label: "Product Managers",
    icon: (
      <svg
        className="size-7"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    id: "it-professionals",
    label: "IT Professionals",
    icon: (
      <svg
        className="size-7"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    id: "business-teams",
    label: "Business Teams",
    icon: (
      <svg
        className="size-7"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    id: "leadership",
    label: "Leadership",
    icon: (
      <svg
        className="size-7"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
]

const allProducts = [
  {
    name: "Jira",
    description:
      "Plan, track, and deliver your biggest ideas together with Jira - the project management tool for all teams.",
    icon: (
      <div className="flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-blue-700">
        <svg className="size-5 text-white" viewBox="0 0 32 32" fill="white">
          <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
        </svg>
      </div>
    ),
    href: "/dashboard",
    roles: [
      "all",
      "developers",
      "product-managers",
      "business-teams",
      "leadership",
    ],
  },
  {
    name: "Confluence",
    description:
      "Spend less time hunting things down and more time getting things done. Organize your work, create documents, and discuss everything in one place.",
    icon: (
      <div className="flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-blue-700">
        <svg className="size-5 text-white" viewBox="0 0 24 24" fill="white">
          <path d="M2.5 18.5c.5-1.5 1-3 2-4.5 1.5-2 3.5-2.5 5.5-1.5l2 1c2 1 4 .5 5.5-1.5 1-1.5 1.5-3 2-4.5M2.5 5.5c.5 1.5 1 3 2 4.5 1.5 2 3.5 2.5 5.5 1.5l2-1c2-1 4-.5 5.5 1.5 1 1.5 1.5 3 2 4.5" />
        </svg>
      </div>
    ),
    href: "/products",
    roles: ["all", "product-managers", "business-teams", "leadership"],
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
    href: "/products",
    roles: [
      "all",
      "developers",
      "product-managers",
      "business-teams",
      "leadership",
    ],
  },
  {
    name: "Rovo",
    description:
      "Help every team work smarter and faster with AI-powered Search, Chat and Agents - or build custom agents, automations, and apps with Studio.",
    icon: (
      <div className="flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-yellow-400 to-orange-500">
        <svg className="size-5 text-white" viewBox="0 0 24 24" fill="white">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
    ),
    href: "/products",
    roles: ["all", "developers", "business-teams"],
  },
  {
    name: "Bitbucket",
    description:
      "Collaborate on code with inline comments and pull requests. Manage and share your Git repositories to build and ship software, as a team.",
    icon: (
      <div className="flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-blue-700">
        <svg className="size-5 text-white" viewBox="0 0 24 24" fill="white">
          <path d="M3.28 2a.5.5 0 00-.49.59l2.7 16.37a.68.68 0 00.66.57h12.17a.5.5 0 00.5-.42L21.21 2.6a.5.5 0 00-.49-.59zm11.08 12.11H9.82L8.87 8.44h6.47z" />
        </svg>
      </div>
    ),
    href: "/products",
    roles: ["all", "developers"],
  },
  {
    name: "Jira Service Management",
    description:
      "Unite teams on a single AI-powered platform to deliver service at high-velocity.",
    icon: (
      <div className="flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-yellow-400 to-yellow-600">
        <svg className="size-5 text-white" viewBox="0 0 24 24" fill="white">
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
    ),
    href: "/products",
    roles: ["all", "it-professionals"],
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
    href: "/products",
    roles: ["all", "product-managers"],
  },
  {
    name: "Trello",
    description:
      "Collaborate and get more done. Trello boards enable your team to organize projects in a fun, flexible, and visual way.",
    icon: (
      <div className="flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-blue-700">
        <svg className="size-5 text-white" viewBox="0 0 24 24" fill="white">
          <rect x="3" y="3" width="7" height="16" rx="1" />
          <rect x="14" y="3" width="7" height="10" rx="1" />
        </svg>
      </div>
    ),
    href: "/products",
    roles: ["all", "business-teams"],
  },
  {
    name: "Compass",
    description:
      "Bring your distributed software architecture and the teams that collaborate on it together in a single, unified place.",
    icon: (
      <div className="flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-teal-400 to-teal-600">
        <svg className="size-5 text-white" viewBox="0 0 24 24" fill="white">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88" />
        </svg>
      </div>
    ),
    href: "/products",
    roles: ["all", "developers"],
  },
  {
    name: "Rovo Dev",
    description:
      "AI-powered developer tools to write, review, and ship code faster.",
    icon: (
      <div className="flex size-8 items-center justify-center rounded-md bg-[#2D3A2D]">
        <svg
          className="size-5 text-[#7EE787]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
    ),
    href: "/products",
    roles: ["all", "developers"],
  },
  {
    name: "Jira Align",
    description:
      "Connect enterprise strategy to technical execution with Jira Align.",
    icon: (
      <div className="flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-indigo-700">
        <svg className="size-5 text-white" viewBox="0 0 24 24" fill="white">
          <path d="M22 12l-10 7V5l10 7z" />
          <path d="M12 12L2 19V5l10 7z" />
        </svg>
      </div>
    ),
    href: "/products",
    roles: ["all", "leadership"],
  },
  {
    name: "Talent",
    description:
      "Find and hire the best talent with a seamless recruiting platform.",
    icon: (
      <div className="flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-yellow-500 to-amber-600">
        <svg className="size-5 text-white" viewBox="0 0 24 24" fill="white">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>
    ),
    href: "/products",
    roles: ["all", "business-teams", "leadership"],
  },
]

export function ExploreByRole() {
  const [activeRole, setActiveRole] = useState("all")

  const filtered = allProducts.filter((p) => p.roles.includes(activeRole))

  return (
    <section className="py-16">
      <div className="mx-auto max-w-[1200px] px-8">
        <h2 className="mb-10 text-center text-3xl font-bold text-[#253858]">
          Explore by role
        </h2>

        {/* Role filter tabs */}
        <div className="mb-10 flex flex-wrap justify-center gap-3">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setActiveRole(role.id)}
              className={`flex flex-col items-center gap-2 rounded-xl px-6 py-4 text-sm font-medium transition-all ${
                activeRole === role.id
                  ? "border-2 border-[#0052CC] bg-white text-[#0052CC] shadow-sm"
                  : "border-2 border-transparent text-[#42526E] hover:bg-[#f4f5f7]"
              }`}
            >
              <span
                className={
                  activeRole === role.id ? "text-[#0052CC]" : "text-[#6B778C]"
                }
              >
                {role.icon}
              </span>
              {role.label}
            </button>
          ))}
        </div>

        {/* Product cards grid */}
        <div className="grid grid-cols-3 gap-5">
          {filtered.map((product) => (
            <div
              key={product.name}
              className="flex flex-col rounded-xl border border-[#dfe1e6] bg-white p-6 transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex items-center gap-3">
                {product.icon}
                <h3 className="text-lg font-bold text-[#253858]">
                  {product.name}
                </h3>
              </div>
              <p className="mb-6 flex-1 text-sm leading-relaxed text-[#42526E]">
                {product.description}
              </p>
              <div className="flex items-center gap-4">
                <Link
                  href={product.href}
                  className="rounded-md border-2 border-[#253858] px-4 py-2 text-sm font-medium text-[#253858] transition-colors hover:bg-[#253858] hover:text-white"
                >
                  Try now
                </Link>
                <Link
                  href={product.href}
                  className="text-sm font-medium text-[#0052CC] hover:underline"
                >
                  Learn more →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
