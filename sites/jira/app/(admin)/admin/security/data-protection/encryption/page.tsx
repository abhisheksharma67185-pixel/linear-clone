"use client"

import { Button } from "@/components/ui/button"

export default function EncryptionPage() {
  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-semibold mb-8">Encryption</h1>

      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-lg mx-auto">
        {/* Lock illustration */}
        <div className="relative mb-6">
          <svg className="size-28" viewBox="0 0 120 120" fill="none">
            {/* Padlock body */}
            <rect x="28" y="56" width="52" height="40" rx="6" fill="#2684FF" />
            {/* Padlock shackle */}
            <path d="M38 56V42a16 16 0 0 1 32 0v14" stroke="#B3D4FF" strokeWidth="6" fill="none" strokeLinecap="round" />
            {/* Keyhole */}
            <circle cx="54" cy="74" r="5" fill="white" />
            <rect x="51.5" y="77" width="5" height="8" rx="2" fill="white" />
            {/* Key decoration */}
            <g transform="translate(72, 58)">
              <circle cx="10" cy="10" r="9" fill="#0065FF" stroke="#B3D4FF" strokeWidth="2" />
              <circle cx="10" cy="10" r="4" fill="#B3D4FF" />
              <rect x="17" y="8" width="14" height="4" rx="1" fill="#0065FF" />
              <rect x="26" y="8" width="3" height="7" rx="1" fill="#0065FF" />
            </g>
            {/* Small decorative circles */}
            <circle cx="90" cy="48" r="4" fill="#B3D4FF" />
            <circle cx="98" cy="60" r="3" fill="#B3D4FF" opacity="0.5" />
          </svg>
        </div>

        <h2 className="text-lg font-semibold mb-3">
          Encrypt app data with your own keys
        </h2>

        <p className="text-sm text-muted-foreground mb-4">
          Apps use Atlassian managed encryption keys by default. You can choose to use{" "}
          <a href="" onClick={(e) => e.preventDefault()} className="text-blue-600 hover:underline">Customer-managed keys (CMK)</a>{" "}
          encryption to maintain more control and management of your data.
        </p>

        <a href="" onClick={(e) => e.preventDefault()} className="text-sm text-blue-600 hover:underline mb-8">
          Understand more about data managed with CMK
        </a>

        {/* CMK upsell card */}
        <div className="rounded-lg border bg-muted/30 p-6 w-full text-center">
          <h3 className="text-sm font-semibold mb-1">
            Get CMK add-on to unlock this functionality
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Scale your organization with confidence and flexibility using our CMK offerings.
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Explore CMK add-on
          </Button>
        </div>
      </div>
    </div>
  )
}
