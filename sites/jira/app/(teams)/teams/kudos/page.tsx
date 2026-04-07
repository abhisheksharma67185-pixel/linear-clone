"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function KudosPage() {
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Kudos</h1>
        <Link href="/kudos">
          <Button variant="outline">Give kudos</Button>
        </Link>
      </div>

      <div className="flex flex-col items-center justify-center py-20 text-center">
        {/* Search/magnifier illustration with question marks */}
        <svg className="mb-6 size-36" viewBox="0 0 150 150" fill="none">
          {/* Question marks */}
          <text x="40" y="30" fill="currentColor" className="text-muted-foreground/20" fontSize="24" fontWeight="bold">?</text>
          <text x="110" y="35" fill="currentColor" className="text-muted-foreground/20" fontSize="18" fontWeight="bold">?</text>
          <text x="25" y="90" fill="currentColor" className="text-muted-foreground/15" fontSize="20" fontWeight="bold">?</text>
          <text x="120" y="100" fill="currentColor" className="text-muted-foreground/20" fontSize="22" fontWeight="bold">?</text>
          <text x="100" y="130" fill="currentColor" className="text-muted-foreground/15" fontSize="16" fontWeight="bold">?</text>

          {/* Dashed circle */}
          <circle cx="70" cy="70" r="40" stroke="currentColor" className="text-muted-foreground/20" strokeWidth="3" strokeDasharray="8 6" fill="none" />

          {/* X inside circle */}
          <line x1="55" y1="55" x2="85" y2="85" stroke="currentColor" className="text-muted-foreground/30" strokeWidth="6" strokeLinecap="round" />
          <line x1="85" y1="55" x2="55" y2="85" stroke="currentColor" className="text-muted-foreground/30" strokeWidth="6" strokeLinecap="round" />

          {/* Magnifier handle */}
          <line x1="100" y1="100" x2="120" y2="120" stroke="currentColor" className="text-muted-foreground/25" strokeWidth="8" strokeLinecap="round" />
        </svg>

        <p className="mb-2 max-w-lg text-sm text-muted-foreground">
          We couldn&apos;t find any teams matching your search. Try changing your search criteria or{" "}
          <button type="button" className="font-medium text-blue-600 hover:underline">clear all filters</button>.
        </p>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          Some teams may not be found on this site due to{" "}
          <button type="button" className="font-medium text-blue-600 hover:underline">changes in team visibility</button>.
        </p>
      </div>
    </div>
  )
}
