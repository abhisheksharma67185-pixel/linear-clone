import Link from "next/link"

const companyLinks = [
  { label: "Company", href: "/products" },
  { label: "Careers", href: "/products" },
  { label: "Events", href: "/products" },
  { label: "Blogs", href: "/products" },
  { label: "Investor Relations", href: "/products" },
  { label: "Atlassian Foundation", href: "/products" },
  { label: "Press kit", href: "/products" },
  { label: "Contact us", href: "/admin/settings/contacts" },
]

const productLinks = [
  { label: "Rovo", href: "/products" },
  { label: "Jira", href: "/dashboard" },
  { label: "Jira Align", href: "/products" },
  { label: "Jira Service Management", href: "/products" },
  { label: "Confluence", href: "/products" },
  { label: "Loom", href: "/products" },
  { label: "Trello", href: "/products" },
  { label: "Bitbucket", href: "/products" },
]

const resourceLinks = [
  { label: "Technical support", href: "/admin" },
  { label: "Purchasing & licensing", href: "/admin/billing" },
  { label: "Atlassian Community", href: "/teams" },
  { label: "Knowledge base", href: "/products" },
  { label: "Marketplace", href: "/home/apps" },
  { label: "My account", href: "/home/account-settings" },
]

const learnLinks = [
  { label: "Partners", href: "/products" },
  { label: "Training & certification", href: "/products" },
  { label: "Documentation", href: "/products" },
  { label: "Developer resources", href: "/products" },
  { label: "Enterprise services", href: "/products" },
]

function FooterColumn({
  title,
  links,
  seeAll,
}: {
  title: string
  links: { label: string; href: string }[]
  seeAll?: { label: string; href: string }
}) {
  return (
    <div>
      <h3 className="mb-4 text-xs font-bold tracking-wider text-slate-800 uppercase">
        {title}
      </h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm font-medium text-slate-800 transition-colors hover:text-slate-600"
            >
              {link.label}
            </Link>
          </li>
        ))}
        {seeAll && (
          <li className="pt-1">
            <Link
              href={seeAll.href}
              className="text-sm font-medium text-[#0052CC] hover:underline"
            >
              {seeAll.label} →
            </Link>
          </li>
        )}
      </ul>
    </div>
  )
}

export function AtlassianFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-100">
      {/* Main footer content */}
      <div className="mx-auto max-w-[1200px] px-8 py-12">
        <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] gap-8">
          {/* Atlassian logo + Company links */}
          <div>
            <div className="mb-6">
              <svg className="h-7 w-7" viewBox="0 0 32 32" fill="#2684FF">
                <path
                  d="M10.543 18.17a.86.86 0 0 0-1.478.147L4.076 28.204A.86.86 0 0 0 4.85 29.5h7.956a.86.86 0 0 0 .774-.491c1.806-3.763.62-8.928-3.037-10.839z"
                  opacity="0.7"
                />
                <path d="M15.593 3.09a14.58 14.58 0 0 0-.98 14.79l4.56 9.13a.86.86 0 0 0 1.538 0l5.213-10.42a.86.86 0 0 0 0-.77L18.67 3.09a1.63 1.63 0 0 0-3.076 0z" />
              </svg>
            </div>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm font-semibold text-slate-800 transition-colors hover:text-slate-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <FooterColumn
            title="Products"
            links={productLinks}
            seeAll={{ label: "See all products", href: "/products" }}
          />
          <FooterColumn
            title="Resources"
            links={resourceLinks}
            seeAll={{ label: "Create support ticket", href: "/admin" }}
          />
          <FooterColumn
            title="Learn"
            links={learnLinks}
            seeAll={{ label: "See all resources", href: "/products" }}
          />

          {/* Empty column for spacing */}
          <div />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-200">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-8 py-4">
          <p className="text-xs text-slate-500">
            Copyright &copy; 2026 Atlassian
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/admin/security"
              className="text-xs text-slate-500 transition-colors hover:text-slate-700"
            >
              Privacy policy
            </Link>
            <Link
              href="/admin/settings"
              className="text-xs text-slate-500 transition-colors hover:text-slate-700"
            >
              Terms
            </Link>
            <Link
              href="/products"
              className="text-xs text-slate-500 transition-colors hover:text-slate-700"
            >
              Impressum
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center gap-1.5 text-xs text-slate-500 transition-colors hover:text-slate-700"
            >
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              English
              <svg
                className="size-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
