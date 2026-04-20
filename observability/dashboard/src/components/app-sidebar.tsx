"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BellRing,
  BookOpen,
  Boxes,
  FileLock2,
  FlaskConical,
  Home,
  KeyRound,
  LifeBuoy,
  MessagesSquare,
  Settings,
  Users,
  Webhook,
} from "lucide-react";
import { OrgSwitcher, type OrgSwitcherItem } from "@/components/org-switcher";
import { UserMenu } from "@/components/user-menu";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface AppSidebarProps {
  org: OrgSwitcherItem;
  orgs: OrgSwitcherItem[];
  projectSlug?: string;
}

export function AppSidebar({ org, orgs, projectSlug }: AppSidebarProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const activeProjectSlug =
    segments.length >= 2 && segments[0] === org.slug ? segments[1] : projectSlug;
  const base = `/${org.slug}`;
  const projectBase = activeProjectSlug ? `${base}/${activeProjectSlug}` : null;

  const topLinks = [
    { href: `${base}`, label: "Overview", icon: Home },
    ...(projectBase
      ? [
          { href: `${projectBase}/traces`, label: "Traces", icon: Activity },
          { href: `${projectBase}/threads`, label: "Threads", icon: MessagesSquare },
          { href: `${projectBase}/metrics`, label: "Metrics", icon: BarChart3 },
          { href: `${projectBase}/monitors`, label: "Monitors", icon: BellRing },
          { href: `${projectBase}/incidents`, label: "Incidents", icon: AlertTriangle },
          { href: `${projectBase}/clusters`, label: "Clusters", icon: Boxes },
          { href: `${projectBase}/experiments`, label: "Experiments", icon: FlaskConical },
        ]
      : []),
  ];

  const settingsLinks = projectBase
    ? [
        { href: `${projectBase}/settings/keys`, label: "API keys", icon: KeyRound },
        { href: `${projectBase}/settings/members`, label: "Members", icon: Users },
        { href: `${projectBase}/settings/webhooks`, label: "Webhooks", icon: Webhook },
        { href: `${projectBase}/settings/data-retention`, label: "Retention", icon: FileLock2 },
        { href: `${projectBase}/settings/billing`, label: "Billing", icon: Settings },
      ]
    : [];

  return (
    <>
      <div className="sticky top-0 z-30 border-b bg-background md:hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{org.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{org.plan} plan</p>
          </div>
          <OrgSwitcher current={org} orgs={orgs} />
        </div>
        <div className="scrollbar-thin overflow-x-auto px-4 pb-3">
          <div className="flex min-w-max items-center gap-2">
            {topLinks.map((link) => (
              <MobileLink
                key={link.href}
                href={link.href}
                label={link.label}
                icon={link.icon}
                active={isActive(pathname, link.href)}
              />
            ))}
          </div>
        </div>
      </div>

      <aside className="hidden h-dvh w-64 shrink-0 border-r bg-sidebar md:sticky md:top-0 md:flex md:self-start md:flex-col">
        <div className="p-4">
          <div className="mb-4">
            <p className="text-sm font-semibold">Theta Observability</p>
            <p className="text-xs text-muted-foreground">Operational dashboard</p>
          </div>
          <OrgSwitcher current={org} orgs={orgs} />
        </div>
        <Separator />
        <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4">
          <NavSection title="Overview">
            {topLinks.map((link) => (
              <SidebarItem
                key={link.href}
                href={link.href}
                label={link.label}
                icon={link.icon}
                active={isActive(pathname, link.href)}
              />
            ))}
          </NavSection>

          {settingsLinks.length > 0 && (
            <NavSection title="Settings">
              {settingsLinks.map((link) => (
                <SidebarItem
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  icon={link.icon}
                  active={isActive(pathname, link.href)}
                />
              ))}
            </NavSection>
          )}
        </nav>
        <Separator />
        <div className="space-y-4 p-4">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Link href="/docs" className="inline-flex items-center gap-1.5 hover:text-foreground">
              <BookOpen className="size-3.5" />
              Docs
            </Link>
            <Link
              href="mailto:support@theta.dev"
              className="inline-flex items-center gap-1.5 hover:text-foreground"
            >
              <LifeBuoy className="size-3.5" />
              Support
            </Link>
          </div>
          <UserMenu />
        </div>
      </aside>
    </>
  );
}

function NavSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <p className="mb-2 px-2 text-xs font-medium text-muted-foreground">{title}</p>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

function SidebarItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors",
        active
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <Icon className="size-4" />
      <span>{label}</span>
    </Link>
  );
}

function MobileLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs",
        active
          ? "border-transparent bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </Link>
  );
}

function isActive(pathname: string, href: string) {
  if (href.endsWith("/traces")) return pathname.startsWith(href);
  if (href.endsWith("/threads")) return pathname.startsWith(href);
  if (href.endsWith("/metrics")) return pathname.startsWith(href);
  if (href.endsWith("/monitors")) return pathname.startsWith(href);
  if (href.endsWith("/incidents")) return pathname.startsWith(href);
  if (href.endsWith("/clusters")) return pathname.startsWith(href);
  if (href.endsWith("/experiments")) return pathname.startsWith(href);
  if (href.includes("/settings/")) return pathname === href;
  return pathname === href;
}
