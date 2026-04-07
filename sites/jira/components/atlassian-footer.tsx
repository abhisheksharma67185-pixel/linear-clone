import Link from "next/link"

const companyLinks = [
  { label: "Company", href: "#" },
  { label: "Careers", href: "#" },
  { label: "Events", href: "#" },
  { label: "Blogs", href: "#" },
  { label: "Investor Relations", href: "#" },
  { label: "Atlassian Foundation", href: "#" },
  { label: "Press kit", href: "#" },
  { label: "Contact us", href: "#" },
]

const productLinks = [
  { label: "Rovo", href: "#" },
  { label: "Jira", href: "/dashboard" },
  { label: "Jira Align", href: "#" },
  { label: "Jira Service Management", href: "#" },
  { label: "Confluence", href: "#" },
  { label: "Loom", href: "#" },
  { label: "Trello", href: "#" },
  { label: "Bitbucket", href: "#" },
]

const resourceLinks = [
  { label: "Technical support", href: "#" },
  { label: "Purchasing & licensing", href: "#" },
  { label: "Atlassian Community", href: "#" },
  { label: "Knowledge base", href: "#" },
  { label: "Marketplace", href: "#" },
  { label: "My account", href: "#" },
]

const learnLinks = [
  { label: "Partners", href: "#" },
  { label: "Training & certification", href: "#" },
  { label: "Documentation", href: "#" },
  { label: "Developer resources", href: "#" },
  { label: "Enterprise services", href: "#" },
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
      <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#253858]">
        {title}
      </h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm font-medium text-[#253858] hover:text-[#0052CC] hover:underline transition-colors"
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
    <footer className="border-t border-[#dfe1e6] bg-[#f4f5f7]">
      {/* Main footer content */}
      <div className="mx-auto max-w-[1200px] px-8 py-12">
        <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] gap-8">
          {/* Atlassian logo + Company links */}
          <div>
            {/* Atlassian logo mark */}
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
                    className="text-sm font-semibold text-[#253858] hover:text-[#0052CC] hover:underline transition-colors"
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
            seeAll={{ label: "See all products", href: "#" }}
          />
          <FooterColumn
            title="Resources"
            links={resourceLinks}
            seeAll={{ label: "Create support ticket", href: "#" }}
          />
          <FooterColumn
            title="Learn"
            links={learnLinks}
            seeAll={{ label: "See all resources", href: "#" }}
          />

          {/* Empty column for spacing like the real site */}
          <div />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#dfe1e6]">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-8 py-4">
          <p className="text-xs text-[#6B778C]">Copyright &copy; 2026 Atlassian</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-xs text-[#6B778C] hover:text-[#253858] hover:underline">
              Privacy policy
            </Link>
            <Link href="#" className="text-xs text-[#6B778C] hover:text-[#253858] hover:underline">
              Terms
            </Link>
            <Link href="#" className="text-xs text-[#6B778C] hover:text-[#253858] hover:underline">
              Impressum
            </Link>
            <button className="flex items-center gap-1.5 text-xs text-[#6B778C] hover:text-[#253858]">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              English
              <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
