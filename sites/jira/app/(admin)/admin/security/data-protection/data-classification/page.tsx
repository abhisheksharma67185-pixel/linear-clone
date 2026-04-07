"use client"

import { Button } from "@/components/ui/button"

export default function DataClassificationPage() {
  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-semibold mb-8">Data classification</h1>

      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-lg mx-auto">
        {/* Shield illustration */}
        <div className="relative mb-6">
          <svg className="size-28" viewBox="0 0 120 120" fill="none">
            {/* Shield body */}
            <path d="M60 10L15 30v30c0 27.6 19.2 53.4 45 60 25.8-6.6 45-32.4 45-60V30L60 10z" fill="#FFC400" />
            <path d="M60 16L21 34v26c0 25 17.4 48.4 39 54.4V16z" fill="#FF991F" />
            <path d="M60 16l39 18v26c0 25-17.4 48.4-39 54.4V16z" fill="#FFC400" />
            {/* Checkmark */}
            <g transform="translate(72, 12)">
              <path d="M10 20l8 8 16-16" stroke="#36B37E" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M5 15l6 6 12-12" stroke="#36B37E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.5" />
            </g>
          </svg>
        </div>

        <h2 className="text-lg font-semibold mb-3">
          Classify data in your Atlassian apps
        </h2>

        <p className="text-sm text-muted-foreground mb-6">
          Data classification allows you to define classification levels for users to categorize their content into. It&apos;s the foundation of data governance and can be based on different taxonomies, such as data sensitivity, data type or regulatory requirements.{" "}
          <a href="" onClick={(e) => e.preventDefault()} className="text-blue-600 hover:underline">How data classification works</a>
        </p>

        <div className="flex items-center gap-4">
          <a href="" onClick={(e) => e.preventDefault()} className="text-sm text-muted-foreground hover:text-foreground">
            Explore benefits
          </a>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Trial Atlassian Guard Premium
          </Button>
        </div>
      </div>
    </div>
  )
}
