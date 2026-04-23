"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface TemplateDetail {
  name: string
  description: string
  category: string
  badge?: string
  color: string
  iconColor: string
  previewBg: string
  previewLabel: string
  fullDescription: string
  product: string
  recommendedFor: string[]
  workTypes: { name: string; color: string }[]
  workflow: string[]
  features: { title: string; description: string; linkText: string }[]
}

const allTemplates: TemplateDetail[] = [
  {
    name: "Scrum",
    description: "Plan, track, and execute work using sprints and a backlog.",
    category: "Made for you",
    badge: "LAST CREATED",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-green-400 to-green-500",
    previewLabel: "Backlog",
    fullDescription:
      "The Scrum template helps teams work together using sprints to break down large, complex projects into bite-sized pieces of value. Encourage your team to learn through incremental delivery, self-organize while working on a problem, and regularly reflect on their wins and losses to continuously improve.",
    product: "Jira",
    recommendedFor: [
      "Teams that deliver work on a regular cadence",
      "DevOps teams that want to connect work across their tools",
    ],
    workTypes: [
      { name: "Epic", color: "bg-purple-500" },
      { name: "Story", color: "bg-green-500" },
      { name: "Bug", color: "bg-red-500" },
      { name: "Task", color: "bg-blue-500" },
      { name: "Sub-task", color: "bg-cyan-500" },
    ],
    workflow: ["TO DO", "IN PROGRESS", "DONE"],
    features: [
      {
        title: "Plan upcoming work in a backlog",
        description:
          "Prioritize and plan your team's work on the backlog. Break down work from your project timeline, and order work items so your team knows what to deliver first.",
        linkText: "Learn more about the backlog",
      },
      {
        title: "Organize cycles of work into sprints",
        description:
          "Sprints are short, time-boxed periods when a team collaborates to complete a set amount of customer value. Use sprints to drive incremental delivery, allow your team to ship high-quality work and deliver value faster.",
        linkText: "Learn more about sprints",
      },
      {
        title: "Understand your team's velocity",
        description:
          "Improve predictability on planning and delivery with out-of-the-box reports, including the sprint report and velocity chart. Empower your team to understand their capacity and iterate on their processes.",
        linkText: "Learn more about agile metrics",
      },
    ],
  },
  {
    name: "General service management",
    description: "Create one place to collect and manage any type of request.",
    category: "Made for you",
    badge: "TRY",
    color: "bg-purple-100",
    iconColor: "text-purple-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Requests",
    fullDescription:
      "Set up a centralized service desk to manage and track incoming work requests. Give your customers and employees a single place to submit requests, and your team a clear view of what needs attention.",
    product: "Jira Service Management",
    recommendedFor: [
      "Teams managing incoming requests",
      "IT and support teams",
    ],
    workTypes: [
      { name: "Request", color: "bg-purple-500" },
      { name: "Incident", color: "bg-red-500" },
      { name: "Change", color: "bg-blue-500" },
    ],
    workflow: ["OPEN", "IN PROGRESS", "WAITING", "RESOLVED"],
    features: [
      {
        title: "Collect requests in one place",
        description:
          "Give your customers a simple portal to submit requests. Automatically route requests to the right team members.",
        linkText: "Learn more about request management",
      },
      {
        title: "Track and prioritize work",
        description:
          "Use queues and SLAs to ensure your team focuses on the most important work first. Never miss a deadline.",
        linkText: "Learn more about queues",
      },
    ],
  },
  {
    name: "Basic IT service management",
    description:
      "Quickly respond to requests, resolve incidents, and deploy changes.",
    category: "Made for you",
    color: "bg-green-100",
    iconColor: "text-green-600",
    previewBg: "from-orange-400 to-orange-500",
    previewLabel: "Open",
    fullDescription:
      "Manage IT service requests, incidents, problems, and changes with an ITIL-ready project. Enable your team to deliver fast, reliable IT services.",
    product: "Jira Service Management",
    recommendedFor: [
      "IT teams managing infrastructure",
      "Teams with ITIL processes",
    ],
    workTypes: [
      { name: "Incident", color: "bg-red-500" },
      { name: "Service request", color: "bg-purple-500" },
      { name: "Change", color: "bg-blue-500" },
      { name: "Problem", color: "bg-orange-500" },
    ],
    workflow: ["OPEN", "IN PROGRESS", "PENDING", "RESOLVED"],
    features: [
      {
        title: "Respond to incidents quickly",
        description:
          "Alert the right people and start resolving incidents faster with built-in escalation and on-call schedules.",
        linkText: "Learn more about incident management",
      },
      {
        title: "Manage changes safely",
        description:
          "Reduce risk with change management workflows that include approvals, risk assessment, and deployment tracking.",
        linkText: "Learn more about change management",
      },
    ],
  },
  {
    name: "Top-level planning",
    description:
      "Plan, track, and manage work across multiple teams and projects.",
    category: "Made for you",
    badge: "PREMIUM",
    color: "bg-pink-100",
    iconColor: "text-pink-600",
    previewBg: "from-emerald-400 to-emerald-500",
    previewLabel: "Plan",
    fullDescription:
      "Get visibility across multiple teams and projects with cross-project planning boards, dependency tracking, and capacity management. Perfect for program managers.",
    product: "Jira",
    recommendedFor: ["Program managers", "Leaders overseeing multiple teams"],
    workTypes: [
      { name: "Epic", color: "bg-purple-500" },
      { name: "Initiative", color: "bg-indigo-500" },
    ],
    workflow: ["TO DO", "IN PROGRESS", "DONE"],
    features: [
      {
        title: "Visualize work across teams",
        description:
          "See all your team's work on a single timeline. Identify dependencies, risks, and bottlenecks before they become problems.",
        linkText: "Learn more about plans",
      },
      {
        title: "Track capacity and progress",
        description:
          "Understand each team's capacity and make informed decisions about what to commit to next.",
        linkText: "Learn more about capacity planning",
      },
    ],
  },
  {
    name: "Kanban",
    description:
      "Visualize and advance your project forward using issues on a powerful board.",
    category: "Software development",
    color: "bg-teal-100",
    iconColor: "text-teal-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Board",
    fullDescription:
      "The Kanban template helps teams visualize their work, limit work in progress, and maximize efficiency. Use it to manage a continuous flow of work without fixed iterations.",
    product: "Jira",
    recommendedFor: [
      "Teams with continuous delivery",
      "Support and maintenance teams",
    ],
    workTypes: [
      { name: "Epic", color: "bg-purple-500" },
      { name: "Story", color: "bg-green-500" },
      { name: "Bug", color: "bg-red-500" },
      { name: "Task", color: "bg-blue-500" },
    ],
    workflow: ["BACKLOG", "SELECTED", "IN PROGRESS", "DONE"],
    features: [
      {
        title: "Visualize work on a board",
        description:
          "Drag and drop issues across columns to track progress. Set WIP limits to prevent bottlenecks.",
        linkText: "Learn more about Kanban boards",
      },
      {
        title: "Continuous improvement",
        description:
          "Use cumulative flow diagrams and control charts to identify bottlenecks and improve your process.",
        linkText: "Learn more about Kanban metrics",
      },
    ],
  },
  {
    name: "Scrum",
    description: "Plan, track, and execute work using sprints and a backlog.",
    category: "Software development",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-green-400 to-green-500",
    previewLabel: "Backlog",
    fullDescription:
      "The Scrum template helps teams work together using sprints to break down large, complex projects into bite-sized pieces of value.",
    product: "Jira",
    recommendedFor: [
      "Teams that deliver work on a regular cadence",
      "DevOps teams",
    ],
    workTypes: [
      { name: "Epic", color: "bg-purple-500" },
      { name: "Story", color: "bg-green-500" },
      { name: "Bug", color: "bg-red-500" },
      { name: "Task", color: "bg-blue-500" },
    ],
    workflow: ["TO DO", "IN PROGRESS", "DONE"],
    features: [
      {
        title: "Plan upcoming work in a backlog",
        description: "Prioritize and plan your team's work on the backlog.",
        linkText: "Learn more about the backlog",
      },
      {
        title: "Organize cycles of work into sprints",
        description: "Use sprints to drive incremental delivery.",
        linkText: "Learn more about sprints",
      },
    ],
  },
  {
    name: "Top-level planning",
    description:
      "Plan, track, and report on big chunks of work, such as a program or initiative.",
    category: "Software development",
    badge: "PREMIUM",
    color: "bg-pink-100",
    iconColor: "text-pink-600",
    previewBg: "from-emerald-400 to-emerald-500",
    previewLabel: "Plan",
    fullDescription:
      "Get visibility across multiple teams and projects with cross-project planning boards.",
    product: "Jira",
    recommendedFor: ["Program managers", "Leaders overseeing multiple teams"],
    workTypes: [
      { name: "Epic", color: "bg-purple-500" },
      { name: "Initiative", color: "bg-indigo-500" },
    ],
    workflow: ["TO DO", "IN PROGRESS", "DONE"],
    features: [
      {
        title: "Visualize work across teams",
        description: "See all your team's work on a single timeline.",
        linkText: "Learn more about plans",
      },
    ],
  },
  {
    name: "Cross-team planning",
    description: "Align teams on shared goals and timelines.",
    category: "Software development",
    badge: "PREMIUM",
    color: "bg-indigo-100",
    iconColor: "text-indigo-600",
    previewBg: "from-blue-400 to-indigo-500",
    previewLabel: "Planning",
    fullDescription:
      "Coordinate work across multiple teams with shared timelines and dependency tracking.",
    product: "Jira",
    recommendedFor: ["Program managers", "Engineering leaders"],
    workTypes: [
      { name: "Epic", color: "bg-purple-500" },
      { name: "Initiative", color: "bg-indigo-500" },
    ],
    workflow: ["TO DO", "IN PROGRESS", "DONE"],
    features: [
      {
        title: "Cross-team dependencies",
        description: "Identify and manage dependencies across teams.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Development requests",
    description:
      "Easily sync new feature requests, bugs, and incidents with your backlog.",
    category: "Software development",
    color: "bg-purple-100",
    iconColor: "text-purple-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Requests",
    fullDescription:
      "Connect your service desk with your development backlog to ensure customer issues get resolved.",
    product: "Jira Service Management",
    recommendedFor: ["Development teams", "Support teams"],
    workTypes: [
      { name: "Request", color: "bg-purple-500" },
      { name: "Bug", color: "bg-red-500" },
      { name: "Incident", color: "bg-orange-500" },
    ],
    workflow: ["OPEN", "IN PROGRESS", "RESOLVED"],
    features: [
      {
        title: "Sync requests to dev",
        description:
          "Automatically escalate requests to your development backlog.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Product roadmap",
    description: "Create custom roadmaps and share your plans with everyone.",
    category: "Software development",
    color: "bg-cyan-100",
    iconColor: "text-cyan-600",
    previewBg: "from-orange-400 to-orange-500",
    previewLabel: "Roadmap",
    fullDescription:
      "Plan and communicate your product strategy with a visual timeline.",
    product: "Jira Product Discovery",
    recommendedFor: ["Product managers", "Product teams"],
    workTypes: [
      { name: "Epic", color: "bg-purple-500" },
      { name: "Idea", color: "bg-cyan-500" },
    ],
    workflow: ["IDEATION", "PLANNED", "IN PROGRESS", "SHIPPED"],
    features: [
      {
        title: "Visual roadmaps",
        description: "Create timeline views of your product plans.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Prioritization",
    description:
      "Evaluate ideas across reach, impact, confidence and effort to quickly prioritize.",
    category: "Software development",
    color: "bg-amber-100",
    iconColor: "text-amber-600",
    previewBg: "from-amber-400 to-amber-500",
    previewLabel: "Prioritization",
    fullDescription:
      "Use RICE scoring to prioritize features and ideas based on data.",
    product: "Jira Product Discovery",
    recommendedFor: ["Product managers"],
    workTypes: [{ name: "Idea", color: "bg-amber-500" }],
    workflow: ["NEW", "EVALUATING", "PLANNED", "SHIPPED"],
    features: [
      {
        title: "RICE scoring",
        description: "Score ideas by Reach, Impact, Confidence, and Effort.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Bug tracking",
    description: "Log, prioritize, and resolve software bugs.",
    category: "Software development",
    color: "bg-red-100",
    iconColor: "text-red-600",
    previewBg: "from-red-400 to-red-500",
    previewLabel: "Bugs",
    fullDescription:
      "Capture, track, and resolve bugs efficiently. Prioritize issues by severity and ensure nothing falls through the cracks.",
    product: "Jira",
    recommendedFor: ["QA teams", "Development teams shipping frequently"],
    workTypes: [
      { name: "Bug", color: "bg-red-500" },
      { name: "Task", color: "bg-blue-500" },
    ],
    workflow: ["TO DO", "IN PROGRESS", "IN REVIEW", "DONE"],
    features: [
      {
        title: "Capture bugs from anywhere",
        description:
          "Log bugs from your browser, IDE, or CI/CD pipeline. Include all the context developers need to fix issues.",
        linkText: "Learn more about bug tracking",
      },
    ],
  },
  // Service management
  {
    name: "General service management",
    description: "Create one place to collect and manage any type of request.",
    category: "Service management",
    badge: "RECOMMENDED",
    color: "bg-purple-100",
    iconColor: "text-purple-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Requests",
    fullDescription:
      "Set up a centralized service desk to manage and track incoming work requests from any team or customer.",
    product: "Jira Service Management",
    recommendedFor: [
      "Teams managing incoming requests",
      "Shared services teams",
    ],
    workTypes: [
      { name: "Request", color: "bg-purple-500" },
      { name: "Incident", color: "bg-red-500" },
      { name: "Change", color: "bg-blue-500" },
    ],
    workflow: ["OPEN", "IN PROGRESS", "WAITING", "RESOLVED"],
    features: [
      {
        title: "Collect requests",
        description: "Give customers a simple portal to submit requests.",
        linkText: "Learn more about request management",
      },
    ],
  },
  {
    name: "Blank space",
    description:
      "Start fresh with a blank space and customize how you manage incoming service requests.",
    category: "Service management",
    color: "bg-gray-100",
    iconColor: "text-gray-600",
    previewBg: "from-blue-300 to-blue-400",
    previewLabel: "Blank",
    fullDescription:
      "Start with a blank canvas and configure your service desk from scratch.",
    product: "Jira Service Management",
    recommendedFor: ["Teams with unique workflows"],
    workTypes: [{ name: "Request", color: "bg-purple-500" }],
    workflow: ["OPEN", "IN PROGRESS", "RESOLVED"],
    features: [
      {
        title: "Fully customizable",
        description: "Build your service desk workflow from the ground up.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "IT service management",
    description:
      "Quickly respond to requests, resolve incidents, and deploy changes.",
    category: "Service management",
    color: "bg-green-100",
    iconColor: "text-green-600",
    previewBg: "from-orange-400 to-orange-500",
    previewLabel: "Change calendar",
    fullDescription:
      "Manage IT service requests, incidents, problems, and changes with ITIL-ready workflows.",
    product: "Jira Service Management",
    recommendedFor: ["IT teams", "DevOps teams"],
    workTypes: [
      { name: "Incident", color: "bg-red-500" },
      { name: "Change", color: "bg-blue-500" },
      { name: "Problem", color: "bg-orange-500" },
    ],
    workflow: ["OPEN", "IN PROGRESS", "PENDING", "RESOLVED"],
    features: [
      {
        title: "Respond to incidents",
        description: "Alert the right people and resolve incidents faster.",
        linkText: "Learn more about incident management",
      },
      {
        title: "Manage changes safely",
        description: "Reduce risk with change management workflows.",
        linkText: "Learn more about change management",
      },
    ],
  },
  {
    name: "IT Operations",
    description:
      "Prioritize and resolve incidents, automate alerts to on-call teams, and minimize downtime with dedicated IT operations workflows.",
    category: "Service management",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-amber-400 to-amber-500",
    previewLabel: "Alerts",
    fullDescription:
      "Prioritize and resolve incidents with dedicated IT operations workflows and on-call scheduling.",
    product: "Jira Service Management",
    recommendedFor: ["IT operations teams", "Site reliability engineers"],
    workTypes: [
      { name: "Incident", color: "bg-red-500" },
      { name: "Alert", color: "bg-amber-500" },
    ],
    workflow: ["TRIGGERED", "ACKNOWLEDGED", "RESOLVED"],
    features: [
      {
        title: "On-call management",
        description: "Route alerts to the right team members automatically.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Customer service management",
    description:
      "Level up your service with AI and launch on-brand customer experiences that truly connect.",
    category: "Service management",
    color: "bg-teal-100",
    iconColor: "text-teal-600",
    previewBg: "from-purple-400 to-purple-500",
    previewLabel: "Support",
    fullDescription:
      "Deliver exceptional customer service with AI-powered features and branded help centers.",
    product: "Customer Service Management",
    recommendedFor: ["Customer support teams", "Customer success teams"],
    workTypes: [
      { name: "Request", color: "bg-purple-500" },
      { name: "Incident", color: "bg-red-500" },
    ],
    workflow: ["OPEN", "WAITING", "IN PROGRESS", "RESOLVED"],
    features: [
      {
        title: "AI-powered support",
        description:
          "Use AI to categorize and route customer requests automatically.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Development requests",
    description:
      "Easily sync new feature requests, bugs, and incidents with your backlog.",
    category: "Service management",
    color: "bg-indigo-100",
    iconColor: "text-indigo-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Requests",
    fullDescription:
      "Connect your service desk with development teams to ensure customer-reported issues get resolved.",
    product: "Jira Service Management",
    recommendedFor: ["Development teams", "Support teams"],
    workTypes: [
      { name: "Bug", color: "bg-red-500" },
      { name: "Feature request", color: "bg-green-500" },
    ],
    workflow: ["OPEN", "IN PROGRESS", "RESOLVED"],
    features: [
      {
        title: "Sync to dev backlog",
        description:
          "Automatically escalate requests to your development team.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "HR service management",
    description: "Simplify onboarding, off-boarding, and any other HR request.",
    category: "Service management",
    badge: "UPDATED",
    color: "bg-emerald-100",
    iconColor: "text-emerald-600",
    previewBg: "from-emerald-400 to-emerald-500",
    previewLabel: "HR",
    fullDescription:
      "Manage HR service requests including onboarding, off-boarding, benefits, and more.",
    product: "Jira Service Management",
    recommendedFor: ["HR teams", "People operations"],
    workTypes: [
      { name: "HR request", color: "bg-emerald-500" },
      { name: "Onboarding", color: "bg-teal-500" },
    ],
    workflow: ["OPEN", "IN PROGRESS", "WAITING", "RESOLVED"],
    features: [
      {
        title: "Employee onboarding",
        description: "Automate onboarding checklists and approvals.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Finance service management",
    description:
      "Easily manage and track budget, spend, and any other finance request.",
    category: "Service management",
    color: "bg-sky-100",
    iconColor: "text-sky-600",
    previewBg: "from-sky-400 to-sky-500",
    previewLabel: "Finance",
    fullDescription:
      "Manage finance requests including budget approvals, expense reports, and procurement.",
    product: "Jira Service Management",
    recommendedFor: ["Finance teams", "Procurement teams"],
    workTypes: [
      { name: "Finance request", color: "bg-sky-500" },
      { name: "Approval", color: "bg-blue-500" },
    ],
    workflow: ["SUBMITTED", "IN REVIEW", "APPROVED", "COMPLETED"],
    features: [
      {
        title: "Budget tracking",
        description: "Track and approve budget requests with clear workflows.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Facilities service management",
    description:
      "Easily manage requests for maintenance, moving, and event planning.",
    category: "Service management",
    color: "bg-cyan-100",
    iconColor: "text-cyan-600",
    previewBg: "from-cyan-400 to-cyan-500",
    previewLabel: "Facilities",
    fullDescription:
      "Handle facilities requests for maintenance, office moves, and event coordination.",
    product: "Jira Service Management",
    recommendedFor: ["Facilities teams", "Office managers"],
    workTypes: [
      { name: "Maintenance", color: "bg-cyan-500" },
      { name: "Move request", color: "bg-blue-500" },
    ],
    workflow: ["OPEN", "IN PROGRESS", "RESOLVED"],
    features: [
      {
        title: "Manage facilities",
        description: "Track maintenance and office requests in one place.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Marketing service management",
    description:
      "Manage employee requests for assets, reviews, and any other marketing requests.",
    category: "Service management",
    color: "bg-pink-100",
    iconColor: "text-pink-600",
    previewBg: "from-pink-400 to-pink-500",
    previewLabel: "Marketing",
    fullDescription:
      "Centralize marketing requests for creative assets, campaign reviews, and brand approvals.",
    product: "Jira Service Management",
    recommendedFor: ["Marketing teams", "Creative teams"],
    workTypes: [
      { name: "Creative request", color: "bg-pink-500" },
      { name: "Review", color: "bg-purple-500" },
    ],
    workflow: ["REQUESTED", "IN PROGRESS", "IN REVIEW", "DELIVERED"],
    features: [
      {
        title: "Creative requests",
        description: "Manage requests for marketing assets and reviews.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Analytics service management",
    description:
      "Help employees access and request the data and analytics they need.",
    category: "Service management",
    color: "bg-orange-100",
    iconColor: "text-orange-600",
    previewBg: "from-orange-400 to-orange-500",
    previewLabel: "Analytics",
    fullDescription:
      "Manage data and analytics requests from across the organization.",
    product: "Jira Service Management",
    recommendedFor: ["Data teams", "Analytics teams"],
    workTypes: [
      { name: "Data request", color: "bg-orange-500" },
      { name: "Report", color: "bg-blue-500" },
    ],
    workflow: ["REQUESTED", "IN PROGRESS", "DELIVERED"],
    features: [
      {
        title: "Data requests",
        description: "Track and fulfill data and analytics requests.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Legal service management",
    description: "Easily manage requests about contracts, policies, and more.",
    category: "Service management",
    color: "bg-violet-100",
    iconColor: "text-violet-600",
    previewBg: "from-violet-400 to-violet-500",
    previewLabel: "Legal",
    fullDescription:
      "Centralize legal requests for contract reviews, policy questions, and compliance matters.",
    product: "Jira Service Management",
    recommendedFor: ["Legal teams", "Compliance teams"],
    workTypes: [
      { name: "Contract review", color: "bg-violet-500" },
      { name: "Legal request", color: "bg-purple-500" },
    ],
    workflow: ["SUBMITTED", "IN REVIEW", "APPROVED", "COMPLETED"],
    features: [
      {
        title: "Contract management",
        description: "Track contract reviews and approvals.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Sales service management",
    description:
      "Easily manage requests for quote support, contract reviews, and more.",
    category: "Service management",
    color: "bg-rose-100",
    iconColor: "text-rose-600",
    previewBg: "from-rose-400 to-rose-500",
    previewLabel: "Sales",
    fullDescription:
      "Support your sales team with streamlined request management for quotes, contracts, and approvals.",
    product: "Jira Service Management",
    recommendedFor: ["Sales teams", "Sales operations"],
    workTypes: [
      { name: "Quote request", color: "bg-rose-500" },
      { name: "Contract", color: "bg-blue-500" },
    ],
    workflow: ["REQUESTED", "IN PROGRESS", "COMPLETED"],
    features: [
      {
        title: "Sales support",
        description: "Manage quote and contract review requests.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Design service management",
    description:
      "Manage employee requests for designs, reviews, and any other requests.",
    category: "Service management",
    color: "bg-fuchsia-100",
    iconColor: "text-fuchsia-600",
    previewBg: "from-fuchsia-400 to-fuchsia-500",
    previewLabel: "Design",
    fullDescription:
      "Centralize design requests for creative assets, UX reviews, and brand guidelines.",
    product: "Jira Service Management",
    recommendedFor: ["Design teams", "UX teams"],
    workTypes: [
      { name: "Design request", color: "bg-fuchsia-500" },
      { name: "Review", color: "bg-purple-500" },
    ],
    workflow: ["REQUESTED", "IN PROGRESS", "IN REVIEW", "DELIVERED"],
    features: [
      {
        title: "Design requests",
        description: "Manage and prioritize incoming design work.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "IT service management (Essentials)",
    description:
      "Manage simple changes, incidents, problems and service requests with team-managed ITSM workflows.",
    category: "Service management",
    color: "bg-slate-100",
    iconColor: "text-slate-600",
    previewBg: "from-slate-400 to-slate-500",
    previewLabel: "ITSM",
    fullDescription:
      "A simplified ITSM template for smaller teams with team-managed workflows.",
    product: "Jira Service Management",
    recommendedFor: ["Small IT teams", "Growing teams"],
    workTypes: [
      { name: "Incident", color: "bg-red-500" },
      { name: "Service request", color: "bg-purple-500" },
    ],
    workflow: ["OPEN", "IN PROGRESS", "RESOLVED"],
    features: [
      {
        title: "Simplified ITSM",
        description: "Get started quickly with essential ITSM workflows.",
        linkText: "Learn more",
      },
    ],
  },
  // Work management
  {
    name: "Blank space",
    description: "Start with a blank canvas",
    category: "Work management",
    color: "bg-gray-100",
    iconColor: "text-gray-600",
    previewBg: "from-gray-300 to-gray-400",
    previewLabel: "Blank",
    fullDescription:
      "Start fresh with a completely blank project and customize everything from scratch.",
    product: "Jira",
    recommendedFor: ["Any team"],
    workTypes: [{ name: "Task", color: "bg-blue-500" }],
    workflow: ["TO DO", "IN PROGRESS", "DONE"],
    features: [
      {
        title: "Full flexibility",
        description: "Build your workflow from scratch.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Project management",
    description: "Plan and deliver business projects.",
    category: "Work management",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Projects",
    fullDescription:
      "Track project milestones, deliverables, and team tasks in one place.",
    product: "Jira",
    recommendedFor: ["Project managers", "Cross-functional teams"],
    workTypes: [
      { name: "Task", color: "bg-blue-500" },
      { name: "Milestone", color: "bg-green-500" },
    ],
    workflow: ["TO DO", "IN PROGRESS", "IN REVIEW", "DONE"],
    features: [
      {
        title: "Plan projects",
        description: "Break down projects into tasks and track progress.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Task tracking",
    description: "Organize and track team or personal tasks.",
    category: "Work management",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-sky-400 to-sky-500",
    previewLabel: "Tasks",
    fullDescription: "Track tasks with a simple list or board view.",
    product: "Jira",
    recommendedFor: ["Any team tracking tasks"],
    workTypes: [{ name: "Task", color: "bg-blue-500" }],
    workflow: ["TO DO", "IN PROGRESS", "DONE"],
    features: [
      {
        title: "Simple task management",
        description: "Track tasks with due dates, assignees, and priorities.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Process control",
    description: "Track and improve recurring workflows.",
    category: "Work management",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-cyan-400 to-cyan-500",
    previewLabel: "Process",
    fullDescription:
      "Visualize and improve recurring business processes with workflow automation.",
    product: "Jira",
    recommendedFor: ["Operations teams", "Process managers"],
    workTypes: [
      { name: "Process", color: "bg-cyan-500" },
      { name: "Task", color: "bg-blue-500" },
    ],
    workflow: ["PENDING", "IN PROGRESS", "REVIEW", "COMPLETE"],
    features: [
      {
        title: "Workflow automation",
        description: "Automate recurring processes and track performance.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Sales pipeline",
    description: "Track deals from lead to closed sale.",
    category: "Work management",
    color: "bg-teal-100",
    iconColor: "text-teal-600",
    previewBg: "from-teal-400 to-teal-500",
    previewLabel: "Pipeline",
    fullDescription:
      "Manage your sales funnel from lead generation to deal close.",
    product: "Jira",
    recommendedFor: ["Sales teams", "Business development"],
    workTypes: [
      { name: "Lead", color: "bg-teal-500" },
      { name: "Deal", color: "bg-green-500" },
    ],
    workflow: ["LEAD", "QUALIFIED", "PROPOSAL", "CLOSED"],
    features: [
      {
        title: "Track deals",
        description: "Move deals through your pipeline stages.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Go-to-Market",
    description: "Plan and launch new products or services.",
    category: "Work management",
    color: "bg-indigo-100",
    iconColor: "text-indigo-600",
    previewBg: "from-indigo-400 to-indigo-500",
    previewLabel: "Launch",
    fullDescription:
      "Coordinate cross-functional go-to-market efforts for product launches.",
    product: "Jira",
    recommendedFor: ["Product marketing", "Launch teams"],
    workTypes: [
      { name: "Launch task", color: "bg-indigo-500" },
      { name: "Milestone", color: "bg-green-500" },
    ],
    workflow: ["PLANNING", "IN PROGRESS", "LAUNCHED"],
    features: [
      {
        title: "Launch planning",
        description: "Coordinate all launch activities in one place.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "UX design",
    description: "Track design work from concept to delivery.",
    category: "Work management",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Design",
    fullDescription:
      "Manage the design process from research through delivery.",
    product: "Jira",
    recommendedFor: ["UX designers", "Design teams"],
    workTypes: [
      { name: "Design task", color: "bg-blue-500" },
      { name: "Research", color: "bg-purple-500" },
    ],
    workflow: ["BACKLOG", "IN PROGRESS", "IN REVIEW", "DONE"],
    features: [
      {
        title: "Design workflow",
        description: "Track design tasks through your process.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Document management",
    description: "Track documents through review and sign-off.",
    category: "Work management",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Documents",
    fullDescription:
      "Manage document lifecycle from creation through approval.",
    product: "Jira",
    recommendedFor: ["Any team with document workflows"],
    workTypes: [{ name: "Document", color: "bg-blue-500" }],
    workflow: ["DRAFT", "IN REVIEW", "APPROVED", "PUBLISHED"],
    features: [
      {
        title: "Document reviews",
        description: "Track documents through review and approval.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Campaign management",
    description: "Run marketing campaigns from idea to launch.",
    category: "Work management",
    color: "bg-green-100",
    iconColor: "text-green-600",
    previewBg: "from-green-400 to-green-500",
    previewLabel: "Campaigns",
    fullDescription: "Plan, execute, and track marketing campaigns end-to-end.",
    product: "Jira",
    recommendedFor: ["Marketing teams"],
    workTypes: [
      { name: "Campaign", color: "bg-green-500" },
      { name: "Task", color: "bg-blue-500" },
    ],
    workflow: ["PLANNING", "IN PROGRESS", "LAUNCHED", "COMPLETE"],
    features: [
      {
        title: "Campaign tracking",
        description: "Track all campaign activities in one place.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Recruitment tracking",
    description: "Track candidates from application to hire.",
    category: "Work management",
    color: "bg-amber-100",
    iconColor: "text-amber-600",
    previewBg: "from-amber-400 to-amber-500",
    previewLabel: "Candidates",
    fullDescription: "Manage your hiring pipeline from sourcing to offer.",
    product: "Jira",
    recommendedFor: ["HR teams", "Recruiting teams"],
    workTypes: [{ name: "Candidate", color: "bg-amber-500" }],
    workflow: ["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED"],
    features: [
      {
        title: "Hiring pipeline",
        description: "Move candidates through your hiring process.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Budget planning",
    description: "Plan and align on budget allocations.",
    category: "Work management",
    color: "bg-amber-100",
    iconColor: "text-amber-600",
    previewBg: "from-amber-400 to-amber-500",
    previewLabel: "Budget",
    fullDescription: "Track budgets, allocations, and spending across teams.",
    product: "Jira",
    recommendedFor: ["Finance teams", "Department heads"],
    workTypes: [
      { name: "Budget item", color: "bg-amber-500" },
      { name: "Approval", color: "bg-blue-500" },
    ],
    workflow: ["DRAFT", "IN REVIEW", "APPROVED", "ALLOCATED"],
    features: [
      {
        title: "Budget tracking",
        description: "Plan and track budget allocations.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Procurement management",
    description: "Track purchase requests to fulfillment.",
    category: "Work management",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Procurement",
    fullDescription:
      "Manage the procurement lifecycle from request to delivery.",
    product: "Jira",
    recommendedFor: ["Procurement teams", "Finance teams"],
    workTypes: [{ name: "Purchase request", color: "bg-blue-500" }],
    workflow: ["REQUESTED", "APPROVED", "ORDERED", "RECEIVED"],
    features: [
      {
        title: "Purchase tracking",
        description: "Track purchases from request to receipt.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Content management",
    description: "Plan, create, and deliver content assets.",
    category: "Work management",
    color: "bg-orange-100",
    iconColor: "text-orange-600",
    previewBg: "from-orange-400 to-orange-500",
    previewLabel: "Content",
    fullDescription: "Plan and manage content creation across channels.",
    product: "Jira",
    recommendedFor: ["Content teams", "Marketing teams"],
    workTypes: [
      { name: "Article", color: "bg-orange-500" },
      { name: "Asset", color: "bg-blue-500" },
    ],
    workflow: ["DRAFT", "IN REVIEW", "PUBLISHED"],
    features: [
      {
        title: "Content pipeline",
        description: "Manage content from ideation to publication.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Personal task planner",
    description: "Organize daily tasks and priorities.",
    category: "Work management",
    color: "bg-yellow-100",
    iconColor: "text-yellow-600",
    previewBg: "from-yellow-400 to-yellow-500",
    previewLabel: "Tasks",
    fullDescription:
      "Keep track of your personal tasks, to-dos, and priorities.",
    product: "Jira",
    recommendedFor: ["Individuals"],
    workTypes: [{ name: "Task", color: "bg-yellow-500" }],
    workflow: ["TO DO", "IN PROGRESS", "DONE"],
    features: [
      {
        title: "Personal productivity",
        description: "Organize your daily tasks and priorities.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Financial close",
    description: "Manage financial close tasks efficiently.",
    category: "Work management",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Close",
    fullDescription: "Track and manage period-end financial close activities.",
    product: "Jira",
    recommendedFor: ["Finance teams", "Accounting teams"],
    workTypes: [{ name: "Close task", color: "bg-blue-500" }],
    workflow: ["NOT STARTED", "IN PROGRESS", "REVIEW", "COMPLETE"],
    features: [
      {
        title: "Close management",
        description: "Track all close activities and deadlines.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Policy management",
    description: "Track and update policies and procedures.",
    category: "Work management",
    color: "bg-emerald-100",
    iconColor: "text-emerald-600",
    previewBg: "from-emerald-400 to-emerald-500",
    previewLabel: "Policies",
    fullDescription: "Manage the lifecycle of organizational policies.",
    product: "Jira",
    recommendedFor: ["Legal teams", "Compliance teams"],
    workTypes: [{ name: "Policy", color: "bg-emerald-500" }],
    workflow: ["DRAFT", "IN REVIEW", "APPROVED", "PUBLISHED"],
    features: [
      {
        title: "Policy lifecycle",
        description: "Track policies from draft to approval.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Marketing asset creation",
    description: "Track requests for marketing assets.",
    category: "Work management",
    color: "bg-amber-100",
    iconColor: "text-amber-600",
    previewBg: "from-amber-400 to-amber-500",
    previewLabel: "Assets",
    fullDescription:
      "Manage requests and creation of marketing assets and collateral.",
    product: "Jira",
    recommendedFor: ["Creative teams", "Marketing teams"],
    workTypes: [
      { name: "Asset", color: "bg-amber-500" },
      { name: "Request", color: "bg-purple-500" },
    ],
    workflow: ["REQUESTED", "IN PROGRESS", "IN REVIEW", "DELIVERED"],
    features: [
      {
        title: "Asset tracking",
        description: "Track marketing asset requests and delivery.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Event planning",
    description: "Plan and coordinate events of any size.",
    category: "Work management",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Events",
    fullDescription:
      "Coordinate all aspects of event planning from venue to follow-up.",
    product: "Jira",
    recommendedFor: ["Event coordinators", "Marketing teams"],
    workTypes: [
      { name: "Event", color: "bg-blue-500" },
      { name: "Task", color: "bg-green-500" },
    ],
    workflow: ["PLANNING", "IN PROGRESS", "COMPLETE"],
    features: [
      {
        title: "Event coordination",
        description: "Track all event planning tasks and logistics.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "RFP process",
    description:
      "Manage RFP (Request for Procurement) to select the right vendor.",
    category: "Work management",
    color: "bg-gray-100",
    iconColor: "text-gray-600",
    previewBg: "from-gray-400 to-gray-500",
    previewLabel: "RFP",
    fullDescription:
      "Manage the Request for Proposal process from creation to vendor selection.",
    product: "Jira",
    recommendedFor: ["Procurement teams", "Operations"],
    workTypes: [
      { name: "RFP", color: "bg-gray-500" },
      { name: "Vendor", color: "bg-blue-500" },
    ],
    workflow: ["DRAFT", "PUBLISHED", "EVALUATION", "AWARDED"],
    features: [
      {
        title: "RFP management",
        description: "Track RFPs from creation to vendor selection.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Email marketing campaign",
    description: "Plan, create, and send email campaigns.",
    category: "Work management",
    color: "bg-cyan-100",
    iconColor: "text-cyan-600",
    previewBg: "from-cyan-400 to-cyan-500",
    previewLabel: "Emails",
    fullDescription:
      "Plan and execute email marketing campaigns from start to finish.",
    product: "Jira",
    recommendedFor: ["Marketing teams", "Email marketers"],
    workTypes: [
      { name: "Campaign", color: "bg-cyan-500" },
      { name: "Email", color: "bg-blue-500" },
    ],
    workflow: ["DRAFT", "IN REVIEW", "SCHEDULED", "SENT"],
    features: [
      {
        title: "Email campaigns",
        description: "Plan and track email campaign performance.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Sales lead tracking",
    description: "Manage sales leads through to conversion.",
    category: "Work management",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Leads",
    fullDescription:
      "Track and manage sales leads from first contact to conversion.",
    product: "Jira",
    recommendedFor: ["Sales teams", "Business development"],
    workTypes: [{ name: "Lead", color: "bg-blue-500" }],
    workflow: ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED"],
    features: [
      {
        title: "Lead management",
        description: "Track leads through your sales process.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "IP infringement",
    description:
      "Protect your organization and employees from IP infringement.",
    category: "Work management",
    color: "bg-red-100",
    iconColor: "text-red-600",
    previewBg: "from-red-400 to-red-500",
    previewLabel: "Cases",
    fullDescription:
      "Track and manage intellectual property infringement cases.",
    product: "Jira",
    recommendedFor: ["Legal teams", "IP teams"],
    workTypes: [{ name: "Case", color: "bg-red-500" }],
    workflow: ["REPORTED", "INVESTIGATING", "ACTION TAKEN", "RESOLVED"],
    features: [
      {
        title: "IP protection",
        description: "Track infringement cases from report to resolution.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Employee review",
    description: "Manage employee reviews and feedback.",
    category: "Work management",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Reviews",
    fullDescription:
      "Manage performance reviews and collect employee feedback.",
    product: "Jira",
    recommendedFor: ["HR teams", "People managers"],
    workTypes: [{ name: "Review", color: "bg-blue-500" }],
    workflow: ["SELF REVIEW", "MANAGER REVIEW", "CALIBRATION", "COMPLETE"],
    features: [
      {
        title: "Performance reviews",
        description: "Track the review process for all employees.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Grant application tracker",
    description: "Manage grants from submission to award.",
    category: "Work management",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Grants",
    fullDescription:
      "Track grant applications from initial submission through award.",
    product: "Jira",
    recommendedFor: ["Nonprofit teams", "Research teams"],
    workTypes: [{ name: "Grant", color: "bg-blue-500" }],
    workflow: ["DRAFT", "SUBMITTED", "UNDER REVIEW", "AWARDED"],
    features: [
      {
        title: "Grant tracking",
        description: "Track grant applications and deadlines.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Nonprofit management",
    description: "Track programs driving social impact.",
    category: "Work management",
    color: "bg-green-100",
    iconColor: "text-green-600",
    previewBg: "from-green-400 to-green-500",
    previewLabel: "Programs",
    fullDescription:
      "Manage nonprofit programs, initiatives, and impact tracking.",
    product: "Jira",
    recommendedFor: ["Nonprofit teams"],
    workTypes: [
      { name: "Program", color: "bg-green-500" },
      { name: "Task", color: "bg-blue-500" },
    ],
    workflow: ["PLANNING", "IN PROGRESS", "COMPLETE"],
    features: [
      {
        title: "Program tracking",
        description: "Track program milestones and outcomes.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Community management",
    description: "Oversee community-focused initiatives.",
    category: "Work management",
    color: "bg-orange-100",
    iconColor: "text-orange-600",
    previewBg: "from-orange-400 to-orange-500",
    previewLabel: "Community",
    fullDescription:
      "Manage community programs, events, and engagement initiatives.",
    product: "Jira",
    recommendedFor: ["Community managers"],
    workTypes: [
      { name: "Initiative", color: "bg-orange-500" },
      { name: "Event", color: "bg-blue-500" },
    ],
    workflow: ["PLANNED", "IN PROGRESS", "COMPLETE"],
    features: [
      {
        title: "Community programs",
        description: "Track community initiatives and engagement.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Space approvals",
    description: "Track and manage space sign-offs.",
    category: "Work management",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Approvals",
    fullDescription:
      "Manage approval workflows for space and resource requests.",
    product: "Jira",
    recommendedFor: ["Facilities teams", "Operations"],
    workTypes: [{ name: "Approval", color: "bg-blue-500" }],
    workflow: ["SUBMITTED", "IN REVIEW", "APPROVED", "DENIED"],
    features: [
      {
        title: "Approval workflow",
        description: "Track approval requests through your process.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Budget approval management",
    description: "Track approvals for budget sign-off.",
    category: "Work management",
    color: "bg-amber-100",
    iconColor: "text-amber-600",
    previewBg: "from-amber-400 to-amber-500",
    previewLabel: "Budget",
    fullDescription:
      "Manage the budget approval process from request through final sign-off.",
    product: "Jira",
    recommendedFor: ["Finance teams", "Department heads"],
    workTypes: [
      { name: "Budget request", color: "bg-amber-500" },
      { name: "Approval", color: "bg-green-500" },
    ],
    workflow: ["SUBMITTED", "IN REVIEW", "APPROVED", "REJECTED"],
    features: [
      {
        title: "Budget approvals",
        description: "Track budget requests through the approval chain.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Manage approvals for documents",
    description: "Approve policies, contracts, and key docs.",
    category: "Work management",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Documents",
    fullDescription:
      "Streamline document approval workflows for policies, contracts, and other key documents.",
    product: "Jira",
    recommendedFor: ["Legal teams", "Compliance teams", "Operations"],
    workTypes: [
      { name: "Document", color: "bg-blue-500" },
      { name: "Approval", color: "bg-green-500" },
    ],
    workflow: ["DRAFT", "SUBMITTED", "IN REVIEW", "APPROVED"],
    features: [
      {
        title: "Document approvals",
        description: "Route documents through review and approval workflows.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Manage approvals for your campaign",
    description:
      "Get your campaign off the ground by using this template to help track planning, execution, and approvals all in one place.",
    category: "Work management",
    color: "bg-green-100",
    iconColor: "text-green-600",
    previewBg: "from-green-400 to-green-500",
    previewLabel: "Campaign",
    fullDescription:
      "Track campaign planning, execution, and approvals in a single workflow.",
    product: "Jira",
    recommendedFor: ["Marketing teams", "Campaign managers"],
    workTypes: [
      { name: "Campaign", color: "bg-green-500" },
      { name: "Approval", color: "bg-blue-500" },
    ],
    workflow: ["PLANNING", "IN REVIEW", "APPROVED", "LAUNCHED"],
    features: [
      {
        title: "Campaign approvals",
        description: "Get sign-off on campaigns before they go live.",
        linkText: "Learn more",
      },
    ],
  },
  // Product management
  {
    name: "Product discovery",
    description:
      "Prioritize ideas then connect them from discovery through to delivery.",
    category: "Product management",
    color: "bg-violet-100",
    iconColor: "text-violet-600",
    previewBg: "from-violet-400 to-violet-500",
    previewLabel: "Ideas",
    fullDescription:
      "Capture, evaluate, and prioritize ideas from customers and stakeholders. Connect the best ideas through discovery to delivery with your development teams.",
    product: "Jira Product Discovery",
    recommendedFor: ["Product managers", "Product teams"],
    workTypes: [
      { name: "Idea", color: "bg-violet-500" },
      { name: "Opportunity", color: "bg-blue-500" },
    ],
    workflow: ["NEW", "EVALUATING", "PLANNED", "IN PROGRESS", "SHIPPED"],
    features: [
      {
        title: "Capture and evaluate ideas",
        description:
          "Collect ideas from customers, stakeholders, and your team. Evaluate them using custom criteria.",
        linkText: "Learn more about ideas",
      },
      {
        title: "Connect discovery to delivery",
        description:
          "Link ideas to epics and stories in Jira Software so your team always knows the why behind the work.",
        linkText: "Learn more about delivery",
      },
    ],
  },
  {
    name: "Product roadmap",
    description: "Create custom roadmaps and share your plans with everyone.",
    category: "Product management",
    color: "bg-indigo-100",
    iconColor: "text-indigo-600",
    previewBg: "from-indigo-400 to-indigo-500",
    previewLabel: "Roadmap",
    fullDescription:
      "Create visual roadmaps to communicate your product strategy and timeline. Share customizable views with different stakeholders.",
    product: "Jira Product Discovery",
    recommendedFor: ["Product managers", "Product leaders", "Product teams"],
    workTypes: [
      { name: "Epic", color: "bg-purple-500" },
      { name: "Idea", color: "bg-cyan-500" },
    ],
    workflow: ["IDEATION", "PLANNED", "IN PROGRESS", "SHIPPED"],
    features: [
      {
        title: "Visual roadmaps",
        description:
          "Create timeline views of your product plans that you can share with stakeholders.",
        linkText: "Learn more about roadmaps",
      },
      {
        title: "Custom views",
        description:
          "Build different views for different audiences — team, leadership, customers.",
        linkText: "Learn more about views",
      },
    ],
  },
  {
    name: "Prioritization",
    description:
      "Evaluate ideas across reach, impact, confidence and effort to quickly prioritize.",
    category: "Product management",
    color: "bg-amber-100",
    iconColor: "text-amber-600",
    previewBg: "from-amber-400 to-amber-500",
    previewLabel: "Prioritization",
    fullDescription:
      "Use data-driven prioritization frameworks like RICE scoring to evaluate ideas based on Reach, Impact, Confidence, and Effort. Make better decisions about what to build next.",
    product: "Jira Product Discovery",
    recommendedFor: ["Product managers", "Product teams"],
    workTypes: [
      { name: "Idea", color: "bg-amber-500" },
      { name: "Opportunity", color: "bg-blue-500" },
    ],
    workflow: ["NEW", "EVALUATING", "PLANNED", "SHIPPED"],
    features: [
      {
        title: "RICE scoring",
        description:
          "Score ideas by Reach, Impact, Confidence, and Effort to prioritize objectively.",
        linkText: "Learn more about prioritization",
      },
      {
        title: "Custom frameworks",
        description:
          "Build your own scoring criteria to match your team's prioritization needs.",
        linkText: "Learn more about custom fields",
      },
    ],
  },
  // Marketing
  {
    name: "Marketing service management",
    description:
      "Manage employee requests for assets, reviews, and any other marketing requests.",
    category: "Marketing",
    color: "bg-pink-100",
    iconColor: "text-pink-600",
    previewBg: "from-pink-400 to-pink-500",
    previewLabel: "Marketing",
    fullDescription:
      "Centralize marketing requests for creative assets, campaign reviews, and brand approvals.",
    product: "Jira Service Management",
    recommendedFor: ["Marketing teams", "Creative teams"],
    workTypes: [
      { name: "Creative request", color: "bg-pink-500" },
      { name: "Review", color: "bg-purple-500" },
    ],
    workflow: ["REQUESTED", "IN PROGRESS", "IN REVIEW", "DELIVERED"],
    features: [
      {
        title: "Creative requests",
        description: "Manage requests for marketing assets and reviews.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Blank space",
    description: "Start with a blank canvas",
    category: "Marketing",
    color: "bg-gray-100",
    iconColor: "text-gray-600",
    previewBg: "from-gray-300 to-gray-400",
    previewLabel: "Blank",
    fullDescription:
      "Start fresh with a completely blank project and customize everything from scratch.",
    product: "Jira",
    recommendedFor: ["Any team"],
    workTypes: [{ name: "Task", color: "bg-blue-500" }],
    workflow: ["TO DO", "IN PROGRESS", "DONE"],
    features: [
      {
        title: "Full flexibility",
        description: "Build your workflow from scratch.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Project management",
    description: "Plan and deliver business projects.",
    category: "Marketing",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Projects",
    fullDescription:
      "Track project milestones, deliverables, and team tasks in one place.",
    product: "Jira",
    recommendedFor: ["Project managers", "Cross-functional teams"],
    workTypes: [
      { name: "Task", color: "bg-blue-500" },
      { name: "Milestone", color: "bg-green-500" },
    ],
    workflow: ["TO DO", "IN PROGRESS", "IN REVIEW", "DONE"],
    features: [
      {
        title: "Plan projects",
        description: "Break down projects into tasks and track progress.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Go-to-Market",
    description: "Plan and launch new products or services.",
    category: "Marketing",
    color: "bg-indigo-100",
    iconColor: "text-indigo-600",
    previewBg: "from-indigo-400 to-indigo-500",
    previewLabel: "Launch",
    fullDescription:
      "Coordinate cross-functional go-to-market efforts for product launches.",
    product: "Jira",
    recommendedFor: ["Product marketing", "Launch teams"],
    workTypes: [
      { name: "Launch task", color: "bg-indigo-500" },
      { name: "Milestone", color: "bg-green-500" },
    ],
    workflow: ["PLANNING", "IN PROGRESS", "LAUNCHED"],
    features: [
      {
        title: "Launch planning",
        description: "Coordinate all launch activities in one place.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Campaign management",
    description: "Run marketing campaigns from idea to launch.",
    category: "Marketing",
    color: "bg-green-100",
    iconColor: "text-green-600",
    previewBg: "from-green-400 to-green-500",
    previewLabel: "Campaigns",
    fullDescription: "Plan, execute, and track marketing campaigns end-to-end.",
    product: "Jira",
    recommendedFor: ["Marketing teams"],
    workTypes: [
      { name: "Campaign", color: "bg-green-500" },
      { name: "Task", color: "bg-blue-500" },
    ],
    workflow: ["PLANNING", "IN PROGRESS", "LAUNCHED", "COMPLETE"],
    features: [
      {
        title: "Campaign tracking",
        description: "Track all campaign activities in one place.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Content management",
    description: "Plan, create, and deliver content assets.",
    category: "Marketing",
    color: "bg-orange-100",
    iconColor: "text-orange-600",
    previewBg: "from-orange-400 to-orange-500",
    previewLabel: "Content",
    fullDescription: "Plan and manage content creation across channels.",
    product: "Jira",
    recommendedFor: ["Content teams", "Editorial teams"],
    workTypes: [
      { name: "Article", color: "bg-orange-500" },
      { name: "Asset", color: "bg-blue-500" },
    ],
    workflow: ["DRAFT", "IN REVIEW", "PUBLISHED"],
    features: [
      {
        title: "Content pipeline",
        description: "Manage content from ideation to publication.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Event planning",
    description: "Plan and coordinate events of any size.",
    category: "Marketing",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Events",
    fullDescription:
      "Coordinate all aspects of event planning from venue to follow-up.",
    product: "Jira",
    recommendedFor: ["Event coordinators", "Marketing teams"],
    workTypes: [
      { name: "Event", color: "bg-blue-500" },
      { name: "Task", color: "bg-green-500" },
    ],
    workflow: ["PLANNING", "IN PROGRESS", "COMPLETE"],
    features: [
      {
        title: "Event coordination",
        description: "Track all event planning tasks and logistics.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Email marketing campaign",
    description: "Plan, create, and send email campaigns.",
    category: "Marketing",
    color: "bg-cyan-100",
    iconColor: "text-cyan-600",
    previewBg: "from-cyan-400 to-cyan-500",
    previewLabel: "Emails",
    fullDescription:
      "Plan and execute email marketing campaigns from start to finish.",
    product: "Jira",
    recommendedFor: ["Marketing teams", "Email marketers"],
    workTypes: [
      { name: "Campaign", color: "bg-cyan-500" },
      { name: "Email", color: "bg-blue-500" },
    ],
    workflow: ["DRAFT", "IN REVIEW", "SCHEDULED", "SENT"],
    features: [
      {
        title: "Email campaigns",
        description: "Plan and track email campaign performance.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Space approvals",
    description: "Track and manage space sign-offs.",
    category: "Marketing",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Approvals",
    fullDescription:
      "Manage approval workflows for space and resource requests.",
    product: "Jira",
    recommendedFor: ["Facilities teams", "Operations"],
    workTypes: [{ name: "Approval", color: "bg-blue-500" }],
    workflow: ["SUBMITTED", "IN REVIEW", "APPROVED", "DENIED"],
    features: [
      {
        title: "Approval workflow",
        description: "Track approval requests through your process.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Budget approval management",
    description: "Track approvals for budget sign-off.",
    category: "Marketing",
    color: "bg-amber-100",
    iconColor: "text-amber-600",
    previewBg: "from-amber-400 to-amber-500",
    previewLabel: "Budget",
    fullDescription:
      "Manage the budget approval process from request through final sign-off.",
    product: "Jira",
    recommendedFor: ["Finance teams", "Department heads"],
    workTypes: [
      { name: "Budget request", color: "bg-amber-500" },
      { name: "Approval", color: "bg-green-500" },
    ],
    workflow: ["SUBMITTED", "IN REVIEW", "APPROVED", "REJECTED"],
    features: [
      {
        title: "Budget approvals",
        description: "Track budget requests through the approval chain.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Manage approvals for documents",
    description: "Approve policies, contracts, and key docs.",
    category: "Marketing",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Documents",
    fullDescription:
      "Streamline document approval workflows for policies, contracts, and other key documents.",
    product: "Jira",
    recommendedFor: ["Legal teams", "Compliance teams", "Operations"],
    workTypes: [
      { name: "Document", color: "bg-blue-500" },
      { name: "Approval", color: "bg-green-500" },
    ],
    workflow: ["DRAFT", "SUBMITTED", "IN REVIEW", "APPROVED"],
    features: [
      {
        title: "Document approvals",
        description: "Route documents through review and approval workflows.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Manage approvals for your campaign",
    description:
      "Get your campaign off the ground by using this template to help track planning, execution, and approvals all in one place.",
    category: "Marketing",
    color: "bg-green-100",
    iconColor: "text-green-600",
    previewBg: "from-green-400 to-green-500",
    previewLabel: "Campaign",
    fullDescription:
      "Track campaign planning, execution, and approvals in a single workflow.",
    product: "Jira",
    recommendedFor: ["Marketing teams", "Campaign managers"],
    workTypes: [
      { name: "Campaign", color: "bg-green-500" },
      { name: "Approval", color: "bg-blue-500" },
    ],
    workflow: ["PLANNING", "IN REVIEW", "APPROVED", "LAUNCHED"],
    features: [
      {
        title: "Campaign approvals",
        description: "Get sign-off on campaigns before they go live.",
        linkText: "Learn more",
      },
    ],
  },
  // Human resources
  {
    name: "HR service management",
    description: "Simplify onboarding, off-boarding, and any other HR request.",
    category: "Human resources",
    badge: "UPDATED",
    color: "bg-emerald-100",
    iconColor: "text-emerald-600",
    previewBg: "from-emerald-400 to-emerald-500",
    previewLabel: "HR",
    fullDescription:
      "Manage HR service requests including onboarding, off-boarding, benefits, and more.",
    product: "Jira Service Management",
    recommendedFor: ["HR teams", "People operations"],
    workTypes: [
      { name: "HR request", color: "bg-emerald-500" },
      { name: "Onboarding", color: "bg-teal-500" },
    ],
    workflow: ["OPEN", "IN PROGRESS", "WAITING", "RESOLVED"],
    features: [
      {
        title: "Employee onboarding",
        description: "Automate onboarding checklists and approvals.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Blank space",
    description: "Start with a blank canvas",
    category: "Human resources",
    color: "bg-gray-100",
    iconColor: "text-gray-600",
    previewBg: "from-gray-300 to-gray-400",
    previewLabel: "Blank",
    fullDescription:
      "Start fresh with a completely blank project and customize everything from scratch.",
    product: "Jira",
    recommendedFor: ["Any team"],
    workTypes: [{ name: "Task", color: "bg-blue-500" }],
    workflow: ["TO DO", "IN PROGRESS", "DONE"],
    features: [
      {
        title: "Full flexibility",
        description: "Build your workflow from scratch.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Recruitment tracking",
    description: "Track candidates from application to hire.",
    category: "Human resources",
    color: "bg-amber-100",
    iconColor: "text-amber-600",
    previewBg: "from-amber-400 to-amber-500",
    previewLabel: "Candidates",
    fullDescription: "Manage your hiring pipeline from sourcing to offer.",
    product: "Jira",
    recommendedFor: ["HR teams", "Recruiting teams"],
    workTypes: [{ name: "Candidate", color: "bg-amber-500" }],
    workflow: ["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED"],
    features: [
      {
        title: "Hiring pipeline",
        description: "Move candidates through your hiring process.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Policy management",
    description: "Track and update policies and procedures.",
    category: "Human resources",
    color: "bg-emerald-100",
    iconColor: "text-emerald-600",
    previewBg: "from-emerald-400 to-emerald-500",
    previewLabel: "Policies",
    fullDescription: "Manage the lifecycle of organizational policies.",
    product: "Jira",
    recommendedFor: ["Legal teams", "Compliance teams", "HR teams"],
    workTypes: [{ name: "Policy", color: "bg-emerald-500" }],
    workflow: ["DRAFT", "IN REVIEW", "APPROVED", "PUBLISHED"],
    features: [
      {
        title: "Policy lifecycle",
        description: "Track policies from draft to approval.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Employee review",
    description: "Manage employee reviews and feedback.",
    category: "Human resources",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Reviews",
    fullDescription:
      "Manage performance reviews and collect employee feedback.",
    product: "Jira",
    recommendedFor: ["HR teams", "People managers"],
    workTypes: [{ name: "Review", color: "bg-blue-500" }],
    workflow: ["SELF REVIEW", "MANAGER REVIEW", "CALIBRATION", "COMPLETE"],
    features: [
      {
        title: "Performance reviews",
        description: "Track the review process for all employees.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Space approvals",
    description: "Track and manage space sign-offs.",
    category: "Human resources",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Approvals",
    fullDescription:
      "Manage approval workflows for space and resource requests.",
    product: "Jira",
    recommendedFor: ["Facilities teams", "Operations"],
    workTypes: [{ name: "Approval", color: "bg-blue-500" }],
    workflow: ["SUBMITTED", "IN REVIEW", "APPROVED", "DENIED"],
    features: [
      {
        title: "Approval workflow",
        description: "Track approval requests through your process.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Budget approval management",
    description: "Track approvals for budget sign-off.",
    category: "Human resources",
    color: "bg-amber-100",
    iconColor: "text-amber-600",
    previewBg: "from-amber-400 to-amber-500",
    previewLabel: "Budget",
    fullDescription:
      "Manage the budget approval process from request through final sign-off.",
    product: "Jira",
    recommendedFor: ["Finance teams", "Department heads"],
    workTypes: [
      { name: "Budget request", color: "bg-amber-500" },
      { name: "Approval", color: "bg-green-500" },
    ],
    workflow: ["SUBMITTED", "IN REVIEW", "APPROVED", "REJECTED"],
    features: [
      {
        title: "Budget approvals",
        description: "Track budget requests through the approval chain.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Manage approvals for documents",
    description: "Approve policies, contracts, and key docs.",
    category: "Human resources",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Documents",
    fullDescription:
      "Streamline document approval workflows for policies, contracts, and other key documents.",
    product: "Jira",
    recommendedFor: ["Legal teams", "Compliance teams", "HR teams"],
    workTypes: [
      { name: "Document", color: "bg-blue-500" },
      { name: "Approval", color: "bg-green-500" },
    ],
    workflow: ["DRAFT", "SUBMITTED", "IN REVIEW", "APPROVED"],
    features: [
      {
        title: "Document approvals",
        description: "Route documents through review and approval workflows.",
        linkText: "Learn more",
      },
    ],
  },
  // Finance
  {
    name: "Finance service management",
    description:
      "Easily manage and track budget, spend, and any other finance request.",
    category: "Finance",
    color: "bg-sky-100",
    iconColor: "text-sky-600",
    previewBg: "from-sky-400 to-sky-500",
    previewLabel: "Finance",
    fullDescription:
      "Manage finance requests including budget approvals, expense reports, and procurement.",
    product: "Jira Service Management",
    recommendedFor: ["Finance teams", "Procurement teams"],
    workTypes: [
      { name: "Finance request", color: "bg-sky-500" },
      { name: "Approval", color: "bg-blue-500" },
    ],
    workflow: ["SUBMITTED", "IN REVIEW", "APPROVED", "COMPLETED"],
    features: [
      {
        title: "Budget tracking",
        description: "Track and approve budget requests with clear workflows.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Blank space",
    description: "Start with a blank canvas",
    category: "Finance",
    color: "bg-gray-100",
    iconColor: "text-gray-600",
    previewBg: "from-gray-300 to-gray-400",
    previewLabel: "Blank",
    fullDescription:
      "Start fresh with a completely blank project and customize everything from scratch.",
    product: "Jira",
    recommendedFor: ["Any team"],
    workTypes: [{ name: "Task", color: "bg-blue-500" }],
    workflow: ["TO DO", "IN PROGRESS", "DONE"],
    features: [
      {
        title: "Full flexibility",
        description: "Build your workflow from scratch.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Budget planning",
    description: "Plan and align on budget allocations.",
    category: "Finance",
    color: "bg-amber-100",
    iconColor: "text-amber-600",
    previewBg: "from-amber-400 to-amber-500",
    previewLabel: "Budget",
    fullDescription: "Track budgets, allocations, and spending across teams.",
    product: "Jira",
    recommendedFor: ["Finance teams", "Department heads"],
    workTypes: [
      { name: "Budget item", color: "bg-amber-500" },
      { name: "Approval", color: "bg-blue-500" },
    ],
    workflow: ["DRAFT", "IN REVIEW", "APPROVED", "ALLOCATED"],
    features: [
      {
        title: "Budget tracking",
        description: "Plan and track budget allocations.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Financial close",
    description: "Manage financial close tasks efficiently.",
    category: "Finance",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Close",
    fullDescription: "Track and manage period-end financial close activities.",
    product: "Jira",
    recommendedFor: ["Finance teams", "Accounting teams"],
    workTypes: [{ name: "Close task", color: "bg-blue-500" }],
    workflow: ["NOT STARTED", "IN PROGRESS", "REVIEW", "COMPLETE"],
    features: [
      {
        title: "Close management",
        description: "Track all close activities and deadlines.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "RFP process",
    description:
      "Manage RFP (Request for Procurement) to select the right vendor.",
    category: "Finance",
    color: "bg-gray-100",
    iconColor: "text-gray-600",
    previewBg: "from-gray-400 to-gray-500",
    previewLabel: "RFP",
    fullDescription:
      "Manage the Request for Proposal process from creation to vendor selection.",
    product: "Jira",
    recommendedFor: ["Procurement teams", "Operations"],
    workTypes: [
      { name: "RFP", color: "bg-gray-500" },
      { name: "Vendor", color: "bg-blue-500" },
    ],
    workflow: ["DRAFT", "PUBLISHED", "EVALUATION", "AWARDED"],
    features: [
      {
        title: "RFP management",
        description: "Track RFPs from creation to vendor selection.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Space approvals",
    description: "Track and manage space sign-offs.",
    category: "Finance",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Approvals",
    fullDescription:
      "Manage approval workflows for space and resource requests.",
    product: "Jira",
    recommendedFor: ["Facilities teams", "Operations"],
    workTypes: [{ name: "Approval", color: "bg-blue-500" }],
    workflow: ["SUBMITTED", "IN REVIEW", "APPROVED", "DENIED"],
    features: [
      {
        title: "Approval workflow",
        description: "Track approval requests through your process.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Budget approval management",
    description: "Track approvals for budget sign-off.",
    category: "Finance",
    color: "bg-amber-100",
    iconColor: "text-amber-600",
    previewBg: "from-amber-400 to-amber-500",
    previewLabel: "Budget",
    fullDescription:
      "Manage the budget approval process from request through final sign-off.",
    product: "Jira",
    recommendedFor: ["Finance teams", "Department heads"],
    workTypes: [
      { name: "Budget request", color: "bg-amber-500" },
      { name: "Approval", color: "bg-green-500" },
    ],
    workflow: ["SUBMITTED", "IN REVIEW", "APPROVED", "REJECTED"],
    features: [
      {
        title: "Budget approvals",
        description: "Track budget requests through the approval chain.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Manage approvals for documents",
    description: "Approve policies, contracts, and key docs.",
    category: "Finance",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Documents",
    fullDescription:
      "Streamline document approval workflows for policies, contracts, and other key documents.",
    product: "Jira",
    recommendedFor: ["Legal teams", "Compliance teams", "Finance teams"],
    workTypes: [
      { name: "Document", color: "bg-blue-500" },
      { name: "Approval", color: "bg-green-500" },
    ],
    workflow: ["DRAFT", "SUBMITTED", "IN REVIEW", "APPROVED"],
    features: [
      {
        title: "Document approvals",
        description: "Route documents through review and approval workflows.",
        linkText: "Learn more",
      },
    ],
  },
  // Design
  {
    name: "Blank space",
    description: "Start with a blank canvas",
    category: "Design",
    color: "bg-gray-100",
    iconColor: "text-gray-600",
    previewBg: "from-gray-300 to-gray-400",
    previewLabel: "Blank",
    fullDescription:
      "Start fresh with a completely blank project and customize everything from scratch.",
    product: "Jira",
    recommendedFor: ["Any team"],
    workTypes: [{ name: "Task", color: "bg-blue-500" }],
    workflow: ["TO DO", "IN PROGRESS", "DONE"],
    features: [
      {
        title: "Full flexibility",
        description: "Build your workflow from scratch.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Project management",
    description: "Plan and deliver business projects.",
    category: "Design",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Projects",
    fullDescription:
      "Track project milestones, deliverables, and team tasks in one place.",
    product: "Jira",
    recommendedFor: ["Project managers", "Cross-functional teams"],
    workTypes: [
      { name: "Task", color: "bg-blue-500" },
      { name: "Milestone", color: "bg-green-500" },
    ],
    workflow: ["TO DO", "IN PROGRESS", "IN REVIEW", "DONE"],
    features: [
      {
        title: "Plan projects",
        description: "Break down projects into tasks and track progress.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Design service management",
    description:
      "Manage employee requests for designs, reviews, and any other requests.",
    category: "Design",
    color: "bg-fuchsia-100",
    iconColor: "text-fuchsia-600",
    previewBg: "from-fuchsia-400 to-fuchsia-500",
    previewLabel: "Design",
    fullDescription:
      "Centralize design requests for creative assets, UX reviews, and brand guidelines.",
    product: "Jira Service Management",
    recommendedFor: ["Design teams", "UX teams"],
    workTypes: [
      { name: "Design request", color: "bg-fuchsia-500" },
      { name: "Review", color: "bg-purple-500" },
    ],
    workflow: ["REQUESTED", "IN PROGRESS", "IN REVIEW", "DELIVERED"],
    features: [
      {
        title: "Design requests",
        description: "Manage and prioritize incoming design work.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "UX design",
    description: "Track design work from concept to delivery.",
    category: "Design",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Design",
    fullDescription:
      "Manage the design process from research through delivery.",
    product: "Jira",
    recommendedFor: ["UX designers", "Design teams"],
    workTypes: [
      { name: "Design task", color: "bg-blue-500" },
      { name: "Research", color: "bg-purple-500" },
    ],
    workflow: ["BACKLOG", "IN PROGRESS", "IN REVIEW", "DONE"],
    features: [
      {
        title: "Design workflow",
        description: "Track design tasks through your process.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Marketing asset creation",
    description: "Track requests for marketing assets.",
    category: "Design",
    color: "bg-amber-100",
    iconColor: "text-amber-600",
    previewBg: "from-amber-400 to-amber-500",
    previewLabel: "Assets",
    fullDescription:
      "Manage requests and creation of marketing assets and collateral.",
    product: "Jira",
    recommendedFor: ["Creative teams", "Marketing teams"],
    workTypes: [
      { name: "Asset", color: "bg-amber-500" },
      { name: "Request", color: "bg-purple-500" },
    ],
    workflow: ["REQUESTED", "IN PROGRESS", "IN REVIEW", "DELIVERED"],
    features: [
      {
        title: "Asset tracking",
        description: "Track marketing asset requests and delivery.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Space approvals",
    description: "Track and manage space sign-offs.",
    category: "Design",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Approvals",
    fullDescription:
      "Manage approval workflows for space and resource requests.",
    product: "Jira",
    recommendedFor: ["Facilities teams", "Operations"],
    workTypes: [{ name: "Approval", color: "bg-blue-500" }],
    workflow: ["SUBMITTED", "IN REVIEW", "APPROVED", "DENIED"],
    features: [
      {
        title: "Approval workflow",
        description: "Track approval requests through your process.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Budget approval management",
    description: "Track approvals for budget sign-off.",
    category: "Design",
    color: "bg-amber-100",
    iconColor: "text-amber-600",
    previewBg: "from-amber-400 to-amber-500",
    previewLabel: "Budget",
    fullDescription:
      "Manage the budget approval process from request through final sign-off.",
    product: "Jira",
    recommendedFor: ["Finance teams", "Department heads"],
    workTypes: [
      { name: "Budget request", color: "bg-amber-500" },
      { name: "Approval", color: "bg-green-500" },
    ],
    workflow: ["SUBMITTED", "IN REVIEW", "APPROVED", "REJECTED"],
    features: [
      {
        title: "Budget approvals",
        description: "Track budget requests through the approval chain.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Manage approvals for documents",
    description: "Approve policies, contracts, and key docs.",
    category: "Design",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Documents",
    fullDescription:
      "Streamline document approval workflows for policies, contracts, and other key documents.",
    product: "Jira",
    recommendedFor: ["Legal teams", "Compliance teams"],
    workTypes: [
      { name: "Document", color: "bg-blue-500" },
      { name: "Approval", color: "bg-green-500" },
    ],
    workflow: ["DRAFT", "SUBMITTED", "IN REVIEW", "APPROVED"],
    features: [
      {
        title: "Document approvals",
        description: "Route documents through review and approval workflows.",
        linkText: "Learn more",
      },
    ],
  },
  // Personal
  {
    name: "General service management",
    description: "Create one place to collect and manage any type of request.",
    category: "Personal",
    badge: "RECOMMENDED",
    color: "bg-purple-100",
    iconColor: "text-purple-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Requests",
    fullDescription:
      "Set up a centralized service desk to manage and track incoming work requests from any team or customer.",
    product: "Jira Service Management",
    recommendedFor: [
      "Teams managing incoming requests",
      "Shared services teams",
    ],
    workTypes: [
      { name: "Request", color: "bg-purple-500" },
      { name: "Incident", color: "bg-red-500" },
    ],
    workflow: ["OPEN", "IN PROGRESS", "WAITING", "RESOLVED"],
    features: [
      {
        title: "Collect requests",
        description: "Give customers a simple portal to submit requests.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Blank space",
    description: "Start with a blank canvas",
    category: "Personal",
    color: "bg-gray-100",
    iconColor: "text-gray-600",
    previewBg: "from-gray-300 to-gray-400",
    previewLabel: "Blank",
    fullDescription:
      "Start fresh with a completely blank project and customize everything from scratch.",
    product: "Jira",
    recommendedFor: ["Any team"],
    workTypes: [{ name: "Task", color: "bg-blue-500" }],
    workflow: ["TO DO", "IN PROGRESS", "DONE"],
    features: [
      {
        title: "Full flexibility",
        description: "Build your workflow from scratch.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Project management",
    description: "Plan and deliver business projects.",
    category: "Personal",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Projects",
    fullDescription:
      "Track project milestones, deliverables, and team tasks in one place.",
    product: "Jira",
    recommendedFor: ["Project managers", "Cross-functional teams"],
    workTypes: [
      { name: "Task", color: "bg-blue-500" },
      { name: "Milestone", color: "bg-green-500" },
    ],
    workflow: ["TO DO", "IN PROGRESS", "IN REVIEW", "DONE"],
    features: [
      {
        title: "Plan projects",
        description: "Break down projects into tasks and track progress.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Task tracking",
    description: "Organize and track team or personal tasks.",
    category: "Personal",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-sky-400 to-sky-500",
    previewLabel: "Tasks",
    fullDescription: "Track tasks with a simple list or board view.",
    product: "Jira",
    recommendedFor: ["Any team tracking tasks"],
    workTypes: [{ name: "Task", color: "bg-blue-500" }],
    workflow: ["TO DO", "IN PROGRESS", "DONE"],
    features: [
      {
        title: "Simple task management",
        description: "Track tasks with due dates, assignees, and priorities.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Personal task planner",
    description: "Organize daily tasks and priorities.",
    category: "Personal",
    color: "bg-yellow-100",
    iconColor: "text-yellow-600",
    previewBg: "from-yellow-400 to-yellow-500",
    previewLabel: "Tasks",
    fullDescription:
      "Keep track of your personal tasks, to-dos, and priorities.",
    product: "Jira",
    recommendedFor: ["Individuals"],
    workTypes: [{ name: "Task", color: "bg-yellow-500" }],
    workflow: ["TO DO", "IN PROGRESS", "DONE"],
    features: [
      {
        title: "Personal productivity",
        description: "Organize your daily tasks and priorities.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Space approvals",
    description: "Track and manage space sign-offs.",
    category: "Personal",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Approvals",
    fullDescription:
      "Manage approval workflows for space and resource requests.",
    product: "Jira",
    recommendedFor: ["Facilities teams", "Operations"],
    workTypes: [{ name: "Approval", color: "bg-blue-500" }],
    workflow: ["SUBMITTED", "IN REVIEW", "APPROVED", "DENIED"],
    features: [
      {
        title: "Approval workflow",
        description: "Track approval requests through your process.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Budget approval management",
    description: "Track approvals for budget sign-off.",
    category: "Personal",
    color: "bg-amber-100",
    iconColor: "text-amber-600",
    previewBg: "from-amber-400 to-amber-500",
    previewLabel: "Budget",
    fullDescription:
      "Manage the budget approval process from request through final sign-off.",
    product: "Jira",
    recommendedFor: ["Finance teams", "Department heads"],
    workTypes: [
      { name: "Budget request", color: "bg-amber-500" },
      { name: "Approval", color: "bg-green-500" },
    ],
    workflow: ["SUBMITTED", "IN REVIEW", "APPROVED", "REJECTED"],
    features: [
      {
        title: "Budget approvals",
        description: "Track budget requests through the approval chain.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Manage approvals for documents",
    description: "Approve policies, contracts, and key docs.",
    category: "Personal",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Documents",
    fullDescription: "Streamline document approval workflows.",
    product: "Jira",
    recommendedFor: ["Legal teams", "Compliance teams"],
    workTypes: [
      { name: "Document", color: "bg-blue-500" },
      { name: "Approval", color: "bg-green-500" },
    ],
    workflow: ["DRAFT", "SUBMITTED", "IN REVIEW", "APPROVED"],
    features: [
      {
        title: "Document approvals",
        description: "Route documents through review and approval workflows.",
        linkText: "Learn more",
      },
    ],
  },
  // Operations
  {
    name: "General service management",
    description: "Create one place to collect and manage any type of request.",
    category: "Operations",
    badge: "RECOMMENDED",
    color: "bg-purple-100",
    iconColor: "text-purple-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Requests",
    fullDescription:
      "Set up a centralized service desk to manage and track incoming work requests.",
    product: "Jira Service Management",
    recommendedFor: ["Teams managing incoming requests"],
    workTypes: [
      { name: "Request", color: "bg-purple-500" },
      { name: "Incident", color: "bg-red-500" },
    ],
    workflow: ["OPEN", "IN PROGRESS", "WAITING", "RESOLVED"],
    features: [
      {
        title: "Collect requests",
        description: "Give customers a simple portal to submit requests.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "IT Operations",
    description:
      "Prioritize and resolve incidents, automate alerts to on-call teams, and minimize downtime with dedicated IT operations workflows.",
    category: "Operations",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-amber-400 to-amber-500",
    previewLabel: "Alerts",
    fullDescription:
      "Prioritize and resolve incidents with dedicated IT operations workflows.",
    product: "Jira Service Management",
    recommendedFor: ["IT operations teams", "Site reliability engineers"],
    workTypes: [
      { name: "Incident", color: "bg-red-500" },
      { name: "Alert", color: "bg-amber-500" },
    ],
    workflow: ["TRIGGERED", "ACKNOWLEDGED", "RESOLVED"],
    features: [
      {
        title: "On-call management",
        description: "Route alerts to the right team members automatically.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Development requests",
    description:
      "Easily sync new feature requests, bugs, and incidents with your backlog.",
    category: "Operations",
    color: "bg-purple-100",
    iconColor: "text-purple-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Requests",
    fullDescription:
      "Connect your service desk with your development backlog to ensure customer issues get resolved.",
    product: "Jira Service Management",
    recommendedFor: ["Development teams", "Support teams"],
    workTypes: [
      { name: "Request", color: "bg-purple-500" },
      { name: "Bug", color: "bg-red-500" },
    ],
    workflow: ["OPEN", "IN PROGRESS", "RESOLVED"],
    features: [
      {
        title: "Sync requests to dev",
        description:
          "Automatically escalate requests to your development backlog.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Blank space",
    description: "Start with a blank canvas",
    category: "Operations",
    color: "bg-gray-100",
    iconColor: "text-gray-600",
    previewBg: "from-gray-300 to-gray-400",
    previewLabel: "Blank",
    fullDescription: "Start fresh with a completely blank project.",
    product: "Jira",
    recommendedFor: ["Any team"],
    workTypes: [{ name: "Task", color: "bg-blue-500" }],
    workflow: ["TO DO", "IN PROGRESS", "DONE"],
    features: [
      {
        title: "Full flexibility",
        description: "Build your workflow from scratch.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Process control",
    description: "Track and improve recurring workflows.",
    category: "Operations",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-cyan-400 to-cyan-500",
    previewLabel: "Process",
    fullDescription:
      "Visualize and improve recurring business processes with workflow automation.",
    product: "Jira",
    recommendedFor: ["Operations teams", "Process managers"],
    workTypes: [
      { name: "Process", color: "bg-cyan-500" },
      { name: "Task", color: "bg-blue-500" },
    ],
    workflow: ["PENDING", "IN PROGRESS", "REVIEW", "COMPLETE"],
    features: [
      {
        title: "Workflow automation",
        description: "Automate recurring processes and track performance.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Procurement management",
    description: "Track purchase requests to fulfillment.",
    category: "Operations",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Procurement",
    fullDescription:
      "Manage the procurement lifecycle from request to delivery.",
    product: "Jira",
    recommendedFor: ["Procurement teams", "Finance teams"],
    workTypes: [{ name: "Purchase request", color: "bg-blue-500" }],
    workflow: ["REQUESTED", "APPROVED", "ORDERED", "RECEIVED"],
    features: [
      {
        title: "Purchase tracking",
        description: "Track purchases from request to receipt.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "RFP process",
    description:
      "Manage RFP (Request for Procurement) to select the right vendor.",
    category: "Operations",
    color: "bg-gray-100",
    iconColor: "text-gray-600",
    previewBg: "from-gray-400 to-gray-500",
    previewLabel: "RFP",
    fullDescription:
      "Manage the Request for Proposal process from creation to vendor selection.",
    product: "Jira",
    recommendedFor: ["Procurement teams", "Operations"],
    workTypes: [
      { name: "RFP", color: "bg-gray-500" },
      { name: "Vendor", color: "bg-blue-500" },
    ],
    workflow: ["DRAFT", "PUBLISHED", "EVALUATION", "AWARDED"],
    features: [
      {
        title: "RFP management",
        description: "Track RFPs from creation to vendor selection.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Space approvals",
    description: "Track and manage space sign-offs.",
    category: "Operations",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Approvals",
    fullDescription:
      "Manage approval workflows for space and resource requests.",
    product: "Jira",
    recommendedFor: ["Facilities teams", "Operations"],
    workTypes: [{ name: "Approval", color: "bg-blue-500" }],
    workflow: ["SUBMITTED", "IN REVIEW", "APPROVED", "DENIED"],
    features: [
      {
        title: "Approval workflow",
        description: "Track approval requests through your process.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Budget approval management",
    description: "Track approvals for budget sign-off.",
    category: "Operations",
    color: "bg-amber-100",
    iconColor: "text-amber-600",
    previewBg: "from-amber-400 to-amber-500",
    previewLabel: "Budget",
    fullDescription:
      "Manage the budget approval process from request through final sign-off.",
    product: "Jira",
    recommendedFor: ["Finance teams", "Department heads"],
    workTypes: [
      { name: "Budget request", color: "bg-amber-500" },
      { name: "Approval", color: "bg-green-500" },
    ],
    workflow: ["SUBMITTED", "IN REVIEW", "APPROVED", "REJECTED"],
    features: [
      {
        title: "Budget approvals",
        description: "Track budget requests through the approval chain.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Manage approvals for documents",
    description: "Approve policies, contracts, and key docs.",
    category: "Operations",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Documents",
    fullDescription: "Streamline document approval workflows.",
    product: "Jira",
    recommendedFor: ["Legal teams", "Compliance teams"],
    workTypes: [
      { name: "Document", color: "bg-blue-500" },
      { name: "Approval", color: "bg-green-500" },
    ],
    workflow: ["DRAFT", "SUBMITTED", "IN REVIEW", "APPROVED"],
    features: [
      {
        title: "Document approvals",
        description: "Route documents through review and approval workflows.",
        linkText: "Learn more",
      },
    ],
  },
  // Legal
  {
    name: "Legal service management",
    description: "Easily manage requests about contracts, policies, and more.",
    category: "Legal",
    color: "bg-violet-100",
    iconColor: "text-violet-600",
    previewBg: "from-violet-400 to-violet-500",
    previewLabel: "Legal",
    fullDescription:
      "Centralize legal requests for contract reviews, policy questions, and compliance matters.",
    product: "Jira Service Management",
    recommendedFor: ["Legal teams", "Compliance teams"],
    workTypes: [
      { name: "Contract review", color: "bg-violet-500" },
      { name: "Legal request", color: "bg-purple-500" },
    ],
    workflow: ["SUBMITTED", "IN REVIEW", "APPROVED", "COMPLETED"],
    features: [
      {
        title: "Contract management",
        description: "Track contract reviews and approvals.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Blank space",
    description: "Start with a blank canvas",
    category: "Legal",
    color: "bg-gray-100",
    iconColor: "text-gray-600",
    previewBg: "from-gray-300 to-gray-400",
    previewLabel: "Blank",
    fullDescription: "Start fresh with a completely blank project.",
    product: "Jira",
    recommendedFor: ["Any team"],
    workTypes: [{ name: "Task", color: "bg-blue-500" }],
    workflow: ["TO DO", "IN PROGRESS", "DONE"],
    features: [
      {
        title: "Full flexibility",
        description: "Build your workflow from scratch.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Document management",
    description: "Track documents through review and sign-off.",
    category: "Legal",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Documents",
    fullDescription:
      "Manage document lifecycle from creation through approval.",
    product: "Jira",
    recommendedFor: ["Any team with document workflows"],
    workTypes: [{ name: "Document", color: "bg-blue-500" }],
    workflow: ["DRAFT", "IN REVIEW", "APPROVED", "PUBLISHED"],
    features: [
      {
        title: "Document reviews",
        description: "Track documents through review and approval.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "IP infringement",
    description:
      "Protect your organization and employees from IP infringement.",
    category: "Legal",
    color: "bg-red-100",
    iconColor: "text-red-600",
    previewBg: "from-red-400 to-red-500",
    previewLabel: "Cases",
    fullDescription:
      "Track and manage intellectual property infringement cases.",
    product: "Jira",
    recommendedFor: ["Legal teams", "IP teams"],
    workTypes: [{ name: "Case", color: "bg-red-500" }],
    workflow: ["REPORTED", "INVESTIGATING", "ACTION TAKEN", "RESOLVED"],
    features: [
      {
        title: "IP protection",
        description: "Track infringement cases from report to resolution.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Space approvals",
    description: "Track and manage space sign-offs.",
    category: "Legal",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Approvals",
    fullDescription: "Manage approval workflows.",
    product: "Jira",
    recommendedFor: ["Operations"],
    workTypes: [{ name: "Approval", color: "bg-blue-500" }],
    workflow: ["SUBMITTED", "IN REVIEW", "APPROVED", "DENIED"],
    features: [
      {
        title: "Approval workflow",
        description: "Track approval requests.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Budget approval management",
    description: "Track approvals for budget sign-off.",
    category: "Legal",
    color: "bg-amber-100",
    iconColor: "text-amber-600",
    previewBg: "from-amber-400 to-amber-500",
    previewLabel: "Budget",
    fullDescription: "Manage the budget approval process.",
    product: "Jira",
    recommendedFor: ["Finance teams"],
    workTypes: [{ name: "Budget request", color: "bg-amber-500" }],
    workflow: ["SUBMITTED", "IN REVIEW", "APPROVED", "REJECTED"],
    features: [
      {
        title: "Budget approvals",
        description: "Track budget requests.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Manage approvals for documents",
    description: "Approve policies, contracts, and key docs.",
    category: "Legal",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Documents",
    fullDescription: "Streamline document approval workflows.",
    product: "Jira",
    recommendedFor: ["Legal teams"],
    workTypes: [
      { name: "Document", color: "bg-blue-500" },
      { name: "Approval", color: "bg-green-500" },
    ],
    workflow: ["DRAFT", "SUBMITTED", "IN REVIEW", "APPROVED"],
    features: [
      {
        title: "Document approvals",
        description: "Route documents through review and approval workflows.",
        linkText: "Learn more",
      },
    ],
  },
  // Sales
  {
    name: "Blank space",
    description: "Start with a blank canvas",
    category: "Sales",
    color: "bg-gray-100",
    iconColor: "text-gray-600",
    previewBg: "from-gray-300 to-gray-400",
    previewLabel: "Blank",
    fullDescription: "Start fresh with a completely blank project.",
    product: "Jira",
    recommendedFor: ["Any team"],
    workTypes: [{ name: "Task", color: "bg-blue-500" }],
    workflow: ["TO DO", "IN PROGRESS", "DONE"],
    features: [
      {
        title: "Full flexibility",
        description: "Build your workflow from scratch.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Sales service management",
    description:
      "Easily manage requests for quote support, contract reviews, and more.",
    category: "Sales",
    color: "bg-rose-100",
    iconColor: "text-rose-600",
    previewBg: "from-rose-400 to-rose-500",
    previewLabel: "Sales",
    fullDescription:
      "Support your sales team with streamlined request management for quotes, contracts, and approvals.",
    product: "Jira Service Management",
    recommendedFor: ["Sales teams", "Sales operations"],
    workTypes: [
      { name: "Quote request", color: "bg-rose-500" },
      { name: "Contract", color: "bg-blue-500" },
    ],
    workflow: ["REQUESTED", "IN PROGRESS", "COMPLETED"],
    features: [
      {
        title: "Sales support",
        description: "Manage quote and contract review requests.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Sales pipeline",
    description: "Track deals from lead to closed sale.",
    category: "Sales",
    color: "bg-teal-100",
    iconColor: "text-teal-600",
    previewBg: "from-teal-400 to-teal-500",
    previewLabel: "Pipeline",
    fullDescription:
      "Manage your sales funnel from lead generation to deal close.",
    product: "Jira",
    recommendedFor: ["Sales teams", "Business development"],
    workTypes: [
      { name: "Lead", color: "bg-teal-500" },
      { name: "Deal", color: "bg-green-500" },
    ],
    workflow: ["LEAD", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "CLOSED WON"],
    features: [
      {
        title: "Track deals",
        description: "Move deals through your pipeline stages.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Sales lead tracking",
    description: "Manage sales leads through to conversion.",
    category: "Sales",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Leads",
    fullDescription:
      "Track and manage sales leads from first contact to conversion.",
    product: "Jira",
    recommendedFor: ["Sales teams", "Business development"],
    workTypes: [{ name: "Lead", color: "bg-blue-500" }],
    workflow: ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED"],
    features: [
      {
        title: "Lead management",
        description: "Track leads through your sales process.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Space approvals",
    description: "Track and manage space sign-offs.",
    category: "Sales",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Approvals",
    fullDescription: "Manage approval workflows.",
    product: "Jira",
    recommendedFor: ["Operations"],
    workTypes: [{ name: "Approval", color: "bg-blue-500" }],
    workflow: ["SUBMITTED", "IN REVIEW", "APPROVED", "DENIED"],
    features: [
      {
        title: "Approval workflow",
        description: "Track approval requests.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Budget approval management",
    description: "Track approvals for budget sign-off.",
    category: "Sales",
    color: "bg-amber-100",
    iconColor: "text-amber-600",
    previewBg: "from-amber-400 to-amber-500",
    previewLabel: "Budget",
    fullDescription: "Manage the budget approval process.",
    product: "Jira",
    recommendedFor: ["Finance teams"],
    workTypes: [{ name: "Budget request", color: "bg-amber-500" }],
    workflow: ["SUBMITTED", "IN REVIEW", "APPROVED", "REJECTED"],
    features: [
      {
        title: "Budget approvals",
        description: "Track budget requests.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Manage approvals for documents",
    description: "Approve policies, contracts, and key docs.",
    category: "Sales",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Documents",
    fullDescription: "Streamline document approval workflows.",
    product: "Jira",
    recommendedFor: ["Legal teams"],
    workTypes: [
      { name: "Document", color: "bg-blue-500" },
      { name: "Approval", color: "bg-green-500" },
    ],
    workflow: ["DRAFT", "SUBMITTED", "IN REVIEW", "APPROVED"],
    features: [
      {
        title: "Document approvals",
        description: "Route documents through review and approval workflows.",
        linkText: "Learn more",
      },
    ],
  },
  // Analytics
  {
    name: "Analytics service management",
    description:
      "Help employees access and request the data and analytics they need.",
    category: "Analytics",
    color: "bg-orange-100",
    iconColor: "text-orange-600",
    previewBg: "from-orange-400 to-orange-500",
    previewLabel: "Analytics",
    fullDescription:
      "Manage data and analytics requests from across the organization.",
    product: "Jira Service Management",
    recommendedFor: ["Data teams", "Analytics teams"],
    workTypes: [
      { name: "Data request", color: "bg-orange-500" },
      { name: "Report", color: "bg-blue-500" },
    ],
    workflow: ["REQUESTED", "IN PROGRESS", "DELIVERED"],
    features: [
      {
        title: "Data requests",
        description: "Track and fulfill data and analytics requests.",
        linkText: "Learn more",
      },
    ],
  },
  // IT
  {
    name: "General service management",
    description: "Create one place to collect and manage any type of request.",
    category: "IT",
    badge: "RECOMMENDED",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Requests",
    fullDescription:
      "Set up a centralized service desk to manage and track incoming work requests. Give your customers and employees a single place to submit requests, and your team a clear view of what needs attention.",
    product: "Jira Service Management",
    recommendedFor: [
      "Teams managing incoming requests",
      "IT and support teams",
    ],
    workTypes: [
      { name: "Request", color: "bg-purple-500" },
      { name: "Incident", color: "bg-red-500" },
      { name: "Change", color: "bg-blue-500" },
    ],
    workflow: ["OPEN", "IN PROGRESS", "WAITING", "RESOLVED"],
    features: [
      {
        title: "Collect requests in one place",
        description:
          "Give your customers a simple portal to submit requests. Automatically route requests to the right team members.",
        linkText: "Learn more about request management",
      },
      {
        title: "Track and prioritize work",
        description:
          "Use queues and SLAs to ensure your team focuses on the most important work first. Never miss a deadline.",
        linkText: "Learn more about queues",
      },
    ],
  },
  {
    name: "IT service management",
    description:
      "Quickly respond to requests, resolve incidents, and deploy changes.",
    category: "IT",
    color: "bg-green-100",
    iconColor: "text-green-600",
    previewBg: "from-orange-400 to-orange-500",
    previewLabel: "Change calendar",
    fullDescription:
      "Manage IT service requests, incidents, problems, and changes with ITIL-ready workflows. Enable your team to deliver fast, reliable IT services.",
    product: "Jira Service Management",
    recommendedFor: ["IT teams", "DevOps teams"],
    workTypes: [
      { name: "Incident", color: "bg-red-500" },
      { name: "Change", color: "bg-blue-500" },
      { name: "Problem", color: "bg-orange-500" },
      { name: "Service request", color: "bg-purple-500" },
    ],
    workflow: ["OPEN", "IN PROGRESS", "PENDING", "RESOLVED"],
    features: [
      {
        title: "Respond to incidents quickly",
        description:
          "Alert the right people and start resolving incidents faster with built-in escalation and on-call schedules.",
        linkText: "Learn more about incident management",
      },
      {
        title: "Manage changes safely",
        description:
          "Reduce risk with change management workflows that include approvals, risk assessment, and deployment tracking.",
        linkText: "Learn more about change management",
      },
    ],
  },
  {
    name: "IT service management (Essentials)",
    description:
      "Manage simple changes, incidents, problems and service requests with team-managed ITSM workflows.",
    category: "IT",
    color: "bg-slate-100",
    iconColor: "text-slate-600",
    previewBg: "from-slate-400 to-slate-500",
    previewLabel: "ITSM",
    fullDescription:
      "A simplified IT service management template with team-managed workflows for handling changes, incidents, problems, and service requests without the complexity of full ITIL processes.",
    product: "Jira Service Management",
    recommendedFor: ["Small IT teams", "Teams new to ITSM"],
    workTypes: [
      { name: "Incident", color: "bg-red-500" },
      { name: "Change", color: "bg-blue-500" },
      { name: "Problem", color: "bg-orange-500" },
      { name: "Service request", color: "bg-purple-500" },
    ],
    workflow: ["TO DO", "IN PROGRESS", "DONE"],
    features: [
      {
        title: "Simplified ITSM",
        description:
          "Get started with IT service management using simple, team-managed workflows.",
        linkText: "Learn more about ITSM Essentials",
      },
    ],
  },
  // Facilities
  {
    name: "Facilities service management",
    description:
      "Easily manage requests for maintenance, moving, and event planning.",
    category: "Facilities",
    color: "bg-cyan-100",
    iconColor: "text-cyan-600",
    previewBg: "from-cyan-400 to-cyan-500",
    previewLabel: "Facilities",
    fullDescription:
      "Handle facilities requests for maintenance, office moves, and event coordination.",
    product: "Jira Service Management",
    recommendedFor: ["Facilities teams", "Office managers"],
    workTypes: [
      { name: "Maintenance", color: "bg-cyan-500" },
      { name: "Move request", color: "bg-blue-500" },
    ],
    workflow: ["OPEN", "IN PROGRESS", "RESOLVED"],
    features: [
      {
        title: "Manage facilities",
        description: "Track maintenance and office requests in one place.",
        linkText: "Learn more",
      },
    ],
  },
  // Nonprofit
  {
    name: "General service management",
    description: "Create one place to collect and manage any type of request.",
    category: "Nonprofit",
    badge: "RECOMMENDED",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Requests",
    fullDescription:
      "Set up a centralized service desk to manage and track incoming work requests. Give your customers and employees a single place to submit requests, and your team a clear view of what needs attention.",
    product: "Jira Service Management",
    recommendedFor: [
      "Teams managing incoming requests",
      "Nonprofit support teams",
    ],
    workTypes: [
      { name: "Request", color: "bg-purple-500" },
      { name: "Incident", color: "bg-red-500" },
      { name: "Change", color: "bg-blue-500" },
    ],
    workflow: ["OPEN", "IN PROGRESS", "WAITING", "RESOLVED"],
    features: [
      {
        title: "Collect requests in one place",
        description:
          "Give your customers a simple portal to submit requests. Automatically route requests to the right team members.",
        linkText: "Learn more about request management",
      },
      {
        title: "Track and prioritize work",
        description:
          "Use queues and SLAs to ensure your team focuses on the most important work first.",
        linkText: "Learn more about queues",
      },
    ],
  },
  {
    name: "Grant application tracker",
    description: "Manage grants from submission to award.",
    category: "Nonprofit",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    previewBg: "from-blue-400 to-blue-500",
    previewLabel: "Grants",
    fullDescription:
      "Track grant applications from initial submission through award.",
    product: "Jira",
    recommendedFor: ["Nonprofit teams", "Research teams"],
    workTypes: [{ name: "Grant", color: "bg-blue-500" }],
    workflow: ["DRAFT", "SUBMITTED", "UNDER REVIEW", "AWARDED"],
    features: [
      {
        title: "Grant tracking",
        description: "Track grant applications and deadlines.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Nonprofit management",
    description: "Track programs driving social impact.",
    category: "Nonprofit",
    color: "bg-green-100",
    iconColor: "text-green-600",
    previewBg: "from-green-400 to-green-500",
    previewLabel: "Programs",
    fullDescription:
      "Manage nonprofit programs, initiatives, and impact tracking.",
    product: "Jira",
    recommendedFor: ["Nonprofit teams"],
    workTypes: [
      { name: "Program", color: "bg-green-500" },
      { name: "Task", color: "bg-blue-500" },
    ],
    workflow: ["PLANNING", "IN PROGRESS", "COMPLETE"],
    features: [
      {
        title: "Program tracking",
        description: "Track program milestones and outcomes.",
        linkText: "Learn more",
      },
    ],
  },
  {
    name: "Community management",
    description: "Oversee community-focused initiatives.",
    category: "Nonprofit",
    color: "bg-amber-100",
    iconColor: "text-amber-600",
    previewBg: "from-amber-300 to-amber-400",
    previewLabel: "Community",
    fullDescription:
      "Manage community programs, volunteer coordination, and outreach initiatives in one place.",
    product: "Jira",
    recommendedFor: ["Community managers", "Nonprofit outreach teams"],
    workTypes: [
      { name: "Initiative", color: "bg-amber-500" },
      { name: "Event", color: "bg-green-500" },
      { name: "Task", color: "bg-blue-500" },
    ],
    workflow: ["PLANNING", "IN PROGRESS", "COMPLETE"],
    features: [
      {
        title: "Community initiatives",
        description: "Track community programs and volunteer activities.",
        linkText: "Learn more",
      },
    ],
  },
]

const sidebarCategories = [
  { name: "Made for you" },
  { name: "Custom templates", badge: "ENTERPRISE" },
  { name: "Software development" },
  { name: "Service management" },
  { name: "Work management" },
  { name: "Product management" },
  { name: "Marketing" },
  { name: "Human resources" },
  { name: "Finance" },
  { name: "Design" },
  { name: "Personal" },
  { name: "Operations" },
  { name: "Legal" },
  { name: "Sales" },
  { name: "Analytics" },
  { name: "IT" },
  { name: "Facilities" },
  { name: "Nonprofit" },
]

const categoryDescriptions: Record<string, string> = {
  "Made for you": "Templates for you based on how similar teams work.",
  "Software development":
    "Templates for agile software teams building great products.",
  "Service management":
    "Empower every team, from IT to HR to marketing, as they collect, prioritize, assign, and track incoming requests with ease. Get up and running quickly by selecting one of our tailored templates that include pre-configured workflows, forms, and settings based on service management best practices.",
  "Work management":
    "Track, coordinate, and manage work with structure and consistency using our work management templates.",
  "Product management":
    "Guide every step of a product's lifecycle: from inception through delivery - stay focused on the product and its customers first and foremost with our product management templates.",
  Marketing:
    "Whether it's a single blog or an entire email campaign, go from concept to launch with our marketing templates.",
  "Human resources":
    "Simplify talent acquisition, new hire onboarding, and employee development processes with our templates for HR teams.",
  Finance:
    "Manage budgeting and finance processes using our templates for finance teams.",
  Design:
    "Manage assets, track tasks, and facilitate collaboration across teams with our design templates.",
  Personal:
    "Work smarter and get more done. Effectively manage and track tasks for small teams or personal use.",
  Operations:
    "Track any type of process in your organization. Coordinate activities, promote standardization and ensure visibility amongst stakeholders with our operations templates.",
  Legal:
    "Get visibility and control over your legal processes. Manage critical information and ensure updates are completed with our templates for legal teams.",
  Sales:
    "Keep track of leads and grow your pipeline with our templates for sales teams.",
  Analytics:
    "Collect details, triage, and manage your data and insight requests using our template for analytics teams.",
  IT: "Facilitate high-velocity service management and leverage powerful ITSM categories and dedicated features with our IT templates.",
  Facilities:
    "From maintenance to moves, handle requests and manage complex changes using our facilities template.",
  Nonprofit:
    "The perfect solution streamlining your community programs, nonprofit initiatives, and grant-funded projects.",
}

function TemplatePreview({
  borderColor,
  label,
  rows,
}: {
  borderColor: string
  label: string
  rows: string[][]
}) {
  return (
    <div
      className={`h-[180px] rounded-2xl border-2 ${borderColor} flex flex-col bg-gray-50 p-4 dark:bg-muted/30`}
    >
      <div className="mb-3 text-xs font-semibold text-foreground">{label}</div>
      <div className="flex-1 space-y-2.5">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-1.5">
            {row.map((c, j) => (
              <div key={j} className={`h-4 rounded-full ${c}`} />
            ))}
            <div className="ml-auto size-3 shrink-0 rounded-full border-2 border-gray-300" />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-center">
        <div className="flex size-9 items-center justify-center rounded-full border-2 border-gray-300">
          <svg
            className="size-5 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>
    </div>
  )
}

const templatePreviews: Record<
  string,
  { border: string; label: string; rows: string[][] }
> = {
  Scrum: {
    border: "border-green-500",
    label: "Backlog",
    rows: [
      ["bg-blue-500 w-[40%]", "bg-green-500 w-[25%]", "bg-pink-500 w-[15%]"],
      ["bg-green-600 w-[35%]", "bg-orange-500 w-[30%]", "bg-gray-300 w-[15%]"],
      ["bg-blue-500 w-[40%]", "bg-purple-400 w-[20%]", "bg-gray-300 w-[20%]"],
    ],
  },
  "General service management": {
    border: "border-blue-500",
    label: "Requests",
    rows: [
      ["bg-blue-500 w-[45%]", "bg-green-500 w-[20%]", "bg-pink-500 w-[15%]"],
      [
        "bg-green-600 w-[40%]",
        "bg-orange-500 w-[25%]",
        "bg-purple-400 w-[15%]",
      ],
      ["bg-blue-500 w-[45%]", "bg-pink-500 w-[20%]", "bg-gray-300 w-[15%]"],
    ],
  },
  "Basic IT service management": {
    border: "border-orange-500",
    label: "Open",
    rows: [
      ["bg-blue-500 w-[45%]", "bg-green-500 w-[20%]", "bg-pink-500 w-[15%]"],
      ["bg-blue-500 w-[40%]", "bg-orange-500 w-[25%]", "bg-purple-400 w-[15%]"],
      ["bg-orange-500 w-[35%]", "bg-pink-500 w-[20%]", "bg-gray-300 w-[20%]"],
    ],
  },
  "Top-level planning": {
    border: "border-emerald-500",
    label: "Plan",
    rows: [
      ["bg-blue-500 w-[40%]", "bg-green-500 w-[25%]", "bg-pink-500 w-[10%]"],
      ["bg-green-600 w-[35%]", "bg-orange-500 w-[25%]", "bg-blue-300 w-[20%]"],
      ["bg-blue-500 w-[40%]", "bg-purple-400 w-[20%]", "bg-gray-300 w-[15%]"],
    ],
  },
  Kanban: {
    border: "border-blue-500",
    label: "Board",
    rows: [
      ["bg-blue-500 w-[45%]", "bg-green-500 w-[25%]", "bg-pink-500 w-[10%]"],
      ["bg-green-500 w-[40%]", "bg-orange-500 w-[20%]", "bg-gray-300 w-[20%]"],
      ["bg-blue-400 w-[35%]", "bg-purple-500 w-[25%]", "bg-gray-300 w-[15%]"],
    ],
  },
  "Blank space": {
    border: "border-blue-400 border-dashed",
    label: "Blank",
    rows: [
      ["bg-blue-400 w-[45%]", "bg-green-400 w-[20%]", "bg-pink-400 w-[15%]"],
      [
        "bg-green-400 w-[40%]",
        "bg-orange-400 w-[25%]",
        "bg-purple-300 w-[15%]",
      ],
      ["bg-blue-300 w-[35%]", "bg-pink-400 w-[20%]", "bg-gray-300 w-[20%]"],
    ],
  },
  "IT service management": {
    border: "border-orange-500",
    label: "Change calendar",
    rows: [
      ["bg-blue-500 w-[40%]", "bg-green-500 w-[25%]", "bg-pink-500 w-[15%]"],
      ["bg-green-600 w-[35%]", "bg-orange-500 w-[25%]", "bg-gray-300 w-[20%]"],
      ["bg-blue-400 w-[45%]", "bg-purple-400 w-[15%]", "bg-gray-300 w-[15%]"],
    ],
  },
  "IT Operations": {
    border: "border-amber-500",
    label: "Alerts",
    rows: [
      ["bg-blue-500 w-[35%]", "bg-green-500 w-[20%]", "bg-amber-400 w-[20%]"],
      ["bg-green-500 w-[30%]", "bg-orange-500 w-[25%]", "bg-amber-300 w-[15%]"],
      ["bg-blue-400 w-[25%]", "bg-green-400 w-[20%]", "bg-gray-300 w-[25%]"],
    ],
  },
  "Customer service management": {
    border: "border-purple-500",
    label: "Support",
    rows: [
      ["bg-purple-500 w-[40%]", "bg-green-500 w-[25%]", "bg-pink-400 w-[15%]"],
      ["bg-blue-500 w-[35%]", "bg-purple-400 w-[25%]", "bg-gray-300 w-[15%]"],
      ["bg-purple-400 w-[30%]", "bg-pink-500 w-[20%]", "bg-gray-300 w-[20%]"],
    ],
  },
  "Development requests": {
    border: "border-blue-500",
    label: "Requests",
    rows: [
      ["bg-blue-500 w-[45%]", "bg-green-500 w-[20%]", "bg-pink-500 w-[15%]"],
      ["bg-indigo-500 w-[40%]", "bg-orange-400 w-[20%]", "bg-gray-300 w-[15%]"],
      ["bg-blue-400 w-[35%]", "bg-purple-400 w-[25%]", "bg-gray-300 w-[15%]"],
    ],
  },
  "HR service management": {
    border: "border-emerald-500",
    label: "HR",
    rows: [
      ["bg-emerald-500 w-[40%]", "bg-green-400 w-[25%]", "bg-teal-400 w-[15%]"],
      ["bg-green-500 w-[35%]", "bg-emerald-400 w-[25%]", "bg-gray-300 w-[15%]"],
      ["bg-teal-500 w-[30%]", "bg-green-400 w-[25%]", "bg-gray-300 w-[20%]"],
    ],
  },
  "Finance service management": {
    border: "border-sky-500",
    label: "Finance",
    rows: [
      ["bg-sky-500 w-[45%]", "bg-blue-500 w-[20%]", "bg-teal-400 w-[15%]"],
      ["bg-blue-500 w-[40%]", "bg-sky-400 w-[25%]", "bg-gray-300 w-[10%]"],
      ["bg-sky-400 w-[35%]", "bg-blue-400 w-[20%]", "bg-gray-300 w-[20%]"],
    ],
  },
  "Facilities service management": {
    border: "border-cyan-500",
    label: "Facilities",
    rows: [
      ["bg-cyan-500 w-[40%]", "bg-teal-400 w-[25%]", "bg-blue-400 w-[15%]"],
      ["bg-teal-500 w-[35%]", "bg-cyan-400 w-[25%]", "bg-gray-300 w-[15%]"],
      ["bg-blue-400 w-[30%]", "bg-cyan-400 w-[25%]", "bg-gray-300 w-[20%]"],
    ],
  },
  "Marketing service management": {
    border: "border-pink-500",
    label: "Marketing",
    rows: [
      ["bg-pink-500 w-[40%]", "bg-rose-400 w-[25%]", "bg-purple-400 w-[15%]"],
      ["bg-rose-500 w-[35%]", "bg-pink-400 w-[25%]", "bg-gray-300 w-[15%]"],
      ["bg-purple-400 w-[30%]", "bg-pink-400 w-[25%]", "bg-gray-300 w-[20%]"],
    ],
  },
  "Analytics service management": {
    border: "border-orange-500",
    label: "Analytics",
    rows: [
      ["bg-orange-500 w-[40%]", "bg-amber-400 w-[25%]", "bg-red-400 w-[15%]"],
      ["bg-amber-500 w-[35%]", "bg-orange-400 w-[25%]", "bg-gray-300 w-[15%]"],
      ["bg-red-400 w-[30%]", "bg-orange-400 w-[25%]", "bg-gray-300 w-[20%]"],
    ],
  },
  "Legal service management": {
    border: "border-violet-500",
    label: "Legal",
    rows: [
      [
        "bg-violet-500 w-[40%]",
        "bg-purple-400 w-[25%]",
        "bg-indigo-400 w-[15%]",
      ],
      ["bg-purple-500 w-[35%]", "bg-violet-400 w-[25%]", "bg-gray-300 w-[15%]"],
      ["bg-indigo-400 w-[30%]", "bg-violet-400 w-[25%]", "bg-gray-300 w-[20%]"],
    ],
  },
  "Sales service management": {
    border: "border-rose-500",
    label: "Sales",
    rows: [
      ["bg-rose-500 w-[40%]", "bg-red-400 w-[25%]", "bg-orange-400 w-[15%]"],
      ["bg-red-500 w-[35%]", "bg-rose-400 w-[25%]", "bg-gray-300 w-[15%]"],
      ["bg-orange-400 w-[30%]", "bg-rose-400 w-[25%]", "bg-gray-300 w-[20%]"],
    ],
  },
  "Design service management": {
    border: "border-fuchsia-500",
    label: "Design",
    rows: [
      [
        "bg-fuchsia-500 w-[40%]",
        "bg-purple-400 w-[25%]",
        "bg-pink-400 w-[15%]",
      ],
      [
        "bg-purple-500 w-[35%]",
        "bg-fuchsia-400 w-[25%]",
        "bg-gray-300 w-[15%]",
      ],
      ["bg-pink-400 w-[30%]", "bg-fuchsia-400 w-[25%]", "bg-gray-300 w-[20%]"],
    ],
  },
  "IT service management (Essentials)": {
    border: "border-slate-500",
    label: "ITSM",
    rows: [
      ["bg-slate-500 w-[40%]", "bg-blue-400 w-[25%]", "bg-gray-400 w-[15%]"],
      ["bg-blue-500 w-[35%]", "bg-slate-400 w-[25%]", "bg-gray-300 w-[15%]"],
      ["bg-gray-400 w-[30%]", "bg-slate-400 w-[25%]", "bg-gray-300 w-[20%]"],
    ],
  },
  "Bug tracking": {
    border: "border-red-500",
    label: "Bugs",
    rows: [
      ["bg-red-500 w-[40%]", "bg-orange-400 w-[25%]", "bg-gray-300 w-[15%]"],
      ["bg-red-400 w-[45%]", "bg-yellow-400 w-[20%]", "bg-gray-300 w-[15%]"],
      ["bg-red-500 w-[35%]", "bg-orange-500 w-[30%]", "bg-gray-300 w-[10%]"],
    ],
  },
}

function BacklogIllustration() {
  return (
    <div className="w-[200px] rounded-lg border bg-white p-3 shadow-sm">
      {[
        {
          check: "bg-blue-500",
          icons: ["bg-green-400", "bg-yellow-400"],
          bar: "bg-blue-300 w-3/4",
        },
        {
          check: "bg-green-500",
          icons: ["bg-green-400", "bg-yellow-400"],
          bar: "bg-green-300 w-2/3",
        },
        {
          check: "bg-green-500",
          icons: ["bg-green-400", "bg-yellow-400"],
          bar: "bg-purple-300 w-1/2",
        },
      ].map((row, i) => (
        <div
          key={i}
          className="flex items-center gap-2 border-b py-1.5 last:border-0"
        >
          <div
            className={`size-4 rounded-sm ${row.check} flex items-center justify-center`}
          >
            <svg
              className="size-2.5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          {row.icons.map((c, j) => (
            <div key={j} className={`size-3 rounded-sm ${c}`} />
          ))}
          <div className={`h-2.5 rounded-full ${row.bar} flex-1`} />
          <div className="size-5 rounded-full border border-blue-200 bg-blue-100" />
        </div>
      ))}
      <div className="mt-1 h-6 border-t" />
    </div>
  )
}

function SprintIllustration() {
  return (
    <div className="flex w-[200px] items-center justify-center">
      <svg className="size-24" viewBox="0 0 100 100" fill="none">
        <circle
          cx="45"
          cy="50"
          r="30"
          stroke="#0052CC"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="150 40"
        />
        <path
          d="M70 50 L90 50 L82 42 M90 50 L82 58"
          stroke="#36B37E"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

function VelocityIllustration() {
  return (
    <div className="flex w-[200px] items-center justify-center">
      <div className="flex h-20 items-end gap-1.5">
        {[40, 55, 35, 65, 50, 70, 45, 60].map((h, i) => (
          <div
            key={i}
            className={`w-4 rounded-t-sm ${i % 2 === 0 ? "bg-teal-400" : "bg-blue-400"}`}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  )
}

/* ── Custom Template Card Illustrations ── */

function KanbanIllustration() {
  return (
    <div className="relative flex h-[180px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-blue-950/40 dark:to-indigo-950/40">
      {/* Background board */}
      <div className="absolute top-6 left-6 h-[110px] w-[120px] rounded-lg bg-gray-200/60 dark:bg-gray-700/40" />
      {/* Front board with cards */}
      <div className="relative w-[160px] rounded-lg bg-white p-2.5 shadow-md dark:bg-gray-800">
        <div className="flex gap-2">
          {/* Column 1 */}
          <div className="flex-1 space-y-1.5">
            <div className="mb-2 h-1.5 w-8 rounded-full bg-gray-300 dark:bg-gray-600" />
            <div className="space-y-1 rounded bg-blue-100 p-1.5 dark:bg-blue-900/40">
              <div className="h-1.5 w-full rounded-full bg-blue-400" />
              <div className="h-1.5 w-3/4 rounded-full bg-blue-300" />
              <div className="flex justify-end">
                <div className="size-3 rounded-full bg-blue-500" />
              </div>
            </div>
            <div className="space-y-1 rounded bg-green-100 p-1.5 dark:bg-green-900/40">
              <div className="h-1.5 w-full rounded-full bg-green-400" />
              <div className="h-1.5 w-1/2 rounded-full bg-green-300" />
            </div>
          </div>
          {/* Column 2 */}
          <div className="flex-1 space-y-1.5">
            <div className="mb-2 h-1.5 w-8 rounded-full bg-gray-300 dark:bg-gray-600" />
            <div className="space-y-1 rounded bg-amber-100 p-1.5 dark:bg-amber-900/40">
              <div className="h-1.5 w-full rounded-full bg-amber-400" />
              <div className="h-1.5 w-2/3 rounded-full bg-amber-300" />
              <div className="flex justify-end">
                <div className="size-3 rounded-full bg-orange-500" />
              </div>
            </div>
            <div className="space-y-1 rounded bg-pink-100 p-1.5 dark:bg-pink-900/40">
              <div className="h-1.5 w-full rounded-full bg-pink-400" />
            </div>
          </div>
          {/* Column 3 */}
          <div className="flex-1 space-y-1.5">
            <div className="mb-2 h-1.5 w-8 rounded-full bg-gray-300 dark:bg-gray-600" />
            <div className="space-y-1 rounded bg-purple-100 p-1.5 dark:bg-purple-900/40">
              <div className="h-1.5 w-full rounded-full bg-purple-400" />
              <div className="h-1.5 w-1/2 rounded-full bg-purple-300" />
            </div>
          </div>
        </div>
      </div>
      {/* Arrows */}
      <svg
        className="absolute top-1/2 right-3 size-6 -translate-y-1/2 text-blue-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </div>
  )
}

function ScrumIllustration() {
  return (
    <div className="relative flex h-[180px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-teal-950/40 dark:to-cyan-950/40">
      <svg className="size-32" viewBox="0 0 120 120" fill="none">
        {/* Sprint cycle circle */}
        <circle
          cx="55"
          cy="60"
          r="38"
          stroke="#0891B2"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="180 60"
        />
        {/* Arrow head on circle */}
        <circle
          cx="55"
          cy="60"
          r="38"
          stroke="#0891B2"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="4 236"
          strokeDashoffset="-176"
        />
        {/* Forward arrow */}
        <path
          d="M85 60 L110 60"
          stroke="#22C55E"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M102 50 L112 60 L102 70"
          stroke="#22C55E"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Center dot */}
        <circle cx="55" cy="60" r="4" fill="#0891B2" />
      </svg>
    </div>
  )
}

function TopLevelPlanningIllustration() {
  return (
    <div className="relative flex h-[180px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100 p-4 dark:from-emerald-950/40 dark:to-teal-950/40">
      <div className="relative w-[180px] rounded-lg bg-white p-3 shadow-md dark:bg-gray-800">
        {/* Header */}
        <div className="mb-3 flex items-center gap-2">
          <div className="size-3 rounded-full bg-teal-500" />
          <div className="h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>
        {/* Timeline rows */}
        <div className="relative space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-6 shrink-0 rounded-full bg-gray-300 dark:bg-gray-600" />
            <div className="h-5 w-[60%] rounded bg-blue-400" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-6 shrink-0 rounded-full bg-gray-300 dark:bg-gray-600" />
            <div className="ml-[15%] h-5 w-[45%] rounded bg-green-400" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-6 shrink-0 rounded-full bg-gray-300 dark:bg-gray-600" />
            <div className="ml-[30%] h-5 w-[50%] rounded bg-purple-400" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-6 shrink-0 rounded-full bg-gray-300 dark:bg-gray-600" />
            <div className="ml-[10%] h-5 w-[35%] rounded bg-amber-400" />
          </div>
          {/* Vertical marker line */}
          <div className="absolute top-0 bottom-0 left-[55%] w-0.5 bg-red-400/70">
            <div className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-red-400" />
          </div>
          {/* Green checkmark */}
          <div className="absolute top-0 right-0">
            <div className="flex size-4 items-center justify-center rounded-full bg-green-500">
              <svg
                className="size-2.5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CrossTeamPlanningIllustration() {
  return (
    <div className="relative flex h-[180px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-100 p-3 dark:from-indigo-950/40 dark:to-blue-950/40">
      {/* Three mini boards with arrows */}
      <div className="flex items-center gap-1">
        {/* Board 1 */}
        <div className="w-[55px] rounded bg-white p-1.5 shadow-sm dark:bg-gray-800">
          <div className="mb-1.5 h-1 w-6 rounded-full bg-gray-300 dark:bg-gray-600" />
          <div className="space-y-1">
            <div className="h-3 rounded bg-blue-200 dark:bg-blue-900/40" />
            <div className="h-3 rounded bg-green-200 dark:bg-green-900/40" />
            <div className="h-3 rounded bg-blue-200 dark:bg-blue-900/40" />
          </div>
        </div>
        {/* Arrow */}
        <svg
          className="size-4 shrink-0 text-indigo-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M5 12h14M14 7l5 5-5 5" />
        </svg>
        {/* Board 2 */}
        <div className="w-[55px] rounded bg-white p-1.5 shadow-sm dark:bg-gray-800">
          <div className="mb-1.5 h-1 w-6 rounded-full bg-gray-300 dark:bg-gray-600" />
          <div className="space-y-1">
            <div className="h-3 rounded bg-purple-200 dark:bg-purple-900/40" />
            <div className="h-3 rounded bg-amber-200 dark:bg-amber-900/40" />
            <div className="h-3 rounded bg-pink-200 dark:bg-pink-900/40" />
          </div>
        </div>
        {/* Arrow */}
        <svg
          className="size-4 shrink-0 text-indigo-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M5 12h14M14 7l5 5-5 5" />
        </svg>
        {/* Board 3 */}
        <div className="w-[55px] rounded bg-white p-1.5 shadow-sm dark:bg-gray-800">
          <div className="mb-1.5 h-1 w-6 rounded-full bg-gray-300 dark:bg-gray-600" />
          <div className="space-y-1">
            <div className="h-3 rounded bg-teal-200 dark:bg-teal-900/40" />
            <div className="h-3 rounded bg-indigo-200 dark:bg-indigo-900/40" />
            <div className="h-3 rounded bg-cyan-200 dark:bg-cyan-900/40" />
          </div>
        </div>
      </div>
    </div>
  )
}

function DevRequestsIllustration() {
  return (
    <div className="relative flex h-[180px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 p-4 dark:from-orange-950/40 dark:to-amber-950/40">
      {/* Circular arrow behind */}
      <svg
        className="absolute bottom-2 left-2 size-16 text-orange-300/50"
        viewBox="0 0 100 100"
        fill="none"
      >
        <circle
          cx="50"
          cy="50"
          r="35"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="160 60"
        />
      </svg>
      {/* Request form card */}
      <div className="relative w-[170px] rounded-lg bg-white p-3 shadow-md dark:bg-gray-800">
        <div className="mb-2 text-[10px] font-bold text-gray-700 dark:text-gray-300">
          Requests
        </div>
        {/* Search/input */}
        <div className="mb-2 flex items-center gap-1.5 rounded border border-gray-200 bg-gray-50 px-2 py-1.5 dark:border-gray-600 dark:bg-gray-700">
          <svg
            className="size-3 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <div className="h-1.5 w-16 rounded-full bg-gray-200 dark:bg-gray-600" />
        </div>
        {/* Request rows */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 rounded bg-gray-50 px-1.5 py-1 dark:bg-gray-700">
            <div className="size-2.5 rounded-full bg-red-500" />
            <div className="h-1.5 flex-1 rounded-full bg-gray-300 dark:bg-gray-600" />
            <div className="flex gap-0.5">
              <div className="size-2 rounded-full bg-gray-300 dark:bg-gray-600" />
              <div className="size-2 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded border border-blue-200 bg-blue-50 px-1.5 py-1 dark:border-blue-800 dark:bg-blue-900/20">
            <div className="size-2.5 rounded-full bg-blue-500" />
            <span className="text-[7px] font-medium text-blue-600 dark:text-blue-400">
              I found a bug
            </span>
            <div className="ml-auto flex gap-0.5">
              <div className="size-2 rounded-full bg-blue-300" />
              <div className="size-2 rounded-full bg-blue-300" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded bg-gray-50 px-1.5 py-1 dark:bg-gray-700">
            <div className="size-2.5 rounded-full bg-green-500" />
            <div className="h-1.5 flex-1 rounded-full bg-gray-300 dark:bg-gray-600" />
            <div className="flex gap-0.5">
              <div className="size-2 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductRoadmapIllustration() {
  return (
    <div className="relative flex h-[180px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 p-4 dark:from-amber-950/40 dark:to-orange-950/40">
      {/* Decorative curve */}
      <svg
        className="absolute right-0 bottom-0 h-24 w-24 text-orange-200/50"
        viewBox="0 0 100 100"
        fill="none"
      >
        <path d="M100 0 Q50 50 100 100" stroke="currentColor" strokeWidth="3" />
        <path d="M80 0 Q30 50 80 100" stroke="currentColor" strokeWidth="2" />
      </svg>
      {/* Roadmap card */}
      <div className="relative w-[170px] rounded-lg bg-white p-3 shadow-md dark:bg-gray-800">
        <div className="mb-2.5 text-[10px] font-bold text-gray-700 dark:text-gray-300">
          Roadmap
        </div>
        {/* Timeline header */}
        <div className="mb-2 flex gap-4">
          <div className="h-1 w-8 rounded-full bg-gray-200 dark:bg-gray-600" />
          <div className="h-1 w-8 rounded-full bg-gray-200 dark:bg-gray-600" />
          <div className="h-1 w-8 rounded-full bg-gray-200 dark:bg-gray-600" />
        </div>
        {/* Gantt bars */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <div className="h-1 w-4 shrink-0 rounded-full bg-gray-300 dark:bg-gray-600" />
            <div className="h-4 w-[55%] rounded bg-blue-400" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-1 w-4 shrink-0 rounded-full bg-gray-300 dark:bg-gray-600" />
            <div className="ml-[20%] h-4 w-[40%] rounded bg-green-400" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-1 w-4 shrink-0 rounded-full bg-gray-300 dark:bg-gray-600" />
            <div className="ml-[35%] h-4 w-[50%] rounded bg-orange-400" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-1 w-4 shrink-0 rounded-full bg-gray-300 dark:bg-gray-600" />
            <div className="ml-[10%] h-4 w-[30%] rounded bg-purple-400" />
          </div>
        </div>
        {/* Progress indicator */}
        <div className="mt-2 flex items-center gap-1">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
            <div className="h-full w-[65%] rounded-full bg-green-400" />
          </div>
          <span className="text-[7px] font-medium text-gray-400">65</span>
        </div>
      </div>
    </div>
  )
}

function PrioritizationIllustration() {
  return (
    <div className="relative flex h-[180px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-100 p-4 dark:from-amber-950/40 dark:to-yellow-950/40">
      <div className="relative w-[170px] rounded-lg bg-white p-3 shadow-md dark:bg-gray-800">
        <div className="mb-2 text-[10px] font-bold text-gray-700 dark:text-gray-300">
          Prioritization
        </div>
        {/* RICE scoring table */}
        <div className="space-y-1.5">
          {[
            { label: "bg-amber-400", score: "w-[80%]", dot: "bg-amber-500" },
            { label: "bg-blue-400", score: "w-[65%]", dot: "bg-blue-500" },
            { label: "bg-green-400", score: "w-[50%]", dot: "bg-green-500" },
            { label: "bg-purple-400", score: "w-[35%]", dot: "bg-purple-500" },
          ].map((row, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className={`size-2 rounded-sm ${row.dot}`} />
              <div className="h-1.5 w-8 rounded-full bg-gray-200 dark:bg-gray-600" />
              <div className={`h-3 ${row.label} rounded ${row.score}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function BugTrackingIllustration() {
  return (
    <div className="relative flex h-[180px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-red-50 to-rose-100 p-4 dark:from-red-950/40 dark:to-rose-950/40">
      <div className="relative w-[170px] rounded-lg bg-white p-3 shadow-md dark:bg-gray-800">
        <div className="mb-2 flex items-center gap-1.5">
          <svg
            className="size-3 text-red-500"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <circle cx="12" cy="12" r="10" />
            <path
              d="M8 12h8M12 8v8"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <div className="text-[10px] font-bold text-gray-700 dark:text-gray-300">
            Bugs
          </div>
          <div className="ml-auto rounded-full bg-red-100 px-1.5 py-0.5 text-[8px] font-medium text-red-600 dark:bg-red-900/40 dark:text-red-400">
            12 open
          </div>
        </div>
        <div className="space-y-1.5">
          {[
            { priority: "bg-red-500", w: "w-[70%]" },
            { priority: "bg-orange-500", w: "w-[55%]" },
            { priority: "bg-yellow-500", w: "w-[60%]" },
            { priority: "bg-red-500", w: "w-[45%]" },
          ].map((row, i) => (
            <div key={i} className="flex items-center gap-1.5 py-0.5">
              <div className={`size-1.5 rounded-full ${row.priority}`} />
              <div
                className={`h-1.5 rounded-full bg-gray-200 dark:bg-gray-600 ${row.w}`}
              />
              <div className="ml-auto size-3 rounded-full bg-gray-100 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Service Management Illustrations ── */

function GeneralServiceMgmtIllustration() {
  return (
    <div className="relative flex h-[180px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/40 dark:to-indigo-950/40">
      <svg className="h-[150px] w-[170px]" viewBox="0 0 170 150" fill="none">
        {/* Building blocks - colorful stacked */}
        <rect x="40" y="55" width="30" height="55" rx="4" fill="#4C9AFF" />
        <rect x="40" y="55" width="30" height="20" rx="4" fill="#2684FF" />
        <rect x="74" y="40" width="30" height="70" rx="4" fill="#0065FF" />
        <rect x="74" y="40" width="30" height="25" rx="4" fill="#0052CC" />
        <rect x="108" y="50" width="24" height="60" rx="4" fill="#4C9AFF" />
        {/* Small colored accent blocks */}
        <rect x="50" y="78" width="12" height="10" rx="2" fill="#79E2F2" />
        <rect x="82" y="72" width="14" height="10" rx="2" fill="#ABF5D1" />
        <rect x="112" y="68" width="10" height="8" rx="2" fill="#79E2F2" />
        {/* Person standing on blocks - more detailed */}
        <circle cx="89" cy="22" r="8" fill="#0052CC" />
        {/* Body */}
        <rect x="83" y="30" width="12" height="14" rx="3" fill="#0052CC" />
        {/* Arms raised */}
        <path
          d="M78 34 L70 24"
          stroke="#0052CC"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M100 34 L108 24"
          stroke="#0052CC"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Hand circles */}
        <circle cx="69" cy="23" r="2.5" fill="#FFAB00" />
        <circle cx="109" cy="23" r="2.5" fill="#36B37E" />
        {/* Small person left */}
        <circle cx="52" cy="44" r="5" fill="#6554C0" />
        <rect x="48" y="49" width="8" height="8" rx="2" fill="#6554C0" />
        {/* Small person right */}
        <circle cx="118" cy="40" r="4" fill="#00B8D9" />
        <rect x="115" y="44" width="6" height="7" rx="2" fill="#00B8D9" />
        {/* Decorative dots */}
        <circle cx="35" cy="98" r="2" fill="#C0B6F2" />
        <circle cx="135" cy="95" r="2" fill="#79E2F2" />
      </svg>
    </div>
  )
}

function ITServiceMgmtIllustration() {
  return (
    <div className="relative flex h-[180px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100 p-4 dark:from-amber-950/40 dark:to-orange-950/40">
      <div className="relative w-[170px] rounded-lg bg-white p-3 shadow-md dark:bg-gray-800">
        <div className="mb-2 text-[10px] font-bold text-gray-700 dark:text-gray-300">
          Change calendar
        </div>
        {/* Calendar grid */}
        <div className="mb-2 grid grid-cols-5 gap-1">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className={`h-3 rounded-sm ${i === 4 ? "bg-amber-300" : i === 7 ? "bg-blue-200" : i === 11 ? "bg-amber-200" : "bg-gray-100 dark:bg-gray-700"}`}
            >
              {(i === 4 || i === 11) && (
                <svg
                  className="mx-auto size-3 text-amber-600"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2L2 20h20L12 2zm0 4l7 12H5l7-12z" />
                </svg>
              )}
            </div>
          ))}
        </div>
        {/* Bottom items */}
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-6 rounded-full bg-blue-400" />
          <div className="h-1.5 w-8 rounded-full bg-gray-200 dark:bg-gray-600" />
          <div className="h-1.5 w-4 rounded-full bg-amber-400" />
        </div>
      </div>
      {/* Pencil icon */}
      <svg
        className="absolute top-5 right-5 size-5 rotate-[-30deg] text-gray-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
      </svg>
    </div>
  )
}

function ITOperationsIllustration() {
  return (
    <div className="relative flex h-[180px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 p-3 dark:from-green-950/40 dark:to-emerald-950/40">
      <div className="relative w-[175px] rounded-lg bg-white p-2.5 shadow-md dark:bg-gray-800">
        {/* Header */}
        <div className="mb-2 flex items-center gap-1.5">
          <svg
            className="size-3 text-amber-500"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2L2 20h20L12 2zm0 4l7 12H5l7-12z" />
          </svg>
          <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">
            Alerts
          </span>
          <div className="ml-auto flex gap-0.5">
            <div className="h-5 w-3 rounded-sm bg-green-400" />
            <div className="h-7 w-3 rounded-sm bg-green-500" />
            <div className="h-4 w-3 rounded-sm bg-green-300" />
            <div className="h-6 w-3 rounded-sm bg-green-400" />
          </div>
        </div>
        {/* Alert rows */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
            <svg
              className="size-2.5 shrink-0 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path d="M4 6h16M4 12h16" />
            </svg>
            <div className="flex flex-1 gap-0.5">
              <div className="h-3 w-[35%] rounded-sm bg-blue-500" />
              <div className="h-3 w-[25%] rounded-sm bg-blue-300" />
              <div className="flex size-3 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
                <div className="size-1.5 rounded-full bg-blue-400" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <svg
              className="size-2.5 shrink-0 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path d="M4 6h16M4 12h16" />
            </svg>
            <div className="flex flex-1 gap-0.5">
              <div className="h-3 w-[40%] rounded-sm bg-orange-400" />
              <div className="h-3 w-[20%] rounded-sm bg-green-400" />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <svg
              className="size-2.5 shrink-0 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path d="M4 6h16M4 12h16" />
            </svg>
            <div className="flex flex-1 gap-0.5">
              <div className="h-3 w-[30%] rounded-sm bg-amber-400" />
              <svg
                className="size-3 text-amber-500"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2L2 20h20L12 2zm0 4l7 12H5l7-12z" />
              </svg>
              <div className="size-3 rounded-full bg-blue-200 dark:bg-blue-800" />
            </div>
          </div>
        </div>
      </div>
      {/* Decorative connection lines */}
      <svg
        className="absolute top-1/2 left-1 size-6 text-green-300"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M4 12h4M14 6l4 6-4 6" />
      </svg>
    </div>
  )
}

function CustomerServiceMgmtIllustration() {
  return (
    <div className="relative flex h-[180px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-purple-100 to-fuchsia-100 p-3 dark:from-purple-950/40 dark:to-fuchsia-950/40">
      <div className="relative w-[140px] rounded-lg bg-white p-3 shadow-md dark:bg-gray-800">
        <div className="mb-2.5 flex items-center gap-1.5">
          <div className="size-3 rounded bg-green-500" />
          <span className="text-[9px] font-bold text-gray-700 dark:text-gray-300">
            Support
          </span>
        </div>
        {/* Support bars */}
        <div className="space-y-2">
          <div className="h-5 w-[85%] rounded bg-green-400" />
          <div className="h-5 w-[70%] rounded bg-amber-400" />
          <div className="h-5 w-[90%] rounded bg-orange-400" />
        </div>
        {/* Shield icon */}
        <div className="absolute bottom-2 -left-2">
          <svg
            className="size-5 text-purple-400"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z"
              opacity="0.5"
            />
          </svg>
        </div>
      </div>
      {/* Checkmark circle */}
      <div className="absolute right-8 bottom-6 flex size-8 items-center justify-center rounded-full border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
        <svg
          className="size-4 text-gray-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    </div>
  )
}

function HRServiceMgmtIllustration() {
  return (
    <div className="relative flex h-[180px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950/40 dark:to-green-950/40">
      <svg className="h-[120px] w-[160px]" viewBox="0 0 160 120" fill="none">
        {/* Person 1 with X */}
        <circle cx="50" cy="40" r="14" fill="#86EFAC" />
        <circle cx="50" cy="28" r="8" fill="#4ADE80" />
        <rect x="42" y="40" width="16" height="24" rx="4" fill="#4ADE80" />
        {/* X mark */}
        <circle
          cx="50"
          cy="22"
          r="12"
          fill="none"
          stroke="#EF4444"
          strokeWidth="2"
        />
        <path
          d="M44 16l12 12M56 16L44 28"
          stroke="#EF4444"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Person 2 with check */}
        <circle cx="110" cy="40" r="14" fill="#86EFAC" />
        <circle cx="110" cy="28" r="8" fill="#4ADE80" />
        <rect x="102" y="40" width="16" height="24" rx="4" fill="#4ADE80" />
        {/* Check mark */}
        <circle
          cx="110"
          cy="22"
          r="12"
          fill="none"
          stroke="#22C55E"
          strokeWidth="2"
        />
        <polyline
          points="103,22 108,27 118,17"
          stroke="#22C55E"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Arrow between */}
        <path
          d="M68 45 L92 45"
          stroke="#A3E635"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M88 41 L93 45 L88 49"
          stroke="#A3E635"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Small cards below */}
        <rect x="35" y="75" width="30" height="16" rx="3" fill="#BBF7D0" />
        <rect x="95" y="75" width="30" height="16" rx="3" fill="#BBF7D0" />
        <rect x="65" y="80" width="30" height="16" rx="3" fill="#86EFAC" />
      </svg>
    </div>
  )
}

function FinanceServiceMgmtIllustration() {
  return (
    <div className="relative flex h-[180px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-100 dark:from-teal-950/40 dark:to-emerald-950/40">
      <svg className="h-[130px] w-[170px]" viewBox="0 0 170 130" fill="none">
        {/* Back card */}
        <rect x="55" y="20" width="90" height="56" rx="8" fill="#5EEAD4" />
        <rect x="65" y="58" width="60" height="6" rx="3" fill="#2DD4BF" />
        {/* Front card */}
        <rect x="25" y="35" width="90" height="56" rx="8" fill="#34D399" />
        <rect x="35" y="45" width="20" height="14" rx="3" fill="#FDE68A" />
        {/* Card chip lines */}
        <line
          x1="38"
          y1="49"
          x2="52"
          y2="49"
          stroke="#EAB308"
          strokeWidth="1"
        />
        <line
          x1="38"
          y1="52"
          x2="52"
          y2="52"
          stroke="#EAB308"
          strokeWidth="1"
        />
        <line
          x1="38"
          y1="55"
          x2="52"
          y2="55"
          stroke="#EAB308"
          strokeWidth="1"
        />
        {/* Card number dots */}
        <g fill="white" opacity="0.8">
          {[0, 1, 2, 3].map((i) => (
            <circle key={`a${i}`} cx={38 + i * 5} cy={72} r="1.5" />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <circle key={`b${i}`} cx={60 + i * 5} cy={72} r="1.5" />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <circle key={`c${i}`} cx={82 + i * 5} cy={72} r="1.5" />
          ))}
        </g>
        {/* Play arrow accent */}
        <circle cx="130" cy="85" r="12" fill="#10B981" />
        <polygon points="126,80 126,90 136,85" fill="white" />
      </svg>
    </div>
  )
}

function FacilitiesServiceMgmtIllustration() {
  return (
    <div className="relative flex h-[180px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-50 to-sky-100 dark:from-cyan-950/40 dark:to-sky-950/40">
      <svg className="h-[130px] w-[160px]" viewBox="0 0 160 130" fill="none">
        {/* Clipboard */}
        <rect
          x="35"
          y="15"
          width="70"
          height="90"
          rx="6"
          fill="#E0F2FE"
          stroke="#7DD3FC"
          strokeWidth="2"
        />
        <rect x="55" y="8" width="30" height="14" rx="5" fill="#7DD3FC" />
        {/* Checklist items */}
        <rect x="48" y="38" width="10" height="10" rx="2" fill="#22D3EE" />
        <polyline
          points="50,43 53,46 57,40"
          stroke="white"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="64" y="40" width="30" height="4" rx="2" fill="#BAE6FD" />

        <rect x="48" y="55" width="10" height="10" rx="2" fill="#22D3EE" />
        <polyline
          points="50,60 53,63 57,57"
          stroke="white"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="64" y="57" width="25" height="4" rx="2" fill="#BAE6FD" />

        <rect
          x="48"
          y="72"
          width="10"
          height="10"
          rx="2"
          fill="#E0F2FE"
          stroke="#7DD3FC"
          strokeWidth="1.5"
        />
        <rect x="64" y="74" width="28" height="4" rx="2" fill="#BAE6FD" />

        {/* Small building icon */}
        <rect x="110" y="55" width="30" height="35" rx="3" fill="#38BDF8" />
        <rect
          x="115"
          y="62"
          width="8"
          height="6"
          rx="1"
          fill="white"
          opacity="0.6"
        />
        <rect
          x="127"
          y="62"
          width="8"
          height="6"
          rx="1"
          fill="white"
          opacity="0.6"
        />
        <rect
          x="115"
          y="72"
          width="8"
          height="6"
          rx="1"
          fill="white"
          opacity="0.6"
        />
        <rect
          x="127"
          y="72"
          width="8"
          height="6"
          rx="1"
          fill="white"
          opacity="0.6"
        />
        <rect x="121" y="80" width="8" height="10" rx="1" fill="#0EA5E9" />
      </svg>
    </div>
  )
}

function MarketingServiceMgmtIllustration() {
  return (
    <div className="relative flex h-[180px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/40 dark:to-sky-950/40">
      <svg className="h-[130px] w-[160px]" viewBox="0 0 160 130" fill="none">
        {/* Megaphone body */}
        <path d="M40 55 L80 35 L80 90 L40 70 Z" fill="#3B82F6" />
        <rect x="25" y="52" width="18" height="22" rx="4" fill="#60A5FA" />
        {/* Megaphone opening */}
        <ellipse cx="80" cy="62" rx="6" ry="28" fill="#2563EB" />
        {/* Sound waves */}
        <path
          d="M92 48 Q100 62 92 78"
          stroke="#93C5FD"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M100 40 Q112 62 100 85"
          stroke="#BFDBFE"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        {/* Handle */}
        <rect x="35" y="72" width="4" height="18" rx="2" fill="#60A5FA" />
        {/* Accent bar */}
        <rect x="115" y="30" width="12" height="70" rx="4" fill="#F87171" />
        <rect x="115" y="30" width="12" height="25" rx="4" fill="#EF4444" />
      </svg>
    </div>
  )
}

function AnalyticsServiceMgmtIllustration() {
  return (
    <div className="relative flex h-[180px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-950/40 dark:to-slate-950/40">
      <svg className="h-[130px] w-[160px]" viewBox="0 0 160 130" fill="none">
        {/* Chart frame */}
        <rect
          x="30"
          y="15"
          width="100"
          height="80"
          rx="6"
          fill="white"
          stroke="#E2E8F0"
          strokeWidth="2"
        />
        {/* Grid lines */}
        <line
          x1="30"
          y1="35"
          x2="130"
          y2="35"
          stroke="#F1F5F9"
          strokeWidth="1"
        />
        <line
          x1="30"
          y1="55"
          x2="130"
          y2="55"
          stroke="#F1F5F9"
          strokeWidth="1"
        />
        <line
          x1="30"
          y1="75"
          x2="130"
          y2="75"
          stroke="#F1F5F9"
          strokeWidth="1"
        />
        {/* Axis */}
        <line
          x1="42"
          y1="25"
          x2="42"
          y2="88"
          stroke="#CBD5E1"
          strokeWidth="1.5"
        />
        <line
          x1="42"
          y1="88"
          x2="125"
          y2="88"
          stroke="#CBD5E1"
          strokeWidth="1.5"
        />
        {/* Line chart - red upward trend */}
        <polyline
          points="48,75 62,68 76,72 90,55 104,42 118,30"
          stroke="#EF4444"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Data points */}
        {[
          [48, 75],
          [62, 68],
          [76, 72],
          [90, 55],
          [104, 42],
          [118, 30],
        ].map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="3"
            fill="white"
            stroke="#EF4444"
            strokeWidth="2"
          />
        ))}
        {/* Bar accents at bottom */}
        <rect x="50" y="105" width="16" height="8" rx="2" fill="#CBD5E1" />
        <rect x="72" y="105" width="16" height="8" rx="2" fill="#CBD5E1" />
        <rect x="94" y="105" width="16" height="8" rx="2" fill="#CBD5E1" />
      </svg>
    </div>
  )
}

function LegalServiceMgmtIllustration() {
  return (
    <div className="relative flex h-[180px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40">
      <svg className="h-[130px] w-[160px]" viewBox="0 0 160 130" fill="none">
        {/* Document/page */}
        <rect
          x="50"
          y="20"
          width="60"
          height="80"
          rx="4"
          fill="white"
          stroke="#C7D2FE"
          strokeWidth="1.5"
        />
        <rect x="60" y="32" width="40" height="3" rx="1.5" fill="#CBD5E1" />
        <rect x="60" y="40" width="30" height="3" rx="1.5" fill="#CBD5E1" />
        <rect x="60" y="48" width="35" height="3" rx="1.5" fill="#CBD5E1" />
        <rect x="60" y="56" width="25" height="3" rx="1.5" fill="#CBD5E1" />
        <rect x="60" y="64" width="38" height="3" rx="1.5" fill="#CBD5E1" />
        <rect x="60" y="72" width="28" height="3" rx="1.5" fill="#CBD5E1" />
        {/* Feather/quill pen */}
        <path
          d="M115 25 Q100 55 108 90"
          stroke="#6366F1"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M115 25 Q125 45 120 70"
          stroke="#818CF8"
          strokeWidth="2"
          fill="none"
        />
        <path d="M115 25 L117 22 L119 25" fill="#6366F1" />
        {/* Magnifying glass */}
        <circle
          cx="40"
          cy="85"
          r="14"
          fill="none"
          stroke="#A5B4FC"
          strokeWidth="3"
        />
        <line
          x1="50"
          y1="95"
          x2="58"
          y2="103"
          stroke="#A5B4FC"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="40" cy="85" r="8" fill="#EEF2FF" opacity="0.5" />
      </svg>
    </div>
  )
}

function SalesServiceMgmtIllustration() {
  return (
    <div className="relative flex h-[180px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/40 dark:to-orange-950/40">
      <svg className="h-[120px] w-[150px]" viewBox="0 0 150 120" fill="none">
        {/* Target circles */}
        <circle cx="65" cy="60" r="40" fill="#FEE2E2" />
        <circle cx="65" cy="60" r="30" fill="#FECACA" />
        <circle cx="65" cy="60" r="20" fill="#FCA5A5" />
        <circle cx="65" cy="60" r="10" fill="#EF4444" />
        <circle cx="65" cy="60" r="3" fill="white" />
        {/* Arrow */}
        <line
          x1="95"
          y1="58"
          x2="125"
          y2="58"
          stroke="#F97316"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M120 52 L127 58 L120 64"
          stroke="#F97316"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Small sparkle */}
        <path
          d="M115 38 L117 42 L121 40 L117 44 L119 48 L115 45 L111 48 L113 44 L109 40 L113 42 Z"
          fill="#FBBF24"
        />
      </svg>
    </div>
  )
}

function DesignServiceMgmtIllustration() {
  return (
    <div className="relative flex h-[180px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/40 dark:to-purple-950/40">
      <svg className="h-[120px] w-[160px]" viewBox="0 0 160 120" fill="none">
        {/* Rainbow arcs */}
        <path
          d="M30 85 Q80 -10 130 85"
          stroke="#EF4444"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M36 85 Q80 0 124 85"
          stroke="#F97316"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M42 85 Q80 10 118 85"
          stroke="#FBBF24"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M48 85 Q80 20 112 85"
          stroke="#22C55E"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M54 85 Q80 30 106 85"
          stroke="#3B82F6"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M60 85 Q80 40 100 85"
          stroke="#8B5CF6"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        {/* Paintbrush */}
        <rect x="95" y="88" width="30" height="8" rx="3" fill="#A78BFA" />
        <rect x="82" y="86" width="16" height="12" rx="2" fill="#7C3AED" />
        {/* Cloud puffs at ends */}
        <circle cx="30" cy="88" r="6" fill="#FDE68A" />
        <circle cx="130" cy="88" r="6" fill="#FDE68A" />
      </svg>
    </div>
  )
}

function ITSMEssentialsIllustration() {
  return (
    <div className="relative flex h-[180px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-950/40 dark:to-gray-950/40">
      <svg className="h-[130px] w-[160px]" viewBox="0 0 160 130" fill="none">
        {/* Warning triangle - colorful */}
        <polygon points="50,30 75,72 25,72" fill="#FFAB00" opacity="0.8" />
        <polygon points="50,40 66,66 34,66" fill="#FFE380" />
        <text
          x="50"
          y="62"
          textAnchor="middle"
          fill="#172B4D"
          fontSize="16"
          fontWeight="bold"
        >
          !
        </text>
        {/* Gear icon - larger and more colorful */}
        <circle cx="110" cy="42" r="22" fill="#6554C0" opacity="0.85" />
        <circle cx="110" cy="42" r="12" fill="#EAE6FF" />
        {/* Gear teeth */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const rad = (angle * Math.PI) / 180
          const x = 110 + 26 * Math.cos(rad)
          const y = 42 + 26 * Math.sin(rad)
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4.5"
              fill="#6554C0"
              opacity="0.85"
            />
          )
        })}
        {/* Connecting dots and lines */}
        <circle cx="45" cy="90" r="5" fill="#00B8D9" />
        <circle cx="80" cy="100" r="4" fill="#36B37E" />
        <circle cx="115" cy="90" r="5" fill="#FF5630" />
        <path
          d="M50 90 L75 100"
          stroke="#DFE1E6"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M85 100 L110 90"
          stroke="#DFE1E6"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Small L-connector */}
        <path
          d="M75 75 L75 90 L45 90"
          stroke="#C1C7D0"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

/* ── Work Management Illustrations ── */

function WMBlankSpaceIllustration() {
  return (
    <div className="flex h-[180px] items-center justify-center rounded-2xl bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-950/40 dark:to-slate-950/40">
      <svg className="h-[130px] w-[140px]" viewBox="0 0 140 130" fill="none">
        {/* Stacked pages */}
        <rect x="30" y="30" width="70" height="85" rx="4" fill="#E2E8F0" />
        <rect x="35" y="25" width="70" height="85" rx="4" fill="#F1F5F9" />
        <rect
          x="40"
          y="20"
          width="70"
          height="85"
          rx="4"
          fill="white"
          stroke="#CBD5E1"
          strokeWidth="1"
        />
        {/* Lines on page */}
        <rect x="50" y="35" width="40" height="3" rx="1.5" fill="#E2E8F0" />
        <rect x="50" y="44" width="50" height="3" rx="1.5" fill="#E2E8F0" />
        <rect x="50" y="53" width="35" height="3" rx="1.5" fill="#E2E8F0" />
        <rect x="50" y="62" width="45" height="3" rx="1.5" fill="#E2E8F0" />
        {/* Blue + circle */}
        <circle cx="85" cy="75" r="16" fill="#2563EB" />
        <line
          x1="85"
          y1="67"
          x2="85"
          y2="83"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="77"
          y1="75"
          x2="93"
          y2="75"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

function ProjectManagementIllustration() {
  return (
    <div className="flex h-[180px] items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40">
      <svg className="h-[130px] w-[160px]" viewBox="0 0 160 130" fill="none">
        {/* Blueprint/plan */}
        <rect x="30" y="25" width="80" height="70" rx="4" fill="#BFDBFE" />
        <rect x="35" y="30" width="70" height="60" rx="2" fill="#93C5FD" />
        {/* Grid on blueprint */}
        <line
          x1="55"
          y1="30"
          x2="55"
          y2="90"
          stroke="#60A5FA"
          strokeWidth="0.5"
        />
        <line
          x1="75"
          y1="30"
          x2="75"
          y2="90"
          stroke="#60A5FA"
          strokeWidth="0.5"
        />
        <line
          x1="95"
          y1="30"
          x2="95"
          y2="90"
          stroke="#60A5FA"
          strokeWidth="0.5"
        />
        <line
          x1="35"
          y1="50"
          x2="105"
          y2="50"
          stroke="#60A5FA"
          strokeWidth="0.5"
        />
        <line
          x1="35"
          y1="70"
          x2="105"
          y2="70"
          stroke="#60A5FA"
          strokeWidth="0.5"
        />
        {/* Shapes on blueprint */}
        <rect
          x="42"
          y="36"
          width="20"
          height="10"
          rx="1"
          fill="#3B82F6"
          opacity="0.7"
        />
        <circle cx="85" cy="60" r="8" fill="#2563EB" opacity="0.5" />
        <polygon points="60,75 70,65 80,75" fill="#3B82F6" opacity="0.6" />
        {/* Compass/tool */}
        <circle cx="115" cy="45" r="4" fill="#1E40AF" />
        <line
          x1="115"
          y1="49"
          x2="115"
          y2="80"
          stroke="#64748B"
          strokeWidth="2"
        />
        <line
          x1="115"
          y1="80"
          x2="105"
          y2="95"
          stroke="#64748B"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="115"
          y1="80"
          x2="125"
          y2="95"
          stroke="#64748B"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Pencil */}
        <rect
          x="95"
          y="55"
          width="4"
          height="25"
          rx="1"
          fill="#FBBF24"
          transform="rotate(-15 97 67)"
        />
        <polygon
          points="93,82 97,87 101,82"
          fill="#1E40AF"
          transform="rotate(-15 97 84)"
        />
        {/* Dots */}
        <circle cx="50" cy="55" r="3" fill="#3B82F6" />
        <circle cx="90" cy="40" r="2" fill="#60A5FA" />
      </svg>
    </div>
  )
}

function TaskTrackingIllustration() {
  return (
    <div className="flex h-[180px] items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/40 dark:to-sky-950/40">
      <svg className="h-[130px] w-[150px]" viewBox="0 0 150 130" fill="none">
        {/* Clipboard */}
        <rect x="35" y="15" width="80" height="100" rx="6" fill="#3B82F6" />
        <rect x="40" y="20" width="70" height="90" rx="4" fill="white" />
        <rect x="55" y="8" width="40" height="16" rx="6" fill="#2563EB" />
        {/* Checklist items */}
        <rect
          x="50"
          y="35"
          width="12"
          height="12"
          rx="2"
          fill="#DBEAFE"
          stroke="#3B82F6"
          strokeWidth="1.5"
        />
        <polyline
          points="53,41 56,44 60,38"
          stroke="#3B82F6"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x="68"
          y="38"
          width="35"
          height="4"
          rx="2"
          fill="#E2E8F0"
          strokeDasharray="6 3"
          stroke="#94A3B8"
          strokeWidth="0.5"
        />

        <rect
          x="50"
          y="55"
          width="12"
          height="12"
          rx="2"
          fill="#DBEAFE"
          stroke="#3B82F6"
          strokeWidth="1.5"
        />
        <polyline
          points="53,61 56,64 60,58"
          stroke="#3B82F6"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x="68"
          y="58"
          width="30"
          height="4"
          rx="2"
          fill="#E2E8F0"
          strokeDasharray="6 3"
          stroke="#94A3B8"
          strokeWidth="0.5"
        />

        <rect
          x="50"
          y="75"
          width="12"
          height="12"
          rx="2"
          fill="#DBEAFE"
          stroke="#3B82F6"
          strokeWidth="1.5"
        />
        <rect
          x="68"
          y="78"
          width="32"
          height="4"
          rx="2"
          fill="#E2E8F0"
          strokeDasharray="6 3"
          stroke="#94A3B8"
          strokeWidth="0.5"
        />

        <rect
          x="50"
          y="95"
          width="12"
          height="12"
          rx="2"
          fill="#DBEAFE"
          stroke="#3B82F6"
          strokeWidth="1.5"
        />
        <rect
          x="68"
          y="98"
          width="28"
          height="4"
          rx="2"
          fill="#E2E8F0"
          strokeDasharray="6 3"
          stroke="#94A3B8"
          strokeWidth="0.5"
        />
      </svg>
    </div>
  )
}

function ProcessControlIllustration() {
  return (
    <div className="flex h-[180px] items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/40 dark:to-blue-950/40">
      <svg className="h-[120px] w-[160px]" viewBox="0 0 160 120" fill="none">
        {/* Red circle node */}
        <circle cx="30" cy="40" r="12" fill="#EF4444" />
        {/* Line to blue node */}
        <line
          x1="42"
          y1="40"
          x2="60"
          y2="40"
          stroke="#94A3B8"
          strokeWidth="2"
          strokeDasharray="4 2"
        />
        {/* Blue circle node */}
        <circle cx="75" cy="40" r="12" fill="#3B82F6" />
        {/* Line down to box */}
        <line
          x1="75"
          y1="52"
          x2="75"
          y2="70"
          stroke="#94A3B8"
          strokeWidth="2"
          strokeDasharray="4 2"
        />
        {/* Line right to green */}
        <line
          x1="87"
          y1="40"
          x2="105"
          y2="40"
          stroke="#94A3B8"
          strokeWidth="2"
          strokeDasharray="4 2"
        />
        {/* Green arrow/output */}
        <path d="M105 32 L120 40 L105 48 Z" fill="#22C55E" />
        <line
          x1="120"
          y1="40"
          x2="140"
          y2="40"
          stroke="#22C55E"
          strokeWidth="2"
        />
        <path
          d="M135 35 L142 40 L135 45"
          stroke="#22C55E"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Blue box node */}
        <rect x="62" y="75" width="26" height="22" rx="3" fill="#2563EB" />
        {/* Dark triangle */}
        <polygon points="60,105 75,90 90,105" fill="#1E293B" />
        {/* Arrow from box right */}
        <line
          x1="88"
          y1="86"
          x2="110"
          y2="86"
          stroke="#94A3B8"
          strokeWidth="2"
          strokeDasharray="4 2"
        />
        <path
          d="M107 82 L113 86 L107 90"
          stroke="#F97316"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

function WMSalesPipelineIllustration() {
  return (
    <div className="flex h-[180px] items-center justify-center rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/40 dark:to-cyan-950/40">
      <svg className="h-[130px] w-[130px]" viewBox="0 0 130 130" fill="none">
        {/* Funnel */}
        <path
          d="M20 20 L110 20 L80 70 L80 105 L50 105 L50 70 Z"
          fill="#5EEAD4"
        />
        <path d="M20 20 L110 20 L95 45 L35 45 Z" fill="#2DD4BF" />
        <path d="M35 45 L95 45 L80 70 L50 70 Z" fill="#14B8A6" />
        <path d="M50 70 L80 70 L80 105 L50 105 Z" fill="#0D9488" />
        {/* Rim highlights */}
        <ellipse cx="65" cy="20" rx="45" ry="6" fill="#99F6E4" opacity="0.5" />
        {/* Drip */}
        <circle cx="65" cy="118" r="5" fill="#0D9488" />
      </svg>
    </div>
  )
}

function GoToMarketIllustration() {
  return (
    <div className="flex h-[180px] items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40">
      <svg className="h-[130px] w-[140px]" viewBox="0 0 140 130" fill="none">
        {/* Rocket body */}
        <path
          d="M70 10 Q70 10 85 45 L85 80 L55 80 L55 45 Q70 10 70 10 Z"
          fill="#E2E8F0"
        />
        <path
          d="M70 10 Q70 10 78 35 L78 75 L62 75 L62 35 Q70 10 70 10 Z"
          fill="#F1F5F9"
        />
        {/* Window */}
        <circle cx="70" cy="45" r="8" fill="#3B82F6" />
        <circle cx="70" cy="45" r="5" fill="#60A5FA" />
        {/* Fins */}
        <path d="M55 60 L40 80 L55 80 Z" fill="#EF4444" />
        <path d="M85 60 L100 80 L85 80 Z" fill="#EF4444" />
        {/* Nose cone */}
        <path d="M65 15 L70 8 L75 15" fill="#F97316" />
        {/* Flames */}
        <path d="M58 80 L65 100 L70 88 L75 100 L82 80" fill="#FBBF24" />
        <path d="M62 80 L66 95 L70 85 L74 95 L78 80" fill="#F97316" />
        {/* Side boosters */}
        <rect x="38" y="55" width="12" height="25" rx="4" fill="#93C5FD" />
        <rect x="90" y="55" width="12" height="25" rx="4" fill="#93C5FD" />
        <path d="M40 80 L44 90 L48 80" fill="#FBBF24" />
        <path d="M92 80 L96 90 L100 80" fill="#FBBF24" />
        {/* Stars */}
        <circle cx="25" cy="30" r="2" fill="#FBBF24" />
        <circle cx="115" cy="25" r="1.5" fill="#FBBF24" />
        <circle cx="110" cy="55" r="1" fill="#93C5FD" />
      </svg>
    </div>
  )
}

function UXDesignIllustration() {
  return (
    <div className="flex h-[180px] items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/40 dark:to-sky-950/40">
      <svg className="h-[120px] w-[160px]" viewBox="0 0 160 120" fill="none">
        {/* Browser window */}
        <rect
          x="25"
          y="20"
          width="100"
          height="75"
          rx="5"
          fill="white"
          stroke="#93C5FD"
          strokeWidth="1.5"
        />
        <rect x="25" y="20" width="100" height="14" rx="5" fill="#3B82F6" />
        <circle cx="33" cy="27" r="2.5" fill="#BFDBFE" />
        <circle cx="41" cy="27" r="2.5" fill="#BFDBFE" />
        <circle cx="49" cy="27" r="2.5" fill="#BFDBFE" />
        {/* Layout blocks */}
        <rect x="32" y="40" width="35" height="20" rx="2" fill="#DBEAFE" />
        <rect x="32" y="65" width="35" height="10" rx="2" fill="#E0F2FE" />
        <rect x="72" y="40" width="46" height="30" rx="2" fill="#BFDBFE" />
        {/* Image icon in layout */}
        <circle cx="95" cy="50" r="5" fill="#60A5FA" />
        <polygon points="82,65 95,52 108,65" fill="#93C5FD" />
        {/* Pencil */}
        <rect
          x="115"
          y="45"
          width="5"
          height="35"
          rx="1"
          fill="#FBBF24"
          transform="rotate(-20 117 62)"
        />
        <polygon
          points="110,78 115,84 120,78"
          fill="#1E293B"
          transform="rotate(-20 115 81)"
        />
        {/* Cursor */}
        <path
          d="M130 30 L130 50 L137 44 L145 55"
          stroke="#60A5FA"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Diamond accent */}
        <polygon points="140,70 145,77 140,84 135,77" fill="#60A5FA" />
      </svg>
    </div>
  )
}

function DocumentManagementIllustration() {
  return (
    <div className="flex h-[180px] items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40">
      <svg className="h-[130px] w-[140px]" viewBox="0 0 140 130" fill="none">
        {/* Document */}
        <path
          d="M35 15 L95 15 L105 25 L105 110 L35 110 Z"
          fill="white"
          stroke="#CBD5E1"
          strokeWidth="1.5"
        />
        <path
          d="M95 15 L95 25 L105 25"
          fill="#E2E8F0"
          stroke="#CBD5E1"
          strokeWidth="1"
        />
        {/* Text lines */}
        <rect x="48" y="35" width="45" height="4" rx="2" fill="#93C5FD" />
        <rect x="48" y="45" width="50" height="4" rx="2" fill="#CBD5E1" />
        <rect x="48" y="55" width="38" height="4" rx="2" fill="#CBD5E1" />
        <rect x="48" y="65" width="45" height="4" rx="2" fill="#CBD5E1" />
        <rect x="48" y="75" width="30" height="4" rx="2" fill="#CBD5E1" />
        {/* Big checkmark */}
        <circle cx="85" cy="90" r="16" fill="#3B82F6" />
        <polyline
          points="76,90 82,96 94,84"
          stroke="white"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

function WMCampaignMgmtIllustration() {
  return (
    <div className="flex h-[180px] items-center justify-center rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40">
      <svg className="h-[120px] w-[160px]" viewBox="0 0 160 120" fill="none">
        {/* Paper planes / kites */}
        <path d="M50 30 L90 50 L50 60 L60 50 Z" fill="#34D399" />
        <path d="M50 30 L60 50 L50 60" fill="#10B981" />
        <path d="M95 15 L125 30 L95 38 L102 30 Z" fill="#22C55E" />
        <path d="M95 15 L102 30 L95 38" fill="#16A34A" />
        {/* Confetti dots */}
        <rect
          x="110"
          y="50"
          width="8"
          height="8"
          rx="1"
          fill="#FBBF24"
          transform="rotate(20 114 54)"
        />
        <rect
          x="70"
          y="65"
          width="6"
          height="12"
          rx="1"
          fill="#F472B6"
          transform="rotate(-15 73 71)"
        />
        <rect
          x="120"
          y="70"
          width="10"
          height="6"
          rx="1"
          fill="#60A5FA"
          transform="rotate(10 125 73)"
        />
        <circle cx="40" cy="45" r="3" fill="#FBBF24" />
        <circle cx="130" cy="40" r="4" fill="#A78BFA" />
        {/* Streamers */}
        <path
          d="M85 60 Q100 65 90 80 Q80 95 95 100"
          stroke="#F97316"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M45 70 Q55 75 50 85 Q45 95 55 100"
          stroke="#3B82F6"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

function RecruitmentTrackingIllustration() {
  return (
    <div className="flex h-[180px] items-center justify-center rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/40">
      <svg className="h-[120px] w-[160px]" viewBox="0 0 160 120" fill="none">
        {/* Flower 1 - yellow */}
        <circle cx="40" cy="55" r="8" fill="#FBBF24" />
        <circle cx="40" cy="55" r="4" fill="#F59E0B" />
        <circle cx="40" cy="43" r="5" fill="#FDE68A" />
        <circle cx="48" cy="49" r="5" fill="#FDE68A" />
        <circle cx="48" cy="61" r="5" fill="#FDE68A" />
        <circle cx="40" cy="67" r="5" fill="#FDE68A" />
        <circle cx="32" cy="61" r="5" fill="#FDE68A" />
        <circle cx="32" cy="49" r="5" fill="#FDE68A" />
        <line
          x1="40"
          y1="72"
          x2="40"
          y2="100"
          stroke="#22C55E"
          strokeWidth="3"
        />
        <path
          d="M40 85 Q48 80 52 85"
          stroke="#22C55E"
          strokeWidth="2"
          fill="none"
        />
        {/* Person - center */}
        <circle cx="80" cy="40" r="12" fill="#E5E7EB" />
        <circle cx="80" cy="35" r="8" fill="#D1D5DB" />
        <path d="M65 65 Q80 50 95 65 L95 90 L65 90 Z" fill="#9CA3AF" />
        <line
          x1="80"
          y1="72"
          x2="80"
          y2="100"
          stroke="#22C55E"
          strokeWidth="3"
        />
        {/* Flower 3 - blue */}
        <circle cx="120" cy="55" r="8" fill="#3B82F6" />
        <circle cx="120" cy="55" r="4" fill="#2563EB" />
        <circle cx="120" cy="43" r="5" fill="#93C5FD" />
        <circle cx="128" cy="49" r="5" fill="#93C5FD" />
        <circle cx="128" cy="61" r="5" fill="#93C5FD" />
        <circle cx="120" cy="67" r="5" fill="#93C5FD" />
        <circle cx="112" cy="61" r="5" fill="#93C5FD" />
        <circle cx="112" cy="49" r="5" fill="#93C5FD" />
        <line
          x1="120"
          y1="72"
          x2="120"
          y2="100"
          stroke="#22C55E"
          strokeWidth="3"
        />
        <path
          d="M120 88 Q112 83 108 88"
          stroke="#22C55E"
          strokeWidth="2"
          fill="none"
        />
      </svg>
    </div>
  )
}

function BudgetPlanningIllustration() {
  return (
    <div className="flex h-[180px] items-center justify-center rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/40">
      <svg className="h-[120px] w-[130px]" viewBox="0 0 130 120" fill="none">
        {/* Coin stack */}
        <ellipse cx="65" cy="95" rx="30" ry="8" fill="#D97706" />
        <rect x="35" y="85" width="60" height="10" fill="#F59E0B" />
        <ellipse cx="65" cy="85" rx="30" ry="8" fill="#FBBF24" />
        <rect x="35" y="75" width="60" height="10" fill="#F59E0B" />
        <ellipse cx="65" cy="75" rx="30" ry="8" fill="#FBBF24" />
        <rect x="35" y="65" width="60" height="10" fill="#F59E0B" />
        <ellipse cx="65" cy="65" rx="30" ry="8" fill="#FBBF24" />
        {/* Top coin with $ */}
        <circle cx="75" cy="35" r="25" fill="#FBBF24" />
        <circle cx="75" cy="35" r="20" fill="#F59E0B" />
        <text
          x="75"
          y="43"
          textAnchor="middle"
          fill="white"
          fontSize="22"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          $
        </text>
      </svg>
    </div>
  )
}

function ProcurementMgmtIllustration() {
  return (
    <div className="flex h-[180px] items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40">
      <svg className="h-[120px] w-[140px]" viewBox="0 0 140 120" fill="none">
        {/* Magnifying glass circle */}
        <circle cx="80" cy="55" r="35" fill="#DBEAFE" />
        <circle cx="80" cy="55" r="28" fill="#EFF6FF" />
        {/* Handle */}
        <line
          x1="102"
          y1="77"
          x2="120"
          y2="95"
          stroke="#3B82F6"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Diamond inside */}
        <polygon points="80,30 100,55 80,80 60,55" fill="#60A5FA" />
        <polygon points="80,38 93,55 80,72 67,55" fill="#93C5FD" />
        {/* Sparkle */}
        <path
          d="M45 30 L47 35 L52 33 L47 37 L49 42 L45 38 L41 42 L43 37 L38 33 L43 35 Z"
          fill="#22C55E"
        />
      </svg>
    </div>
  )
}

function WMContentMgmtIllustration() {
  return (
    <div className="flex h-[180px] items-center justify-center rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/40">
      <svg className="h-[120px] w-[140px]" viewBox="0 0 140 120" fill="none">
        {/* Document */}
        <rect
          x="40"
          y="15"
          width="65"
          height="85"
          rx="4"
          fill="white"
          stroke="#CBD5E1"
          strokeWidth="1.5"
        />
        {/* Pie chart on doc */}
        <circle cx="65" cy="50" r="15" fill="#F97316" />
        <path d="M65 50 L65 35 A15 15 0 0 1 78 55 Z" fill="#3B82F6" />
        <path d="M65 50 L78 55 A15 15 0 0 1 55 60 Z" fill="#FBBF24" />
        {/* Text lines */}
        <rect x="48" y="72" width="40" height="3" rx="1.5" fill="#E2E8F0" />
        <rect x="48" y="80" width="30" height="3" rx="1.5" fill="#E2E8F0" />
        <rect x="48" y="88" width="35" height="3" rx="1.5" fill="#E2E8F0" />
        {/* Pencil */}
        <rect
          x="95"
          y="30"
          width="5"
          height="35"
          rx="1"
          fill="#FBBF24"
          transform="rotate(-15 97 47)"
        />
        <polygon
          points="92,67 97,73 102,67"
          fill="#1E293B"
          transform="rotate(-15 97 70)"
        />
        {/* Leaf accent */}
        <path
          d="M30 90 Q40 75 50 85"
          stroke="#22C55E"
          strokeWidth="2"
          fill="#BBF7D0"
        />
      </svg>
    </div>
  )
}

function PersonalTaskPlannerIllustration() {
  return (
    <div className="flex h-[180px] items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/40 dark:to-amber-950/40">
      <svg className="h-[130px] w-[130px]" viewBox="0 0 130 130" fill="none">
        {/* Notepad */}
        <rect x="25" y="20" width="80" height="95" rx="3" fill="#FDE68A" />
        <rect
          x="25"
          y="20"
          width="80"
          height="95"
          rx="3"
          fill="#FEF3C7"
          stroke="#FBBF24"
          strokeWidth="1"
        />
        {/* Spiral binding */}
        {[30, 42, 54, 66, 78, 90, 102].map((y) => (
          <circle key={y} cx="25" cy={y} r="3" fill="#F59E0B" />
        ))}
        {/* Lines */}
        <line
          x1="35"
          y1="38"
          x2="95"
          y2="38"
          stroke="#FBBF24"
          strokeWidth="0.5"
        />
        <line
          x1="35"
          y1="50"
          x2="95"
          y2="50"
          stroke="#FBBF24"
          strokeWidth="0.5"
        />
        <line
          x1="35"
          y1="62"
          x2="95"
          y2="62"
          stroke="#FBBF24"
          strokeWidth="0.5"
        />
        <line
          x1="35"
          y1="74"
          x2="95"
          y2="74"
          stroke="#FBBF24"
          strokeWidth="0.5"
        />
        <line
          x1="35"
          y1="86"
          x2="95"
          y2="86"
          stroke="#FBBF24"
          strokeWidth="0.5"
        />
        <line
          x1="35"
          y1="98"
          x2="95"
          y2="98"
          stroke="#FBBF24"
          strokeWidth="0.5"
        />
        {/* Written text simulation */}
        <rect
          x="38"
          y="32"
          width="35"
          height="3"
          rx="1"
          fill="#92400E"
          opacity="0.3"
        />
        <rect
          x="38"
          y="44"
          width="45"
          height="3"
          rx="1"
          fill="#92400E"
          opacity="0.3"
        />
        <rect
          x="38"
          y="56"
          width="30"
          height="3"
          rx="1"
          fill="#92400E"
          opacity="0.3"
        />
        <rect
          x="38"
          y="68"
          width="40"
          height="3"
          rx="1"
          fill="#92400E"
          opacity="0.3"
        />
      </svg>
    </div>
  )
}

function FinancialCloseIllustration() {
  return (
    <div className="flex h-[180px] items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/40 dark:to-sky-950/40">
      <svg className="h-[120px] w-[150px]" viewBox="0 0 150 120" fill="none">
        {/* Calendar */}
        <rect
          x="30"
          y="20"
          width="70"
          height="70"
          rx="5"
          fill="white"
          stroke="#CBD5E1"
          strokeWidth="1.5"
        />
        <rect x="30" y="20" width="70" height="18" rx="5" fill="#3B82F6" />
        {/* Calendar dots */}
        <circle cx="48" cy="29" r="2" fill="#BFDBFE" />
        <circle cx="65" cy="29" r="2" fill="#BFDBFE" />
        <circle cx="82" cy="29" r="2" fill="#BFDBFE" />
        {/* Calendar grid */}
        {[48, 58, 68, 78].map((y) =>
          [42, 55, 68, 81].map((x) => (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width="8"
              height="6"
              rx="1"
              fill="#EFF6FF"
            />
          ))
        )}
        {/* Trend line chart */}
        <polyline
          points="105,80 115,65 125,70 135,45 145,35"
          stroke="#3B82F6"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Arrow up */}
        <path
          d="M142 30 L145 25 L148 30"
          stroke="#3B82F6"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

function PolicyManagementIllustration() {
  return (
    <div className="flex h-[180px] items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40">
      <svg className="h-[130px] w-[120px]" viewBox="0 0 120 130" fill="none">
        {/* Book */}
        <rect x="25" y="15" width="70" height="95" rx="4" fill="#6EE7B7" />
        <rect x="30" y="15" width="65" height="95" rx="3" fill="#A7F3D0" />
        {/* Spine */}
        <rect x="25" y="15" width="8" height="95" rx="2" fill="#34D399" />
        {/* Cover lines */}
        <rect
          x="40"
          y="35"
          width="45"
          height="5"
          rx="2"
          fill="white"
          opacity="0.7"
        />
        <rect
          x="40"
          y="48"
          width="35"
          height="4"
          rx="2"
          fill="white"
          opacity="0.5"
        />
        <rect
          x="40"
          y="58"
          width="40"
          height="4"
          rx="2"
          fill="white"
          opacity="0.5"
        />
        {/* Bookmark */}
        <path d="M80 15 L80 35 L85 30 L90 35 L90 15" fill="#2563EB" />
        {/* Bottom accent */}
        <rect
          x="40"
          y="85"
          width="20"
          height="12"
          rx="2"
          fill="white"
          opacity="0.4"
        />
      </svg>
    </div>
  )
}

function MarketingAssetCreationIllustration() {
  return (
    <div className="flex h-[180px] items-center justify-center rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/40">
      <svg className="h-[120px] w-[140px]" viewBox="0 0 140 120" fill="none">
        {/* Frame */}
        <rect x="25" y="15" width="90" height="80" rx="3" fill="#FBBF24" />
        <rect x="30" y="20" width="80" height="70" rx="2" fill="#FDE68A" />
        <rect x="35" y="25" width="70" height="60" rx="1" fill="white" />
        {/* Picture inside frame */}
        {/* Mountains */}
        <polygon points="45,75 65,45 85,75" fill="#93C5FD" />
        <polygon points="60,75 80,50 100,75" fill="#60A5FA" />
        {/* Sun */}
        <circle cx="55" cy="40" r="8" fill="#FBBF24" />
        {/* Frame decorative corners */}
        <circle cx="30" cy="20" r="3" fill="#F59E0B" />
        <circle cx="110" cy="20" r="3" fill="#F59E0B" />
        <circle cx="30" cy="90" r="3" fill="#F59E0B" />
        <circle cx="110" cy="90" r="3" fill="#F59E0B" />
        {/* Hanging wire */}
        <path
          d="M55 10 L70 5 L85 10"
          stroke="#94A3B8"
          strokeWidth="1.5"
          fill="none"
        />
        <circle cx="70" cy="5" r="2" fill="#64748B" />
      </svg>
    </div>
  )
}

function WMEventPlanningIllustration() {
  return (
    <div className="flex h-[180px] items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40">
      <svg className="h-[120px] w-[150px]" viewBox="0 0 150 120" fill="none">
        {/* Calendar circles */}
        <circle
          cx="55"
          cy="45"
          r="25"
          fill="#DBEAFE"
          stroke="#93C5FD"
          strokeWidth="2"
        />
        <circle
          cx="95"
          cy="45"
          r="25"
          fill="#DBEAFE"
          stroke="#93C5FD"
          strokeWidth="2"
        />
        <circle
          cx="75"
          cy="75"
          r="25"
          fill="#DBEAFE"
          stroke="#93C5FD"
          strokeWidth="2"
        />
        {/* Calendar icon */}
        <rect x="45" y="35" width="20" height="18" rx="2" fill="#3B82F6" />
        <rect x="45" y="35" width="20" height="6" rx="2" fill="#2563EB" />
        <circle cx="51" cy="47" r="1.5" fill="white" />
        <circle cx="59" cy="47" r="1.5" fill="white" />
        {/* Clock icon */}
        <circle
          cx="95"
          cy="45"
          r="12"
          fill="white"
          stroke="#F97316"
          strokeWidth="2"
        />
        <line
          x1="95"
          y1="38"
          x2="95"
          y2="45"
          stroke="#F97316"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="95"
          y1="45"
          x2="101"
          y2="48"
          stroke="#F97316"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* People icon */}
        <circle cx="75" cy="70" r="5" fill="#8B5CF6" />
        <path d="M67 82 Q75 75 83 82" fill="#A78BFA" />
      </svg>
    </div>
  )
}

function RFPProcessIllustration() {
  return (
    <div className="flex h-[180px] items-center justify-center rounded-2xl bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-950/40 dark:to-slate-950/40">
      <svg className="h-[120px] w-[140px]" viewBox="0 0 140 120" fill="none">
        {/* Shopping cart */}
        <path
          d="M30 30 L45 30 L60 75 L100 75"
          stroke="#64748B"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M45 30 L50 65 L95 65 L100 40 L50 40"
          fill="#E2E8F0"
          stroke="#94A3B8"
          strokeWidth="1.5"
        />
        {/* Cart wheels */}
        <circle cx="65" cy="82" r="5" fill="#94A3B8" />
        <circle cx="90" cy="82" r="5" fill="#94A3B8" />
        {/* Items in cart */}
        <rect x="55" y="45" width="12" height="18" rx="2" fill="#3B82F6" />
        <rect x="72" y="48" width="10" height="15" rx="2" fill="#F97316" />
        {/* Checkmark */}
        <circle cx="105" cy="35" r="14" fill="#22C55E" />
        <polyline
          points="97,35 103,41 113,31"
          stroke="white"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

function EmailMarketingIllustration() {
  return (
    <div className="flex h-[180px] items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-950/40 dark:to-sky-950/40">
      <svg className="h-[120px] w-[140px]" viewBox="0 0 140 120" fill="none">
        {/* Envelope */}
        <rect x="25" y="30" width="90" height="60" rx="5" fill="#22D3EE" />
        <path
          d="M25 35 L70 65 L115 35"
          stroke="white"
          strokeWidth="2"
          fill="none"
        />
        {/* Flap */}
        <path d="M25 30 L70 55 L115 30" fill="#06B6D4" />
        {/* Letter coming out */}
        <rect
          x="40"
          y="15"
          width="60"
          height="35"
          rx="3"
          fill="white"
          stroke="#E2E8F0"
          strokeWidth="1"
        />
        <rect x="48" y="22" width="30" height="3" rx="1.5" fill="#CBD5E1" />
        <rect x="48" y="29" width="40" height="3" rx="1.5" fill="#CBD5E1" />
        <rect x="48" y="36" width="25" height="3" rx="1.5" fill="#CBD5E1" />
        {/* Send arrow */}
        <circle cx="115" cy="75" r="10" fill="#0891B2" />
        <path
          d="M110 75 L118 75 M115 71 L119 75 L115 79"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Sparkles */}
        <circle cx="20" cy="55" r="2" fill="#FBBF24" />
        <circle cx="125" cy="45" r="1.5" fill="#FBBF24" />
      </svg>
    </div>
  )
}

function SalesLeadTrackingIllustration() {
  return (
    <div className="flex h-[180px] items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40">
      <svg className="h-[120px] w-[150px]" viewBox="0 0 150 120" fill="none">
        {/* Magnifying glass */}
        <circle
          cx="75"
          cy="55"
          r="30"
          fill="#DBEAFE"
          stroke="#3B82F6"
          strokeWidth="3"
        />
        <line
          x1="97"
          y1="77"
          x2="120"
          y2="100"
          stroke="#1E40AF"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* @ symbols and circles inside */}
        <text
          x="60"
          y="50"
          fill="#3B82F6"
          fontSize="14"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          @
        </text>
        <text
          x="78"
          y="65"
          fill="#60A5FA"
          fontSize="10"
          fontFamily="sans-serif"
        >
          @
        </text>
        <circle cx="65" cy="62" r="4" fill="#F97316" />
        <circle cx="85" cy="45" r="3" fill="#22C55E" />
        <circle cx="75" cy="70" r="3" fill="#8B5CF6" />
        {/* Orbiting dots */}
        <circle cx="45" cy="35" r="4" fill="#93C5FD" />
        <circle cx="105" cy="38" r="3" fill="#93C5FD" />
        <circle cx="50" cy="75" r="3" fill="#BFDBFE" />
        {/* Connection lines */}
        <line
          x1="48"
          y1="37"
          x2="60"
          y2="45"
          stroke="#BFDBFE"
          strokeWidth="1"
          strokeDasharray="3 2"
        />
        <line
          x1="103"
          y1="40"
          x2="88"
          y2="47"
          stroke="#BFDBFE"
          strokeWidth="1"
          strokeDasharray="3 2"
        />
      </svg>
    </div>
  )
}

function IPInfringementIllustration() {
  return (
    <div className="flex h-[180px] items-center justify-center rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/40 dark:to-rose-950/40">
      <svg className="h-[120px] w-[130px]" viewBox="0 0 130 120" fill="none">
        {/* Document */}
        <rect
          x="35"
          y="25"
          width="60"
          height="75"
          rx="4"
          fill="white"
          stroke="#CBD5E1"
          strokeWidth="1.5"
        />
        <rect x="45" y="40" width="40" height="3" rx="1.5" fill="#CBD5E1" />
        <rect x="45" y="50" width="35" height="3" rx="1.5" fill="#CBD5E1" />
        <rect x="45" y="60" width="38" height="3" rx="1.5" fill="#CBD5E1" />
        <rect x="45" y="70" width="30" height="3" rx="1.5" fill="#CBD5E1" />
        {/* Red NO circle */}
        <circle
          cx="65"
          cy="55"
          r="32"
          fill="none"
          stroke="#EF4444"
          strokeWidth="5"
        />
        <line
          x1="42"
          y1="32"
          x2="88"
          y2="78"
          stroke="#EF4444"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

function EmployeeReviewIllustration() {
  return (
    <div className="flex h-[180px] items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/40 dark:to-sky-950/40">
      <svg className="h-[120px] w-[150px]" viewBox="0 0 150 120" fill="none">
        {/* Speedometer background */}
        <path d="M30 85 A45 45 0 0 1 120 85" fill="#E2E8F0" />
        <path d="M30 85 A45 45 0 0 1 75 40" fill="#EF4444" />
        <path d="M75 40 A45 45 0 0 1 105 52" fill="#FBBF24" />
        <path d="M105 52 A45 45 0 0 1 120 85" fill="#22C55E" />
        {/* Inner circle */}
        <circle cx="75" cy="85" r="30" fill="white" />
        {/* Needle */}
        <line
          x1="75"
          y1="85"
          x2="95"
          y2="55"
          stroke="#1E293B"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="75" cy="85" r="6" fill="#1E293B" />
        <circle cx="75" cy="85" r="3" fill="white" />
        {/* Tick marks */}
        <line
          x1="38"
          y1="82"
          x2="45"
          y2="82"
          stroke="#94A3B8"
          strokeWidth="1.5"
        />
        <line
          x1="75"
          y1="42"
          x2="75"
          y2="49"
          stroke="#94A3B8"
          strokeWidth="1.5"
        />
        <line
          x1="112"
          y1="82"
          x2="105"
          y2="82"
          stroke="#94A3B8"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  )
}

function GrantApplicationIllustration() {
  return (
    <div className="flex h-[180px] items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/40 dark:to-sky-950/40">
      <svg className="h-[120px] w-[140px]" viewBox="0 0 140 120" fill="none">
        {/* Form/document */}
        <rect
          x="30"
          y="15"
          width="70"
          height="90"
          rx="4"
          fill="white"
          stroke="#CBD5E1"
          strokeWidth="1.5"
        />
        {/* $ header */}
        <rect x="40" y="25" width="50" height="20" rx="3" fill="#DBEAFE" />
        <text
          x="65"
          y="40"
          textAnchor="middle"
          fill="#2563EB"
          fontSize="16"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          $
        </text>
        {/* Form lines */}
        <rect x="40" y="52" width="45" height="4" rx="2" fill="#E2E8F0" />
        <rect x="40" y="62" width="38" height="4" rx="2" fill="#E2E8F0" />
        <rect x="40" y="72" width="42" height="4" rx="2" fill="#E2E8F0" />
        <rect x="40" y="82" width="30" height="4" rx="2" fill="#E2E8F0" />
        {/* Pen */}
        <rect
          x="100"
          y="35"
          width="5"
          height="40"
          rx="1"
          fill="#3B82F6"
          transform="rotate(-20 102 55)"
        />
        <polygon
          points="96,76 102,82 108,76"
          fill="#1E293B"
          transform="rotate(-20 102 79)"
        />
        <rect
          x="100"
          y="33"
          width="5"
          height="8"
          rx="1"
          fill="#60A5FA"
          transform="rotate(-20 102 37)"
        />
      </svg>
    </div>
  )
}

function NonprofitMgmtIllustration() {
  return (
    <div className="flex h-[180px] items-center justify-center rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40">
      <svg className="h-[120px] w-[140px]" viewBox="0 0 140 120" fill="none">
        {/* Globe */}
        <circle cx="70" cy="60" r="35" fill="#BBF7D0" />
        <circle
          cx="70"
          cy="60"
          r="35"
          fill="none"
          stroke="#22C55E"
          strokeWidth="2"
        />
        {/* Continents rough shapes */}
        <ellipse cx="60" cy="50" rx="12" ry="15" fill="#22C55E" opacity="0.5" />
        <ellipse cx="82" cy="55" rx="10" ry="12" fill="#22C55E" opacity="0.5" />
        <ellipse cx="70" cy="75" rx="8" ry="6" fill="#22C55E" opacity="0.5" />
        {/* Ring around */}
        <ellipse
          cx="70"
          cy="60"
          rx="42"
          ry="12"
          fill="none"
          stroke="#A78BFA"
          strokeWidth="2"
          transform="rotate(-20 70 60)"
        />
        {/* Star */}
        <polygon
          points="70,15 73,24 82,24 75,30 78,39 70,33 62,39 65,30 58,24 67,24"
          fill="#FBBF24"
        />
        {/* Hearts */}
        <path
          d="M108 80 Q108 75 112 75 Q116 75 116 80 Q116 85 108 92 Q100 85 100 80 Q100 75 104 75 Q108 75 108 80"
          fill="#EC4899"
          transform="scale(0.6) translate(150 120)"
        />
        <circle cx="40" cy="90" r="5" fill="#22C55E" />
        <path d="M38 88 L40 90 L42 88" stroke="white" strokeWidth="1" />
      </svg>
    </div>
  )
}

function CommunityMgmtIllustration() {
  return (
    <div className="flex h-[180px] items-center justify-center rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/40">
      <svg className="h-[120px] w-[140px]" viewBox="0 0 140 120" fill="none">
        {/* Chat bubble 1 */}
        <rect x="25" y="20" width="55" height="40" rx="8" fill="#FED7AA" />
        <polygon points="45,60 50,70 55,60" fill="#FED7AA" />
        {/* Heart emoji inside */}
        <path
          d="M50 35 Q50 30 54 30 Q58 30 58 35 Q58 40 50 47 Q42 40 42 35 Q42 30 46 30 Q50 30 50 35"
          fill="#EF4444"
        />
        {/* Chat bubble 2 */}
        <rect x="60" y="50" width="55" height="40" rx="8" fill="#A5F3FC" />
        <polygon points="80,90 85,100 90,90" fill="#A5F3FC" />
        {/* Emoji face inside */}
        <circle cx="80" cy="68" r="4" fill="#FBBF24" />
        <circle cx="93" cy="68" r="4" fill="#FBBF24" />
        <path
          d="M78 76 Q86 82 96 76"
          stroke="#F97316"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        {/* Small speech indicators */}
        <circle cx="110" cy="35" r="4" fill="#C4B5FD" />
        <circle cx="118" cy="30" r="2.5" fill="#DDD6FE" />
        <circle cx="30" cy="75" r="3" fill="#FDE68A" />
      </svg>
    </div>
  )
}

function SpaceApprovalsIllustration() {
  return (
    <div className="flex h-[180px] items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-950/40 dark:to-slate-950/40">
      <svg className="h-[120px] w-[150px]" viewBox="0 0 150 120" fill="none">
        {/* Bars/rows */}
        <rect x="30" y="30" width="70" height="8" rx="2" fill="#CBD5E1" />
        <rect x="30" y="45" width="55" height="8" rx="2" fill="#CBD5E1" />
        <rect x="30" y="60" width="65" height="8" rx="2" fill="#CBD5E1" />
        <rect x="30" y="75" width="50" height="8" rx="2" fill="#CBD5E1" />
        <rect x="30" y="90" width="60" height="8" rx="2" fill="#CBD5E1" />
        {/* Blue + circle */}
        <circle cx="115" cy="55" r="22" fill="#2563EB" />
        <line
          x1="115"
          y1="44"
          x2="115"
          y2="66"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <line
          x1="104"
          y1="55"
          x2="126"
          y2="55"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

function BudgetApprovalIllustration() {
  return (
    <div className="flex h-[180px] items-center justify-center rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/40">
      <svg className="h-[120px] w-[130px]" viewBox="0 0 130 120" fill="none">
        {/* Coin stack */}
        <ellipse cx="55" cy="100" rx="25" ry="6" fill="#D97706" />
        <rect x="30" y="92" width="50" height="8" fill="#F59E0B" />
        <ellipse cx="55" cy="92" rx="25" ry="6" fill="#FBBF24" />
        <rect x="30" y="84" width="50" height="8" fill="#F59E0B" />
        <ellipse cx="55" cy="84" rx="25" ry="6" fill="#FBBF24" />
        <rect x="30" y="76" width="50" height="8" fill="#F59E0B" />
        <ellipse cx="55" cy="76" rx="25" ry="6" fill="#FBBF24" />
        {/* Top coin with $ */}
        <circle cx="55" cy="40" r="22" fill="#FBBF24" />
        <circle cx="55" cy="40" r="17" fill="#F59E0B" />
        <text
          x="55"
          y="47"
          textAnchor="middle"
          fill="white"
          fontSize="20"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          $
        </text>
        {/* Small floating coins */}
        <circle cx="95" cy="55" r="10" fill="#FBBF24" />
        <circle cx="95" cy="55" r="7" fill="#F59E0B" />
        <text
          x="95"
          y="59"
          textAnchor="middle"
          fill="white"
          fontSize="10"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          $
        </text>
        <circle cx="105" cy="35" r="6" fill="#FDE68A" />
      </svg>
    </div>
  )
}

function DocApprovalsIllustration() {
  return (
    <div className="flex h-[180px] items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40">
      <svg className="h-[120px] w-[150px]" viewBox="0 0 150 120" fill="none">
        {/* Back document */}
        <rect x="45" y="15" width="60" height="75" rx="4" fill="#BFDBFE" />
        {/* Front document */}
        <rect
          x="30"
          y="25"
          width="60"
          height="75"
          rx="4"
          fill="white"
          stroke="#93C5FD"
          strokeWidth="1.5"
        />
        {/* Text lines */}
        <rect x="40" y="38" width="40" height="3" rx="1.5" fill="#CBD5E1" />
        <rect x="40" y="47" width="35" height="3" rx="1.5" fill="#CBD5E1" />
        <rect x="40" y="56" width="42" height="3" rx="1.5" fill="#CBD5E1" />
        <rect x="40" y="65" width="30" height="3" rx="1.5" fill="#CBD5E1" />
        {/* Chart bars */}
        <rect x="40" y="74" width="8" height="16" rx="1" fill="#93C5FD" />
        <rect x="52" y="78" width="8" height="12" rx="1" fill="#60A5FA" />
        <rect x="64" y="72" width="8" height="18" rx="1" fill="#3B82F6" />
        {/* Big blue checkmark */}
        <circle cx="105" cy="65" r="22" fill="#3B82F6" />
        <polyline
          points="93,65 101,73 117,57"
          stroke="white"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

function CampaignApprovalsIllustration() {
  return (
    <div className="flex h-[180px] items-center justify-center rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40">
      <svg className="h-[120px] w-[160px]" viewBox="0 0 160 120" fill="none">
        {/* Flag poles */}
        <line
          x1="55"
          y1="25"
          x2="55"
          y2="100"
          stroke="#94A3B8"
          strokeWidth="2.5"
        />
        <line
          x1="85"
          y1="20"
          x2="85"
          y2="100"
          stroke="#94A3B8"
          strokeWidth="2.5"
        />
        <line
          x1="115"
          y1="30"
          x2="115"
          y2="100"
          stroke="#94A3B8"
          strokeWidth="2.5"
        />
        {/* Flags */}
        <path d="M55 25 L80 32 L55 42" fill="#10B981" />
        <path d="M85 20 L110 27 L85 37" fill="#3B82F6" />
        <path d="M115 30 L140 37 L115 47" fill="#F97316" />
        {/* Connecting streamers */}
        <path
          d="M58 35 Q72 25 82 30"
          stroke="#FBBF24"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M88 28 Q102 22 112 32"
          stroke="#A78BFA"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        {/* Confetti */}
        <rect
          x="40"
          y="55"
          width="6"
          height="6"
          rx="1"
          fill="#FBBF24"
          transform="rotate(15 43 58)"
        />
        <rect
          x="95"
          y="50"
          width="5"
          height="5"
          rx="1"
          fill="#EC4899"
          transform="rotate(-10 97 52)"
        />
        <circle cx="70" cy="60" r="3" fill="#60A5FA" />
        <circle cx="130" cy="55" r="2.5" fill="#34D399" />
        <rect
          x="120"
          y="65"
          width="4"
          height="8"
          rx="1"
          fill="#F97316"
          transform="rotate(20 122 69)"
        />
        {/* Star */}
        <polygon
          points="105,65 107,70 112,70 108,73 110,78 105,75 100,78 102,73 98,70 103,70"
          fill="#FBBF24"
        />
      </svg>
    </div>
  )
}

/* ── Product Management Illustrations (detailed app-screenshot style) ── */

function PMProductDiscoveryIllustration() {
  return (
    <div className="flex h-[220px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-purple-400 via-fuchsia-400 to-pink-400 p-3">
      <div className="relative h-full w-full overflow-hidden rounded-lg bg-white p-3 shadow-lg dark:bg-gray-800">
        {/* Header */}
        <div className="mb-2 text-[11px] font-bold text-purple-700 dark:text-purple-300">
          Ideas
        </div>
        {/* Idea rows */}
        <div className="space-y-2">
          {[
            {
              bars: [
                "bg-blue-500 w-[35%]",
                "bg-green-500 w-[20%]",
                "bg-pink-500 w-[12%]",
              ],
              dots: [
                "bg-blue-300",
                "bg-green-300",
                "bg-yellow-300",
                "bg-blue-300",
                "bg-green-300",
              ],
              score: "95",
            },
            {
              bars: ["bg-green-500 w-[30%]", "bg-orange-500 w-[18%]"],
              dots: [
                "bg-orange-300",
                "bg-blue-300",
                "bg-green-300",
                "bg-pink-300",
              ],
              score: "82",
            },
            {
              bars: ["bg-purple-400 w-[25%]", "bg-pink-400 w-[15%]"],
              dots: [
                "bg-green-300",
                "bg-blue-300",
                "bg-orange-300",
                "bg-purple-300",
                "bg-pink-300",
              ],
              score: "79",
            },
          ].map((row, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="flex shrink-0 gap-0.5">
                {row.bars.map((b, j) => (
                  <div key={j} className={`h-3.5 rounded-sm ${b}`} />
                ))}
              </div>
              <div className="ml-1 flex shrink-0 gap-0.5">
                <svg
                  className="size-3 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="ml-auto flex shrink-0 gap-[2px]">
                {row.dots.map((d, j) => (
                  <div key={j} className={`size-[5px] rounded-full ${d}`} />
                ))}
              </div>
              <span className="ml-1 shrink-0 text-[8px] font-medium text-gray-500">
                {row.score}
              </span>
            </div>
          ))}
        </div>
        {/* Bottom row with curved arrow */}
        <div className="mt-2.5 flex items-center gap-1.5">
          <div className="flex gap-0.5">
            <div className="h-3.5 w-[20%] rounded-sm bg-violet-400" />
            <div className="h-3.5 w-[15%] rounded-sm bg-teal-400" />
          </div>
          <svg
            className="size-3 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <div className="ml-auto flex gap-[2px]">
            {[
              "bg-green-300",
              "bg-blue-300",
              "bg-orange-300",
              "bg-purple-300",
            ].map((d, j) => (
              <div key={j} className={`size-[5px] rounded-full ${d}`} />
            ))}
          </div>
          <span className="ml-1 text-[8px] font-medium text-gray-500">86</span>
        </div>
        {/* Decorative curved arrow */}
        <svg
          className="absolute right-6 bottom-2 h-10 w-10 text-gray-400"
          viewBox="0 0 40 40"
          fill="none"
        >
          <path
            d="M5 30 Q15 5 35 15"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M30 10 L36 15 L30 20"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
    </div>
  )
}

function PMProductRoadmapIllustration() {
  return (
    <div className="flex h-[220px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-amber-300 via-orange-300 to-yellow-300 p-3">
      <div className="relative h-full w-full overflow-hidden rounded-lg bg-white p-3 shadow-lg dark:bg-gray-800">
        {/* Header */}
        <div className="mb-2 text-[11px] font-bold text-orange-700 dark:text-orange-300">
          Roadmap
        </div>
        {/* Timeline header marks */}
        <div className="mb-1.5 ml-8 flex gap-4">
          <div className="h-0.5 w-10 rounded-full bg-gray-200 dark:bg-gray-600" />
          <div className="h-0.5 w-10 rounded-full bg-gray-200 dark:bg-gray-600" />
          <div className="h-0.5 w-10 rounded-full bg-gray-200 dark:bg-gray-600" />
        </div>
        {/* Gantt rows */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5">
            <div className="h-1 w-5 shrink-0 rounded-full bg-gray-300 dark:bg-gray-600" />
            <div className="h-5 w-[45%] rounded bg-blue-500" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-1 w-5 shrink-0 rounded-full bg-gray-300 dark:bg-gray-600" />
            <div className="ml-[5%] h-5 w-[30%] rounded bg-teal-500" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-1 w-5 shrink-0 rounded-full bg-gray-300 dark:bg-gray-600" />
            <div className="ml-[15%] h-5 w-[35%] rounded bg-green-500" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-1 w-5 shrink-0 rounded-full bg-gray-300 dark:bg-gray-600" />
            <div className="ml-[25%] h-5 w-[40%] rounded bg-orange-400" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-1 w-5 shrink-0 rounded-full bg-gray-300 dark:bg-gray-600" />
            <div className="ml-[10%] h-5 w-[25%] rounded bg-purple-400" />
          </div>
        </div>
        {/* Progress bar at bottom */}
        <div className="mt-3 flex items-center gap-1.5">
          <div className="h-3 w-[40%] rounded bg-teal-400" />
          <div className="h-3 w-[20%] rounded bg-teal-300/50" />
          <span className="ml-auto text-[7px] text-gray-400">95</span>
        </div>
        {/* Decorative circle */}
        <svg
          className="absolute right-2 bottom-1 h-12 w-12 text-orange-200/40"
          viewBox="0 0 50 50"
          fill="none"
        >
          <circle
            cx="25"
            cy="25"
            r="20"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="10 5"
          />
        </svg>
      </div>
    </div>
  )
}

function PMPrioritizationIllustration() {
  return (
    <div className="flex h-[220px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-gray-700 via-slate-700 to-gray-800 p-3">
      <div className="relative h-full w-full overflow-hidden rounded-lg bg-white p-3 shadow-lg dark:bg-gray-800">
        {/* Header */}
        <div className="mb-2 text-[11px] font-bold text-gray-700 dark:text-gray-300">
          Prioritization
        </div>
        {/* Scoring rows */}
        <div className="space-y-2">
          {[
            {
              dots: [
                "bg-red-400",
                "bg-blue-400",
                "bg-green-400",
                "bg-yellow-400",
                "bg-pink-400",
              ],
              score: "129",
              color: "text-red-500",
            },
            {
              dots: [
                "bg-green-400",
                "bg-orange-400",
                "bg-blue-400",
                "bg-purple-400",
                "bg-red-400",
                "bg-yellow-400",
              ],
              score: "105",
              color: "text-orange-500",
            },
            {
              dots: [
                "bg-blue-400",
                "bg-green-400",
                "bg-pink-400",
                "bg-yellow-400",
              ],
              score: "86",
              color: "text-blue-500",
            },
            {
              dots: [
                "bg-orange-400",
                "bg-blue-400",
                "bg-green-400",
                "bg-red-400",
                "bg-purple-400",
              ],
              score: "72",
              color: "text-green-600",
            },
            {
              dots: [
                "bg-red-400",
                "bg-orange-400",
                "bg-blue-400",
                "bg-green-400",
                "bg-pink-400",
              ],
              score: "24",
              color: "text-gray-500",
            },
          ].map((row, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="flex shrink-0 gap-0.5">
                <div className="h-3 w-4 rounded-sm bg-gray-200 dark:bg-gray-600" />
                <div className="h-3 w-6 rounded-sm bg-gray-200 dark:bg-gray-600" />
              </div>
              <div className="flex flex-1 justify-center gap-[3px]">
                {row.dots.map((d, j) => (
                  <div key={j} className={`size-[6px] rounded-full ${d}`} />
                ))}
              </div>
              <span
                className={`text-[8px] font-bold ${row.color} min-w-[20px] shrink-0 text-right`}
              >
                {row.score}
              </span>
            </div>
          ))}
        </div>
        {/* Cursor decoration */}
        <svg
          className="absolute top-1/2 left-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-gray-600 opacity-30"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M5 3l3.057 11.293L12 11l3.943 3.293L19 3 5 3z" />
          <path d="M12 11l-1.5 5.5L14 22l1.5-5.5L12 11z" />
        </svg>
      </div>
    </div>
  )
}

const templateIllustrations: Record<string, () => React.JSX.Element> = {
  // Software development
  Kanban: KanbanIllustration,
  Scrum: ScrumIllustration,
  "Top-level planning": TopLevelPlanningIllustration,
  "Cross-team planning": CrossTeamPlanningIllustration,
  "Product roadmap": ProductRoadmapIllustration,
  Prioritization: PrioritizationIllustration,
  "Bug tracking": BugTrackingIllustration,
  // Service management
  "General service management": GeneralServiceMgmtIllustration,
  "Blank space": WMBlankSpaceIllustration,
  "IT service management": ITServiceMgmtIllustration,
  "IT Operations": ITOperationsIllustration,
  "Customer service management": CustomerServiceMgmtIllustration,
  "Development requests": DevRequestsIllustration,
  "HR service management": HRServiceMgmtIllustration,
  "Finance service management": FinanceServiceMgmtIllustration,
  "Facilities service management": FacilitiesServiceMgmtIllustration,
  "Marketing service management": MarketingServiceMgmtIllustration,
  "Analytics service management": AnalyticsServiceMgmtIllustration,
  "Legal service management": LegalServiceMgmtIllustration,
  "Sales service management": SalesServiceMgmtIllustration,
  "Design service management": DesignServiceMgmtIllustration,
  "IT service management (Essentials)": ITSMEssentialsIllustration,
  // Work management
  "Project management": ProjectManagementIllustration,
  "Task tracking": TaskTrackingIllustration,
  "Process control": ProcessControlIllustration,
  "Sales pipeline": WMSalesPipelineIllustration,
  "Go-to-Market": GoToMarketIllustration,
  "UX design": UXDesignIllustration,
  "Document management": DocumentManagementIllustration,
  "Campaign management": WMCampaignMgmtIllustration,
  "Recruitment tracking": RecruitmentTrackingIllustration,
  "Budget planning": BudgetPlanningIllustration,
  "Procurement management": ProcurementMgmtIllustration,
  "Content management": WMContentMgmtIllustration,
  "Personal task planner": PersonalTaskPlannerIllustration,
  "Financial close": FinancialCloseIllustration,
  "Policy management": PolicyManagementIllustration,
  "Marketing asset creation": MarketingAssetCreationIllustration,
  "Event planning": WMEventPlanningIllustration,
  "RFP process": RFPProcessIllustration,
  "Email marketing campaign": EmailMarketingIllustration,
  "Sales lead tracking": SalesLeadTrackingIllustration,
  "IP infringement": IPInfringementIllustration,
  "Employee review": EmployeeReviewIllustration,
  "Grant application tracker": GrantApplicationIllustration,
  "Nonprofit management": NonprofitMgmtIllustration,
  "Community management": CommunityMgmtIllustration,
  "Space approvals": SpaceApprovalsIllustration,
  "Budget approval management": BudgetApprovalIllustration,
  "Manage approvals for documents": DocApprovalsIllustration,
  "Manage approvals for your campaign": CampaignApprovalsIllustration,
  // IT (category-specific overrides)
  "IT:General service management": GeneralServiceMgmtIllustration,
  "IT:IT service management (Essentials)": ITSMEssentialsIllustration,
  // Nonprofit (category-specific overrides)
  "Nonprofit:General service management": GeneralServiceMgmtIllustration,
  "Nonprofit:Community management": CommunityMgmtIllustration,
  // Product management (category-specific overrides)
  "Product management:Product discovery": PMProductDiscoveryIllustration,
  "Product management:Product roadmap": PMProductRoadmapIllustration,
  "Product management:Prioritization": PMPrioritizationIllustration,
}

export default function TemplatesFullPage() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState("Made for you")
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateDetail | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [newSpaceName, setNewSpaceName] = useState("")
  const [newSpaceKey, setNewSpaceKey] = useState("")
  const [teamSize, setTeamSize] = useState("")
  const [customUse, setCustomUse] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [importSource, setImportSource] = useState("")
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importSpaceName, setImportSpaceName] = useState("")
  const [importSpaceKey, setImportSpaceKey] = useState("")
  const [importStep, setImportStep] = useState(1)
  const [importStarted, setImportStarted] = useState(false)
  const [activeProduct, setActiveProduct] = useState<string | null>(null)

  const filtered = activeProduct
    ? allTemplates.filter((t) => t.product === activeProduct)
    : allTemplates.filter((t) => t.category === activeCategory)

  return (
    <div className="flex min-h-screen bg-white dark:bg-background">
      {/* Left sidebar */}
      <div className="w-[260px] shrink-0 overflow-auto border-r p-6">
        <button
          onClick={() => router.push("/projects")}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <svg className="size-5" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
          </svg>
        </button>
        <h2 className="mb-4 text-lg font-bold text-foreground">
          Space templates
        </h2>
        <nav className="flex flex-col gap-0.5">
          {sidebarCategories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => {
                setActiveCategory(cat.name)
                setSelectedTemplate(null)
                setActiveProduct(null)
              }}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                activeCategory === cat.name && !activeProduct
                  ? "-ml-[2px] border-l-2 border-[#0052CC] bg-blue-50 font-medium text-[#0052CC] dark:bg-blue-900/20"
                  : "text-foreground hover:bg-gray-100 dark:hover:bg-accent"
              }`}
            >
              {cat.name}
              {"badge" in cat && cat.badge && (
                <span className="rounded border px-1 py-0.5 text-[9px] leading-none font-bold text-muted-foreground">
                  {cat.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Products section */}
        <div className="mt-6 border-t pt-6">
          <div className="mb-3 px-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Products
          </div>
          <div className="flex flex-col gap-0.5">
            {[
              {
                name: "Jira",
                icon: (
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-[6px] bg-[#2684FF]">
                    <svg className="size-4" viewBox="0 0 32 32" fill="white">
                      <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
                    </svg>
                  </div>
                ),
              },
              {
                name: "Jira Service Management",
                icon: (
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-[6px] bg-[#FFAB00]">
                    <svg className="size-4" viewBox="0 0 24 24" fill="none">
                      <path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" fill="#172B4D" />
                    </svg>
                  </div>
                ),
              },
              {
                name: "Customer Service Managem...",
                filterName: "Customer Service Management",
                icon: (
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-[6px] bg-[#FFAB00]">
                    <svg className="size-4" viewBox="0 0 24 24" fill="none">
                      <circle
                        cx="12"
                        cy="12"
                        r="6"
                        stroke="#172B4D"
                        strokeWidth="2"
                      />
                      <path
                        d="M12 8v4l3 2"
                        stroke="#172B4D"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                ),
              },
              {
                name: "Jira Product Discovery",
                icon: (
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-[6px] bg-[#8777D9]">
                    <svg className="size-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="5" fill="white" />
                      <path
                        d="M12 7v5l3.5 2"
                        stroke="#8777D9"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                ),
              },
            ].map((product) => (
              <button
                key={product.name}
                onClick={() => {
                  const filterBy =
                    "filterName" in product && product.filterName
                      ? (product.filterName as string)
                      : product.name
                  if (activeProduct === filterBy) {
                    setActiveProduct(null)
                  } else {
                    setActiveProduct(filterBy)
                    setSelectedTemplate(null)
                  }
                }}
                className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  activeProduct ===
                  ("filterName" in product && product.filterName
                    ? product.filterName
                    : product.name)
                    ? "bg-blue-50 font-medium text-[#0052CC] dark:bg-blue-900/20"
                    : "text-foreground hover:bg-gray-100 dark:hover:bg-accent"
                }`}
              >
                {product.icon}
                {product.name}
              </button>
            ))}
          </div>
        </div>

        {/* More section */}
        <div className="mt-6 border-t pt-6">
          <div className="mb-3 px-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            More
          </div>
          <button
            onClick={() => {
              setImportOpen(true)
              setImportStep(1)
              setImportSource("")
              setImportFile(null)
              setImportSpaceName("")
              setImportSpaceKey("")
              setImportStarted(false)
            }}
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-1.5 text-sm text-foreground hover:bg-gray-100 dark:hover:bg-accent"
          >
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Import data
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {selectedTemplate ? (
          /* ── Template Detail View ── */
          <div className="p-10">
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="hover:text-foreground"
              >
                Space templates
              </button>
              <span>/</span>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="hover:text-foreground"
              >
                {activeCategory}
              </button>
            </div>

            <div className="flex gap-10">
              {/* Left: detail content */}
              <div className="max-w-[700px] flex-1 rounded-lg border bg-white p-8 dark:bg-card">
                <div className="mb-6 flex items-start justify-between">
                  <h1 className="text-2xl font-bold text-foreground">
                    {selectedTemplate.name}
                  </h1>
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <svg
                      className="size-5"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                    </svg>
                  </button>
                </div>

                <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
                  {selectedTemplate.fullDescription}
                </p>

                {/* Feature sections */}
                {selectedTemplate.features.map((feature, i) => (
                  <div
                    key={i}
                    className="mb-8 flex gap-6 border-b pb-8 last:border-0"
                  >
                    <div className="shrink-0">
                      {i === 0 && <BacklogIllustration />}
                      {i === 1 && <SprintIllustration />}
                      {i === 2 && <VelocityIllustration />}
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-bold text-foreground">
                        {feature.title}
                      </h3>
                      <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
                        {feature.description}
                      </p>
                      <button className="flex items-center gap-1 text-sm text-[#0052CC] hover:underline">
                        {feature.linkText}
                        <svg
                          className="size-3"
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M4 12L12 4M12 4H6M12 4v6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Use template button */}
                <div className="flex justify-end border-t pt-4">
                  <Button
                    className="bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() =>
                      router.push(
                        `/templates/create?template=${encodeURIComponent(selectedTemplate.name)}&desc=${encodeURIComponent(selectedTemplate.description)}&product=${encodeURIComponent(selectedTemplate.product)}`
                      )
                    }
                  >
                    Use template
                  </Button>
                </div>
              </div>

              {/* Right sidebar info */}
              <div className="w-[220px] shrink-0">
                <div className="mb-6">
                  <h4 className="mb-2 text-xs font-bold text-muted-foreground uppercase">
                    Product
                  </h4>
                  <div className="flex items-center gap-2">
                    <svg className="size-5" viewBox="0 0 32 32" fill="#2684FF">
                      <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
                    </svg>
                    <span className="text-sm font-medium">
                      {selectedTemplate.product}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="mb-2 text-xs font-bold text-muted-foreground uppercase">
                    Recommended for
                  </h4>
                  <ul className="space-y-1.5">
                    {selectedTemplate.recommendedFor.map((r, i) => (
                      <li key={i} className="text-sm text-foreground">
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-6">
                  <h4 className="mb-2 text-xs font-bold text-muted-foreground uppercase">
                    Work types
                  </h4>
                  <ul className="space-y-2">
                    {selectedTemplate.workTypes.map((wt) => (
                      <li key={wt.name} className="flex items-center gap-2">
                        <div
                          className={`size-4 rounded-sm ${wt.color} flex items-center justify-center`}
                        >
                          <svg
                            className="size-2.5 text-white"
                            viewBox="0 0 16 16"
                            fill="currentColor"
                          >
                            <rect x="3" y="3" width="10" height="10" rx="1" />
                          </svg>
                        </div>
                        <span className="text-sm">{wt.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="mb-2 text-xs font-bold text-muted-foreground uppercase">
                    Workflow
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTemplate.workflow.map((w) => (
                      <span
                        key={w}
                        className="rounded-sm bg-gray-100 px-2 py-1 text-[11px] font-bold text-foreground dark:bg-muted"
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeCategory === "Custom templates" && !activeProduct ? (
          /* ── Custom Templates Enterprise View ── */
          <div className="p-10">
            <div className="mb-8 text-sm text-muted-foreground">
              Space templates
            </div>

            {/* Illustration */}
            <div className="mb-8 flex justify-center">
              <div className="relative h-[200px] w-[320px]">
                {/* Purple/pink background shape */}
                <div className="absolute top-0 right-0 h-[180px] w-[200px] -rotate-6 rounded-xl bg-gradient-to-br from-purple-300 to-pink-300" />
                {/* Blue shape */}
                <div className="absolute bottom-0 left-4 h-[120px] w-[60px] rotate-6 rounded-lg bg-blue-500" />
                {/* Card */}
                <div className="absolute top-1/2 left-1/2 w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="size-4 rounded bg-purple-500" />
                    <span className="text-xs font-semibold text-gray-700">
                      Space template
                    </span>
                  </div>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="mb-2 flex items-center gap-2">
                      <div className="h-2 w-[60%] rounded-full bg-gray-200" />
                      <div className="ml-auto flex gap-0.5">
                        {[1, 2, 3].map((j) => (
                          <div
                            key={j}
                            className="size-2 rounded-full bg-gray-200"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {submitted ? (
              <div className="mx-auto max-w-[800px]">
                {/* Illustration */}
                <div className="mb-8 flex justify-center">
                  <svg
                    className="h-[160px] w-[200px]"
                    viewBox="0 0 200 160"
                    fill="none"
                  >
                    {/* Arrow top-left */}
                    <path
                      d="M60 40 Q75 25 90 35"
                      stroke="#253858"
                      strokeWidth="2"
                      fill="none"
                      markerEnd="url(#arrowhead)"
                    />
                    {/* People shapes */}
                    <circle cx="110" cy="55" r="20" fill="#0052CC" />
                    <circle cx="140" cy="55" r="20" fill="#36B37E" />
                    <circle cx="95" cy="85" r="20" fill="#F5A623" />
                    <circle cx="125" cy="85" r="20" fill="#0052CC" />
                    <rect
                      x="100"
                      y="95"
                      width="35"
                      height="25"
                      rx="4"
                      fill="#36B37E"
                    />
                    <rect
                      x="85"
                      y="100"
                      width="20"
                      height="15"
                      rx="3"
                      fill="#253858"
                    />
                    {/* Arrow bottom-right */}
                    <path
                      d="M150 110 Q165 120 155 135"
                      stroke="#253858"
                      strokeWidth="2"
                      fill="none"
                    />
                    <defs>
                      <marker
                        id="arrowhead"
                        markerWidth="8"
                        markerHeight="6"
                        refX="8"
                        refY="3"
                        orient="auto"
                      >
                        <polygon points="0 0, 8 3, 0 6" fill="#253858" />
                      </marker>
                    </defs>
                  </svg>
                </div>

                <h2 className="mb-3 text-center text-2xl font-bold text-foreground">
                  We&apos;ll be in touch soon!
                </h2>
                <p className="mx-auto mb-10 max-w-[500px] text-center text-sm text-muted-foreground">
                  Our sales team will reach out via email within 2 business
                  days. In the meantime, here are some more resources to get you
                  started.
                </p>

                {/* Resource cards */}
                <div className="grid grid-cols-3 gap-5">
                  <div className="rounded-xl border p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <svg
                        className="size-5 text-foreground"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </svg>
                      <span className="text-sm font-bold text-foreground">
                        Feature Roadmaps
                      </span>
                    </div>
                    <p className="mb-4 text-sm text-muted-foreground">
                      See what&apos;s in our pipeline for Cloud and Data Center
                      products.
                    </p>
                    <a
                      href="https://www.atlassian.com/roadmap/cloud"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block rounded-md border px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-gray-50 dark:hover:bg-accent"
                    >
                      View roadmaps
                    </a>
                  </div>

                  <div className="rounded-xl border p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <svg
                        className="size-5 text-foreground"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      <span className="text-sm font-bold text-foreground">
                        Cloud Premium products
                      </span>
                    </div>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Learn about advanced product features for enterprises.
                    </p>
                    <a
                      href="https://www.atlassian.com/software/premium"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block rounded-md border px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-gray-50 dark:hover:bg-accent"
                    >
                      See advanced features
                    </a>
                  </div>

                  <div className="rounded-xl border p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <svg
                        className="size-5 text-foreground"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                      <span className="text-sm font-bold text-foreground">
                        More enterprise resources
                      </span>
                    </div>
                    <p className="mb-4 text-sm text-muted-foreground">
                      View resources, filtered by Cloud and Data Center product
                      features.
                    </p>
                    <a
                      href="https://www.atlassian.com/enterprise"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block rounded-md border px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-gray-50 dark:hover:bg-accent"
                    >
                      Browse resources
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-[520px]">
                <h2 className="mb-3 text-2xl font-bold text-foreground">
                  Unlock custom space templates
                </h2>
                <p className="mb-6 text-sm text-muted-foreground">
                  We&apos;ll email you at{" "}
                  <strong className="text-foreground">
                    abhisheksharma67185@gmail.com
                  </strong>{" "}
                  to arrange a time to chat about custom space templates on{" "}
                  <button className="inline-flex items-center gap-0.5 text-blue-600 hover:underline">
                    Jira Enterprise
                    <svg
                      className="size-3"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M4 12L12 4M12 4H6M12 4v6" />
                    </svg>
                  </button>
                  .
                </p>

                {/* Team size */}
                <div className="mb-5">
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Number of people on your team (required)
                  </label>
                  <input
                    type="number"
                    value={teamSize}
                    onChange={(e) => setTeamSize(e.target.value)}
                    className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Use case */}
                <div className="mb-5">
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    How will you be using custom space templates? (required)
                  </label>
                  <input
                    type="text"
                    value={customUse}
                    onChange={(e) => setCustomUse(e.target.value)}
                    className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Privacy notice */}
                <p className="mb-5 text-xs text-muted-foreground">
                  By submitting this form, I acknowledge receipt of{" "}
                  <button className="inline-flex items-center gap-0.5 text-blue-600 hover:underline">
                    Atlassian&apos;s Privacy Policy
                    <svg
                      className="size-3"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M4 12L12 4M12 4H6M12 4v6" />
                    </svg>
                  </button>
                  .
                </p>

                {/* Submit */}
                <button
                  onClick={() => {
                    if (teamSize && customUse) setSubmitted(true)
                  }}
                  disabled={!teamSize || !customUse}
                  className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Submit
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ── Template Grid View ── */
          <div className="px-10 py-8">
            {/* Breadcrumb */}
            <div className="mb-6">
              <span className="text-sm text-muted-foreground">
                Space templates
              </span>
            </div>

            <h1 className="text-[24px] font-semibold text-foreground">
              {activeProduct || activeCategory}
            </h1>
            <p className="mt-2 max-w-[800px] text-sm leading-relaxed text-muted-foreground">
              {activeProduct
                ? `Browse all templates powered by ${activeProduct}.`
                : categoryDescriptions[activeCategory] ||
                  "Browse templates for this category."}
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((tmpl, idx) => {
                const CustomIllustration =
                  templateIllustrations[`${tmpl.category}:${tmpl.name}`] ||
                  templateIllustrations[tmpl.name]
                const preview = templatePreviews[tmpl.name] || {
                  border: "border-blue-400",
                  label: tmpl.previewLabel,
                  rows: [
                    [
                      "bg-blue-500 w-[45%]",
                      "bg-green-500 w-[20%]",
                      "bg-pink-500 w-[15%]",
                    ],
                    [
                      "bg-green-500 w-[40%]",
                      "bg-orange-500 w-[25%]",
                      "bg-gray-300 w-[15%]",
                    ],
                    [
                      "bg-blue-400 w-[35%]",
                      "bg-purple-400 w-[25%]",
                      "bg-gray-300 w-[15%]",
                    ],
                  ],
                }
                return (
                  <button
                    key={`${tmpl.name}-${idx}`}
                    onClick={() => setSelectedTemplate(tmpl)}
                    className="group overflow-hidden rounded-lg border border-gray-200 bg-white text-left transition-all hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:bg-card dark:hover:border-gray-600"
                  >
                    <div className="relative p-4 pb-0">
                      {CustomIllustration ? (
                        <CustomIllustration />
                      ) : (
                        <TemplatePreview
                          borderColor={preview.border}
                          label={preview.label}
                          rows={preview.rows}
                        />
                      )}
                      {/* Hover tooltip like real Jira */}
                      <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="rounded bg-[#172B4D] px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow-lg dark:bg-gray-700">
                          {tmpl.name}
                        </div>
                      </div>
                    </div>
                    <div className="p-4 pt-3">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-foreground">
                          {tmpl.name}
                        </span>
                        {tmpl.badge && (
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] leading-none font-bold ${
                              tmpl.badge === "PREMIUM"
                                ? "border border-amber-400 text-amber-700"
                                : tmpl.badge === "RECOMMENDED"
                                  ? "bg-[#E9F2FF] text-[#0055CC] dark:bg-blue-900/40 dark:text-blue-300"
                                  : tmpl.badge === "LAST CREATED" ||
                                      tmpl.badge === "UPDATED"
                                    ? "border border-gray-300 text-gray-600"
                                    : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            {tmpl.badge}
                          </span>
                        )}
                      </div>
                      <p className="line-clamp-2 text-[13px] leading-snug text-muted-foreground">
                        {tmpl.description}
                      </p>
                      <div className="mt-2 flex items-center gap-1.5">
                        {tmpl.product === "Jira Service Management" ? (
                          <svg className="size-4" viewBox="0 0 32 32">
                            <circle cx="16" cy="16" r="14" fill="#36B37E" />
                            <path
                              d="M16 8l-7 10h5v6h4v-6h5l-7-10z"
                              fill="white"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="size-4"
                            viewBox="0 0 32 32"
                            fill="#2684FF"
                          >
                            <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
                          </svg>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {tmpl.product}
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <svg
                  className="mb-4 size-12 text-gray-200"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                  <rect x="9" y="3" width="6" height="4" rx="1" />
                </svg>
                <p className="text-sm text-muted-foreground">
                  No templates in this category yet
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create space from template</DialogTitle>
            <DialogDescription>
              Using the <strong>{selectedTemplate?.name}</strong> template.
              Enter a name for your new space.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium">
                Space name <span className="text-red-500">*</span>
              </label>
              <Input
                value={newSpaceName}
                onChange={(e) => {
                  setNewSpaceName(e.target.value)
                  setNewSpaceKey(
                    e.target.value
                      .replace(/[^a-zA-Z]/g, "")
                      .toUpperCase()
                      .slice(0, 5)
                  )
                }}
                placeholder="e.g. Marketing"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium">Key</label>
              <Input
                value={newSpaceKey}
                onChange={(e) => setNewSpaceKey(e.target.value.toUpperCase())}
                placeholder="e.g. MARK"
                className="font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateOpen(false)
                setNewSpaceName("")
                setNewSpaceKey("")
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              disabled={!newSpaceName.trim()}
              onClick={() => {
                setCreateOpen(false)
                setNewSpaceName("")
                setNewSpaceKey("")
              }}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import data dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Import data to a new space</DialogTitle>
            <DialogDescription>
              Import your data from external tools or files into a new Jira
              space.
            </DialogDescription>
          </DialogHeader>

          {importStep === 1 && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Choose where you want to import data from:
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    id: "csv",
                    label: "CSV file",
                    desc: "Import from a CSV or Excel file",
                    icon: (
                      <svg
                        className="size-8 text-green-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <path d="M8 13h2M8 17h2M12 13h2M12 17h2" />
                      </svg>
                    ),
                  },
                  {
                    id: "trello",
                    label: "Trello",
                    desc: "Import boards from Trello",
                    icon: (
                      <svg
                        className="size-8 text-blue-500"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <rect
                          x="2"
                          y="2"
                          width="20"
                          height="20"
                          rx="3"
                          fill="#0079BF"
                        />
                        <rect
                          x="4.5"
                          y="4.5"
                          width="6"
                          height="13"
                          rx="1.5"
                          fill="white"
                        />
                        <rect
                          x="13.5"
                          y="4.5"
                          width="6"
                          height="9"
                          rx="1.5"
                          fill="white"
                        />
                      </svg>
                    ),
                  },
                  {
                    id: "asana",
                    label: "Asana",
                    desc: "Import projects from Asana",
                    icon: (
                      <svg className="size-8" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="8" r="4" fill="#F06A6A" />
                        <circle cx="6" cy="18" r="4" fill="#F06A6A" />
                        <circle cx="18" cy="18" r="4" fill="#F06A6A" />
                      </svg>
                    ),
                  },
                  {
                    id: "monday",
                    label: "Monday.com",
                    desc: "Import boards from Monday",
                    icon: (
                      <svg className="size-8" viewBox="0 0 24 24" fill="none">
                        <circle cx="6" cy="16" r="3" fill="#FF3D57" />
                        <circle cx="12" cy="10" r="3" fill="#FFCB00" />
                        <circle cx="18" cy="16" r="3" fill="#00CA72" />
                      </svg>
                    ),
                  },
                  {
                    id: "json",
                    label: "JSON file",
                    desc: "Import from a JSON export",
                    icon: (
                      <svg
                        className="size-8 text-amber-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <path d="M8 13 L10 15 L8 17" />
                        <path d="M13 13h3" />
                      </svg>
                    ),
                  },
                  {
                    id: "other",
                    label: "Other tools",
                    desc: "Jira Server, GitHub, and more",
                    icon: (
                      <svg
                        className="size-8 text-gray-500"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      >
                        <circle cx="12" cy="12" r="1" />
                        <circle cx="19" cy="12" r="1" />
                        <circle cx="5" cy="12" r="1" />
                      </svg>
                    ),
                  },
                ].map((source) => (
                  <button
                    key={source.id}
                    onClick={() => setImportSource(source.id)}
                    className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-all hover:shadow-sm ${
                      importSource === source.id
                        ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500 dark:bg-blue-950/20"
                        : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">{source.icon}</div>
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {source.label}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {source.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {importStep === 2 && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                {importSource === "csv" || importSource === "json"
                  ? "Upload your file and configure your new space."
                  : `Connect your ${importSource === "trello" ? "Trello" : importSource === "asana" ? "Asana" : importSource === "monday" ? "Monday.com" : "external"} account and select what to import.`}
              </p>

              {(importSource === "csv" || importSource === "json") && (
                <div
                  className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/50 dark:border-gray-600 dark:hover:bg-blue-950/10"
                  onClick={() =>
                    document.getElementById("import-file-input")?.click()
                  }
                >
                  <input
                    id="import-file-input"
                    type="file"
                    accept={
                      importSource === "csv" ? ".csv,.xlsx,.xls" : ".json"
                    }
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setImportFile(e.target.files[0])
                    }}
                  />
                  <svg
                    className="mx-auto mb-3 size-10 text-gray-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  {importFile ? (
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {importFile.name}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {(importFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {importSource === "csv" ? "CSV, XLSX, or XLS" : "JSON"}{" "}
                        files supported
                      </p>
                    </div>
                  )}
                </div>
              )}

              {importSource !== "csv" && importSource !== "json" && (
                <div className="rounded-lg border p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded bg-blue-100 dark:bg-blue-900/40">
                      <svg
                        className="size-4 text-blue-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Connect account
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Authorize access to import your data
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="ml-auto">
                      Connect
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You&apos;ll be redirected to authorize access. We only read
                    data needed for import.
                  </p>
                </div>
              )}

              <div className="mt-2 flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium">
                    New space name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={importSpaceName}
                    onChange={(e) => {
                      setImportSpaceName(e.target.value)
                      setImportSpaceKey(
                        e.target.value
                          .replace(/[^a-zA-Z]/g, "")
                          .toUpperCase()
                          .slice(0, 5)
                      )
                    }}
                    placeholder="e.g. Imported Project"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium">Key</label>
                  <Input
                    value={importSpaceKey}
                    onChange={(e) =>
                      setImportSpaceKey(e.target.value.toUpperCase())
                    }
                    placeholder="e.g. IMP"
                    className="font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {importStep === 3 && (
            <div className="flex flex-col items-center gap-4 py-6">
              {!importStarted ? (
                <>
                  <div className="flex size-16 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
                    <svg
                      className="size-8 text-blue-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-base font-medium text-foreground">
                      Ready to import
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Your data will be imported into{" "}
                      <strong>{importSpaceName}</strong> ({importSpaceKey}).
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex size-16 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20">
                    <svg
                      className="size-8 text-green-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-base font-medium text-foreground">
                      Import complete!
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Your space <strong>{importSpaceName}</strong> has been
                      created successfully.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            {importStep === 1 && (
              <>
                <Button variant="outline" onClick={() => setImportOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  disabled={!importSource}
                  onClick={() => setImportStep(2)}
                >
                  Continue
                </Button>
              </>
            )}
            {importStep === 2 && (
              <>
                <Button variant="outline" onClick={() => setImportStep(1)}>
                  Back
                </Button>
                <Button
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  disabled={
                    !importSpaceName.trim() ||
                    ((importSource === "csv" || importSource === "json") &&
                      !importFile)
                  }
                  onClick={() => setImportStep(3)}
                >
                  Continue
                </Button>
              </>
            )}
            {importStep === 3 && !importStarted && (
              <>
                <Button variant="outline" onClick={() => setImportStep(2)}>
                  Back
                </Button>
                <Button
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => {
                    setImportStarted(true)
                  }}
                >
                  Start import
                </Button>
              </>
            )}
            {importStep === 3 && importStarted && (
              <Button
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => {
                  setImportOpen(false)
                  router.push("/projects")
                }}
              >
                Go to space
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
