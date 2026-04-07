"use client"

import { Button } from "@/components/ui/button"

export default function ApplicationTunnelsPage() {
  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-semibold mb-8">Application tunnels</h1>

      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-lg mx-auto">
        {/* Illustration - laptop with connection */}
        <div className="relative mb-6">
          <svg className="w-32 h-24" viewBox="0 0 128 96" fill="none">
            {/* Laptop body */}
            <rect x="16" y="8" width="48" height="36" rx="3" fill="#E0E0E0" stroke="#BDBDBD" strokeWidth="1.5" />
            {/* Laptop screen */}
            <rect x="20" y="12" width="40" height="24" rx="1" fill="white" />
            {/* Laptop base */}
            <rect x="10" y="44" width="60" height="4" rx="2" fill="#BDBDBD" />
            {/* Connection dots */}
            <circle cx="78" cy="30" r="2.5" fill="#B3D4FF" />
            <circle cx="86" cy="30" r="1.5" fill="#4C9AFF" />
            {/* Plus circle */}
            <circle cx="104" cy="30" r="20" fill="#2684FF" />
            <line x1="104" y1="20" x2="104" y2="40" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="94" y1="30" x2="114" y2="30" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
        </div>

        <h2 className="text-lg font-semibold mb-3">
          Link Cloud and Data Center
        </h2>

        <p className="text-sm text-muted-foreground mb-6">
          Communicate with your network securely, without needing to open it to the outside world. To do this, create a tunnel to connect to your self-managed instances.
        </p>

        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          Create tunnel
        </Button>
      </div>
    </div>
  )
}
