"use client"

const providers = [
  {
    name: "Google Workspace",
    description: "Uses Google Workspace to integrate.",
    action: "Choose",
    iconBg: "bg-white",
    icon: (
      <svg className="size-8" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
      </svg>
    ),
  },
  {
    name: "Active Directory Federation Services",
    guardRequired: true,
    iconBg: "bg-white",
    icon: (
      <svg className="size-8" viewBox="0 0 48 48">
        <rect width="22" height="22" x="2" y="2" fill="#F25022" />
        <rect width="22" height="22" x="24" y="2" fill="#7FBA00" />
        <rect width="22" height="22" x="2" y="24" fill="#00A4EF" />
        <rect width="22" height="22" x="24" y="24" fill="#FFB900" />
      </svg>
    ),
  },
  {
    name: "Auth0",
    guardRequired: true,
    iconBg: "bg-white",
    icon: (
      <svg className="size-8" viewBox="0 0 48 48" fill="none">
        <path d="M34 8H14l-4 12 10 8-4 12h16l-4-12 10-8-4-12z" fill="#EB5424" />
      </svg>
    ),
  },
  {
    name: "Cyberark Idaptive",
    guardRequired: true,
    iconBg: "bg-white",
    icon: (
      <svg className="size-8" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="20" fill="#00A98F" />
        <path d="M24 12v24M16 18l16 12M32 18L16 30" stroke="white" strokeWidth="3" />
      </svg>
    ),
  },
  {
    name: "Duo",
    guardRequired: true,
    iconBg: "bg-white",
    icon: (
      <svg className="size-8" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="8" fill="#6BBF4E" />
        <text x="8" y="34" fill="white" fontWeight="bold" fontSize="22">duo</text>
      </svg>
    ),
  },
  {
    name: "Google Cloud Identity",
    guardRequired: true,
    iconBg: "bg-white",
    icon: (
      <svg className="size-8" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="20" fill="#4285F4" />
        <path d="M24 14a10 10 0 100 20 10 10 0 000-20zm0 4a6 6 0 110 12 6 6 0 010-12z" fill="white" />
      </svg>
    ),
  },
  {
    name: "JumpCloud",
    guardRequired: true,
    iconBg: "bg-white",
    icon: (
      <svg className="size-8" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="8" fill="#1E2D3D" />
        <path d="M14 28l10-16 10 16H14z" fill="#65CB8B" />
      </svg>
    ),
  },
  {
    name: "Microsoft Azure AD",
    guardRequired: true,
    iconBg: "bg-white",
    icon: (
      <svg className="size-8" viewBox="0 0 48 48" fill="none">
        <path d="M18 6l-14 24h10l4-8 8 16h14L18 6z" fill="#0078D4" />
      </svg>
    ),
  },
  {
    name: "Okta",
    guardRequired: true,
    iconBg: "bg-white",
    icon: (
      <svg className="size-8" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="8" fill="#F5F5F5" />
        <text x="6" y="32" fill="#007DC1" fontWeight="bold" fontSize="18">okta</text>
      </svg>
    ),
  },
  {
    name: "OneLogin",
    guardRequired: true,
    iconBg: "bg-white",
    icon: (
      <svg className="size-8" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="8" fill="#2D3F50" />
        <circle cx="24" cy="24" r="10" fill="#01B4CE" />
        <text x="20" y="28" fill="white" fontSize="10" fontWeight="bold">1</text>
      </svg>
    ),
  },
  {
    name: "Ping Identity",
    guardRequired: true,
    iconBg: "bg-white",
    icon: (
      <svg className="size-8" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="8" fill="#B71C1C" />
        <text x="4" y="32" fill="white" fontWeight="bold" fontSize="16">Ping</text>
      </svg>
    ),
  },
  {
    name: "Other provider",
    guardRequired: true,
    iconBg: "bg-white",
    icon: (
      <svg className="size-8" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="20" fill="#E0E0E0" />
        <circle cx="24" cy="20" r="8" fill="#9E9E9E" />
        <path d="M12 40c0-6.627 5.373-12 12-12s12 5.373 12 12" fill="#9E9E9E" />
      </svg>
    ),
  },
]

export default function IdentityProvidersPage() {
  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-semibold mb-4">Identity providers</h1>

      <p className="text-sm text-muted-foreground mb-6 max-w-3xl">
        Manage users in Atlassian apps from one place, your identity provider. Set up single sign-on and user sync after you connect your identity provider.{" "}
        <a href="" onClick={(e) => e.preventDefault()} className="text-blue-600 hover:underline">Explore identity providers</a>
      </p>

      <h2 className="text-base font-semibold mb-4">Choose an identity provider</h2>

      <div className="grid grid-cols-4 gap-4">
        {providers.map((provider) => (
          <div key={provider.name} className="rounded-lg border p-4 hover:bg-accent/50 cursor-pointer transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="size-10 rounded flex items-center justify-center overflow-hidden">
                {provider.icon}
              </div>
              {provider.action && (
                <span className="text-sm font-medium text-blue-600">{provider.action}</span>
              )}
            </div>
            <h3 className="text-sm font-semibold mb-1">{provider.name}</h3>
            {provider.description && (
              <p className="text-xs text-muted-foreground">{provider.description}</p>
            )}
            {provider.guardRequired && (
              <p className="text-xs text-blue-600">
                Requires an Atlassian Guard subscription
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
