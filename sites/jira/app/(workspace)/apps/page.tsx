"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon } from "@hugeicons/core-free-icons"

// ─── App Data ────────────────────────────────────────────────────────────────

interface AppItem {
  name: string
  company: string
  description: string
  rating: number
  reviews: number
  downloads: string
  badge: "SPOTLIGHT" | "BESTSELLER"
  trust: "CLOUD FORTIFIED" | "RUNS ON ATLASSIAN"
  iconBg: string
  iconText: string
}

const apps: AppItem[] = [
  {
    name: "ScriptRunner for Jira",
    company: "Adaptavist",
    description:
      "The must-have app for Jira admins of every technical background: the ultimate toolkit for unlimited automation and customisation",
    rating: 3.7,
    reviews: 819,
    downloads: "36.6k",
    badge: "SPOTLIGHT",
    trust: "CLOUD FORTIFIED",
    iconBg: "bg-sky-100",
    iconText: "SR",
  },
  {
    name: "Xray - Test Management for Jira",
    company: "Xblend",
    description:
      "Native Test Management. Built for every member of your team to plan, test, track and release great software",
    rating: 3.4,
    reviews: 549,
    downloads: "29.1k",
    badge: "SPOTLIGHT",
    trust: "CLOUD FORTIFIED",
    iconBg: "bg-green-100",
    iconText: "X",
  },
  {
    name: "Timesheets by Tempo - Jira Time Tracking",
    company: "Tempo Software",
    description:
      "Tempo Timesheets: #1 AI Jira Time Tracking App for Project Management & Billing with Google, Slack & Outlook Integration",
    rating: 3.3,
    reviews: 885,
    downloads: "29.4k",
    badge: "BESTSELLER",
    trust: "CLOUD FORTIFIED",
    iconBg: "bg-rose-100",
    iconText: "T",
  },
  {
    name: "Jira Misc Workflow Extensions (JMWE)",
    company: "Appfire",
    description:
      "Customize and automate workflows in Jira with JMWE. Built for advanced, unlimited automation and smarter workflow control",
    rating: 3.8,
    reviews: 519,
    downloads: "17.6k",
    badge: "SPOTLIGHT",
    trust: "CLOUD FORTIFIED",
    iconBg: "bg-blue-100",
    iconText: "JM",
  },
  {
    name: "Zephyr - Test Management and Automation for Jira",
    company: "SmartBear",
    description:
      "Manage and automate tests without leaving Jira to ship quality software, faster",
    rating: 3.3,
    reviews: 475,
    downloads: "20k",
    badge: "BESTSELLER",
    trust: "CLOUD FORTIFIED",
    iconBg: "bg-green-100",
    iconText: "Z",
  },
  {
    name: "JXL - Sheets Hierarchy Structure Sum-up Time in...",
    company: "Appfire",
    description:
      "The power of Jira with the simplicity of spreadsheets – plan, manage, and organize work your way with the all-in-one Jira editor",
    rating: 4.0,
    reviews: 142,
    downloads: "5k",
    badge: "BESTSELLER",
    trust: "RUNS ON ATLASSIAN",
    iconBg: "bg-emerald-100",
    iconText: "JX",
  },
  {
    name: "Structure by Tempo - Jira Portfolio Management PPM",
    company: "Tempo Software",
    description:
      "Jira Project Portfolio Management (PPM): Manage projects & team capacity in excel spreadsheet-like tables with advanced hierarchy",
    rating: 3.6,
    reviews: 401,
    downloads: "14.1k",
    badge: "SPOTLIGHT",
    trust: "CLOUD FORTIFIED",
    iconBg: "bg-red-100",
    iconText: "ST",
  },
  {
    name: "eazyBI for Jira Reports, Charts, and Dashboards",
    company: "eazyBI",
    description:
      "Build custom Jira reports for company-wide Jira dashboards. Scalable, powerful, enterprise-ready: complete Jira analytics solution",
    rating: 3.8,
    reviews: 225,
    downloads: "12k",
    badge: "SPOTLIGHT",
    trust: "CLOUD FORTIFIED",
    iconBg: "bg-yellow-100",
    iconText: "eB",
  },
  {
    name: "JSU Automation Suite for Jira Workflows",
    company: "Appfire",
    description:
      "Easy, no-code workflow automation for Jira with a drag-and-drop rule builder and unlimited automation rule executions",
    rating: 3.6,
    reviews: 293,
    downloads: "13.2k",
    badge: "SPOTLIGHT",
    trust: "CLOUD FORTIFIED",
    iconBg: "bg-emerald-100",
    iconText: "JS",
  },
  {
    name: "Deep Clone for Jira",
    company: "codefortynine",
    description:
      "Clone projects, bulk clone issues & copy epics. Duplicate project templates & recurring tasks. Migrate projects between instances",
    rating: 3.6,
    reviews: 131,
    downloads: "13.3k",
    badge: "BESTSELLER",
    trust: "CLOUD FORTIFIED",
    iconBg: "bg-blue-100",
    iconText: "DC",
  },
  {
    name: "Power BI Connector for Jira",
    company: "Tempo Software",
    description:
      "No-code Power BI Jira integration. Connect Jira to Power BI and build custom Jira reports easily. Use free dashboard templates",
    rating: 3.8,
    reviews: 157,
    downloads: "10.1k",
    badge: "BESTSELLER",
    trust: "CLOUD FORTIFIED",
    iconBg: "bg-teal-100",
    iconText: "PB",
  },
  {
    name: "Rich Filters for Jira Dashboards",
    company: "Appfire",
    description:
      "Make your Jira dashboard actually work for you – use smart filters and build custom, dynamic reports that highlight what matters",
    rating: 3.8,
    reviews: 177,
    downloads: "9.1k",
    badge: "SPOTLIGHT",
    trust: "CLOUD FORTIFIED",
    iconBg: "bg-indigo-100",
    iconText: "RF",
  },
  {
    name: "Checklists for Jira (Pro) by HeroCoders",
    company: "HeroCoders",
    description:
      "Jira checklists for Definition of Done, Acceptance Criteria, and ToDo lists. The smart checklist solution to automate action items",
    rating: 3.6,
    reviews: 264,
    downloads: "8.6k",
    badge: "BESTSELLER",
    trust: "CLOUD FORTIFIED",
    iconBg: "bg-green-100",
    iconText: "CH",
  },
  {
    name: "Custom Charts for Jira - Reports, Dashboards, Graphs ...",
    company: "Tempo Software",
    description:
      "Easily create comprehensive charts, graphs, filters & reports for your Jira Dashboards & Analytics, and Track Time in Status",
    rating: 3.6,
    reviews: 138,
    downloads: "8.7k",
    badge: "SPOTLIGHT",
    trust: "CLOUD FORTIFIED",
    iconBg: "bg-cyan-100",
    iconText: "CC",
  },
  {
    name: "Jira Workflow Toolbox",
    company: "Decadis AG",
    description:
      "JWT - the best rated & complete automation solution. Limitless customization of Jira workflows without the need to code",
    rating: 4.0,
    reviews: 534,
    downloads: "5.1k",
    badge: "SPOTLIGHT",
    trust: "CLOUD FORTIFIED",
    iconBg: "bg-slate-100",
    iconText: "JW",
  },
  {
    name: "Worklogs - Time Tracking, Time Reports, Timesheets",
    company: "SolDevelo",
    description:
      "Time reports and time tracking for members of your team done in an easy and flexible way. Your daily Time Tracker",
    rating: 3.6,
    reviews: 98,
    downloads: "5.8k",
    badge: "BESTSELLER",
    trust: "RUNS ON ATLASSIAN",
    iconBg: "bg-gray-100",
    iconText: "WL",
  },
  {
    name: "Email This Issue",
    company: "META-INF KFT",
    description:
      "Mail collaboration and email service desk made easy - send and receive e-mails and notifications, with support for external users",
    rating: 3.5,
    reviews: 179,
    downloads: "6k",
    badge: "SPOTLIGHT",
    trust: "CLOUD FORTIFIED",
    iconBg: "bg-green-100",
    iconText: "EM",
  },
  {
    name: "Time in Status",
    company: "SaaSJet",
    description:
      "From Jira status time to clarity: reports, custom fields, dashboards, average time, lead time, cycle time. + Sprint velocity",
    rating: 3.6,
    reviews: 207,
    downloads: "5.6k",
    badge: "BESTSELLER",
    trust: "CLOUD FORTIFIED",
    iconBg: "bg-orange-100",
    iconText: "TS",
  },
  {
    name: "Gantt Charts for Structure PPM - Jira Roadmaps | Tempo",
    company: "Tempo Software",
    description:
      "Visualize Structure custom hierarchies, roadmap, project plan, timeline, dependencies, calendar & progress in Jira Gantt Charts",
    rating: 3.4,
    reviews: 60,
    downloads: "7k",
    badge: "SPOTLIGHT",
    trust: "CLOUD FORTIFIED",
    iconBg: "bg-red-100",
    iconText: "GC",
  },
  {
    name: "Clockwork Pro for Jira Time Tracking and Timesheets",
    company: "HeroCoders",
    description:
      "Advanced time tracking, timesheets, and cost tracking. Automatic time tracker. Worklog Reports for Billing. Calendar integration",
    rating: 3.7,
    reviews: 138,
    downloads: "4.9k",
    badge: "BESTSELLER",
    trust: "CLOUD FORTIFIED",
    iconBg: "bg-green-100",
    iconText: "CP",
  },
  {
    name: "Smart Checklists for Jira (Pro)",
    company: "TitanApps",
    description:
      "Runs on Atlassian Checklist for Jira: Quick Subtasks, Templates & Automation, Definition of Done, Acceptance Criteria, QA, HR",
    rating: 3.7,
    reviews: 119,
    downloads: "4.4k",
    badge: "BESTSELLER",
    trust: "RUNS ON ATLASSIAN",
    iconBg: "bg-blue-100",
    iconText: "SC",
  },
  {
    name: "Xporter - Export issues from Jira to PDF, Word, Excel",
    company: "Xblend",
    description:
      "Revolutionize your Jira reporting. Generate and automate PDF/DOCX/XLSX reports in your issue screens",
    rating: 3.7,
    reviews: 292,
    downloads: "4.2k",
    badge: "SPOTLIGHT",
    trust: "CLOUD FORTIFIED",
    iconBg: "bg-sky-100",
    iconText: "XP",
  },
  {
    name: "AIO Tests: QA Testing and Test Management for Jira",
    company: "Navarambh Software Pvt. Ltd.",
    description:
      "All-In-One, feature-rich & scalable Jira-native QA app for end-to-end test management with AI assisted test creation capabilities",
    rating: 3.9,
    reviews: 110,
    downloads: "3.8k",
    badge: "SPOTLIGHT",
    trust: "CLOUD FORTIFIED",
    iconBg: "bg-amber-100",
    iconText: "AI",
  },
  {
    name: "Activity Timeline: Resource Capacity Planning, Time...",
    company: "Reliex",
    description:
      "Resource Management, Timesheet Reports, Resource Planning & Timelines. Capacity Planner, Tracker and Advanced Roadmaps Integration",
    rating: 3.8,
    reviews: 116,
    downloads: "4k",
    badge: "BESTSELLER",
    trust: "CLOUD FORTIFIED",
    iconBg: "bg-cyan-100",
    iconText: "AT",
  },
]

const filterButtons = [
  "Pricing",
  "Trust signals",
  "Categories",
  "Use cases",
  "More filters",
]

// ─── Star Rating ─────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.3
  const stars = []
  for (let i = 0; i < 4; i++) {
    if (i < full) {
      stars.push(
        <svg
          key={i}
          className="size-4 text-amber-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )
    } else if (i === full && half) {
      stars.push(
        <svg key={i} className="size-4 text-amber-400" viewBox="0 0 20 20">
          <defs>
            <linearGradient id={`half-${i}`}>
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="#D1D5DB" />
            </linearGradient>
          </defs>
          <path
            fill={`url(#half-${i})`}
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      )
    } else {
      stars.push(
        <svg
          key={i}
          className="size-4 text-gray-300"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )
    }
  }
  return <div className="flex items-center">{stars}</div>
}

// ─── App Card ────────────────────────────────────────────────────────────────

function AppCard({ app }: { app: AppItem }) {
  return (
    <div className="group relative flex cursor-pointer flex-col rounded-lg border bg-card p-5 transition-shadow hover:shadow-md">
      {/* Badge */}
      <span
        className={`absolute -top-2.5 right-3 rounded px-2 py-0.5 text-[10px] font-bold text-white uppercase ${
          app.badge === "SPOTLIGHT" ? "bg-purple-600" : "bg-amber-500"
        }`}
      >
        {app.badge}
      </span>

      {/* Icon + Info */}
      <div className="mb-3 flex items-start gap-4">
        <div
          className={`flex size-14 shrink-0 items-center justify-center rounded-xl text-base font-bold ${app.iconBg} text-foreground/70`}
        >
          {app.iconText}
        </div>
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-sm leading-snug font-semibold">
            {app.name}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            by {app.company}{" "}
            <svg
              className="inline size-3 text-amber-500"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path d="M8 0l2 5h5l-4 3.5 1.5 5L8 10.5 3.5 13.5 5 8.5 1 5h5z" />
            </svg>
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="mb-4 line-clamp-3 flex-1 text-xs leading-relaxed text-muted-foreground">
        {app.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold">{app.rating}/4</span>
          <StarRating rating={app.rating} />
          <span className="text-xs text-muted-foreground">({app.reviews})</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <svg
            className="size-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {app.downloads}
        </div>
      </div>

      {/* Trust badge */}
      <div className="mt-3 flex items-center gap-1.5 border-t pt-3">
        <svg
          className="size-3.5 text-blue-500"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M8 1l2 3h3l-1 3 2 3h-3l-2 3-2-3H4l2-3-1-3h3z" />
        </svg>
        <span className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          {app.trust}
        </span>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AppsPage() {
  const [search, setSearch] = useState("")
  const [visibleCount, setVisibleCount] = useState(9)

  const filteredApps = apps.filter(
    (app) =>
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.company.toLowerCase().includes(search.toLowerCase()) ||
      app.description.toLowerCase().includes(search.toLowerCase())
  )

  const visibleApps = filteredApps.slice(0, visibleCount)
  const hasMore = visibleCount < filteredApps.length

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <span>Jira</span>
          <span>/</span>
          <span>Marketplace apps</span>
        </div>
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <svg
            className="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Feedback
        </button>
      </div>

      {/* Title */}
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">
        Explore apps for Jira
      </h1>

      {/* Search */}
      <div className="relative mb-4">
        <svg
          className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <Input
          placeholder="Search for apps"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 pl-10"
        />
      </div>

      {/* Filter chips */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {filterButtons.map((label) => (
          <button
            key={label}
            className="flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
          >
            {label}
            <HugeiconsIcon icon={ArrowDown01Icon} className="size-3.5" />
          </button>
        ))}
      </div>

      {/* Results count + sort */}
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Showing over 1,000 apps</p>
        <button className="flex items-center gap-1 text-sm font-medium">
          Sort by: Relevance
          <HugeiconsIcon icon={ArrowDown01Icon} className="size-3.5" />
        </button>
      </div>

      {/* App grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleApps.map((app) => (
          <AppCard key={app.name} app={app} />
        ))}
      </div>

      {filteredApps.length === 0 && (
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          No apps found matching your search.
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setVisibleCount((prev) => prev + 9)}
            className="rounded-md border px-6 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  )
}
