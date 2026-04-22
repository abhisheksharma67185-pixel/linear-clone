"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const rovoData = [
  { date: "April 1, 2026", label: "Apr\n1", x: 35, value: 0 },
  { date: "April 2, 2026", label: "Apr\n2", x: 65, value: 0 },
  { date: "April 3, 2026", label: "Apr\n3", x: 95, value: 0 },
  { date: "April 4, 2026", label: "Apr\n4", x: 125, value: 0 },
  { date: "April 5, 2026", label: "Apr\n5", x: 155, value: 0 },
  { date: "April 6, 2026", label: "Apr\n6", x: 185, value: 0 },
  { date: "April 7, 2026", label: "Apr\n7", x: 215, value: 0 },
]

function RovoChart() {
  const [hover, setHover] = useState<number | null>(null)

  return (
    <div className="relative mt-4 h-40">
      <svg className="h-full w-full" viewBox="0 0 240 140">
        {/* Y axis labels */}
        <text
          x="18"
          y="18"
          fill="currentColor"
          className="text-muted-foreground"
          fontSize="8"
          textAnchor="end"
        >
          100
        </text>
        <text
          x="18"
          y="42"
          fill="currentColor"
          className="text-muted-foreground"
          fontSize="8"
          textAnchor="end"
        >
          80
        </text>
        <text
          x="18"
          y="66"
          fill="currentColor"
          className="text-muted-foreground"
          fontSize="8"
          textAnchor="end"
        >
          60
        </text>
        <text
          x="18"
          y="90"
          fill="currentColor"
          className="text-muted-foreground"
          fontSize="8"
          textAnchor="end"
        >
          40
        </text>
        <text
          x="18"
          y="114"
          fill="currentColor"
          className="text-muted-foreground"
          fontSize="8"
          textAnchor="end"
        >
          20
        </text>
        {/* Grid lines */}
        <line
          x1="24"
          y1="15"
          x2="230"
          y2="15"
          stroke="currentColor"
          className="text-muted-foreground/10"
          strokeWidth="0.5"
        />
        <line
          x1="24"
          y1="39"
          x2="230"
          y2="39"
          stroke="currentColor"
          className="text-muted-foreground/10"
          strokeWidth="0.5"
        />
        <line
          x1="24"
          y1="63"
          x2="230"
          y2="63"
          stroke="currentColor"
          className="text-muted-foreground/10"
          strokeWidth="0.5"
        />
        <line
          x1="24"
          y1="87"
          x2="230"
          y2="87"
          stroke="currentColor"
          className="text-muted-foreground/10"
          strokeWidth="0.5"
        />
        <line
          x1="24"
          y1="111"
          x2="230"
          y2="111"
          stroke="currentColor"
          className="text-muted-foreground/10"
          strokeWidth="0.5"
        />
        <line
          x1="24"
          y1="128"
          x2="230"
          y2="128"
          stroke="currentColor"
          className="text-muted-foreground/20"
          strokeWidth="1"
        />
        {/* Data line */}
        <polyline
          points={rovoData.map((d) => `${d.x},126`).join(" ")}
          fill="none"
          stroke="#2563EB"
          strokeWidth="2"
        />
        {/* Hover vertical line */}
        {hover !== null && (
          <line
            x1={rovoData[hover].x}
            y1="15"
            x2={rovoData[hover].x}
            y2="128"
            stroke="currentColor"
            className="text-muted-foreground/40"
            strokeWidth="1"
            strokeDasharray="2"
          />
        )}
        {/* Data points & hit areas */}
        {rovoData.map((d, i) => (
          <g key={i}>
            <circle cx={d.x} cy={126} r="3" fill="#2563EB" />
            <rect
              x={d.x - 15}
              y={0}
              width={30}
              height={128}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          </g>
        ))}
        {/* X axis labels */}
        {rovoData.map((d, i) => (
          <text
            key={i}
            x={d.x}
            y="138"
            fill="currentColor"
            className="text-muted-foreground"
            fontSize="7"
            textAnchor="middle"
          >
            {d.label.split("\n").map((line, j) => (
              <tspan key={j} x={d.x} dy={j === 0 ? 0 : 9}>
                {line}
              </tspan>
            ))}
          </text>
        ))}
      </svg>
      {/* Tooltip */}
      {hover !== null && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg border bg-background px-3 py-2 shadow-md"
          style={{
            left: `${(rovoData[hover].x / 240) * 100}%`,
            top: "40%",
            transform: "translateX(-50%)",
          }}
        >
          <p className="text-xs font-medium">{rovoData[hover].date}</p>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-blue-600" />
            <span className="text-xs text-muted-foreground">
              Daily credits used
            </span>
            <span className="text-xs font-medium">{rovoData[hover].value}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function OpenRequestsChart() {
  return (
    <div className="mt-4 flex items-center gap-4">
      {[
        {
          name: "Jira",
          count: 0,
          bg: "bg-gradient-to-br from-blue-500 to-blue-700",
          icon: (
            <svg className="size-4 text-white" viewBox="0 0 32 32" fill="white">
              <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
            </svg>
          ),
        },
        {
          name: "Jira Service Ma...",
          count: 0,
          bg: "bg-gradient-to-br from-blue-400 to-green-500",
          icon: (
            <svg
              className="size-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4l3 3" />
            </svg>
          ),
        },
      ].map((app) => (
        <div key={app.name} className="flex items-center gap-2.5">
          <div
            className={`flex size-8 items-center justify-center rounded-md ${app.bg}`}
          >
            {app.icon}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{app.name}</p>
            <p className="text-sm font-semibold">{app.count}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AdminOverviewPage() {
  return (
    <div className="max-w-5xl p-8">
      <h1 className="mb-8 text-2xl font-semibold">
        abhisheksharma67185 overview
      </h1>

      {/* Quick actions */}
      <h2 className="mb-3 text-base font-semibold">Quick actions</h2>
      <div className="mb-8 grid grid-cols-3 gap-3">
        {[
          {
            label: "Invite users",
            href: "/admin/users",
            icon: (
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="17" y1="11" x2="23" y2="11" />
              </svg>
            ),
          },
          {
            label: "Add app",
            href: "/admin/atlassian-apps",
            icon: (
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            ),
          },
          {
            label: "Verify domain",
            href: "/admin/domains",
            icon: (
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            ),
          },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex items-center justify-center gap-2 rounded-lg border px-4 py-4 text-sm transition-colors hover:bg-accent"
          >
            <span className="text-muted-foreground">{action.icon}</span>
            {action.label}
          </Link>
        ))}
      </div>

      {/* Monitor */}
      <h2 className="mb-3 text-base font-semibold">Monitor</h2>
      <div className="mb-8 grid grid-cols-3 gap-4">
        {/* Rovo credits usage */}
        <div className="rounded-lg border p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Rovo credits usage</h3>
            <Link href="/admin/insights/platform-usage">
              <Button variant="outline" size="sm">
                View usage
              </Button>
            </Link>
          </div>
          <p className="text-3xl font-bold">0</p>
          <p className="mt-1 text-xs text-muted-foreground">
            used in the last 7 days
          </p>
          <RovoChart />
        </div>

        {/* Monthly active users */}
        <div className="rounded-lg border p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Monthly active users</h3>
            <Link href="/admin/users">
              <Button variant="outline" size="sm">
                Manage users
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold">1</p>
            <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
              0% MONTH TO DATE
            </span>
          </div>
          <div className="mt-4 h-40">
            <svg className="h-full w-full" viewBox="0 0 240 140">
              <text
                x="18"
                y="18"
                fill="currentColor"
                className="text-muted-foreground"
                fontSize="8"
                textAnchor="end"
              >
                1
              </text>
              <text
                x="18"
                y="42"
                fill="currentColor"
                className="text-muted-foreground"
                fontSize="8"
                textAnchor="end"
              >
                0.8
              </text>
              <text
                x="18"
                y="66"
                fill="currentColor"
                className="text-muted-foreground"
                fontSize="8"
                textAnchor="end"
              >
                0.6
              </text>
              <text
                x="18"
                y="90"
                fill="currentColor"
                className="text-muted-foreground"
                fontSize="8"
                textAnchor="end"
              >
                0.4
              </text>
              <text
                x="18"
                y="114"
                fill="currentColor"
                className="text-muted-foreground"
                fontSize="8"
                textAnchor="end"
              >
                0.2
              </text>
              <text
                x="18"
                y="130"
                fill="currentColor"
                className="text-muted-foreground"
                fontSize="8"
                textAnchor="end"
              >
                0
              </text>
              {[15, 39, 63, 87, 111].map((y) => (
                <line
                  key={y}
                  x1="24"
                  y1={y}
                  x2="230"
                  y2={y}
                  stroke="currentColor"
                  className="text-muted-foreground/10"
                  strokeWidth="0.5"
                />
              ))}
              <line
                x1="24"
                y1="128"
                x2="230"
                y2="128"
                stroke="currentColor"
                className="text-muted-foreground/20"
                strokeWidth="1"
              />
              {/* Active users data line */}
              <polyline
                points="35,128 55,128 75,128 95,118 115,128 135,128 155,128 175,118 195,128 215,128"
                fill="none"
                stroke="#2563EB"
                strokeWidth="2"
              />
              {[35, 55, 75, 95, 115, 135, 155, 175, 195, 215].map((x, i) => (
                <circle
                  key={i}
                  cx={x}
                  cy={[128, 128, 128, 118, 128, 128, 128, 118, 128, 128][i]}
                  r="2.5"
                  fill="#2563EB"
                />
              ))}
            </svg>
          </div>
        </div>

        {/* Open requests */}
        <div className="rounded-lg border p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              Open requests for app access
            </h3>
            <Link href="/admin/user-requests">
              <Button variant="outline" size="sm">
                Review requests
              </Button>
            </Link>
          </div>
          <p className="text-3xl font-bold">0</p>
          <div className="mt-2">
            <select className="w-full rounded-md border bg-background px-3 py-1.5 text-sm">
              <option>abhisheksharma67185</option>
            </select>
          </div>
          <OpenRequestsChart />
        </div>
      </div>

      {/* Discover */}
      <h2 className="mb-3 text-base font-semibold">Discover</h2>
      <div className="grid grid-cols-4 gap-3">
        {[
          {
            name: "Platform usage",
            href: "/admin/insights/platform-usage",
            description:
              "Keep track of how your organization is using Rovo credits and other features across the Atlassian platform.",
            icon: (
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            ),
            iconBg: "bg-green-50 dark:bg-green-950/30",
          },
          {
            name: "Atlassian Guard",
            href: "/admin/security/security-guide",
            description:
              "Enforce security policies, understand your risk profile, and quickly remediate issues.",
            icon: <span className="text-base">🛡️</span>,
            iconBg: "bg-muted",
          },
          {
            name: "Platform experiences",
            href: "/admin/platform-experiences",
            description:
              "Connect the work your team does across different Atlassian apps.",
            icon: (
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            ),
            iconBg: "bg-muted",
          },
          {
            name: "Authentication policies",
            href: "/admin/security/user-security/authentication-policies",
            description:
              "Specify security settings for different sets of users and configurations.",
            icon: (
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            ),
            iconBg: "bg-muted",
          },
        ].map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex flex-col rounded-lg border p-4 text-left transition-colors hover:bg-accent/50"
          >
            <div className="mb-2 flex w-full items-center justify-between">
              <div
                className={`size-9 rounded-lg ${item.iconBg} flex items-center justify-center`}
              >
                {item.icon}
              </div>
              <svg
                className="size-4 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M7 17L17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </div>
            <h3 className="mb-1 text-sm font-semibold">{item.name}</h3>
            <p className="text-xs text-muted-foreground">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
