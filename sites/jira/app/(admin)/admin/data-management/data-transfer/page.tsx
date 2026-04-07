"use client"

import { Button } from "@/components/ui/button"

export default function DataTransferPage() {
  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-semibold mb-8">Data transfer</h1>

      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-lg mx-auto">
        {/* Cloud illustration */}
        <div className="relative mb-6">
          <svg className="w-40 h-28" viewBox="0 0 160 112" fill="none">
            {/* Back cloud */}
            <ellipse cx="90" cy="52" rx="50" ry="30" fill="#B3D4FF" />
            {/* Middle cloud */}
            <ellipse cx="70" cy="60" rx="45" ry="28" fill="#4C9AFF" />
            {/* Front cloud */}
            <ellipse cx="60" cy="68" rx="40" ry="24" fill="#2684FF" />
            {/* Dark accent */}
            <ellipse cx="50" cy="72" rx="20" ry="12" fill="#0052CC" />
            {/* Small purple accent */}
            <ellipse cx="95" cy="50" rx="12" ry="8" fill="#8777D9" />
          </svg>
        </div>

        <h2 className="text-lg font-semibold mb-3">
          Start by creating a transfer plan
        </h2>

        <p className="text-sm text-muted-foreground mb-4">
          A transfer plan is a collection of project, spaces, users, groups, and related data such as pages, configurations, and settings you want to transfer.
        </p>

        <a href="" onClick={(e) => e.preventDefault()} className="text-sm text-blue-600 hover:underline mb-4">
          How to transfer data
        </a>

        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          Create transfer plan
        </Button>
      </div>
    </div>
  )
}
