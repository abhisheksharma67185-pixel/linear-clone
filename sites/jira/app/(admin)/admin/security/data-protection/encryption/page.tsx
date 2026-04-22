import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function EncryptionPage() {
  return (
    <div className="max-w-5xl p-8">
      <h1 className="mb-8 text-2xl font-semibold">Encryption</h1>

      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center text-center">
        {/* Lock illustration */}
        <div className="relative mb-6">
          <svg className="size-28" viewBox="0 0 120 120" fill="none">
            {/* Padlock body */}
            <rect x="28" y="56" width="52" height="40" rx="6" fill="#2684FF" />
            {/* Padlock shackle */}
            <path
              d="M38 56V42a16 16 0 0 1 32 0v14"
              stroke="#B3D4FF"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
            />
            {/* Keyhole */}
            <circle cx="54" cy="74" r="5" fill="white" />
            <rect x="51.5" y="77" width="5" height="8" rx="2" fill="white" />
            {/* Key decoration */}
            <g transform="translate(72, 58)">
              <circle
                cx="10"
                cy="10"
                r="9"
                fill="#0065FF"
                stroke="#B3D4FF"
                strokeWidth="2"
              />
              <circle cx="10" cy="10" r="4" fill="#B3D4FF" />
              <rect x="17" y="8" width="14" height="4" rx="1" fill="#0065FF" />
              <rect x="26" y="8" width="3" height="7" rx="1" fill="#0065FF" />
            </g>
            {/* Small decorative circles */}
            <circle cx="90" cy="48" r="4" fill="#B3D4FF" />
            <circle cx="98" cy="60" r="3" fill="#B3D4FF" opacity="0.5" />
          </svg>
        </div>

        <h2 className="mb-3 text-lg font-semibold">
          Encrypt app data with your own keys
        </h2>

        <p className="mb-4 text-sm text-muted-foreground">
          Apps use Atlassian managed encryption keys by default. You can choose
          to use{" "}
          <Link
            href="/admin/security/security-guide"
            className="text-blue-600 hover:underline"
          >
            Customer-managed keys (CMK)
          </Link>{" "}
          encryption to maintain more control and management of your data.
        </p>

        <Link
          href="/admin/security/security-guide"
          className="mb-8 text-sm text-blue-600 hover:underline"
        >
          Understand more about data managed with CMK
        </Link>

        {/* CMK upsell card */}
        <div className="w-full rounded-lg border bg-muted/30 p-6 text-center">
          <h3 className="mb-1 text-sm font-semibold">
            Get CMK add-on to unlock this functionality
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Scale your organization with confidence and flexibility using our
            CMK offerings.
          </p>
          <Link href="/admin/security/security-guide">
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              Explore CMK add-on
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
