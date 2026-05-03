"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"
import { use, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { NativeSelect } from "@/components/ui/native-select"
import { Switch } from "@/components/ui/switch"
import { Kbd } from "@/components/ui/kbd"
import { cn } from "@/lib/utils"
import {
  AdkLogo,
  AikidoLogo,
  AirbyteLogo,
  ArcLogo,
  AtlasSupportLogo,
  AxoloLogo,
  BirdEatsBugLogo,
  CannyLogo,
  CanvaLogo,
  CapybaraLogo,
  CharlieLogo,
  ClaapLogo,
  ChatPrdLogo,
  CirclebackLogo,
  ClaudeLogo,
  CloudbackLogo,
  CodaLogo,
  CopilotLogo,
  CursorLogo,
  CycleReportLogo,
  DatadogLogo,
  DescriptLogo,
  DevinLogo,
  DrataLogo,
  DiscordLogo,
  DustLogo,
  EmailIntakeLogo,
  FactoryLogo,
  FencerLogo,
  FigmaLogo,
  FivetranLogo,
  FrontLogo,
  GitHubLogo,
  GitLabLogo,
  GleanLogo,
  GoogleSheetsLogo,
  HoneybadgerLogo,
  IncidentIoLogo,
  IndexLogo,
  IntercomLogo,
  JamLogo,
  JellyfishLogo,
  JiraLogo,
  KawachLogo,
  LinearAsksLogo,
  LoomLogo,
  MicrosoftTeamsLogo,
  MiroLogo,
  NotionLogo,
  OpenAILogo,
  OrcaSecurityLogo,
  PagerDutyLogo,
  ProductlaneLogo,
  RangeLogo,
  RaycastLogo,
  ReplitLogo,
  RetoolLogo,
  SalesforceLogo,
  ScreenpressoLogo,
  SecureSlateLogo,
  SentryLogo,
  SlackLogo,
  SpanLogo,
  TellaLogo,
  V0Logo,
  VantaLogo,
  VercelLogo,
  VSCodeLogo,
  WindsurfLogo,
  YouTubeLogo,
  ZapierLogo,
  ZendeskLogo,
} from "@/components/provider-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  Shield01Icon,
  Link01Icon,
  PlusSignIcon,
  PuzzleIcon,
  Book02Icon,
  Mail01Icon,
  GlobeIcon,
} from "@hugeicons/core-free-icons"

function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ")
}

// Back link that uses browser history when available so the previous
// settings scroll position is preserved. Falls back to the integrations
// route on direct navigation (e.g. opened in a new tab).
function BackToIntegrationsLink({
  label = "Integrations",
}: {
  label?: string
}) {
  const router = useRouter()
  return (
    <Link
      href="/settings?section=integrations"
      scroll={false}
      onClick={(e) => {
        if (
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey ||
          e.button !== 0
        ) {
          return
        }
        // Go back via browser history when possible so the previous
        // settings scroll position is restored. Falls through to the href
        // (full client-side navigation to /settings?section=integrations)
        // on direct loads / new-tab opens.
        if (typeof window !== "undefined" && window.history.length > 1) {
          e.preventDefault()
          router.back()
        }
      }}
      className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1.5 text-xs"
      aria-label="Back to integrations"
    >
      <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
      {label}
    </Link>
  )
}

export default function IntegrationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)

  if (slug === "github" || slug === "github-eng" || slug === "github-lc") {
    return <GitHubIntegrationDetail />
  }

  if (slug === "slack" || slug === "slack-lc" || slug === "slack-co") {
    return <SlackIntegrationDetail />
  }

  if (slug === "gitlab" || slug === "gitlab-eng" || slug === "gitlab-lc") {
    return <GitLabIntegrationDetail />
  }

  if (slug === "figma" || slug === "figma-md") {
    return <FigmaIntegrationDetail />
  }

  if (slug === "canva") {
    return <CanvaIntegrationDetail />
  }

  if (slug === "claap") {
    return <ClaapIntegrationDetail />
  }

  if (slug === "descript") {
    return <DescriptIntegrationDetail />
  }

  if (slug === "intercom" || slug === "intercom-cx") {
    return <IntercomIntegrationDetail />
  }

  if (slug === "zendesk") {
    return <ZendeskIntegrationDetail />
  }

  if (slug === "front") {
    return <FrontIntegrationDetail />
  }

  if (slug === "canny") {
    return <CannyIntegrationDetail />
  }

  if (slug === "productlane" || slug === "productlane-co") {
    return <ProductlaneIntegrationDetail />
  }

  if (slug === "index") {
    return <IndexIntegrationDetail />
  }

  if (slug === "salesforce") {
    return <SalesforceIntegrationDetail />
  }

  if (slug === "atlas") {
    return <AtlasSupportIntegrationDetail />
  }

  if (slug === "gsheets" || slug === "gsheets-an") {
    return <GoogleSheetsIntegrationDetail />
  }

  if (slug === "airbyte") {
    return <AirbyteIntegrationDetail />
  }

  if (slug === "retool") {
    return <RetoolIntegrationDetail />
  }

  if (slug === "span") {
    return <SpanIntegrationDetail />
  }

  if (slug === "jellyfish") {
    return <JellyfishIntegrationDetail />
  }

  if (slug === "coda") {
    return <CodaIntegrationDetail />
  }

  if (slug === "cyclereport") {
    return <CycleReportIntegrationDetail />
  }

  if (slug === "aikido") {
    return <AikidoIntegrationDetail />
  }

  if (slug === "cloudback") {
    return <CloudbackIntegrationDetail />
  }

  if (slug === "drata") {
    return <DrataIntegrationDetail />
  }

  if (slug === "fencer") {
    return <FencerIntegrationDetail />
  }

  if (slug === "secureslate") {
    return <SecureSlateIntegrationDetail />
  }

  if (slug === "vanta") {
    return <VantaIntegrationDetail />
  }

  if (slug === "kawach") {
    return <KawachIntegrationDetail />
  }

  if (slug === "orca") {
    return <OrcaSecurityIntegrationDetail />
  }

  if (slug === "codex") {
    return <CodexIntegrationDetail />
  }

  if (slug === "cursor") {
    return <CursorIntegrationDetail />
  }

  if (slug === "copilot") {
    return <CopilotIntegrationDetail />
  }

  if (slug === "factory") {
    return <FactoryIntegrationDetail />
  }

  if (slug === "sentry-ag") {
    return <SentryAgentIntegrationDetail />
  }

  if (slug === "devin") {
    return <DevinIntegrationDetail />
  }

  if (slug === "chatprd") {
    return <ChatPrdIntegrationDetail />
  }

  if (slug === "charlie") {
    return <CharlieIntegrationDetail />
  }

  if (slug === "cursor-mcp") {
    return <CursorMcpIntegrationDetail />
  }

  if (slug === "chatgpt") {
    return <ChatGptIntegrationDetail />
  }

  if (slug === "claude-ai") {
    return <ClaudeIntegrationDetail />
  }

  if (slug === "v0") {
    return <V0IntegrationDetail />
  }

  if (slug === "windsurf") {
    return <WindsurfIntegrationDetail />
  }

  if (slug === "replit") {
    return <ReplitIntegrationDetail />
  }

  if (slug === "dust") {
    return <DustIntegrationDetail />
  }

  if (slug === "adk") {
    return <AdkIntegrationDetail />
  }

  if (slug === "pagerduty" || slug === "pagerduty-lc") {
    return <PagerDutyIntegrationDetail />
  }

  if (slug === "sentry-eng") {
    return <SentryIntegrationDetail />
  }

  if (slug === "vscode") {
    return <VSCodeIntegrationDetail />
  }

  if (slug === "datadog") {
    return <DatadogIntegrationDetail />
  }

  if (slug === "incidentio") {
    return <IncidentIoIntegrationDetail />
  }

  if (slug === "raycast" || slug === "raycast-eng" || slug === "raycast-au") {
    return <RaycastIntegrationDetail />
  }

  if (
    slug === "linear-asks" ||
    slug === "linear-asks-br" ||
    slug === "linear-asks-co"
  ) {
    return <LinearAsksIntegrationDetail />
  }

  if (slug === "notion" || slug === "notion-lc" || slug === "notion-co") {
    return <NotionIntegrationDetail />
  }

  if (slug === "zapier" || slug === "zapier-lc" || slug === "zapier-au") {
    return <ZapierIntegrationDetail />
  }

  if (slug === "birdeats") {
    return <BirdEatsBugIntegrationDetail />
  }

  if (slug === "honeybadger") {
    return <HoneybadgerIntegrationDetail />
  }

  if (slug === "jam") {
    return <JamIntegrationDetail />
  }

  if (slug === "vercel-br") {
    return <VercelIntegrationDetail />
  }

  if (slug === "arc") {
    return <ArcIntegrationDetail />
  }

  if (slug === "email-au") {
    return <CreateIssuesViaEmailIntegrationDetail />
  }

  if (slug === "jira-au" || slug === "jira") {
    return <JiraIntegrationDetail />
  }

  if (slug === "fivetran" || slug === "fivetran-an") {
    return <FivetranIntegrationDetail />
  }

  if (slug === "axolo") {
    return <AxoloIntegrationDetail />
  }

  if (slug === "capybara") {
    return <CapybaraIntegrationDetail />
  }

  if (slug === "circleback") {
    return <CirclebackIntegrationDetail />
  }

  if (slug === "msteams") {
    return <MicrosoftTeamsIntegrationDetail />
  }

  if (slug === "discord") {
    return <DiscordIntegrationDetail />
  }

  if (slug === "glean") {
    return <GleanIntegrationDetail />
  }

  if (slug === "range") {
    return <RangeIntegrationDetail />
  }

  if (slug === "loom") {
    return <LoomIntegrationDetail />
  }

  if (slug === "miro") {
    return <MiroIntegrationDetail />
  }

  if (slug === "screenpresso") {
    return <ScreenpressoIntegrationDetail />
  }

  if (slug === "tella") {
    return <TellaIntegrationDetail />
  }

  if (slug === "youtube") {
    return <YouTubeIntegrationDetail />
  }

  return <GenericIntegrationDetail slug={slug} />
}

// ---------------------------------------------------------------------------
// GitHub-specific rich detail view (matches the production Linear design):
// header with logo + Built-by/Docs/Enable rail, two screenshot tiles, an
// Overview block with Read more, and the Connected organizations + Personal
// GitHub account rows beneath.
// ---------------------------------------------------------------------------
function GitHubIntegrationDetail() {
  const [orgsOpen, setOrgsOpen] = useState(false)
  const [overviewExpanded, setOverviewExpanded] = useState(false)
  const [issuesOpen, setIssuesOpen] = useState(false)
  const [branchFormat, setBranchFormat] = useState("username/identifier-title")
  const [privateRepos, setPrivateRepos] = useState(true)
  const [publicRepos, setPublicRepos] = useState(false)
  const [includeDescriptions, setIncludeDescriptions] = useState(true)
  const [magicWords, setMagicWords] = useState(false)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#24292e]">
          <GitHubLogo className="size-7 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">GitHub</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Automate your pull request and commit workflows and keep issues
            synced both ways
          </p>
        </div>
      </header>

      {/* Built by / Docs / Enable rail */}
      <div className="bg-card flex flex-wrap items-start justify-between gap-4 rounded-lg border p-4">
        <div className="flex gap-8">
          <div>
            <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Built by
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
              <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
              Linear
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Docs
            </div>
            <a
              href="https://linear.app/docs/github"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub integration docs (opens in new tab)"
              className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
            >
              <HugeiconsIcon icon={Book02Icon} className="size-3.5" />
              Docs
            </a>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => toast.info("GitHub OAuth connect flow coming soon")}
          aria-label="Enable GitHub integration"
        >
          <HugeiconsIcon icon={PuzzleIcon} className="size-3.5" />
          Enable
        </Button>
      </div>

      {/* Overview */}
      <section>
        <h2 className="text-sm font-semibold">Overview</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          Linear&apos;s GitHub integration keeps your work in sync in both
          applications. It links issues to Pull Requests and commits so that
          issues update automatically from <em>In Progress</em> to <em>Done</em>{" "}
          as the PR moves from drafted to merged — there is no need to update
          the issue in Linear at all.
        </p>
        {overviewExpanded ? (
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Branch names can be copied with a single keystroke from the issue
            command menu (⌘K → &lsquo;git&rsquo;), and any commit message that
            references an issue ID will appear in the issue&apos;s activity
            feed. Reviewers can move issues across statuses without leaving
            GitHub.
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => setOverviewExpanded((v) => !v)}
          className="text-muted-foreground hover:text-foreground mt-2 text-xs"
          aria-expanded={overviewExpanded}
        >
          {overviewExpanded ? "Show less" : "Read more"}
        </button>
      </section>

      {/* Connected organizations */}
      <Collapsible open={orgsOpen} onOpenChange={setOrgsOpen}>
        <CollapsibleTrigger
          className="bg-card hover:border-foreground/20 flex w-full items-center justify-between rounded-lg border p-4 text-left transition-colors"
          aria-label="Connected organizations"
        >
          <span className="text-sm font-medium">Connected organizations</span>
          <HugeiconsIcon
            icon={PlusSignIcon}
            className="text-muted-foreground size-4"
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="bg-card mt-2 rounded-lg border p-4">
          <p className="text-muted-foreground text-xs">
            No GitHub organizations are connected to this workspace yet. Enable
            the integration above to link an organization.
          </p>
        </CollapsibleContent>
      </Collapsible>

      {/* Personal GitHub account row */}
      <Link
        href="/settings?section=connected-accounts"
        scroll={false}
        className="bg-card hover:border-foreground/20 flex items-center justify-between rounded-lg border p-4 transition-colors"
        aria-label="Personal GitHub account: not connected. Manage connected accounts."
      >
        <span className="text-sm">Personal GitHub account not connected</span>
        <span className="text-muted-foreground flex items-center gap-1 text-xs">
          Connected accounts
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
        </span>
      </Link>

      {/* GitHub Issues collapsible */}
      <Collapsible open={issuesOpen} onOpenChange={setIssuesOpen}>
        <CollapsibleTrigger
          className="bg-card hover:border-foreground/20 group flex w-full items-start justify-between gap-4 rounded-lg border p-4 text-left transition-colors"
          aria-label="GitHub Issues sync"
        >
          <div className="min-w-0">
            <div className="text-sm font-medium">GitHub Issues</div>
            <p className="text-muted-foreground mt-1 text-xs leading-5">
              Automatically create issues and sync properties from GitHub
              repositories into Linear teams
            </p>
          </div>
          <HugeiconsIcon
            icon={PlusSignIcon}
            className="text-muted-foreground mt-0.5 size-4 shrink-0"
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="bg-card mt-2 rounded-lg border p-4">
          <p className="text-muted-foreground text-xs">
            Connect a GitHub organization above to configure repository → team
            mappings.
          </p>
        </CollapsibleContent>
      </Collapsible>

      {/* Branch format */}
      <section className="bg-card rounded-lg border p-4">
        <div className="text-sm font-medium">Branch format</div>
        <p className="text-muted-foreground mt-1 text-xs leading-5">
          Linear helps you keep your git branch names aligned across your entire
          organization. Users can copy a git branch name for their issue using
          the{" "}
          <span className="text-foreground font-medium">
            Copy git branch name
          </span>{" "}
          action (
          <span className="ml-0.5 inline-flex items-center gap-1 align-middle">
            <Kbd>⌘</Kbd>
            <Kbd>⇧</Kbd>
            <Kbd>.</Kbd>
          </span>
          ).
        </p>
        <div className="mt-4 flex items-center justify-between">
          <label htmlFor="github-branch-format" className="text-sm font-medium">
            Format
          </label>
          <NativeSelect
            id="github-branch-format"
            value={branchFormat}
            onChange={(e) => setBranchFormat(e.target.value)}
            aria-label="Branch name format"
            className="min-w-[220px]"
          >
            <option value="username/identifier-title">
              username/identifier-title
            </option>
            <option value="identifier-title">identifier-title</option>
            <option value="identifier">identifier</option>
            <option value="team/identifier-title">team/identifier-title</option>
          </NativeSelect>
        </div>
      </section>

      {/* Linkbacks */}
      <section className="bg-card rounded-lg border p-4">
        <div className="text-sm font-medium">Linkbacks</div>
        <p className="text-muted-foreground mt-1 text-xs leading-5">
          Automatically comment in GitHub with a link to the Linear issue.
          Private team issue titles will not be included in the comment.
        </p>
        <div className="mt-4 space-y-3">
          <ToggleRow
            id="github-linkbacks-private"
            label="Private repositories"
            checked={privateRepos}
            onCheckedChange={setPrivateRepos}
          />
          <ToggleRow
            id="github-linkbacks-public"
            label="Public repositories"
            checked={publicRepos}
            onCheckedChange={setPublicRepos}
          />
          <ToggleRow
            id="github-linkbacks-descriptions"
            label="Include issue descriptions in linkbacks"
            checked={includeDescriptions}
            onCheckedChange={setIncludeDescriptions}
          />
        </div>
      </section>

      {/* Magic words */}
      <section className="bg-card rounded-lg border p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-sm font-medium">
              Link commits to issues with magic words
            </div>
            <p className="text-muted-foreground mt-1 text-xs leading-5">
              Include magic words in your commit messages to link GitHub commits
              to Linear issues. For example: &lsquo;Fixes ID-123&rsquo; or
              &lsquo;Part of ID-123&rsquo;.{" "}
              <a
                href="https://linear.app/docs/github#magic-words"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:underline"
                aria-label="Read more about magic words (opens in new tab)"
              >
                Read more
                <HugeiconsIcon
                  icon={ArrowUpRight01Icon}
                  className="ml-0.5 inline size-3 align-[-1px]"
                />
              </a>
            </p>
          </div>
          <Switch
            id="github-magic-words"
            checked={magicWords}
            onCheckedChange={setMagicWords}
            aria-label="Enable magic words"
          />
        </div>
      </section>
    </div>
  )
}

function ToggleRow({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string
  label: string
  checked: boolean
  onCheckedChange: (next: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <label htmlFor={id} className="text-sm">
        {label}
      </label>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label={label}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Slack-specific rich detail view. Mirrors the production layout: header +
// Built-by / Docs / Enable rail, two illustrated screenshot tiles, Overview,
// the Personal Slack account row, a Connections section with Connected
// workspaces, and the multi-row Settings group (Linkbacks, Unfurls, Issue
// templates, Project channels) followed by Linear Agent feature toggles.
// ---------------------------------------------------------------------------
function SlackIntegrationDetail() {
  const [overviewExpanded, setOverviewExpanded] = useState(false)
  const [workspacesOpen, setWorkspacesOpen] = useState(false)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white">
          <SlackLogo className="size-8" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">Slack</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Create issues from Slack messages and sync threads
          </p>
        </div>
      </header>

      {/* Built by / Docs / Enable rail */}
      <div className="bg-card flex flex-wrap items-start justify-between gap-4 rounded-lg border p-4">
        <div className="flex gap-8">
          <div>
            <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Built by
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
              <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
              Linear
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Docs
            </div>
            <a
              href="https://linear.app/docs/slack"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Slack integration docs (opens in new tab)"
              className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
            >
              <HugeiconsIcon icon={Book02Icon} className="size-3.5" />
              Docs
            </a>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => toast.info("Slack OAuth connect flow coming soon")}
          aria-label="Enable Slack integration"
        >
          <HugeiconsIcon icon={PuzzleIcon} className="size-3.5" />
          Enable
        </Button>
      </div>

      {/* Overview */}
      <section>
        <h2 className="text-sm font-semibold">Overview</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          The Slack integration makes it easy to create, update, and view Linear
          issues from Slack. Notifications and synced threads keep colleagues in
          the loop on projects and issues.
        </p>
        {overviewExpanded ? (
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Mention <span className="font-medium">@Linear</span> in any channel
            to triage on the spot, sync a thread to an issue&apos;s comments, or
            create a new issue directly from a message&apos;s actions menu.
            Linkbacks reply with rich previews so context never has to leave the
            conversation.
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => setOverviewExpanded((v) => !v)}
          className="text-muted-foreground hover:text-foreground mt-2 text-xs"
          aria-expanded={overviewExpanded}
        >
          {overviewExpanded ? "Show less" : "Read more"}
        </button>
      </section>

      {/* Personal Slack account */}
      <Link
        href="/settings?section=connected-accounts"
        scroll={false}
        className="bg-card hover:border-foreground/20 flex items-center justify-between rounded-lg border p-4 transition-colors"
        aria-label="Personal Slack account: not connected. Manage connected accounts."
      >
        <span className="text-sm">Personal Slack account not connected</span>
        <span className="text-muted-foreground flex items-center gap-1 text-xs">
          Connected accounts
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
        </span>
      </Link>

      {/* Connections */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">Connections</h2>
        <Collapsible open={workspacesOpen} onOpenChange={setWorkspacesOpen}>
          <CollapsibleTrigger
            className="bg-card hover:border-foreground/20 flex w-full items-center justify-between rounded-lg border p-4 text-left transition-colors"
            aria-label="Connected workspaces"
          >
            <span className="text-sm font-medium">Connected workspaces</span>
            <HugeiconsIcon
              icon={PlusSignIcon}
              className="text-muted-foreground size-4"
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="bg-card mt-2 rounded-lg border p-4">
            <p className="text-muted-foreground text-xs">
              No Slack workspaces are connected yet. Enable the integration
              above to add one.
            </p>
          </CollapsibleContent>
        </Collapsible>
      </section>

      {/* Settings */}
      <section className="flex flex-col gap-5">
        <div>
          <h2 className="text-sm font-semibold">Settings</h2>
          <p className="text-muted-foreground mt-2 text-xs leading-5">
            To better keep your team aware of changes in Linear, you can connect
            Linear teams to specific Slack channels. Go to
            &ldquo;Notifications&rdquo; in team&apos;s settings to set up Slack
            notifications.
          </p>
        </div>

        <SlackSettingRow
          title="Linkbacks"
          description={
            <>
              Automatically reply to a thread with a link to the Linear issue
              when its issue identifier is mentioned in a Slack channel the
              Linear bot is a member of. We&apos;ll only link the issue once
              every 60 minutes per Slack thread. Issues in private teams will
              not be linked.
            </>
          }
        />

        <SlackSettingRow
          title="Unfurls"
          description={
            <>
              Show expanded previews of issues, comments, documents and more
              when shared in Slack. Allow taking actions from issue unfurl menus
              in Slack where available like syncing threads, commenting or
              assigning to yourself. Links from private teams will not be
              unfurled. Disable unfurling if you are linking a public Slack
              workspace.
            </>
          }
        />

        <SlackSettingRow
          title="Issue templates available in Slack"
          description="Add team or workspace issue templates to make them available in Slack"
        />

        <SlackSettingRow
          title="Project channels"
          description="Automatically create a Slack channel when a new project is created. Project members will be invited to the channel and receive project updates."
        />
      </section>

      {/* Linear Agent */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold">Linear Agent</h2>
          <p className="text-muted-foreground mt-2 text-xs leading-5">
            Linear Agent uses AI to create issues from Slack messages. Once
            enabled, you can mention{" "}
            <span className="text-foreground font-medium">@Linear</span> in
            channels or threads, or DM it directly to search issues, create new
            ones, and get help with your workspace.
          </p>
        </div>

        <SlackFeatureRow
          title="Code Intelligence"
          description="Allow Linear Agent to analyze code and answer questions about your repositories when triggered in this Slack workspace"
        />
        <SlackFeatureRow
          title="Slack workflow access"
          description="Allow Linear Agent to act with workspace-wide access to non-private team data when triggered by Slack workflows"
        />
        <SlackFeatureRow
          title="Workspace guidance"
          description="Guide how Linear Agent creates issues by providing instructions or examples. You can also @mention teams, people, or link to docs for reference."
        />

        <div className="bg-muted/30 text-muted-foreground rounded-lg border border-dashed p-4 text-xs">
          Linear Agent is not enabled for any Slack workspace.
        </div>
      </section>
    </div>
  )
}

function SlackSettingRow({
  title,
  description,
}: {
  title: string
  description: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <div className="text-sm font-medium">{title}</div>
        <p className="text-muted-foreground mt-1 text-xs leading-5">
          {description}
        </p>
      </div>
      <div className="bg-muted/30 text-muted-foreground rounded-lg border border-dashed p-4 text-xs">
        No Slack workspaces connected
      </div>
    </div>
  )
}

function SlackFeatureRow({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div>
      <div className="text-sm font-medium">{title}</div>
      <p className="text-muted-foreground mt-1 text-xs leading-5">
        {description}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// GitLab-specific rich detail view. Mirrors the production layout: header +
// Built-by / Docs / Enable rail, two illustrated screenshot tiles (Activity
// on the left, ⌘K branch lookup on the right — opposite to GitHub), Overview
// with a longer copy block, and Branch format + Linkbacks settings (where
// the private toggle is split as "Private/Internal" to match GitLab's
// repository visibility model).
// ---------------------------------------------------------------------------
function GitLabIntegrationDetail() {
  const [overviewExpanded, setOverviewExpanded] = useState(false)
  const [branchFormat, setBranchFormat] = useState("username/identifier-title")
  const [privateRepos, setPrivateRepos] = useState(true)
  const [publicRepos, setPublicRepos] = useState(false)
  const [includeDescriptions, setIncludeDescriptions] = useState(true)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl">
          <GitLabLogo className="size-12" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">GitLab</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Automate your Merge Request workflow
          </p>
        </div>
      </header>

      {/* Built by / Docs / Enable rail */}
      <div className="bg-card flex flex-wrap items-start justify-between gap-4 rounded-lg border p-4">
        <div className="flex gap-8">
          <div>
            <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Built by
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
              <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
              Linear
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Docs
            </div>
            <a
              href="https://linear.app/docs/gitlab"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitLab integration docs (opens in new tab)"
              className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
            >
              <HugeiconsIcon icon={Book02Icon} className="size-3.5" />
              Docs
            </a>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => toast.info("GitLab OAuth connect flow coming soon")}
          aria-label="Enable GitLab integration"
        >
          <HugeiconsIcon icon={PuzzleIcon} className="size-3.5" />
          Enable
        </Button>
      </div>

      {/* Screenshot tiles — Activity LEFT, ⌘K RIGHT (opposite of GitHub) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div
          aria-hidden
          className="flex aspect-[4/3] items-center justify-center rounded-lg border bg-gradient-to-br from-blue-500/30 via-pink-400/25 to-orange-400/30"
        >
          <div className="bg-background/80 rounded-md border px-3 py-2 text-[10px] shadow-sm">
            <div className="text-muted-foreground flex items-center justify-between border-b pb-1">
              <span>#1400 GraphQL execution failed: ViewPreferencesCreate</span>
              <span>3 minutes ago</span>
            </div>
            <div className="mt-1 font-medium">Activity</div>
            <div className="text-muted-foreground mt-1 space-y-0.5 leading-tight">
              <div>paco created the issue · 2 months ago</div>
              <div>
                GitLab changed status from{" "}
                <span className="text-foreground">Todo</span> →{" "}
                <span className="text-foreground">In Progress</span>
              </div>
              <div>
                GitLab changed status from{" "}
                <span className="text-foreground">In Progress</span> →{" "}
                <span className="text-foreground">In Review</span>
              </div>
              <div>
                GitLab changed status from{" "}
                <span className="text-foreground">In Review</span> →{" "}
                <span className="text-foreground">Done</span>
              </div>
            </div>
          </div>
        </div>
        <div
          aria-hidden
          className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-lg border bg-gradient-to-br from-blue-500/30 via-pink-400/25 to-orange-400/30 p-4"
        >
          <div className="flex items-center gap-1">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
            <span className="text-muted-foreground text-[10px]">
              &lsquo;git&rsquo;
            </span>
          </div>
          <div className="bg-background/80 w-3/4 rounded-md border px-3 py-2 text-[10px] shadow-sm">
            <div className="text-muted-foreground">
              Issue · LIN-320 GraphQL execution failed
            </div>
            <div className="mt-1 font-mono text-[11px]">git|</div>
            <div className="text-muted-foreground mt-1 flex items-center justify-between text-[10px]">
              <span>Copy git branch name to clipboard</span>
              <span>⌘ ⇧</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overview */}
      <section className="bg-card rounded-lg border p-5">
        <h2 className="text-sm font-semibold">Overview</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          Our GitLab integration keeps your work in sync in both applications.
          It links issues to Merge Requests so that issues update automatically
          from <em>In Progress</em> to <em>Done</em> as the MR moves from
          drafted to merged – there is no need to update the issue in Linear at
          all. Move even faster by using a keyboard shortcut that creates the
          issue&apos;s git branch name, assigns the issue and moves the issue to{" "}
          <em>In Progress</em> in one step.
        </p>
        {overviewExpanded ? (
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Commit messages that reference an issue ID surface in the
            issue&apos;s activity feed, and the issue automatically subscribes
            reviewers from the MR. Mentions of the issue ID anywhere in the MR
            description add a back-link comment so context never has to leave
            the MR thread.
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => setOverviewExpanded((v) => !v)}
          className="text-muted-foreground hover:text-foreground mt-2 text-xs"
          aria-expanded={overviewExpanded}
        >
          {overviewExpanded ? "Show less" : "Read more"}
        </button>
      </section>

      {/* Branch format */}
      <section className="bg-card rounded-lg border p-4">
        <div className="text-sm font-medium">Branch format</div>
        <p className="text-muted-foreground mt-1 text-xs leading-5">
          Linear helps you keep your git branch names aligned across your entire
          organization. Users can copy a git branch name for their issue using
          the{" "}
          <span className="text-foreground font-medium">
            Copy git branch name
          </span>{" "}
          action (
          <span className="ml-0.5 inline-flex items-center gap-1 align-middle">
            <Kbd>⌘</Kbd>
            <Kbd>⇧</Kbd>
            <Kbd>.</Kbd>
          </span>
          ).
        </p>
        <div className="mt-4 flex items-center justify-between">
          <label htmlFor="gitlab-branch-format" className="text-sm font-medium">
            Format
          </label>
          <NativeSelect
            id="gitlab-branch-format"
            value={branchFormat}
            onChange={(e) => setBranchFormat(e.target.value)}
            aria-label="Branch name format"
            className="min-w-[220px]"
          >
            <option value="username/identifier-title">
              username/identifier-title
            </option>
            <option value="identifier-title">identifier-title</option>
            <option value="identifier">identifier</option>
            <option value="team/identifier-title">team/identifier-title</option>
          </NativeSelect>
        </div>
      </section>

      {/* Linkbacks — note "Private/Internal repositories" (GitLab adds an
          Internal visibility tier between Public and Private) */}
      <section className="bg-card rounded-lg border p-4">
        <div className="text-sm font-medium">Linkbacks</div>
        <p className="text-muted-foreground mt-1 text-xs leading-5">
          Automatically comment in GitLab with a link to the Linear issue.
          Private team issue titles will not be included in the comment.
        </p>
        <div className="mt-4 space-y-3">
          <ToggleRow
            id="gitlab-linkbacks-private"
            label="Private/Internal repositories"
            checked={privateRepos}
            onCheckedChange={setPrivateRepos}
          />
          <ToggleRow
            id="gitlab-linkbacks-public"
            label="Public repositories"
            checked={publicRepos}
            onCheckedChange={setPublicRepos}
          />
          <ToggleRow
            id="gitlab-linkbacks-descriptions"
            label="Include issue descriptions in linkbacks"
            checked={includeDescriptions}
            onCheckedChange={setIncludeDescriptions}
          />
        </div>
      </section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Figma-specific rich detail view. Mirrors the production layout: header +
// Built-by / Docs / Enable rail, two illustrated screenshot tiles (Linear ×
// Figma collision on the left, "Link issues to designs" plugin window on the
// right), Overview, and a single "Linear plugin for Figma" install row that
// deep-links to the Figma plugin store.
// ---------------------------------------------------------------------------
function FigmaIntegrationDetail() {
  const [overviewExpanded, setOverviewExpanded] = useState(false)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white">
          <FigmaLogo className="h-9 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">Figma</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Create and link issues directly from Figma
          </p>
        </div>
      </header>

      {/* Built by / Docs / Enable rail */}
      <div className="bg-card flex flex-wrap items-start justify-between gap-4 rounded-lg border p-4">
        <div className="flex gap-8">
          <div>
            <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Built by
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
              <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
              Linear
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Docs
            </div>
            <a
              href="https://linear.app/docs/figma"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Figma integration docs (opens in new tab)"
              className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
            >
              <HugeiconsIcon icon={Book02Icon} className="size-3.5" />
              Docs
            </a>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => toast.info("Figma OAuth connect flow coming soon")}
          aria-label="Enable Figma integration"
        >
          <HugeiconsIcon icon={PuzzleIcon} className="size-3.5" />
          Enable
        </Button>
      </div>

      {/* Screenshot tiles */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Left tile — Linear × Figma logo collision over an issue list +
            Draft comment card peek. Cream gradient matches the screenshot. */}
        <div
          aria-hidden
          className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border bg-gradient-to-br from-[#f8f0e8] via-[#f3e8de] to-[#ead8c8]"
        >
          <div className="bg-background/80 absolute top-3 right-3 h-1/2 w-1/2 rounded-md border text-[6px] shadow-sm">
            <div className="text-muted-foreground border-b px-1 py-0.5">
              Issues
            </div>
            <div className="text-muted-foreground space-y-0.5 px-1 py-1 leading-tight">
              <div>ENC-201 · Video for changelog</div>
              <div>ENC-202 · Update CTA copy</div>
              <div>ENC-203 · New Icons</div>
              <div>ENC-204 · Improve admin settings</div>
              <div>ENC-205 · Change UI for email digest</div>
            </div>
          </div>
          <div className="bg-background/80 absolute bottom-3 left-3 h-1/2 w-1/2 rounded-md border text-[6px] shadow-sm">
            <div className="text-muted-foreground border-b px-1 py-0.5">
              Draft comment
            </div>
            <div className="text-muted-foreground px-1 py-1 leading-tight">
              This is happening every time when…
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-1">
            <div className="flex size-8 items-center justify-center rounded-md bg-[#5e6ad2] text-xs font-bold text-white">
              L
            </div>
            <div className="flex size-8 items-center justify-center rounded-md bg-white">
              <FigmaLogo className="h-5 w-3" />
            </div>
          </div>
          <span className="absolute right-1/3 bottom-2 rounded bg-emerald-500/90 px-1 py-0.5 text-[7px] font-medium text-white">
            Matt
          </span>
        </div>

        {/* Right tile — "Link issues to designs" header with plugin modal */}
        <div
          aria-hidden
          className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border bg-gradient-to-br from-[#f8f0e8] via-[#f3e8de] to-[#ead8c8]"
        >
          <div className="absolute top-4 left-4 text-xs font-semibold">
            Link issues to designs
          </div>
          <div className="bg-background/85 absolute right-4 bottom-4 w-3/5 rounded-md border text-[6px] shadow-sm">
            <div className="flex items-center justify-between border-b px-1 py-0.5">
              <span className="text-muted-foreground">Create new issue</span>
              <span className="text-muted-foreground">×</span>
            </div>
            <div className="space-y-0.5 px-1 py-1">
              <div className="font-medium">Plugin design</div>
              <div className="text-muted-foreground leading-tight">
                We&apos;re initiating a plugin for Figma and back to start the
                design for it.
              </div>
              <div className="bg-muted/40 mt-1 rounded px-1 py-0.5">
                <span className="text-muted-foreground">Attachment</span>
              </div>
              <div className="mt-1 flex justify-end">
                <span className="rounded bg-indigo-500 px-1.5 py-0.5 font-medium text-white">
                  Create issue
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overview */}
      <section className="bg-card rounded-lg border p-5">
        <h2 className="text-sm font-semibold">Overview</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          Streamline design and development with integrated tooling for Figma.
          Install the Linear plugin for Figma to create and link issues to
          designs. You can also enable embedded previews of your designs in
          Linear issues and documents.
        </p>
        {overviewExpanded ? (
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Once installed, paste a Figma file or frame URL into any Linear
            issue or document to render an interactive preview. Selecting a
            frame in Figma and running the plugin opens a panel that lets you
            attach the selection to an existing issue or create a new one
            without leaving the canvas.
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => setOverviewExpanded((v) => !v)}
          className="text-muted-foreground hover:text-foreground mt-2 text-xs"
          aria-expanded={overviewExpanded}
        >
          {overviewExpanded ? "Show less" : "Read more"}
        </button>
      </section>

      {/* Linear plugin for Figma — install row */}
      <a
        href="https://www.figma.com/community/plugin/856218900471650276/linear"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Install the Linear plugin for Figma (opens in new tab)"
        className="bg-card hover:border-foreground/20 flex items-center justify-between gap-3 rounded-lg border p-4 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="bg-muted/50 flex size-9 shrink-0 items-center justify-center rounded-md border">
            <HugeiconsIcon
              icon={PuzzleIcon}
              className="text-muted-foreground size-4"
            />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium">Linear plugin for Figma</div>
            <div className="text-muted-foreground mt-0.5 text-xs">
              Installed by 0 members
            </div>
          </div>
        </div>
        <span className="flex items-center gap-1 text-xs font-medium">
          Install in Figma
          <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
        </span>
      </a>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Intercom-specific rich detail view. Mirrors the production layout: header
// + Built-by / Docs / Enable rail, two screenshot tiles (Linear "Create
// issue" form on the left, Activity feed with an Intercom inbound message on
// the right), Overview, and the Intercom-only settings: Enable internal
// notes, Automate conversation reopening, and a Templates row.
// ---------------------------------------------------------------------------
function IntercomIntegrationDetail() {
  const [overviewExpanded, setOverviewExpanded] = useState(false)
  const [notesOnComment, setNotesOnComment] = useState(false)
  const [notesOnStatus, setNotesOnStatus] = useState(false)
  const [reopenOnIssueCompleted, setReopenOnIssueCompleted] = useState(false)
  const [reopenOnIssueCancelled, setReopenOnIssueCancelled] = useState(false)
  const [reopenOnIssueComment, setReopenOnIssueComment] = useState(false)
  const [reopenOnProjectCompleted, setReopenOnProjectCompleted] =
    useState(false)
  const [reopenOnProjectCancelled, setReopenOnProjectCancelled] =
    useState(false)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white text-black">
          <IntercomLogo className="size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">Intercom</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Keep a tight feedback loop with customers and streamline bug reports
          </p>
        </div>
      </header>

      {/* Built by / Docs / Enable rail */}
      <div className="bg-card flex flex-wrap items-start justify-between gap-4 rounded-lg border p-4">
        <div className="flex gap-8">
          <div>
            <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Built by
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
              <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
              Linear
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Docs
            </div>
            <a
              href="https://linear.app/docs/intercom"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Intercom integration docs (opens in new tab)"
              className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
            >
              <HugeiconsIcon icon={Book02Icon} className="size-3.5" />
              Docs
            </a>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => toast.info("Intercom OAuth connect flow coming soon")}
          aria-label="Enable Intercom integration"
        >
          <HugeiconsIcon icon={PuzzleIcon} className="size-3.5" />
          Enable
        </Button>
      </div>

      {/* Screenshot tiles */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Left tile — Linear "Create issue" form mock */}
        <div
          aria-hidden
          className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border bg-[#dee5f5]"
        >
          <div className="bg-background/95 w-3/5 rounded-md border px-2 py-1.5 text-[7px] shadow-sm">
            <div className="border-b pb-1 font-medium">⊙ Linear</div>
            <div className="mt-1 space-y-1">
              <div>
                <span className="text-muted-foreground">Title</span>
                <div className="bg-muted/50 mt-0.5 rounded px-1 py-0.5">
                  Interface bug
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Description</span>
                <div className="bg-muted/30 mt-0.5 h-3 rounded" />
              </div>
              <div>
                <span className="text-muted-foreground">Team</span>
                <div className="bg-muted/50 mt-0.5 rounded px-1 py-0.5">
                  Linear
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Priority</span>
                <div className="bg-muted/50 mt-0.5 rounded px-1 py-0.5">
                  High
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Assignee</span>
                <div className="bg-muted/50 text-muted-foreground mt-0.5 rounded px-1 py-0.5">
                  Choose one…
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Label</span>
                <div className="bg-muted/50 mt-0.5 rounded px-1 py-0.5">
                  Bug
                </div>
              </div>
            </div>
            <div className="mt-1.5 space-y-0.5">
              <div className="rounded bg-indigo-500 py-0.5 text-center font-medium text-white">
                Create issue
              </div>
              <div className="text-muted-foreground py-0.5 text-center">
                Cancel
              </div>
            </div>
          </div>
        </div>

        {/* Right tile — Intercom inbound message + status timeline */}
        <div
          aria-hidden
          className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border bg-[#dee5f5]"
        >
          <div className="bg-background/95 w-4/5 rounded-md border px-2 py-1.5 text-[7px] shadow-sm">
            <div className="flex items-center justify-between border-b pb-1">
              <span>
                <span className="bg-muted/50 mr-1 inline-block h-2 w-2 rounded" />
                Message from Jordan
              </span>
              <span className="text-muted-foreground">
                I&apos;m seeing a bu…
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="font-medium">Activity</span>
              <span className="text-muted-foreground">Subscribe</span>
            </div>
            <div className="text-muted-foreground mt-1 space-y-0.5 leading-tight">
              <div>raissa created the issue · 1 day ago</div>
              <div>
                raissa changed status from{" "}
                <span className="text-foreground">Todo</span> →{" "}
                <span className="text-foreground">In Progress</span>
              </div>
              <div>
                raissa changed status from{" "}
                <span className="text-foreground">In Progress</span> →{" "}
                <span className="text-foreground">In Review</span>
              </div>
              <div>
                raissa changed status from{" "}
                <span className="text-foreground">In Review</span> →{" "}
                <span className="text-foreground">Done</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overview */}
      <section className="bg-card rounded-lg border p-5">
        <h2 className="text-sm font-semibold">Overview</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          This integration enables a tight feedback loop between customer and
          product teams if you use Intercom for customer support. Use it to
          create Linear issues from customer conversations, link conversations
          to existing Linear issues, surface key information between tools, and
          make it easier to get back to customers when bugs are fixed or
          feedback has been implemented.
        </p>
        {overviewExpanded ? (
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Linked conversations stay in sync both ways: Intercom replies are
            mirrored as comments on the Linear issue, and status transitions in
            Linear can automatically reopen the Intercom conversation so agents
            can follow up. Workspace-wide templates make it easy to triage
            common reports straight from the Inbox.
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => setOverviewExpanded((v) => !v)}
          className="text-muted-foreground hover:text-foreground mt-2 text-xs"
          aria-expanded={overviewExpanded}
        >
          {overviewExpanded ? "Show less" : "Read more"}
        </button>
      </section>

      {/* Enable internal notes */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold">Enable internal notes</h2>
          <p className="text-muted-foreground mt-2 text-xs leading-5">
            Choose when to add internal notes to linked Intercom conversations.
            Internal notes will always be added when an issue is linked,
            completed or cancelled.
          </p>
        </div>
        <div className="bg-card flex flex-col rounded-lg border">
          <ToggleListRow
            id="intercom-notes-comment"
            label="A comment is made in an issue"
            checked={notesOnComment}
            onCheckedChange={setNotesOnComment}
          />
          <ToggleListRow
            id="intercom-notes-status"
            label="An issue changes to any status"
            checked={notesOnStatus}
            onCheckedChange={setNotesOnStatus}
            isLast
          />
        </div>
      </section>

      {/* Automate conversation reopening */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold">
            Automate conversation reopening
          </h2>
          <p className="text-muted-foreground mt-2 text-xs leading-5">
            Choose when to automatically reopen Intercom conversations that are
            linked to a Linear issue or project
          </p>
        </div>
        <div className="bg-card flex flex-col rounded-lg border">
          <ToggleListRow
            id="intercom-reopen-issue-completed"
            label="An issue is completed"
            checked={reopenOnIssueCompleted}
            onCheckedChange={setReopenOnIssueCompleted}
          />
          <ToggleListRow
            id="intercom-reopen-issue-cancelled"
            label="An issue is cancelled"
            checked={reopenOnIssueCancelled}
            onCheckedChange={setReopenOnIssueCancelled}
          />
          <ToggleListRow
            id="intercom-reopen-issue-comment"
            label="A comment is made in an issue"
            checked={reopenOnIssueComment}
            onCheckedChange={setReopenOnIssueComment}
          />
          <ToggleListRow
            id="intercom-reopen-project-completed"
            label="A project is completed"
            checked={reopenOnProjectCompleted}
            onCheckedChange={setReopenOnProjectCompleted}
          />
          <ToggleListRow
            id="intercom-reopen-project-cancelled"
            label="A project is cancelled"
            checked={reopenOnProjectCancelled}
            onCheckedChange={setReopenOnProjectCancelled}
            isLast
          />
        </div>
      </section>

      {/* Templates */}
      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-sm font-semibold">Templates</h2>
          <p className="text-muted-foreground mt-2 text-xs leading-5">
            Add team or workspace issue templates to make them available in
            Intercom
          </p>
        </div>
        <button
          type="button"
          onClick={() => toast.info("Template selector coming soon")}
          className="bg-card hover:border-foreground/20 flex w-full items-center justify-between rounded-lg border p-4 text-left transition-colors"
          aria-label="Add a template"
        >
          <span className="text-muted-foreground text-sm">No templates</span>
          <HugeiconsIcon
            icon={PlusSignIcon}
            className="text-muted-foreground size-4"
          />
        </button>
      </section>
    </div>
  )
}

function ZendeskIntegrationDetail() {
  const [overviewExpanded, setOverviewExpanded] = useState(false)
  const [notesOnComment, setNotesOnComment] = useState(false)
  const [notesOnStatus, setNotesOnStatus] = useState(false)
  const [reopenOnIssueCompleted, setReopenOnIssueCompleted] = useState(false)
  const [reopenOnIssueCancelled, setReopenOnIssueCancelled] = useState(false)
  const [reopenOnIssueComment, setReopenOnIssueComment] = useState(false)
  const [reopenOnProjectCompleted, setReopenOnProjectCompleted] =
    useState(false)
  const [reopenOnProjectCancelled, setReopenOnProjectCancelled] =
    useState(false)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl">
          <ZendeskLogo className="size-14" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">Zendesk</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Keep a tight feedback loop with customers and streamline bug reports
          </p>
        </div>
      </header>

      {/* Built by / Docs / Enable rail */}
      <div className="bg-card flex flex-wrap items-start justify-between gap-4 rounded-lg border p-4">
        <div className="flex gap-8">
          <div>
            <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Built by
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
              <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
              Linear
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Docs
            </div>
            <a
              href="https://linear.app/docs/zendesk"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Zendesk integration docs (opens in new tab)"
              className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
            >
              <HugeiconsIcon icon={Book02Icon} className="size-3.5" />
              Docs
            </a>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => toast.info("Zendesk OAuth connect flow coming soon")}
          aria-label="Enable Zendesk integration"
        >
          <HugeiconsIcon icon={PuzzleIcon} className="size-3.5" />
          Enable
        </Button>
      </div>

      {/* Screenshot tiles — pink (Zendesk → Linear) and green (Linear → Zendesk) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Left tile — Zendesk ticket with side-by-side "Create new Linear issue" */}
        <div
          aria-hidden
          className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border bg-[#f7d6e0]"
        >
          <div className="bg-background/95 flex w-4/5 gap-1 rounded-md border p-1.5 text-[6px] shadow-sm">
            <div className="flex-1 space-y-1 border-r pr-1.5">
              <div className="font-medium">I need help</div>
              <div className="text-muted-foreground">Via sample ticket</div>
              <div className="flex items-center gap-1">
                <span className="bg-muted/60 inline-block size-2 rounded-full" />
                <span className="font-medium">Julieta Carreyra</span>
              </div>
              <div className="text-muted-foreground leading-tight">
                Hello,
                <br />
                Something dramatic happened and I could really use your help.
                <br />
                Thanks in advance
              </div>
            </div>
            <div className="flex-1 space-y-1 pl-1">
              <div className="border-b pb-1 font-medium">⊙ Linear</div>
              <div className="text-muted-foreground">
                Create new Linear issue
              </div>
              <div className="mt-1 flex gap-0.5">
                <div className="bg-muted/60 flex-1 rounded py-0.5 text-center">
                  New issue
                </div>
                <div className="bg-muted/60 flex-1 rounded py-0.5 text-center">
                  Link issue
                </div>
              </div>
              <div className="text-muted-foreground pt-1 text-[5px]">
                Logged in as Kam Saarinen · Log out
              </div>
            </div>
          </div>
        </div>

        {/* Right tile — Linear "Customers > ENC-350" with linked Zendesk message */}
        <div
          aria-hidden
          className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border bg-[#a3d9b1]"
        >
          <div className="bg-background/95 w-4/5 rounded-md border px-2 py-1.5 text-[7px] shadow-sm">
            <div className="text-muted-foreground border-b pb-1">
              Customers › ENC-350
            </div>
            <div className="mt-1 font-medium">I need help</div>
            <div className="text-muted-foreground mt-1 leading-tight">
              Hello,
              <br />
              Something dramatic happened and I could really use your help.
              <br />
              Thanks in advance
            </div>
            <div className="text-muted-foreground mt-1.5">+ Add sub-issues</div>
            <div className="mt-1.5 flex items-center justify-between rounded border bg-[#03363D]/10 px-1 py-0.5">
              <span className="flex items-center gap-1">
                <span className="inline-block size-2 rounded bg-[#03363D]" />
                Message from Julieta
              </span>
              <span className="text-muted-foreground">1 hour ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overview */}
      <section className="bg-card rounded-lg border p-5">
        <h2 className="text-sm font-semibold">Overview</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          This integration enables a tight feedback loop between customer and
          product teams if you use Zendesk for customer support. Use it to
          create Linear issues from customer tickets, link tickets to existing
          Linear issues, display data from the linked Zendesk ticket in Linear
          as an attachment, and make it easier to get back to customers when
          bugs are fixed or feedback has been implemented.
        </p>
        {overviewExpanded ? (
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Linked tickets stay in sync both ways: Zendesk replies are mirrored
            as comments on the Linear issue, and status transitions in Linear
            can automatically reopen the Zendesk ticket so agents can follow up.
            Workspace-wide templates make it easy to triage common reports
            straight from the support queue.
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => setOverviewExpanded((v) => !v)}
          className="text-muted-foreground hover:text-foreground mt-2 text-xs"
          aria-expanded={overviewExpanded}
        >
          {overviewExpanded ? "Show less" : "Read more"}
        </button>
      </section>

      {/* Linear app for Zendesk install row */}
      <a
        href="https://www.zendesk.com/marketplace/apps/support/198929/linear/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Install Linear app for Zendesk (opens in new tab)"
        className="bg-card hover:border-foreground/20 flex w-full items-center justify-between rounded-lg border p-4 transition-colors"
      >
        <div className="flex items-center gap-3">
          <ZendeskLogo className="size-9" />
          <div>
            <div className="text-sm font-medium">Linear app for Zendesk</div>
            <div className="text-muted-foreground text-xs">
              Installed by 0 members
            </div>
          </div>
        </div>
        <span className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm">
          Install in Zendesk
          <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
        </span>
      </a>

      {/* Enable internal notes */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold">Enable internal notes</h2>
          <p className="text-muted-foreground mt-2 text-xs leading-5">
            Choose when to add internal notes to linked Zendesk tickets.
            Internal notes will always be added when an issue is linked,
            completed or cancelled.
          </p>
        </div>
        <div className="bg-card flex flex-col rounded-lg border">
          <ToggleListRow
            id="zendesk-notes-comment"
            label="A comment is made in an issue"
            checked={notesOnComment}
            onCheckedChange={setNotesOnComment}
          />
          <ToggleListRow
            id="zendesk-notes-status"
            label="An issue changes to any status"
            checked={notesOnStatus}
            onCheckedChange={setNotesOnStatus}
            isLast
          />
        </div>
      </section>

      {/* Automate ticket reopening */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold">Automate ticket reopening</h2>
          <p className="text-muted-foreground mt-2 text-xs leading-5">
            Choose when to automatically reopen Zendesk tickets that are linked
            to a Linear issue or project
          </p>
        </div>
        <div className="bg-card flex flex-col rounded-lg border">
          <ToggleListRow
            id="zendesk-reopen-issue-completed"
            label="An issue is completed"
            checked={reopenOnIssueCompleted}
            onCheckedChange={setReopenOnIssueCompleted}
          />
          <ToggleListRow
            id="zendesk-reopen-issue-cancelled"
            label="An issue is cancelled"
            checked={reopenOnIssueCancelled}
            onCheckedChange={setReopenOnIssueCancelled}
          />
          <ToggleListRow
            id="zendesk-reopen-issue-comment"
            label="A comment is made in an issue"
            checked={reopenOnIssueComment}
            onCheckedChange={setReopenOnIssueComment}
          />
          <ToggleListRow
            id="zendesk-reopen-project-completed"
            label="A project is completed"
            checked={reopenOnProjectCompleted}
            onCheckedChange={setReopenOnProjectCompleted}
          />
          <ToggleListRow
            id="zendesk-reopen-project-cancelled"
            label="A project is cancelled"
            checked={reopenOnProjectCancelled}
            onCheckedChange={setReopenOnProjectCancelled}
            isLast
          />
        </div>
      </section>

      {/* Templates */}
      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-sm font-semibold">Templates</h2>
          <p className="text-muted-foreground mt-2 text-xs leading-5">
            Add team or workspace issue templates to make them available in
            Zendesk
          </p>
        </div>
        <button
          type="button"
          onClick={() => toast.info("Template selector coming soon")}
          className="bg-card hover:border-foreground/20 flex w-full items-center justify-between rounded-lg border p-4 text-left transition-colors"
          aria-label="Add a template"
        >
          <span className="text-muted-foreground text-sm">No templates</span>
          <HugeiconsIcon
            icon={PlusSignIcon}
            className="text-muted-foreground size-4"
          />
        </button>
      </section>

      <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
        <span
          aria-hidden
          className="border-muted-foreground/40 text-muted-foreground inline-flex size-3.5 items-center justify-center rounded-full border text-[8px]"
        >
          !
        </span>
        Closed Zendesk tickets do not support automated comments or reopening.
      </p>
    </div>
  )
}

function FrontIntegrationDetail() {
  const [overviewExpanded, setOverviewExpanded] = useState(false)
  const [commentsOnComment, setCommentsOnComment] = useState(false)
  const [commentsOnStatus, setCommentsOnStatus] = useState(false)
  const [reopenOnIssueCompleted, setReopenOnIssueCompleted] = useState(false)
  const [reopenOnIssueCancelled, setReopenOnIssueCancelled] = useState(false)
  const [reopenOnIssueComment, setReopenOnIssueComment] = useState(false)
  const [reopenOnProjectCompleted, setReopenOnProjectCompleted] =
    useState(false)
  const [reopenOnProjectCancelled, setReopenOnProjectCancelled] =
    useState(false)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl">
          <FrontLogo className="size-14" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">Front</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Keep a tight feedback loop with customers and streamline bug reports
          </p>
        </div>
      </header>

      {/* Built by / Docs / Enable rail */}
      <div className="bg-card flex flex-wrap items-start justify-between gap-4 rounded-lg border p-4">
        <div className="flex gap-8">
          <div>
            <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Built by
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
              <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
              Linear
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Docs
            </div>
            <a
              href="https://linear.app/docs/front"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Front integration docs (opens in new tab)"
              className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
            >
              <HugeiconsIcon icon={Book02Icon} className="size-3.5" />
              Docs
            </a>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => toast.info("Front OAuth connect flow coming soon")}
          aria-label="Enable Front integration"
        >
          <HugeiconsIcon icon={PuzzleIcon} className="size-3.5" />
          Enable
        </Button>
      </div>

      {/* Screenshot tiles — orange/coral gradient */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Left tile — Front inbox with linked Linear issue panel */}
        <div
          aria-hidden
          className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border bg-gradient-to-br from-[#fde3cf] via-[#f5b48a] to-[#ec6f3f]"
        >
          <div className="bg-background/95 flex w-4/5 gap-1 rounded-md border p-1.5 text-[6px] shadow-sm">
            <div className="flex-1 space-y-1 border-r pr-1">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">2 · supportlife…</span>
                <span className="text-muted-foreground">⌃</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="bg-muted/60 inline-block size-2 rounded-full" />
                <span className="font-medium">Erin Frey</span>
              </div>
              <div className="text-muted-foreground leading-tight">
                …notifications that I want to refer back to later, but…
              </div>
              <div className="text-muted-foreground leading-tight">
                …nks for sending in the feedback!
              </div>
            </div>
            <div className="w-[42%] space-y-0.5">
              <div className="border-b pb-0.5 font-medium">⊙ Linear</div>
              <div className="text-muted-foreground">Message from Jordan</div>
              <div className="mt-0.5 flex gap-0.5">
                <div className="bg-muted/60 flex-1 rounded py-0.5 text-center">
                  Create
                </div>
                <div className="bg-muted/60 flex-1 rounded py-0.5 text-center">
                  Link
                </div>
              </div>
              <div className="text-muted-foreground pt-0.5 leading-tight">
                FEA-294 · Inbox
                <br />
                Snooze for notifications
              </div>
              <div className="text-muted-foreground flex justify-between">
                <span>Status</span>
                <span className="text-foreground">Done</span>
              </div>
              <div className="text-muted-foreground flex justify-between">
                <span>Priority</span>
                <span className="text-foreground">No priority</span>
              </div>
              <div className="text-muted-foreground flex justify-between">
                <span>Assignee</span>
                <span className="text-foreground">Raissa</span>
              </div>
              <div className="text-muted-foreground flex justify-between">
                <span>Project</span>
                <span className="text-foreground">Feature Req…</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right tile — Linear "Feature Requests · FEA-294" with linked Front msg */}
        <div
          aria-hidden
          className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border bg-gradient-to-br from-[#ec6f3f] via-[#f59ab8] to-[#bfd6f6]"
        >
          <div className="bg-background/95 w-4/5 rounded-md border px-2 py-1.5 text-[7px] shadow-sm">
            <div className="text-muted-foreground border-b pb-1">
              <span className="mr-1 inline-block size-1.5 rounded-sm bg-[#A276FF]/20" />
              Feature Requests · FEA-294
            </div>
            <div className="mt-1 font-medium">Snooze for notifications</div>
            <div className="text-muted-foreground mt-1 leading-tight">
              Can you add snooze for Inbox notifications? I find I keep some
              notifications that I want to refer back to later, but then I
              can&apos;t clear my Inbox.
            </div>
            <div className="text-muted-foreground mt-1.5">+ Add sub-issues</div>
            <div className="mt-1.5 flex items-center justify-between rounded border bg-[#A276FF]/10 px-1 py-0.5">
              <span className="flex items-center gap-1">
                <span className="inline-block size-2 rounded bg-[#A276FF]" />
                Message from Jordan
              </span>
              <span className="text-muted-foreground">
                Can you add snooze for inb…
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Overview */}
      <section className="bg-card rounded-lg border p-5">
        <h2 className="text-sm font-semibold">Overview</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          This integration enables a tight feedback loop between customer and
          product teams if you use Front for customer support. Use it to create
          Linear issues from customer conversations, link conversations to
          existing Linear issues, surface key information between tools, and
          make it easier to get back to customers when bugs are fixed or
          feedback has been implemented.
        </p>
        {overviewExpanded ? (
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Linked conversations stay in sync both ways: Front replies are
            mirrored as comments on the Linear issue, and status transitions in
            Linear can automatically reopen the Front conversation so agents can
            follow up. Workspace-wide templates make it easy to triage common
            reports straight from the shared inbox.
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => setOverviewExpanded((v) => !v)}
          className="text-muted-foreground hover:text-foreground mt-2 text-xs"
          aria-expanded={overviewExpanded}
        >
          {overviewExpanded ? "Show less" : "Read more"}
        </button>
      </section>

      {/* Linear app for Front install row */}
      <a
        href="https://app.frontapp.com/settings/company/integrations/linear"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Install Linear app for Front (opens in new tab)"
        className="bg-card hover:border-foreground/20 flex w-full items-center justify-between rounded-lg border p-4 transition-colors"
      >
        <div className="flex items-center gap-3">
          <FrontLogo className="size-9" />
          <div>
            <div className="text-sm font-medium">Linear app for Front</div>
            <div className="text-muted-foreground text-xs">
              Installed by 0 members
            </div>
          </div>
        </div>
        <span className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm">
          Install in Front
          <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
        </span>
      </a>

      {/* Enable comments */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold">Enable comments</h2>
          <p className="text-muted-foreground mt-2 text-xs leading-5">
            Choose when to add comments to linked Front conversations. Comments
            will always be added when an issue is linked, completed or
            cancelled.
          </p>
        </div>
        <div className="bg-card flex flex-col rounded-lg border">
          <ToggleListRow
            id="front-comments-comment"
            label="A comment is made in an issue"
            checked={commentsOnComment}
            onCheckedChange={setCommentsOnComment}
          />
          <ToggleListRow
            id="front-comments-status"
            label="An issue changes to any status"
            checked={commentsOnStatus}
            onCheckedChange={setCommentsOnStatus}
            isLast
          />
        </div>
      </section>

      {/* Automate conversation reopening */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold">
            Automate conversation reopening
          </h2>
          <p className="text-muted-foreground mt-2 text-xs leading-5">
            Choose when to automatically reopen Front conversations that are
            linked to a Linear issue or project
          </p>
        </div>
        <div className="bg-card flex flex-col rounded-lg border">
          <ToggleListRow
            id="front-reopen-issue-completed"
            label="An issue is completed"
            checked={reopenOnIssueCompleted}
            onCheckedChange={setReopenOnIssueCompleted}
          />
          <ToggleListRow
            id="front-reopen-issue-cancelled"
            label="An issue is cancelled"
            checked={reopenOnIssueCancelled}
            onCheckedChange={setReopenOnIssueCancelled}
          />
          <ToggleListRow
            id="front-reopen-issue-comment"
            label="A comment is made in an issue"
            checked={reopenOnIssueComment}
            onCheckedChange={setReopenOnIssueComment}
          />
          <ToggleListRow
            id="front-reopen-project-completed"
            label="A project is completed"
            checked={reopenOnProjectCompleted}
            onCheckedChange={setReopenOnProjectCompleted}
          />
          <ToggleListRow
            id="front-reopen-project-cancelled"
            label="A project is cancelled"
            checked={reopenOnProjectCancelled}
            onCheckedChange={setReopenOnProjectCancelled}
            isLast
          />
        </div>
      </section>

      <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
        <span
          aria-hidden
          className="border-muted-foreground/40 text-muted-foreground inline-flex size-3.5 items-center justify-center rounded-full border text-[8px]"
        >
          !
        </span>
        Conversations in private inboxes do not support automated comments or
        reopening.
      </p>
    </div>
  )
}

function CannyIntegrationDetail() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl">
          <CannyLogo className="size-14" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">Canny</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Sync Canny posts to Linear issues to keep customers in the loop
          </p>
        </div>
      </header>

      {/* Built by / Website / Enable rail */}
      <div className="bg-card flex flex-wrap items-start justify-between gap-4 rounded-lg border p-4">
        <div className="flex gap-8">
          <div>
            <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Built by
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
              <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
              Canny
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Website
            </div>
            <a
              href="https://canny.io"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Canny website (opens in new tab)"
              className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
            >
              <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
              canny.io
            </a>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() =>
            window.open(
              "https://canny.io/integrations/linear",
              "_blank",
              "noopener,noreferrer"
            )
          }
          aria-label="Enable Canny integration (opens in new tab)"
        >
          Enable
          <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
        </Button>
      </div>

      {/* Screenshot tiles — solid indigo with mock cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Left tile — "Link Canny posts with Linear issues" */}
        <div
          aria-hidden
          className="relative flex aspect-[4/3] flex-col items-center justify-end overflow-hidden rounded-lg border bg-[#5C5BD6] p-3"
        >
          <div className="absolute top-3 left-3 max-w-[8rem] text-[10px] leading-tight font-medium text-white">
            Link Canny posts with Linear issues
          </div>
          <div className="bg-background/95 ml-auto w-3/5 rounded-md border px-2 py-1.5 text-[6px] shadow-sm">
            <div className="border-b pb-1 font-medium">New field for links</div>
            <div className="text-muted-foreground mt-1 leading-tight">
              For some roles, people want to be able to submit links to work
              like their portfolio or their GitHub.
            </div>
            <div className="text-muted-foreground mt-1">+ Add sub-issues</div>
            <div className="mt-1 font-medium">Activity</div>
            <div className="text-muted-foreground mt-0.5 leading-tight">
              <span className="bg-muted/50 mr-1 inline-block size-1.5 rounded" />
              Canny created the issue · 3 minutes ago
            </div>
            <div className="text-muted-foreground mt-0.5 leading-tight">
              <span className="bg-muted/50 mr-1 inline-block size-1.5 rounded" />
              Canny · 3 minutes ago
            </div>
            <div className="text-muted-foreground mt-0.5 leading-tight">
              This issue has been linked to a Canny post:
              <br />
              feedback.awesome.co/admin/board/feature-requests/p/new-field-for-links
            </div>
            <div className="border-muted-foreground/30 text-muted-foreground mt-1 rounded border px-1 py-0.5 text-[5px]">
              Leave a comment…
            </div>
            <div className="mt-1 flex justify-end">
              <div className="bg-muted/60 rounded px-1 py-0.5">Comment</div>
            </div>
          </div>
        </div>

        {/* Right tile — "Push ideas to Linear" */}
        <div
          aria-hidden
          className="relative flex aspect-[4/3] flex-col items-center justify-end overflow-hidden rounded-lg border bg-[#4845D2] p-3"
        >
          <div className="absolute top-3 left-3 max-w-[7rem] text-[10px] leading-tight font-medium text-white">
            Push ideas to Linear
          </div>
          <div className="bg-background/95 ml-auto w-3/5 rounded-md border px-2 py-1.5 text-[6px] shadow-sm">
            <div className="border-b pb-1 font-medium">
              Create a new Linear issue
            </div>
            <div className="mt-1 grid grid-cols-2 gap-1">
              <div>
                <div className="text-muted-foreground">TEAM</div>
                <div className="bg-muted/50 mt-0.5 rounded px-1 py-0.5">
                  Mert test
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">STATUS</div>
                <div className="bg-muted/50 mt-0.5 rounded px-1 py-0.5">
                  Done
                </div>
              </div>
            </div>
            <div className="mt-1">
              <div className="text-muted-foreground">TITLE</div>
              <div className="bg-muted/50 mt-0.5 rounded px-1 py-0.5">
                New field for links
              </div>
            </div>
            <div className="mt-1">
              <div className="text-muted-foreground">DESCRIPTION</div>
              <div className="text-muted-foreground bg-muted/30 mt-0.5 rounded px-1 py-0.5 leading-tight">
                For some roles, people want to be able to submit links to work
                like their portfolio or their GitHub.
              </div>
            </div>
            <div className="mt-1.5 rounded bg-indigo-500 py-0.5 text-center font-medium text-white">
              CREATE & LINK ISSUE
            </div>
          </div>
        </div>
      </div>

      {/* Overview */}
      <section className="bg-card rounded-lg border p-5">
        <h2 className="text-sm font-semibold">Overview</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          Understand customer needs to determine priority before executing in
          Linear. Never forget to update customers and other stakeholders
          because statuses are synced.
        </p>

        <h3 className="mt-5 text-sm font-semibold">How it works</h3>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          Canny keeps track of customer feedback so your team can understand
          needs and impact. From there, the Canny roadmap is used to prioritize
          new features based on impact and effort. When your team is ready to
          execute, push projects/features into Linear.
        </p>
        <p className="text-muted-foreground mt-3 text-sm leading-6">
          In Linear, you&apos;ll see a link that goes back to the Canny post.
          This is a great way to refer back to customer needs as you build out a
          feature. Your team can also easily go back to Canny to request
          additional information about how they&apos;d want a feature to work.
        </p>
        <p className="text-muted-foreground mt-3 text-sm leading-6">
          You can also set up rules so that when statuses are updated in Linear,
          they are reflected in Canny. This is a great way to keep your
          stakeholders in the loop. They will appreciate being kept up to date
          and your team will appreciate the simple workflow.
        </p>

        <h3 className="mt-5 text-sm font-semibold">Configure</h3>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          Admins in Canny that have an Owner or Manager role can configure the
          Linear integration in Canny. Simply head to your integrations page,
          find Linear, and go through the installation steps. Once the
          integration is installed, you&apos;ll be able to set up rules to
          trigger status syncing.
        </p>
      </section>
    </div>
  )
}

function ProductlaneIntegrationDetail() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl">
          <ProductlaneLogo className="size-14" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">Productlane</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Helpdesk, customer requests portal, public roadmap, and changelog
            built on Linear
          </p>
        </div>
      </header>

      {/* Built by / Website / Enable rail */}
      <div className="bg-card flex flex-wrap items-start justify-between gap-4 rounded-lg border p-4">
        <div className="flex gap-8">
          <div>
            <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Built by
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
              <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
              Productlane
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Website
            </div>
            <a
              href="https://productlane.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Productlane website (opens in new tab)"
              className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
            >
              <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
              productlane.com
            </a>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() =>
            window.open(
              "https://productlane.com",
              "_blank",
              "noopener,noreferrer"
            )
          }
          aria-label="Enable Productlane integration (opens in new tab)"
        >
          Enable
          <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
        </Button>
      </div>

      {/* Screenshot tiles — dark UI mocks */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Left tile — Productlane Inbox */}
        <div
          aria-hidden
          className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border bg-[#0F1115]"
        >
          <div className="w-[88%] rounded-md border border-white/10 bg-[#15171C] px-2 py-1.5 text-[6px] text-white/80 shadow-sm">
            <div className="flex items-center justify-between border-b border-white/10 pb-1">
              <span className="font-medium">Inbox · Open</span>
              <span className="text-white/40">
                Help with setting up the Stack plan
              </span>
            </div>
            <div className="mt-1 flex gap-1">
              <div className="w-[40%] space-y-0.5">
                <div className="text-white/40">Topics</div>
                <div className="rounded bg-white/5 px-1 py-0.5">Tasks</div>
                <div className="text-white/40">My team</div>
                <div className="text-white/40">Personal</div>
                <div className="text-white/40">Onboarding</div>
              </div>
              <div className="flex-1 space-y-0.5 border-l border-white/10 pl-1">
                <div className="rounded bg-white/5 px-1 py-0.5">Pedro · 2m</div>
                <div className="text-white/40">
                  Hi, I&apos;m the new sign-up agent in the Stack tier and want
                  to make sure we set everything up correctly before rolling it
                  out to the team. I&apos;m mainly unsure about permissions,
                  complete edition rolling, and whether or not…
                </div>
              </div>
            </div>
            <div className="border-muted-foreground/30 mt-1 rounded border px-1 py-0.5 text-[5px] text-white/40">
              Reply…
            </div>
          </div>
        </div>

        {/* Right tile — Productlane Roadmap */}
        <div
          aria-hidden
          className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border bg-[#0F1115]"
        >
          <div className="w-[88%] space-y-1 rounded-md border border-white/10 bg-[#15171C] p-2 text-[6px] text-white/80 shadow-sm">
            <div className="flex items-center justify-between rounded bg-white/5 px-1.5 py-1">
              <span className="flex items-center gap-1 font-medium">
                <span className="inline-block size-1.5 rounded-full bg-[#A276FF]" />
                In Progress
              </span>
            </div>
            <div className="rounded bg-white/5 px-1.5 py-1">
              <div className="font-medium">⊙ Live Chat</div>
              <div className="text-white/40">
                Add a chat to your widget to talk with customers in realtime.
              </div>
            </div>
            <div className="rounded bg-white/5 px-1.5 py-1">
              <div className="font-medium">⊙ Outbound mailing</div>
              <div className="text-white/40">
                Send Changelogs and feedback Loop emails to multiple customers.
              </div>
            </div>
            <div className="flex items-center justify-between rounded bg-white/5 px-1.5 py-1 font-medium">
              <span className="flex items-center gap-1">
                <span className="inline-block size-1.5 rounded-full bg-emerald-400" />
                Planned
              </span>
            </div>
            <div className="rounded bg-white/5 px-1.5 py-1">
              <div className="font-medium">⊙ AI Agent</div>
              <div className="text-white/40">
                Making the AI Agent more powerful and go beyond just answering
                questions.
              </div>
            </div>
            <div className="text-white/40">⊙ API Improvement</div>
          </div>
        </div>
      </div>

      {/* Overview */}
      <section className="bg-card rounded-lg border p-5">
        <h2 className="text-sm font-semibold">Overview</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          Productlane is a lightning-fast, AI-native customer support tool with
          a customer portal, public roadmap, and Changelog that&rsquo;s built
          exclusively on Linear. Handle live chat, Slack, and email in a single
          inbox with a 50ms UI and turn every conversation into Linear issues
          without duplicating work.
        </p>

        <h3 className="mt-5 text-sm font-semibold">How it works</h3>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          <span className="text-foreground font-medium">Helpdesk</span>:
          Productlane consolidates live chat, Slack Connect channels, and shared
          email into a unified inbox. An embedded widget lets customers reach
          out directly from your app, where an AI agent trained on your help
          center articles and Linear issues can resolve common questions
          instantly. When a conversation needs human attention, your team can
          reply from Productlane or directly from a Slack thread, link requests
          to Linear issues, and get notified when work is completed.
        </p>
        <p className="text-muted-foreground mt-3 text-sm leading-6">
          <span className="text-foreground font-medium">
            Linear Customer requests portal and public roadmap:
          </span>
          <br />
          Give customers visibility into what you&rsquo;re building with a
          portal that combines a support requests with your Linear tickets and
          requests. Customers can submit and prioritize their own requests, see
          real-time status updates synced from Linear, and browse your roadmap.
        </p>
        <p className="text-muted-foreground mt-3 text-sm leading-6">
          <span className="text-foreground font-medium">Changelog</span>:
          Productlane&rsquo;s Release Intelligence automatically generates
          Changelog drafts from your completed Linear issues and projects. When
          you finish a project, Productlane pulls in the relevant issues,
          categorizes them by label, and writes a draft for you. Add a cover
          image with built-in styling tools, then broadcast the update via
          email, Slack, or an in-app notification through the embedded widget.
        </p>

        <h3 className="mt-5 text-sm font-semibold">Configure</h3>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          Sign up for Productlane with your Linear account. Admin rights are
          required the first time to grant access. After that, anyone in your
          Linear workspace can log in to Productlane to view conversations and
          answer customers.
          <br />
          Productlane requires read and write access to sync issues and projects
          in real time. You can update permissions anytime in Linear&rsquo;s API
          settings.
        </p>
      </section>
    </div>
  )
}

function IndexIntegrationDetail() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl">
          <IndexLogo className="size-14" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">Index</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            The Productboard and Jira Product Discovery alternative for Product
            Management on Linear
          </p>
        </div>
      </header>

      {/* Built by / Website / Enable rail */}
      <div className="bg-card flex flex-wrap items-start justify-between gap-4 rounded-lg border p-4">
        <div className="flex gap-8">
          <div>
            <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Built by
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
              <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
              Index
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Website
            </div>
            <a
              href="https://index.inc"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Index website (opens in new tab)"
              className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
            >
              <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
              index.inc
            </a>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() =>
            window.open("https://index.inc", "_blank", "noopener,noreferrer")
          }
          aria-label="Enable Index integration (opens in new tab)"
        >
          Enable
          <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
        </Button>
      </div>

      {/* Screenshot tiles — purple/blue gradient mocks */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Left tile — Index whiteboard with sticky-note ideas */}
        <div
          aria-hidden
          className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border bg-gradient-to-b from-[#1a1b3a] via-[#3b3a6e] to-[#d2a3c9]"
        >
          <div className="w-[88%] space-y-1 rounded-md border border-white/10 bg-[#0F1027]/90 p-2 text-[6px] text-white/80 shadow-sm">
            <div className="flex items-center justify-between border-b border-white/10 pb-1">
              <span className="font-medium">Index › Recent Ideas</span>
              <span className="rounded bg-indigo-500 px-1 py-0.5 text-[5px] font-medium text-white">
                Linear
              </span>
            </div>
            <div className="flex items-center justify-between text-white/40">
              <span>Status: small · Done · ⌃ Add filter</span>
            </div>
            <div className="grid grid-cols-3 gap-1 pt-1">
              <div className="rounded bg-[#3057e8]/40 p-1">
                <div className="font-medium">Canvas idea</div>
                <div className="text-white/40">⋆ ⋆ ⋆ ⋆</div>
              </div>
              <div className="rounded bg-[#1f9e6a]/40 p-1">
                <div className="font-medium">Whiteboard ideas</div>
                <div className="text-white/40">⋆ ⋆ ⋆ ⋆</div>
              </div>
              <div className="rounded bg-[#caa14a]/40 p-1">
                <div className="font-medium">Roadmap</div>
                <div className="text-white/40">⋆ ⋆ ⋆ ⋆</div>
              </div>
            </div>
            <div className="rounded bg-yellow-200/90 p-1 text-[5px] text-black">
              Sticky note: try the new
              <br />
              prioritization framework
              <br />
              for Q2 planning queue
            </div>
          </div>
        </div>

        {/* Right tile — Index spreadsheet view */}
        <div
          aria-hidden
          className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border bg-gradient-to-b from-[#1a1b3a] via-[#3b3a6e] to-[#d2a3c9]"
        >
          <div className="w-[88%] space-y-0.5 rounded-md border border-white/10 bg-[#0F1027]/90 p-2 text-[6px] text-white/80 shadow-sm">
            <div className="flex items-center justify-between border-b border-white/10 pb-1">
              <span className="font-medium">⊙ Q3 planning</span>
              <span className="rounded bg-indigo-500 px-1 py-0.5 text-[5px] font-medium text-white">
                Linear
              </span>
            </div>
            <div className="mt-1 grid grid-cols-[1.4fr_0.7fr_0.7fr_0.6fr] gap-1 border-b border-white/5 pb-0.5 text-white/40">
              <span>Title</span>
              <span>Insights</span>
              <span>Owner</span>
              <span>Status</span>
            </div>
            {[
              ["Notification system", "Becky", "Open"],
              ["Dependency management", "Mique", "Open"],
              ["Data exception", "Stripe", "Open"],
              ["A/B testing experiments", "Ulysse", "Open"],
              ["Onboarding rebuild", "Becky", "Done"],
              ["Roadmap publisher", "Mique", "Done"],
              ["User feedback portal", "Stripe", "Open"],
              ["Multi-currency billing", "Becky", "Done"],
              ["Dynamic subscription billing", "Mique", "Done"],
              ["Analytics half", "Ulysse", "Open"],
            ].map(([title, owner, status]) => (
              <div
                key={title}
                className="grid grid-cols-[1.4fr_0.7fr_0.7fr_0.6fr] gap-1 border-b border-white/5 py-0.5"
              >
                <span className="truncate">{title}</span>
                <span className="text-white/40">⋆⋆⋆⋆</span>
                <span className="truncate">{owner}</span>
                <span
                  className={cn(
                    "truncate text-[5px]",
                    status === "Done" ? "text-emerald-300" : "text-blue-300"
                  )}
                >
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overview */}
      <section className="bg-card rounded-lg border p-5">
        <h2 className="text-sm font-semibold">Overview</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          Index&apos;s Linear integration enables new planning and discovery
          capabilities for Product Management, and is the first alternative to
          Productboard and Jira Product Discovery that connects to Linear.
        </p>
        <p className="text-muted-foreground mt-3 text-sm leading-6">
          Create and connect Linear projects and view their issues from the
          Index app. Run planning, prioritization, and discovery in the only
          whiteboard for Linear, with spreadsheet and board views also
          available. Dates and status will automatically stay in sync between
          both tools for a connected discovery and planning experience.
        </p>

        <h3 className="mt-5 text-sm font-semibold">How it works</h3>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          When you create a project in Index, you&apos;ll have the option to
          push it to Linear, which will automatically create and connect the
          corresponding Linear project. New ideas which you&apos;re still
          shaping can stay in Index until you&apos;re ready. This enables the
          following workflows:
        </p>
        <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-6 text-sm leading-6">
          <li>
            Brainstorming new ideas with your team on a whiteboard, and pushing
            it to Linear when complete
          </li>
          <li>
            Managing customer requests in a spreadsheet with custom fields, and
            viewing the Linear status
          </li>
          <li>
            Running prioritization exercises in frameworks like RICE and WSJF on
            your Linear project list
          </li>
        </ul>
        <p className="text-muted-foreground mt-3 text-sm leading-6">
          Additionally, when visiting a project page in Index, you&apos;ll be
          able to view the list of issues in Linear, along with the owner and
          status for each issue. You can click on any issue to jump to it in the
          Linear app.
        </p>

        <h3 className="mt-5 text-sm font-semibold">Configure</h3>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          To get started, go to Index&apos;s{" "}
          <a
            href="https://index.inc/integrations/linear"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 underline-offset-2 hover:underline"
          >
            Linear integration page
          </a>{" "}
          and proceed through the CTA to add the integration. If you&apos;re
          migrating from an alternative app like Productboard or Jira Product
          Discovery, you&apos;ll be prompted to import your data so you can use
          it with Index and Linear.
        </p>
      </section>
    </div>
  )
}

function SalesforceIntegrationDetail() {
  const [overviewExpanded, setOverviewExpanded] = useState(false)
  const [notesOnComment, setNotesOnComment] = useState(false)
  const [notesOnStatus, setNotesOnStatus] = useState(false)
  const [caseStatus, setCaseStatus] = useState("")
  const [updateOnIssueCompleted, setUpdateOnIssueCompleted] = useState(false)
  const [updateOnIssueCancelled, setUpdateOnIssueCancelled] = useState(false)
  const [updateOnIssueComment, setUpdateOnIssueComment] = useState(false)
  const [updateOnProjectCompleted, setUpdateOnProjectCompleted] =
    useState(false)
  const [updateOnProjectCancelled, setUpdateOnProjectCancelled] =
    useState(false)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl">
          <SalesforceLogo className="size-14" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">Salesforce</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Create Linear issues from Salesforce cases
          </p>
        </div>
      </header>

      {/* Built by / Docs / Enable rail */}
      <div className="bg-card flex flex-wrap items-start justify-between gap-4 rounded-lg border p-4">
        <div className="flex gap-8">
          <div>
            <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Built by
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
              <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
              Linear
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Docs
            </div>
            <a
              href="https://linear.app/docs/salesforce"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Salesforce integration docs (opens in new tab)"
              className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
            >
              <HugeiconsIcon icon={Book02Icon} className="size-3.5" />
              Docs
            </a>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() =>
            toast.info("Salesforce OAuth connect flow coming soon")
          }
          aria-label="Enable Salesforce integration"
        >
          <HugeiconsIcon icon={PuzzleIcon} className="size-3.5" />
          Enable
        </Button>
      </div>

      {/* Screenshot tiles — Salesforce case + Linear issue with linked case */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Left tile — Salesforce Case Details */}
        <div
          aria-hidden
          className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border bg-white"
        >
          <div className="w-[78%] rounded-md border bg-white px-2 py-1.5 text-[6px] text-neutral-700 shadow-sm">
            <div className="flex items-center gap-1 border-b pb-1 font-medium">
              <SalesforceLogo className="size-2.5" />
              Case Details
            </div>
            <div className="mt-1 grid grid-cols-2 gap-1">
              <div>
                <div className="text-neutral-400">Case Number</div>
                <div>0001337</div>
              </div>
              <div>
                <div className="text-neutral-400">Case Owner</div>
                <div>Pepper Vu</div>
              </div>
              <div>
                <div className="text-neutral-400">Status</div>
                <div>New</div>
              </div>
              <div>
                <div className="text-neutral-400">Customer</div>
                <div>Edge AI</div>
              </div>
              <div className="col-span-2">
                <div className="text-neutral-400">Subject</div>
                <div>HIPAA compliance</div>
              </div>
              <div className="col-span-2">
                <div className="text-neutral-400">Description</div>
                <div className="leading-tight">
                  Is HIPAA compliance on your roadmap?
                  <br />
                  It&apos;s the only missing feature preventing us
                  <br />
                  from moving forward!
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right tile — Linear issue with linked Salesforce case */}
        <div
          aria-hidden
          className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border bg-[#0F1115]"
        >
          <div className="w-[88%] rounded-md border border-white/10 bg-[#15171C] px-2 py-1.5 text-[6px] text-white/80 shadow-sm">
            <div className="border-b border-white/10 pb-1 text-white/60">
              ⊙ Product · PRO-217
            </div>
            <div className="mt-1 font-medium">HIPAA compliance</div>
            <div className="mt-1 leading-tight text-white/40">
              Is HIPAA compliance on your roadmap? It&apos;s the only missing
              feature preventing us from moving forward.
            </div>
            <div className="mt-1 flex items-center justify-between rounded border border-white/10 bg-white/5 px-1 py-0.5">
              <span className="flex items-center gap-1">
                <span className="inline-block size-2 rounded bg-[#00A1E0]" />
                Edge AI
              </span>
            </div>
            <div className="mt-1.5 font-medium">Activity</div>
            <div className="mt-0.5 leading-tight text-white/40">
              <span className="mr-1 inline-block size-1.5 rounded-full bg-white/30" />
              Pepper Vu created an issue from Salesforce
            </div>
            <div className="mt-1 grid grid-cols-2 gap-x-1 gap-y-0.5 text-white/40">
              <span>⊙ Edge AI</span>
              <span className="text-right">Owner · guillaume</span>
              <span>Status</span>
              <span className="text-right">Active</span>
              <span>Tier</span>
              <span className="text-right">Business</span>
              <span>Revenue</span>
              <span className="text-right">$3.3K/mo</span>
              <span>Size</span>
              <span className="text-right">3,500</span>
              <span>Data source</span>
              <span className="text-right">Salesforce</span>
            </div>
            <div className="mt-1 leading-tight text-white/40">
              <span className="mr-1 inline-block size-1.5 rounded-full bg-white/30" />
              Pepper Vu created the issue from Salesforce · 3d ago
            </div>
          </div>
        </div>
      </div>

      {/* Overview */}
      <section className="bg-card rounded-lg border p-5">
        <h2 className="text-sm font-semibold">Overview</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          Linear&apos;s Salesforce integration connects customer feedback
          directly to product development. Capture and track requests, sync
          customer context, and stay updated on development progress — all from
          Salesforce.
        </p>
        {overviewExpanded ? (
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Linked cases stay in sync both ways: comments and status changes
            from Linear are mirrored back to Salesforce so account teams can
            keep customers informed without leaving their CRM. Workspace-wide
            templates make it easy to triage common requests straight from a
            case record.
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => setOverviewExpanded((v) => !v)}
          className="text-muted-foreground hover:text-foreground mt-2 text-xs"
          aria-expanded={overviewExpanded}
        >
          {overviewExpanded ? "Show less" : "Read more"}
        </button>
      </section>

      {/* Linear app for Salesforce install row */}
      <a
        href="https://appexchange.salesforce.com/appxListingDetail?listingId=linear"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Install Linear app for Salesforce (opens in new tab)"
        className="bg-card hover:border-foreground/20 flex w-full items-center justify-between rounded-lg border p-4 transition-colors"
      >
        <div className="flex items-center gap-3">
          <SalesforceLogo className="size-9" />
          <div>
            <div className="text-sm font-medium">Linear app for Salesforce</div>
            <div className="text-muted-foreground text-xs">
              Installed by 0 members
            </div>
          </div>
        </div>
        <span className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm">
          Install in Salesforce
          <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
        </span>
      </a>

      {/* Enable internal notes */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold">Enable internal notes</h2>
          <p className="text-muted-foreground mt-2 text-xs leading-5">
            Choose when to add internal notes to linked Salesforce cases.
            Internal notes will always be added when an issue is linked,
            completed or cancelled.
          </p>
        </div>
        <div className="bg-card flex flex-col rounded-lg border">
          <ToggleListRow
            id="salesforce-notes-comment"
            label="A comment is made in an issue"
            checked={notesOnComment}
            onCheckedChange={setNotesOnComment}
          />
          <ToggleListRow
            id="salesforce-notes-status"
            label="An issue changes to any status"
            checked={notesOnStatus}
            onCheckedChange={setNotesOnStatus}
            isLast
          />
        </div>
      </section>

      {/* Automate case status */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold">Automate case status</h2>
          <p className="text-muted-foreground mt-2 text-xs leading-5">
            Choose when to automatically update Salesforce cases that are linked
            to a Linear issue or project
          </p>
        </div>
        <div className="bg-card flex flex-col rounded-lg border">
          <div className="flex items-start justify-between gap-4 px-4 py-3">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">Case status</div>
              <p className="text-muted-foreground mt-1 text-xs leading-5">
                Status set on the Salesforce case whenever a linked Linear issue
                or project is updated to one of the statuses below.
              </p>
            </div>
            <NativeSelect
              value={caseStatus}
              onChange={(e) => setCaseStatus(e.target.value)}
              aria-label="Salesforce case status"
              className="w-32 shrink-0"
            >
              <option value="">Select…</option>
              <option value="closed">Closed</option>
              <option value="closed-resolved">Closed — Resolved</option>
              <option value="working">Working</option>
              <option value="escalated">Escalated</option>
            </NativeSelect>
          </div>
        </div>
        <div className="bg-card flex flex-col rounded-lg border">
          <ToggleListRow
            id="salesforce-update-issue-completed"
            label="An issue is completed"
            checked={updateOnIssueCompleted}
            onCheckedChange={setUpdateOnIssueCompleted}
          />
          <ToggleListRow
            id="salesforce-update-issue-cancelled"
            label="An issue is cancelled"
            checked={updateOnIssueCancelled}
            onCheckedChange={setUpdateOnIssueCancelled}
          />
          <ToggleListRow
            id="salesforce-update-issue-comment"
            label="A comment is made in an issue"
            checked={updateOnIssueComment}
            onCheckedChange={setUpdateOnIssueComment}
          />
          <ToggleListRow
            id="salesforce-update-project-completed"
            label="A project is completed"
            checked={updateOnProjectCompleted}
            onCheckedChange={setUpdateOnProjectCompleted}
          />
          <ToggleListRow
            id="salesforce-update-project-cancelled"
            label="A project is cancelled"
            checked={updateOnProjectCancelled}
            onCheckedChange={setUpdateOnProjectCancelled}
            isLast
          />
        </div>
      </section>

      {/* Templates */}
      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-sm font-semibold">Templates</h2>
          <p className="text-muted-foreground mt-2 text-xs leading-5">
            Add team or workspace issue templates to make them available in
            Salesforce
          </p>
        </div>
        <button
          type="button"
          onClick={() => toast.info("Template selector coming soon")}
          className="bg-card hover:border-foreground/20 flex w-full items-center justify-between rounded-lg border p-4 text-left transition-colors"
          aria-label="Add a template"
        >
          <span className="text-muted-foreground text-sm">No templates</span>
          <HugeiconsIcon
            icon={PlusSignIcon}
            className="text-muted-foreground size-4"
          />
        </button>
      </section>
    </div>
  )
}

function AtlasSupportIntegrationDetail() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl">
          <AtlasSupportLogo className="size-14" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">
            Atlas Support
          </h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Keep a tight feedback loop with customers and streamline customer
            requests
          </p>
        </div>
      </header>

      {/* Built by / Website / Enable rail */}
      <div className="bg-card flex flex-wrap items-start justify-between gap-4 rounded-lg border p-4">
        <div className="flex gap-8">
          <div>
            <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Built by
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
              <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
              Atlas
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Website
            </div>
            <a
              href="https://atlas.so"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Atlas website (opens in new tab)"
              className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
            >
              <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
              atlas.so
            </a>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() =>
            window.open("https://atlas.so", "_blank", "noopener,noreferrer")
          }
          aria-label="Enable Atlas Support integration (opens in new tab)"
        >
          Enable
          <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
        </Button>
      </div>

      {/* Screenshot tiles — light marble/pink background with Atlas mocks */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Left tile — Atlas "Linear issue" creation modal */}
        <div
          aria-hidden
          className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border bg-[#f3edff]"
        >
          <div className="w-[80%] rounded-md border bg-white px-2 py-1.5 text-[6px] text-neutral-700 shadow-sm">
            <div className="flex items-center justify-between border-b pb-1 font-medium">
              Linear issue
              <span className="text-neutral-400">×</span>
            </div>
            <div className="mt-1">
              <div className="text-neutral-400">Labels</div>
              <div className="mt-0.5 inline-block rounded bg-rose-100 px-1 py-0.5 text-rose-600">
                Bug
              </div>
            </div>
            <div className="mt-1">
              <div className="text-neutral-400">Description</div>
              <div className="border-b pb-0.5 text-neutral-400">
                B I U S ⌐ ¶ ≡ ≡ ≡ {} ∷ ▣
              </div>
              <div className="mt-0.5 leading-tight">
                Bob Mortis (Sandy Space Inc) said:
                <br />I can&apos;t checkout, can you please help?
              </div>
            </div>
            <div className="bg-muted/30 mt-1 flex h-5 items-center justify-center rounded">
              <div className="size-3 rounded bg-amber-300" />
            </div>
            <div className="mt-1 flex justify-end gap-1">
              <div className="rounded px-1 py-0.5 text-neutral-400">Cancel</div>
              <div className="rounded bg-indigo-500 px-1 py-0.5 text-white">
                Create issue
              </div>
            </div>
          </div>
        </div>

        {/* Right tile — Atlas Automations panel */}
        <div
          aria-hidden
          className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border bg-[#f3edff]"
        >
          <div className="w-[82%] rounded-md border bg-white px-2 py-1.5 text-[6px] text-neutral-700 shadow-sm">
            <div className="font-medium">Automations</div>
            <div className="mt-0.5 leading-tight text-neutral-400">
              Specify the events that should create activities and notes in
              Atlas and Linear
            </div>
            <div className="mt-1.5 flex items-center justify-between border-t pt-1">
              <span>Enable automatic re-opening of Atlas tickets</span>
              <span className="inline-block h-2 w-3.5 rounded-full bg-indigo-500" />
            </div>
            <div className="mt-1 flex items-center justify-between border-t pt-1">
              <span>When ticket status in Atlas is</span>
              <span className="flex gap-0.5 text-neutral-400">
                <span className="bg-muted/40 rounded px-1">Snoozed ×</span>
                <span className="bg-muted/40 rounded px-1">Pending ×</span>
                <span className="bg-muted/40 rounded px-1">Closed ×</span>
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between border-t pt-1">
              <span>When a Linear ticket moves into</span>
              <span className="flex gap-0.5 text-neutral-400">
                <span className="bg-muted/40 rounded px-1">Closed ×</span>
                <span className="bg-muted/40 rounded px-1">Cancelled ×</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Overview */}
      <section className="bg-card rounded-lg border p-5">
        <h2 className="text-sm font-semibold">Overview</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          Easily create Linear issues from Atlas support tickets with all the
          context your engineering team needs. Descriptions are automatically
          generated from the first message, saving time and making every issue
          clear and actionable. Customize how tickets and issues sync between
          Atlas and Linear to fit your workflow. With fine-grained controls and
          rich text support, your teams can collaborate seamlessly across tools.
        </p>

        <h3 className="mt-5 text-sm font-semibold">How it works</h3>
        <ul className="text-muted-foreground mt-2 list-disc space-y-3 pl-6 text-sm leading-6">
          <li>
            <span className="text-foreground font-medium">
              Create issues with context
            </span>
            <br />
            Send Atlas tickets to Linear in a single click. Descriptions are
            auto-generated from the first customer message, providing engineers
            with all the information they need, without extra manual effort.
          </li>
          <li>
            <span className="text-foreground font-medium">
              Sync updates across tools
            </span>
            <br />
            Keep Atlas and Linear in sync with customizable activity syncing.
            Choose what updates flow between the tools—like status changes, new
            comments, or assignee updates—so your team gets the right
            information in the right place.
          </li>
          <li>
            <span className="text-foreground font-medium">
              Rich text support
            </span>
            <br />
            Add more context to your Linear issues with rich text formatting.
            Use headers, bold text, and images to make sure everyone is on the
            same page.
          </li>
          <li>
            <span className="text-foreground font-medium">
              Fine-grained workflow controls
            </span>
            <br />
            Control when Atlas tickets re-open based on Linear issue statuses.
            For example, configure tickets to reopen only if they were
            previously{" "}
            <span className="text-foreground font-medium">Snoozed</span>,{" "}
            <span className="text-foreground font-medium">Pending</span>, or{" "}
            <span className="text-foreground font-medium">Closed</span>.
          </li>
        </ul>

        <h3 className="mt-6 text-sm font-semibold">Configure</h3>
        <ul className="text-muted-foreground mt-2 list-disc space-y-3 pl-6 text-sm leading-6">
          <li>
            <span className="text-foreground font-medium">
              Connect Atlas and Linear
            </span>
            <br />
            Log in to your Atlas and Linear accounts, and enable the integration
            in just a few clicks from{" "}
            <a
              href="https://atlas.so/settings/integrations/linear"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 underline-offset-2 hover:underline"
            >
              this page
            </a>
            .
          </li>
          <li>
            <span className="text-foreground font-medium">
              Set your sync preferences
            </span>
            <br />
            Decide which activities sync between Atlas and Linear, like ticket
            status changes, new customer messages, or assignee updates.
          </li>
          <li>
            <span className="text-foreground font-medium">
              Customize your workflows
            </span>
            <br />
            Use advanced workflow settings to control when tickets reopen and
            how issues interact across tools.
          </li>
        </ul>
      </section>
    </div>
  )
}

function ToggleListRow({
  id,
  label,
  checked,
  onCheckedChange,
  isLast,
}: {
  id: string
  label: string
  checked: boolean
  onCheckedChange: (next: boolean) => void
  isLast?: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-3",
        !isLast && "border-b"
      )}
    >
      <label htmlFor={id} className="text-sm">
        {label}
      </label>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label={label}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Google Sheets-specific rich detail view. Mirrors the production layout:
// header + Built-by / Docs / Enable rail, two screenshot tiles (a Sheets
// "Linear issues" tab on the left, an Integrate-with-Google-Sheets status
// card on the right) on a soft grey background with floating Google brand
// dots, Overview, and three top-level sync toggles (issues / projects /
// initiatives) each rendered as a description-bearing card row.
// ---------------------------------------------------------------------------
function GoogleSheetsIntegrationDetail() {
  const [overviewExpanded, setOverviewExpanded] = useState(false)
  const [syncIssues, setSyncIssues] = useState(false)
  const [syncProjects, setSyncProjects] = useState(false)
  const [syncInitiatives, setSyncInitiatives] = useState(false)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white">
          <GoogleSheetsLogo className="size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">
            Google Sheets
          </h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Build custom dashboards and analytics from issue and project data
          </p>
        </div>
      </header>

      {/* Built by / Docs / Enable rail */}
      <div className="bg-card flex flex-wrap items-start justify-between gap-4 rounded-lg border p-4">
        <div className="flex gap-8">
          <div>
            <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Built by
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
              <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
              Linear
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Docs
            </div>
            <a
              href="https://linear.app/docs/google-sheets"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Google Sheets integration docs (opens in new tab)"
              className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
            >
              <HugeiconsIcon icon={Book02Icon} className="size-3.5" />
              Docs
            </a>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() =>
            toast.info("Google Sheets OAuth connect flow coming soon")
          }
          aria-label="Enable Google Sheets integration"
        >
          <HugeiconsIcon icon={PuzzleIcon} className="size-3.5" />
          Enable
        </Button>
      </div>

      {/* Screenshot tiles */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Left tile — Sheets "Linear issues" tab mock with floating Google
            brand dots (blue, yellow, red) */}
        <div
          aria-hidden
          className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border bg-[#eaeaea]"
        >
          <span className="absolute top-3 left-1/2 size-3 -translate-x-1/2 rounded-full bg-[#4285F4]" />
          <span className="absolute top-1/2 left-3 size-3 rounded-full bg-[#FBBC04]" />
          <span className="absolute right-6 bottom-3 size-3 rounded-full bg-[#EA4335]" />
          <div className="bg-background/95 w-11/12 rounded-md border text-[6px] shadow-sm">
            <div className="border-b px-1.5 py-1">
              <div className="font-medium">Linear issues</div>
              <div className="text-muted-foreground mt-0.5 flex justify-between">
                <span>File · Edit · View · Insert · Format · Data · Tools</span>
                <span className="rounded bg-emerald-600 px-1 py-px font-medium text-white">
                  Share
                </span>
              </div>
            </div>
            <div className="bg-muted/40 grid grid-cols-[auto_repeat(7,1fr)] gap-px p-px text-[5px]">
              <div className="bg-background/90 px-1 py-px font-medium">ID</div>
              <div className="bg-background/90 px-1 py-px font-medium">
                Team
              </div>
              <div className="bg-background/90 px-1 py-px font-medium">
                Title
              </div>
              <div className="bg-background/90 px-1 py-px font-medium">
                Status
              </div>
              <div className="bg-background/90 px-1 py-px font-medium">
                Estimate
              </div>
              <div className="bg-background/90 px-1 py-px font-medium">
                Priority
              </div>
              <div className="bg-background/90 px-1 py-px font-medium">
                Project
              </div>
              <div className="bg-background/90 px-1 py-px font-medium">
                Creator
              </div>
              {[
                [
                  "ENC-25",
                  "Encom",
                  "Download offline maps",
                  "Cancelled",
                  "—",
                  "Medium",
                  "—",
                  "erin",
                ],
                [
                  "ENC-22",
                  "Encom",
                  "Upgrade software",
                  "Done",
                  "4",
                  "Low",
                  "—",
                  "quinn",
                ],
                [
                  "ONB-8",
                  "Onboarding",
                  "Build gravity-defying pen",
                  "Backlog",
                  "—",
                  "Low",
                  "—",
                  "davina",
                ],
                [
                  "ENC-33",
                  "Encom",
                  "Pack snacks",
                  "In Review",
                  "—",
                  "Urgent",
                  "—",
                  "erin",
                ],
                [
                  "ONB-12",
                  "Onboarding",
                  "Replace rocket boosters",
                  "Cancelled",
                  "2",
                  "High",
                  "—",
                  "erin",
                ],
                [
                  "ONB-15",
                  "Onboarding",
                  "Order ink from interstellar outlets",
                  "Done",
                  "—",
                  "No priority",
                  "—",
                  "jori",
                ],
              ].map((row, i) => (
                <React.Fragment key={i}>
                  {row.map((cell, j) => (
                    <div
                      key={j}
                      className="bg-background/90 truncate px-1 py-px"
                    >
                      {cell}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
            <div className="text-muted-foreground flex items-center justify-between border-t px-1.5 py-0.5 text-[5px]">
              <span>Issues</span>
              <span className="rounded bg-emerald-600/10 px-1 text-emerald-700">
                Explore
              </span>
            </div>
          </div>
        </div>

        {/* Right tile — Integrate-with-Google-Sheets status card with floating
            green/yellow/red brand dots */}
        <div
          aria-hidden
          className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border bg-[#eaeaea]"
        >
          <span className="absolute top-3 right-6 size-3 rounded-full bg-[#34A853]" />
          <span className="absolute right-3 bottom-1/3 size-2.5 rounded-full bg-[#EA4335]" />
          <span className="absolute bottom-4 left-8 size-2.5 rounded-full bg-[#FBBC04]" />
          <div className="bg-background/95 w-4/5 rounded-md border px-2 py-1.5 text-[6px] shadow-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 font-medium">
                <span className="size-2 rounded-sm bg-emerald-600" />
                Integrate with Google Sheets
              </span>
              <span className="rounded bg-indigo-500 px-1.5 py-0.5 font-medium text-white">
                Disconnect
              </span>
            </div>
            <div className="text-muted-foreground mt-1.5 leading-tight">
              Enabled by{" "}
              <span className="bg-muted/60 inline-block size-1.5 rounded-full align-middle" />{" "}
              <span className="text-foreground font-medium">erin</span> on Jun 7
              · <span className="text-foreground underline">Update now</span> ·{" "}
              <span className="text-foreground underline">
                Open Google Sheets
              </span>{" "}
              (Updated 3 hours ago)
            </div>
          </div>
        </div>
      </div>

      {/* Overview */}
      <section className="bg-card rounded-lg border p-5">
        <h2 className="text-sm font-semibold">Overview</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          Create a copy of all of your workspace issue data in Google Sheets.
          This integration is most commonly used to build custom dashboards and
          analytics.
        </p>
        {overviewExpanded ? (
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Each enabled object syncs to its own tab in the destination
            spreadsheet and refreshes on a fixed cadence. Use the standard
            Google Sheets pivot tables, charts and Apps Script triggers to roll
            up the data however your team needs — Linear writes, Sheets owns the
            read side.
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => setOverviewExpanded((v) => !v)}
          className="text-muted-foreground hover:text-foreground mt-2 text-xs"
          aria-expanded={overviewExpanded}
        >
          {overviewExpanded ? "Show less" : "Read more"}
        </button>
      </section>

      {/* Sync toggles — one card per object type */}
      <SyncToggleCard
        id="gsheets-sync-issues"
        title="Sync issues"
        description="Automatically sync all issues to a Google Sheet"
        checked={syncIssues}
        onCheckedChange={setSyncIssues}
      />
      <SyncToggleCard
        id="gsheets-sync-projects"
        title="Sync projects"
        description="Automatically sync all projects to a Google Sheet"
        checked={syncProjects}
        onCheckedChange={setSyncProjects}
      />
      <SyncToggleCard
        id="gsheets-sync-initiatives"
        title="Sync initiatives"
        description="Automatically sync all initiatives to a Google Sheet"
        checked={syncInitiatives}
        onCheckedChange={setSyncInitiatives}
      />
    </div>
  )
}

function SyncToggleCard({
  id,
  title,
  description,
  checked,
  onCheckedChange,
}: {
  id: string
  title: string
  description: string
  checked: boolean
  onCheckedChange: (next: boolean) => void
}) {
  return (
    <div className="bg-card flex items-center justify-between gap-4 rounded-lg border p-4">
      <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer">
        <div className="text-sm font-medium">{title}</div>
        <p className="text-muted-foreground mt-1 text-xs leading-5">
          {description}
        </p>
      </label>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label={title}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Codex (OpenAI) integration detail. Differs from the Linear-built pages:
// • header rail shows BUILT BY OpenAI + WEBSITE openai.com (not Docs);
// • the Enable CTA opens externally (small ↗ glyph);
// • screenshot tiles render on a flat dark surface instead of a coloured
//   gradient — they imitate Linear's own dark-theme issue activity panel and
//   a desktop notification toast respectively;
// • all body copy (Overview, Availability, How it works, Configure) lives in
//   one rounded card, with Configure rendered as a real <ul> + nested <ul>
//   so the bullet styling matches the screenshot.
// ---------------------------------------------------------------------------
function CodexIntegrationDetail() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#1a1a1a] text-white">
          <OpenAILogo className="size-8" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">Codex</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Delegate issues to Codex directly from Linear
          </p>
        </div>
      </header>

      {/* Built by / Website / Enable rail */}
      <div className="bg-card flex flex-wrap items-start justify-between gap-4 rounded-lg border p-4">
        <div className="flex gap-8">
          <div>
            <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Built by
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
              <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
              OpenAI
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Website
            </div>
            <a
              href="https://openai.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="OpenAI website (opens in new tab)"
              className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
            >
              <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
              openai.com
            </a>
          </div>
        </div>
        <Button size="sm" asChild aria-label="Enable Codex (opens in new tab)">
          <a
            href="https://chatgpt.com/codex"
            target="_blank"
            rel="noopener noreferrer"
          >
            Enable
            <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
          </a>
        </Button>
      </div>

      {/* Body — single rounded card holding the screenshots and all docs
          sections (Overview / Availability / How it works / Configure). */}
      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        {/* Screenshot tiles — flat dark surfaces matching Linear's theme */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Left tile — Codex panel inside an issue */}
          <div
            aria-hidden
            className="flex aspect-[4/3] items-center justify-center rounded-lg border bg-[#1a1a1a] p-3 text-white"
          >
            <div className="w-full rounded-md border border-white/10 bg-[#222] px-2 py-1.5 text-[7px]">
              <div className="flex items-center justify-between border-b border-white/10 pb-1">
                <span className="flex items-center gap-1 font-medium">
                  <span className="flex size-2.5 items-center justify-center rounded-full bg-white text-[5px] text-black">
                    <OpenAILogo className="size-1.5" />
                  </span>
                  Codex connected
                </span>
                <span className="text-white/50">⤢ Codex · · · ×</span>
              </div>
              <div className="mt-1.5 space-y-1">
                <div>
                  <div className="text-white/80">
                    <span className="text-white">steven</span>{" "}
                    <span className="text-white/40">8h ago</span>
                  </div>
                  <div className="text-white/60">@Codex please take a look</div>
                </div>
                <div className="leading-tight text-white/60">
                  On it! I&apos;ve received your request.
                </div>
                <div className="leading-tight text-white/60">
                  Kicked off a task in &lsquo;acme-app&rsquo; environment.
                </div>
                <div className="leading-tight text-white/60">
                  Track progress here:{" "}
                  <span className="text-blue-400 underline">View task →</span>
                </div>
                <div className="border-t border-white/10 pt-1">
                  <div className="flex items-center gap-1">
                    <span className="flex size-2.5 items-center justify-center rounded-full bg-white">
                      <OpenAILogo className="size-1.5 text-black" />
                    </span>
                    <span>Codex</span>{" "}
                    <span className="text-white/40">8h ago</span>
                  </div>
                  <div className="mt-0.5 font-medium">Summary</div>
                  <div className="leading-tight text-white/60">
                    • Corrected a null pointer exception in the login service
                    caused by an…
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right tile — desktop notification toast */}
          <div
            aria-hidden
            className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border bg-[#1a1a1a] p-3"
          >
            <div className="w-full rounded-md border border-white/10 bg-[#222] px-2 py-1.5 text-[7px] text-white shadow-md">
              <div className="flex items-start gap-1.5">
                <span className="mt-0.5 flex size-3 shrink-0 items-center justify-center rounded-full bg-white">
                  <OpenAILogo className="size-2 text-black" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span>
                      <span className="mr-1 inline-block size-1 rounded-full bg-orange-500 align-middle" />
                      <span className="font-medium">
                        ENG-928 Uninitialized config variable
                      </span>
                    </span>
                    <span className="text-white/50">now</span>
                  </div>
                  <div className="leading-tight text-white/60">
                    Codex finished: Corrected a null pointer exception…
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <CodexSection title="Overview">
          Codex is a coding agent that can take on entire tasks on your behalf,
          straight from Linear. When you assign or mention{" "}
          <span className="text-foreground font-medium">@Codex</span> in an
          issue, Codex spins up a cloud agent to start working, posting updates
          back to Linear as it makes progress. It posts a link to the completed
          task in Codex cloud for you to review, create a PR, or continue
          working.
        </CodexSection>

        <CodexSection title="Availability">
          Codex in Linear is available to ChatGPT users on Plus, Pro Business,
          Enterprise, or Edu plans.
        </CodexSection>

        <CodexSection title="How it works">
          Codex looks at the context in the issue to decide which Codex Cloud
          Environment to use, or you can also mention the name of the
          environment you intend, such as by writing &ldquo;
          <span className="text-foreground font-medium italic">
            @Codex fix the above in openai/codex
          </span>
          &rdquo;. Codex will update the issues with suggested solutions for you
          to approve and finalize.
        </CodexSection>

        <section>
          <h2 className="text-sm font-semibold">Configure</h2>
          <ul className="text-muted-foreground mt-3 list-disc space-y-3 pl-5 text-sm leading-6">
            <li>
              <span className="text-foreground font-medium">
                Set up Codex Cloud Tasks
              </span>{" "}
              –
              <ul className="mt-2 list-[circle] space-y-2 pl-5">
                <li>
                  If you don&apos;t have one yet, sign up for a Plus, Pro,
                  Business, Enterprise, or Edu plan. (
                  <a
                    href="https://openai.com/chatgpt/pricing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Pricing
                  </a>
                  ). Then enable Cloud Tasks by{" "}
                  <a
                    href="https://chatgpt.com/codex/settings"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    connecting GitHub
                  </a>
                  , and finally{" "}
                  <a
                    href="https://chatgpt.com/codex/settings"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    set up an environment
                  </a>
                  . If you&apos;re on an Enterprise plan, you may first need to
                  ask your ChatGPT workspace admin to enable both Codex Cloud
                  Tasks in{" "}
                  <a
                    href="https://chatgpt.com/admin"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    workspace settings
                  </a>
                  , and the &ldquo;Codex for Linear&rdquo; Connector in{" "}
                  <a
                    href="https://chatgpt.com/admin/connectors"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    connector settings
                  </a>
                  .
                </li>
              </ul>
            </li>
            <li>
              <span className="text-foreground font-medium">
                Install the Codex agent in your Linear workspace
              </span>{" "}
              – Do this from{" "}
              <a
                href="https://chatgpt.com/codex/settings"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Codex settings
              </a>
              .
            </li>
            <li>
              <span className="text-foreground font-medium">
                Add @Codex to your issues
              </span>{" "}
              - Try mentioning{" "}
              <span className="text-foreground font-medium">@Codex</span> in an
              issue or assigning them one to kick off the agent session.
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}

function CodexSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-2 text-sm leading-6">{children}</p>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Cursor integration detail. Same docs-style chrome as the Codex page (third
// party agent → BUILT BY Cursor + WEBSITE cursor.com + an Enable CTA that
// opens cursor.com in a new tab). Two flat dark screenshot tiles imitate
// Linear's own theme: a cascade of issue Properties panels showing Cursor
// transitioning Todo → In Progress → In Review → Done on the left, and a
// comment input with the @cursor mention picker on the right.
// ---------------------------------------------------------------------------
function CursorIntegrationDetail() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#1a1a1a] text-white">
          <CursorLogo className="size-8" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">Cursor</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Turn issues into pull requests with Cursor cloud agents
          </p>
        </div>
      </header>

      {/* Body card — header rail + screenshots + docs sections all share one
          rounded surface, matching the production layout. */}
      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        {/* Built by / Website / Enable rail */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-8">
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Built by
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                Cursor
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Website
              </div>
              <a
                href="https://cursor.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Cursor website (opens in new tab)"
                className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
              >
                <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
                cursor.com
              </a>
            </div>
          </div>
          <Button
            size="sm"
            asChild
            aria-label="Enable Cursor (opens in new tab)"
          >
            <a
              href="https://cursor.com/agents"
              target="_blank"
              rel="noopener noreferrer"
            >
              Enable
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
            </a>
          </Button>
        </div>

        {/* Screenshot tiles */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Left tile — three Properties panels cascading right */}
          <div
            aria-hidden
            className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border bg-[#1a1a1a] p-3 text-white"
          >
            {[
              {
                status: "In Progress",
                statusDot: "bg-yellow-400",
                assignee: "Yann",
                offset: "left-2 top-3",
                z: "z-30",
              },
              {
                status: "In Review",
                statusDot: "bg-emerald-400",
                assignee: "Adrien",
                offset: "left-1/3 top-1/4",
                z: "z-20",
              },
              {
                status: "Done",
                statusDot: "bg-violet-400",
                assignee: "Karri",
                offset: "left-2/3 top-1/3",
                z: "z-10",
              },
            ].map((p, i) => (
              <div
                key={i}
                className={cn(
                  "absolute w-2/5 rounded-md border border-white/10 bg-[#222] px-2 py-1.5 text-[7px] shadow-md",
                  p.offset,
                  p.z
                )}
              >
                <div className="text-white/50">Properties</div>
                <div className="mt-1 flex items-center gap-1">
                  <span className={cn("size-2 rounded-full", p.statusDot)} />
                  {p.status}
                </div>
                <div className="mt-1 flex items-center gap-1">
                  <span className="bg-muted/40 size-2 rounded-full" />
                  {p.assignee}
                </div>
                <div className="mt-1 flex items-center gap-1">
                  <CursorLogo className="size-2 text-white" />
                  Cursor
                </div>
                <div className="text-muted-foreground mt-1 flex items-center gap-1">
                  <span className="size-2">⚠</span>
                  Set estimate
                </div>
              </div>
            ))}
          </div>

          {/* Right tile — comment field + @cursor mention picker */}
          <div
            aria-hidden
            className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border bg-[#1a1a1a] p-3 text-white"
          >
            <div className="relative w-3/4 rounded-md border border-white/10 bg-[#222] px-2 py-1.5 text-[7px] shadow-md">
              <div className="text-white/80">
                Can you take a stab at this @cur
                <span className="bg-muted/40 inline-block h-2 w-px align-middle" />
              </div>
              <div className="absolute top-full left-1/3 mt-1 w-3/4 rounded-md border border-white/10 bg-[#2a2a2a] px-1.5 py-1 shadow-md">
                <div className="text-white/40">Users</div>
                <div className="mt-0.5 flex items-center justify-between rounded bg-white/5 px-1 py-0.5">
                  <span className="flex items-center gap-1">
                    <CursorLogo className="size-2 text-white" />
                    Cursor
                  </span>
                  <span className="rounded bg-blue-500/20 px-1 text-[6px] text-blue-300">
                    Agent
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-1 px-1 py-0.5">
                  <span className="bg-muted/40 size-2 rounded-full" />
                  Curtis
                </div>
              </div>
            </div>
          </div>
        </div>

        <CodexSection title="Overview">
          Assign any Linear issue to Cursor, and a cloud agent will get to work.
          You can track progress directly in Linear, the Cursor web app, or your
          IDE. Once the task is complete, the Cursor agent will update the issue
          automatically with a PR.
        </CodexSection>

        <section>
          <h2 className="text-sm font-semibold">How it works</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            When you connect Cursor with Linear, you can assign any issue in
            Linear directly to Cursor. Once assigned, Cursor automatically spins
            up a cloud agent to begin tackling the task. The agent works in
            context of the issue, pulling in the relevant details from Linear so
            that progress always stays aligned with the original request.
          </p>
          <p className="text-muted-foreground mt-4 text-sm leading-6">
            As the agent works, updates flow back into Linear, so you can track
            progress without leaving your existing workflow. You&apos;ll also
            see activity and results in the Cursor web app and within your IDE,
            making it easy to monitor and refine work from whichever tool you
            prefer. This unified view keeps everyone on the team aligned,
            whether they primarily use Linear or Cursor.
          </p>
          <p className="text-muted-foreground mt-4 text-sm leading-6">
            When the agent completes a task, it records the results and marks
            the issue with the final output. Teams can then review the solution
            in Linear, dive deeper in the Cursor app, or continue iterating
            directly from the IDE. The integration ensures that assignments,
            status updates, and deliverables stay synchronized across all three
            surfaces, reducing manual coordination and making it seamless to
            move from planning to execution.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold">Configure</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            On Cursor&apos;s Pro or Ultra plans, an admin can install the cloud
            agent to your workspace from{" "}
            <a
              href="https://cursor.com/integrations/linear"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              here
            </a>
            . Once connected, you can delegate work to the Cursor agent in by
            mentioning in an issue, or from the assignee menu. Detailed steps
            can be found in Cursor&apos;s{" "}
            <a
              href="https://docs.cursor.com/agents/linear"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              documentation
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// GitHub Copilot integration detail. Like Codex/Cursor this is a third-party
// agent docs page (BUILT BY GitHub, WEBSITE github.com, external Enable),
// with two flat dark screenshot tiles at the top of the body card and three
// docs sections beneath: Overview (intro paragraph + "When you assign…" +
// numbered list), How it works (bulleted list), and Configure (numbered
// list with an inline link).
// ---------------------------------------------------------------------------
function CopilotIntegrationDetail() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white text-black">
          <CopilotLogo className="size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">
            GitHub Copilot
          </h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Turn Linear issues into code with GitHub Copilot coding agent
          </p>
        </div>
      </header>

      {/* Body card */}
      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        {/* Built by / Website / Enable rail */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-8">
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Built by
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                GitHub
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Website
              </div>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub website (opens in new tab)"
                className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
              >
                <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
                github.com
              </a>
            </div>
          </div>
          <Button
            size="sm"
            asChild
            aria-label="Enable GitHub Copilot (opens in new tab)"
          >
            <a
              href="https://github.com/features/copilot"
              target="_blank"
              rel="noopener noreferrer"
            >
              Enable
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
            </a>
          </Button>
        </div>

        {/* Screenshot tiles */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Left tile — Activity panel mock */}
          <div
            aria-hidden
            className="flex aspect-[4/3] items-center justify-center rounded-lg border bg-[#1a1a1a] p-3 text-white"
          >
            <div className="w-full rounded-md border border-white/10 bg-[#222] px-2 py-1.5 text-[7px]">
              <div className="flex items-center justify-between border-b border-white/10 pb-1">
                <span className="font-medium">Activity</span>
                <span className="text-white/50">Unsubscribe ⊘🔥</span>
              </div>
              <div className="mt-1.5 space-y-1">
                <div className="text-white/60">
                  octocat created the issue · 42min ago
                </div>
                <div className="border-t border-white/10 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <CopilotLogo className="size-2 text-white" />
                      <span className="font-medium">GitHub Copilot</span>
                      <span className="text-white/50">agent connected</span>
                    </span>
                    <span className="text-white/40">⤢ Activity ⋯</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-white">Sid Bhargava</span>{" "}
                    <span className="text-white/40">9min ago</span>
                  </div>
                  <div className="leading-tight text-white/60">
                    @GitHub Copilot can you implement this?
                  </div>
                </div>
                <div className="border-t border-white/10 pt-1">
                  <div className="flex items-center gap-1">
                    <CopilotLogo className="size-2 text-white" />
                    <span className="font-medium">GitHub Copilot</span>
                    <span className="text-white/40">just now</span>
                  </div>
                  <div className="leading-tight text-white/60">
                    Copilot has completed the issue. See the pull request ↓
                  </div>
                  <div className="mt-1 flex items-center gap-1 rounded border border-white/10 bg-[#1a1a1a] px-1 py-0.5">
                    <span className="text-white/60">↓</span>
                    <span>Add ASCII octocat art to readme.md</span>
                    <span className="ml-auto flex items-center gap-0.5 text-white/50">
                      <CopilotLogo className="size-1.5 text-white" />
                      GitHub Copilot
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right tile — repository selector */}
          <div
            aria-hidden
            className="flex aspect-[4/3] items-center justify-center rounded-lg border bg-[#1a1a1a] p-3 text-white"
          >
            <div className="w-full rounded-md border border-white/10 bg-[#222] px-2 py-1.5 text-[7px]">
              <div className="flex items-center justify-between border-b border-white/10 pb-1">
                <span className="flex items-center gap-1">
                  <CopilotLogo className="size-2 text-white" />
                  <span className="font-medium">GitHub Copilot</span>
                  <span className="text-white/50">agent connected</span>
                  <span className="text-white/40">just now</span>
                </span>
                <span className="text-white/40">
                  ⤢ GitHub Copilot · Activity
                </span>
              </div>
              <div className="mt-1.5 space-y-1">
                <div className="flex items-center gap-1">
                  <CopilotLogo className="size-2 text-white" />
                  <span className="font-medium">GitHub Copilot</span>
                  <span className="text-white/40">just now</span>
                </div>
                <div className="text-white/70">
                  Please select the GitHub repository to work in
                </div>
                <div className="flex items-center justify-between rounded border border-white/10 bg-[#1a1a1a] px-1 py-0.5">
                  <span className="text-white/60">Select repository</span>
                  <span className="text-white/40">▾</span>
                </div>
                <div className="space-y-0.5 rounded border border-white/10 bg-[#1a1a1a] px-1 py-1">
                  <div className="flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-white/30" />
                    <span>Hello-World</span>
                    <span className="truncate text-white/40">
                      https://github.com/octocat/hello-world
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-white/30" />
                    <span>Spoon-Knife</span>
                    <span className="truncate text-white/40">
                      https://github.com/octocat/spoon-knife
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overview */}
        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            You can now assign issues in Linear to GitHub Copilot coding agent,
            GitHub&apos;s asynchronous, autonomous background agent.
          </p>
          <p className="text-muted-foreground mt-4 text-sm leading-6">
            When you assign a Linear issue to Copilot, it will:
          </p>
          <ol className="text-muted-foreground mt-3 list-decimal space-y-2 pl-6 text-sm leading-6">
            <li>Analyze the issue contents and open a draft pull request</li>
            <li>
              Work independently in its own ephemeral development environment,
              powered by GitHub Actions. Within this environment, Copilot can
              explore your code, make changes, run automated tests and linters,
              and more.
            </li>
            <li>
              Stream progress updates back to your Linear activity timeline
            </li>
            <li>
              Request a pull request review from you when work is completed
            </li>
          </ol>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-sm font-semibold">How it works</h2>
          <ul className="text-muted-foreground mt-3 list-disc space-y-2 pl-6 text-sm leading-6">
            <li>
              Automate repetitive tasks like bug fixes, refactors, and
              documentation updates
            </li>
            <li>
              Reduce manual steps and context switching between Linear and
              GitHub
            </li>
            <li>
              Follow your existing review and approval rules for every pull
              request Copilot creates
            </li>
          </ul>
        </section>

        {/* Configure */}
        <section>
          <h2 className="text-sm font-semibold">Configure</h2>
          <ol className="text-muted-foreground mt-3 list-decimal space-y-2 pl-6 text-sm leading-6">
            <li>
              Workspace admin{" "}
              <a
                href="https://github.com/apps/copilot-swe-agent"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                installs
              </a>{" "}
              the integration
            </li>
            <li>
              Users must link their GitHub account to Linear in order to use the
              integration (users will be prompted to do this in the UI)
            </li>
          </ol>
        </section>
      </div>
    </div>
  )
}

// Factory integration detail. Third-party agent (BUILT BY Factory, WEBSITE
// factory.ai, external Enable). Body card has a single dark backlog tile with
// an "Assign to..." popover showing Code Droid selected, followed by Overview
// / How it works / Configure prose copy.
// ---------------------------------------------------------------------------
function FactoryIntegrationDetail() {
  const todoCards = [
    { id: "PRO-14", title: "Implement Dark Mode" },
    { id: "PRO-18", title: "Optimize Image Rendering Pipeline" },
    { id: "PRO-14", title: "Implement Dark Mode" },
  ]
  const inProgressCards = [{ id: "PRO-9", title: "Fix WebSocket Reconnection" }]

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[#5B2D8E]">
          <FactoryLogo className="size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">Factory</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Assign issues from your backlog to Droids
          </p>
        </div>
      </header>

      {/* Body card */}
      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        {/* Built by / Website / Enable rail */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-8">
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Built by
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                Factory
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Website
              </div>
              <a
                href="https://factory.ai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Factory website (opens in new tab)"
                className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
              >
                <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
                factory.ai
              </a>
            </div>
          </div>
          <Button
            size="sm"
            asChild
            aria-label="Enable Factory (opens in new tab)"
          >
            <a
              href="https://factory.ai"
              target="_blank"
              rel="noopener noreferrer"
            >
              Enable
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
            </a>
          </Button>
        </div>

        {/* Backlog screenshot tile with "Assign to..." popover */}
        <div
          aria-hidden
          className="relative overflow-hidden rounded-lg border bg-[#0e0e10] p-4 text-white"
        >
          <div className="grid grid-cols-2 gap-4 font-mono text-[11px]">
            {/* Todo column */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-white/70">
                <span className="inline-block size-2.5 rounded-full border border-white/40" />
                <span>Todo</span>
                <span className="text-white/40">3</span>
              </div>
              {todoCards.map((c, idx) => (
                <div
                  key={`todo-${idx}`}
                  className="rounded-md border border-white/10 bg-[#161618] px-2.5 py-2"
                >
                  <div className="flex items-center justify-between text-[10px] text-white/50">
                    <span>{c.id}</span>
                    <span className="size-1.5 rounded-full border border-white/30" />
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-white/80">
                    <span className="inline-block size-2.5 rounded-full border border-white/40" />
                    <span>{c.title}</span>
                  </div>
                  <div className="mt-2 flex items-end gap-0.5">
                    <span className="block h-1 w-1 bg-white/20" />
                    <span className="block h-1.5 w-1 bg-white/30" />
                    <span className="block h-2 w-1 bg-white/40" />
                  </div>
                </div>
              ))}
            </div>

            {/* In progress column */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-white/70">
                <span className="inline-block size-2.5 rounded-full border-2 border-yellow-400/70" />
                <span>In progress</span>
                <span className="text-white/40">2</span>
              </div>
              {inProgressCards.map((c, idx) => (
                <div
                  key={`prog-${idx}`}
                  className="rounded-md border border-white/10 bg-[#161618] px-2.5 py-2"
                >
                  <div className="flex items-center justify-between text-[10px] text-white/50">
                    <span>{c.id}</span>
                    <span className="size-1.5 rounded-full border border-white/30" />
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-white/80">
                    <span className="inline-block size-2.5 rounded-full border border-white/40" />
                    <span>{c.title}</span>
                  </div>
                  <div className="mt-2 flex items-end gap-0.5">
                    <span className="block h-1 w-1 bg-white/20" />
                    <span className="block h-1.5 w-1 bg-white/30" />
                    <span className="block h-2 w-1 bg-white/40" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assign to... popover */}
          <div className="absolute top-24 right-6 w-56 rounded-md border border-white/10 bg-[#1a1a1d] p-1.5 font-mono text-[11px] shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 px-2 py-1.5 text-white/60">
              <span>Assign to ...</span>
              <span className="rounded border border-white/15 px-1 text-[9px] text-white/50">
                A
              </span>
            </div>
            <div className="mt-1 space-y-0.5">
              <div className="flex items-center gap-2 rounded px-2 py-1 text-white/60">
                <span className="size-2 rounded-full bg-white/30" />
                <span>No assignee</span>
              </div>
              <div className="flex items-center gap-2 rounded bg-white/5 px-2 py-1 text-white">
                <span className="size-2 rounded-full bg-orange-500" />
                <span>Code Droid</span>
                <span className="ml-auto text-white/70">✓</span>
              </div>
            </div>
            <div className="mt-1.5 border-t border-white/10 px-2 py-1 text-[9px] tracking-wider text-white/40 uppercase">
              Project members
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 rounded px-2 py-1 text-white/60">
                <span className="size-2 rounded-full bg-white/30" />
                <span>mike</span>
              </div>
              <div className="flex items-center gap-2 rounded px-2 py-1 text-white/60">
                <span className="size-2 rounded-full bg-white/30" />
                <span>jessica</span>
              </div>
            </div>
          </div>
        </div>

        {/* Overview */}
        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Delegate any Linear issue to Factory, and an autonomous Droid spins
            up to handle it. Droids work in isolated cloud environments, pulling
            full context from your issues: descriptions, comments, linked
            tickets, and dependencies. Track real-time progress as Droids code,
            test, and create pull requests, all without leaving Linear.
          </p>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-sm font-semibold">How it works</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Connect Factory with Linear, then mention{" "}
            <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">
              @Factory
            </code>{" "}
            in a comment or assign an issue from the assignee menu. Factory
            instantly provisions a remote workspace and launches a Droid with
            complete context.
          </p>
          <p className="text-muted-foreground mt-4 text-sm leading-6">
            As Droids work, live updates flow back into Linear through agent
            activities. You&apos;ll see their thinking process, tool
            invocations, and explanations in real time. Each activity reveals
            what&apos;s happening and why, keeping your team informed without
            switching tools. Droids don&apos;t just generate code, they iterate
            autonomously. Running tests, linting, catching errors, refactoring
            based on failures, validating against requirements. When edge cases
            emerge, they adapt and document decisions so your team understands
            the reasoning behind every change.
          </p>
          <p className="text-muted-foreground mt-4 text-sm leading-6">
            When complete, Factory opens a pull request linked to the original
            issue and emits a final summary. PR Review Droids automatically
            review the code once it lands in GitHub or GitLab, providing
            feedback. From assignment to review, the entire pipeline runs
            without manual intervention.
          </p>
          <p className="text-muted-foreground mt-4 text-sm leading-6">
            Scale your engineering capacity instantly by running tens or
            hundreds simultaneously, each in its own isolated environment.
            Factory&apos;s remote workspace architecture enables parallelized
            work through concurrent Droids.
          </p>
        </section>

        {/* Configure */}
        <section>
          <h2 className="text-sm font-semibold">Configure</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Workspace admins can enable Factory from the{" "}
            <a
              href="https://factory.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              integration settings
            </a>{" "}
            and authorize Linear access. Once connected,{" "}
            <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">
              @Factory
            </code>{" "}
            becomes available as an assignee across all teams.
          </p>
        </section>
      </div>
    </div>
  )
}

// Sentry Agent integration detail. Third-party agent (BUILT BY Sentry,
// WEBSITE sentry.io, external Enable). Body card has two dark screenshot
// tiles — left: an Activity timeline with a Root Cause Analysis being
// generated; right: a Sentry agent reply with code-style event trace —
// followed by Overview / How it works / Configure prose with Install,
// Authorize, Verify Webhooks, and Requirements subsections.
// ---------------------------------------------------------------------------
function SentryAgentIntegrationDetail() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#4C1D95] text-white">
          <SentryLogo className="size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">Sentry Agent</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Resolve Linear Issues with Seer by Sentry
          </p>
        </div>
      </header>

      {/* Body card */}
      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        {/* Built by / Website / Enable rail */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-8">
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Built by
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                Sentry
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Website
              </div>
              <a
                href="https://sentry.io"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Sentry website (opens in new tab)"
                className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
              >
                <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
                sentry.io
              </a>
            </div>
          </div>
          <Button
            size="sm"
            asChild
            aria-label="Enable Sentry Agent (opens in new tab)"
          >
            <a
              href="https://sentry.io"
              target="_blank"
              rel="noopener noreferrer"
            >
              Enable
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
            </a>
          </Button>
        </div>

        {/* Screenshot tiles */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Left tile — Activity panel mock */}
          <div
            aria-hidden
            className="flex aspect-[4/3] items-center justify-center rounded-lg border bg-[#0e0e10] p-3 text-white"
          >
            <div className="w-full rounded-md border border-white/10 bg-[#161618] px-2 py-1.5 text-[7px]">
              <div className="flex items-center justify-between border-b border-white/10 pb-1">
                <span className="font-medium">Activity</span>
                <span className="flex items-center gap-1 text-white/50">
                  Unsubscribe
                  <span className="text-purple-400">⊘</span>
                  <span className="text-orange-400">🔥</span>
                </span>
              </div>
              <div className="mt-1.5 space-y-1">
                <div className="flex items-center gap-1 text-white/60">
                  <SentryLogo className="size-2 text-purple-400" />
                  <span>Sentry created the issue</span>
                  <span className="text-white/40">· 8min ago</span>
                </div>
                <div className="flex items-center gap-1 text-white/60">
                  <span className="size-1.5 rounded-full bg-white/30" />
                  <span>Linear notified Tom Moor</span>
                  <span className="text-white/40">· 8min ago</span>
                </div>
                <div className="border-t border-white/10 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <SentryLogo className="size-2 text-purple-400" />
                      <span className="font-medium">Sentry agent</span>
                      <span className="text-white/50">connected</span>
                      <span className="text-white/40">just now</span>
                    </span>
                    <span className="flex items-center gap-1 text-white/40">
                      <SentryLogo className="size-1.5 text-purple-400" />
                      Sentry · Activity ⋯
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-orange-400" />
                    <span className="text-white">Tom Moor</span>
                    <span className="text-white/40">just now</span>
                  </div>
                  <div className="leading-tight text-white/70">
                    @sentry, what&apos;s causing this bug?
                  </div>
                </div>
                <div className="border-t border-white/10 pt-1">
                  <div className="flex items-center justify-between rounded border border-white/10 bg-[#1a1a1d] px-1 py-0.5">
                    <span className="flex items-center gap-1">
                      <span className="text-white/60">📄</span>
                      <span className="text-white/70">
                        Creating a Root Cause Analysis. This might take a
                        moment...
                      </span>
                    </span>
                    <span className="text-white/40">0:05</span>
                  </div>
                </div>
                <div className="border-t border-white/10 pt-1">
                  <div className="flex items-center justify-between rounded border border-white/10 bg-[#1a1a1d] px-1 py-0.5">
                    <span className="flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-orange-400" />
                      <span className="text-white/60">Message Sentry...</span>
                    </span>
                    <span className="flex items-center gap-1 text-white/40">
                      <span>📎</span>
                      <span>↑</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right tile — Root Cause Analysis result */}
          <div
            aria-hidden
            className="flex aspect-[4/3] items-center justify-center rounded-lg border bg-[#0e0e10] p-3 text-white"
          >
            <div className="w-full rounded-md border border-white/10 bg-[#161618] px-2 py-1.5 text-[7px]">
              <div className="flex items-center gap-1 border-b border-white/10 pb-1">
                <SentryLogo className="size-2 text-purple-400" />
                <span className="font-medium">Sentry</span>
                <span className="text-white/40">just now</span>
              </div>
              <div className="mt-1.5 space-y-1">
                <div className="font-semibold text-white">
                  Root Cause Analysis
                </div>
                <div className="font-mono text-[6.5px] leading-relaxed text-white/70">
                  <span className="text-purple-400">formatMetricsForOrg</span>{" "}
                  static method loses its context when passed as{" "}
                  <span className="text-purple-400">Array.fro</span>
                  <br />
                  causing <span className="text-orange-400">undefined</span>
                  .formatMetrics{" "}
                  <span className="text-purple-400">TypeError</span>.
                </div>
                <div className="mt-1 font-semibold text-white">Event trace</div>
                <ol className="list-decimal space-y-0.5 pl-3 leading-tight text-white/60">
                  <li>
                    Admin job execution starts, initiating suggestion
                    evaluation.
                  </li>
                  <li>
                    Batch processing of organizations begins, collecting
                    metrics.
                  </li>
                  <li>
                    Batch results are reported, triggering organization-level
                    metric formatting.
                  </li>
                  <li>
                    Organizations are sorted and mapped, losing this context for{" "}
                    <span className="font-mono text-purple-400">
                      formatMetricsForOrg
                    </span>
                    <br />
                    Key Issue: The{" "}
                    <span className="font-mono text-purple-400">
                      sortedOrgs
                    </span>{" "}
                    array is created and then map is called with
                    <br />
                    <span className="font-mono text-purple-400">
                      EvaluateSuggestionsActivity.formatMetricsForOrg
                    </span>{" "}
                    as the callback. Th
                    <br />
                    point where the this context is lost for the{" "}
                    <span className="font-mono text-purple-400">
                      formatMetricsForOrg
                    </span>{" "}
                    method.
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Overview */}
        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            The Sentry Agent helps teams resolve issues faster by bringing
            Seer&apos;s root cause analyses directly into Linear. When you
            mention the agent in a Linear issue, it runs diagnostics in Sentry
            and posts back insights so you can quickly understand and act on
            problems without switching tools.
          </p>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-sm font-semibold">How it works</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            The Sentry Agent integration connects Sentry&apos;s debugging
            insights with Linear&apos;s issue tracking so teams can investigate
            and resolve problems without leaving their workflow. Once configured
            through secure OAuth, the agent listens for activity from both
            Sentry and Linear via webhooks, handling events like issue detail
            requests or Seer issue fix operations.
          </p>
          <p className="text-muted-foreground mt-4 text-sm leading-6">
            When triggered, it can initiate Seer runs in Sentry, generating root
            cause analyses that are posted back into Linear issues alongside
            other context so developers can quickly understand what went wrong
            and how to fix it.
          </p>
        </section>

        {/* Configure */}
        <section>
          <h2 className="text-sm font-semibold">Configure</h2>

          <div className="mt-3 space-y-4">
            <div>
              <h3 className="text-sm font-semibold">Install the Agent</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                Start by installing the Sentry Agent in your Linear workspace.
                You&apos;ll be prompted to connect both Linear and Sentry
                through their respective OAuth flows. These flows are mapped to
                your end user ensuring that users access is limited to only the
                environments they have permissions to.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold">Authorize Access</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                During setup, you&apos;ll grant the agent access to your Linear
                workspace and your Sentry account. This ensures it can fetch
                issue data, run Seer analyses, and post results back into Linear
                issues. You&apos;ll see explicit prompts to approve these
                permissions during the OAuth process.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold">Verify Webhooks</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                The integration relies on webhook activity from both Linear and
                Sentry (for things like agent mentions, issue updates, and
                installation events). These are automatically configured during
                setup, with all incoming requests verified using HMAC signatures
                to prevent spoofing.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold">Requirements</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                You&apos;ll need to be an admin in your Linear workspace to
                install the app, and a Sentry org member with permissions to
                approve OAuth apps for your org.
              </p>
              <p className="text-muted-foreground mt-4 text-sm leading-6">
                Each user interacting with the agent in Linear will need to
                authenticate their own Sentry account so the integration can
                perform Seer runs or retrieve issue details tied to that user.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

// Devin integration detail. Third-party agent (BUILT BY Cognition, WEBSITE
// devin.ai, external Enable). Body card has two light-on-gradient screenshot
// tiles — left: a Devin scoping comment with Task / Existing Code / Proposed
// Solution + confidence pills; right: a Linear backlog where every issue is
// auto-assigned to devin — followed by Overview / How it works (with bullet
// list) / Configure prose with a "Devin's settings" link.
// ---------------------------------------------------------------------------
function DevinIntegrationDetail() {
  const eng = [
    { id: "ENG-2", title: "Display the number of queries for each ite..." },
    { id: "ENG-5", title: "Analyze performance and identify blockin..." },
    { id: "ENG-4", title: "Update the docs.devin.ai site release note..." },
    { id: "ENG-3", title: "Update the cognition.ai website banner to ..." },
    { id: "ENG-13", title: "Update the docs.devin.ai site release note..." },
    { id: "ENG-12", title: "Analyze performance and identify blockin..." },
  ]
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[#0057FF]">
          <DevinLogo className="size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">Devin</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Automate work from issue to tested PR with Devin
          </p>
        </div>
      </header>

      {/* Body card */}
      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        {/* Built by / Website / Enable rail */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-8">
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Built by
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                Cognition
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Website
              </div>
              <a
                href="https://devin.ai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Devin website (opens in new tab)"
                className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
              >
                <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
                devin.ai
              </a>
            </div>
          </div>
          <Button
            size="sm"
            asChild
            aria-label="Enable Devin (opens in new tab)"
          >
            <a
              href="https://devin.ai"
              target="_blank"
              rel="noopener noreferrer"
            >
              Enable
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
            </a>
          </Button>
        </div>

        {/* Screenshot tiles — light cards on a soft purple/teal gradient */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Left tile — Devin scoping comment */}
          <div
            aria-hidden
            className="aspect-[4/3] rounded-lg p-3"
            style={{
              background:
                "linear-gradient(135deg, #b3e8db 0%, #d6c7f5 50%, #b9b6f3 100%)",
            }}
          >
            <div className="flex h-full w-full flex-col rounded-md bg-white p-2 text-[7px] text-zinc-900 shadow">
              <div className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-zinc-300" />
                <span className="font-medium">Jane</span>
                <span className="text-zinc-400">5h ago</span>
              </div>
              <div className="mt-0.5">@devin can you scope this issue?</div>
              <div className="mt-2 border-t border-zinc-200 pt-1.5">
                <div className="flex items-center gap-1">
                  <DevinLogo className="size-2 text-[#0057FF]" />
                  <span className="font-medium">devin</span>
                  <span className="text-zinc-400">5h ago</span>
                </div>
                <ul className="mt-1 space-y-0.5">
                  <li className="flex gap-1">
                    <span className="text-zinc-400">▸</span>
                    <span>
                      <span className="font-semibold">The Task:</span> Remove
                      all usages of the &quot;
                      <code className="rounded bg-zinc-100 px-0.5 font-mono">
                        allow-skip-github
                      </code>
                      &quot; feature flag from the codebase.{" "}
                      <span className="font-medium">Confidence: Medium</span>{" "}
                      <span className="text-yellow-500">●</span>
                    </span>
                  </li>
                  <li className="flex gap-1">
                    <span className="text-zinc-400">▸</span>
                    <span>
                      <span className="font-semibold">Existing Code:</span> The{" "}
                      <code className="rounded bg-zinc-100 px-0.5 font-mono">
                        allow-skip-github
                      </code>{" "}
                      flag is used in frontend (
                      <code className="rounded bg-zinc-100 px-0.5 font-mono">
                        flags.ts
                      </code>
                      ,{" "}
                      <code className="rounded bg-zinc-100 px-0.5 font-mono">
                        GitIntegrationsOnboarding.tsx
                      </code>
                      ) and backend (
                      <code className="rounded bg-zinc-100 px-0.5 font-mono">
                        organizations.py
                      </code>
                      ) to control GitHub skip functionality.{" "}
                      <span className="font-medium">Confidence: High</span>{" "}
                      <span className="text-emerald-500">●</span>
                    </span>
                  </li>
                  <li className="flex gap-1">
                    <span className="text-zinc-400">▸</span>
                    <span>
                      <span className="font-semibold">Proposed Solution:</span>{" "}
                      Remove flag from{" "}
                      <code className="rounded bg-zinc-100 px-0.5 font-mono">
                        flags.ts
                      </code>
                      ,{" "}
                      <code className="rounded bg-zinc-100 px-0.5 font-mono">
                        GitIntegrationsOnboarding.tsx
                      </code>
                      , and{" "}
                      <code className="rounded bg-zinc-100 px-0.5 font-mono">
                        organizations.py
                      </code>
                      . <span className="font-medium">Confidence: Medium</span>{" "}
                      <span className="text-yellow-500">●</span>
                    </span>
                  </li>
                </ul>
                <div className="mt-1.5 leading-tight text-zinc-500">
                  Looks good?{" "}
                  <a className="text-[#0057FF] underline" href="#">
                    Click here
                  </a>{" "}
                  to start a Devin session to create a PR
                  <br />
                  Needs work? Edit the issue text, then remove and add the Devin
                  label to try again.
                </div>
              </div>
            </div>
          </div>

          {/* Right tile — Linear backlog with all issues assigned to devin */}
          <div
            aria-hidden
            className="aspect-[4/3] rounded-lg p-3"
            style={{
              background:
                "linear-gradient(135deg, #b3e8db 0%, #c9bff5 60%, #8a7ff0 100%)",
            }}
          >
            <div className="flex h-full w-full flex-col rounded-md bg-white p-1.5 text-[7px] text-zinc-900 shadow">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-1">
                <span className="flex items-center gap-1">
                  <span className="grid size-3 place-items-center rounded-sm bg-zinc-200">
                    📁
                  </span>
                  <span className="font-medium">eng-webapp</span>
                </span>
                <span className="flex items-center gap-1 text-zinc-400">
                  🔔 ⌃ ⊕
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 border-b border-zinc-200 pb-1 text-zinc-600">
                <span className="border-b-2 border-zinc-900 pb-0.5 font-medium text-zinc-900">
                  ⊕ All issues
                </span>
                <span>○ Active</span>
                <span>○ Backlog</span>
                <span className="ml-auto">⊞</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-zinc-500">
                <span>≡ Filter</span>
                <span>≡ Display</span>
              </div>
              <div className="mt-1 flex items-center gap-1 text-zinc-700">
                <span>⊙ Done</span>
                <span className="text-zinc-400">10</span>
                <span className="ml-auto text-zinc-400">+</span>
              </div>
              <div className="mt-1 flex-1 space-y-0.5">
                {eng.map((row) => (
                  <div
                    key={row.id}
                    className="flex items-center gap-1.5 rounded px-1 py-0.5 hover:bg-zinc-50"
                  >
                    <span className="size-2 rounded-sm border border-zinc-300" />
                    <span className="text-zinc-400">▤</span>
                    <span className="font-mono text-zinc-500">{row.id}</span>
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    <span className="truncate text-zinc-800">{row.title}</span>
                    <span className="ml-auto flex items-center gap-1 text-zinc-500">
                      <span className="rounded bg-zinc-100 px-1 font-medium text-zinc-600">
                        devin
                      </span>
                      <span>⤢</span>
                      <span className="text-zinc-400">Apr 7</span>
                      <span className="size-2 rounded-full bg-zinc-300" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Overview */}
        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            The Devin integration for Linear connects Devin&apos;s autonomous AI
            software engineering capabilities directly to your Linear workflow.
            Devin analyzes engineering tasks, scopes issues, and suggests
            implementation plans within your existing Linear environment.
          </p>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-sm font-semibold">How it works</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Assign Devin to an issue, mention{" "}
            <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">
              @devin
            </code>{" "}
            in a comment, or apply the <span className="italic">devin</span>{" "}
            label to initiate analysis. Devin knows your codebase and will begin
            scoping your issue immediately. Within a few minutes, Devin will
            comment on the issue with:
          </p>
          <ul className="text-muted-foreground mt-3 list-disc space-y-2 pl-6 text-sm leading-6">
            <li>A summary of the current code</li>
            <li>An implementation plan</li>
            <li>Any edge cases or questions that need your attention</li>
          </ul>
          <p className="text-muted-foreground mt-4 text-sm leading-6">
            Devin has the self-awareness to report <span aria-hidden>🔴</span>/
            <span aria-hidden>🟠</span>/<span aria-hidden>🟢</span> confidence
            estimates next to its suggestions. You can assign Devin to multiple
            issues at once, too.
          </p>
          <p className="text-muted-foreground mt-4 text-sm leading-6">
            Review the implementation plan and use Devin&apos;s analysis to get
            up to speed. You can continue working with Devin in Linear to update
            the implementation plan or click the link in Devin&apos;s response
            to draft a PR in a Devin session or open up a Devin space for
            further analysis. The Devin session and any PRs created within the
            session will be automatically linked to the Linear issue.
          </p>
        </section>

        {/* Configure */}
        <section>
          <h2 className="text-sm font-semibold">Configure</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Connect Devin to your Linear account from{" "}
            <a
              href="https://devin.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              Devin&apos;s settings
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}

// ChatPRD integration detail. Third-party agent (BUILT BY ChatPRD, WEBSITE
// chatprd.ai, external Enable). Body card has two screenshot tiles on
// gradient backgrounds — left: lavender tile with marketing tagline +
// Activity panel showing @chatprd rewriting an issue title; right: coral
// tile with a "Get product feedback" headline + a generated welcome-email
// draft — followed by Overview / How it works / Configure prose.
// ---------------------------------------------------------------------------
function ChatPrdIntegrationDetail() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      {/* Header */}
      <header className="flex items-start gap-4">
        <div
          className="flex size-14 shrink-0 items-center justify-center rounded-2xl text-white"
          style={{
            background:
              "linear-gradient(135deg, #ffd1e6 0%, #ff8fb5 50%, #c4528b 100%)",
          }}
        >
          <ChatPrdLogo className="size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">ChatPRD</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Writes requirements, manages issues, and gives feedback on your
            product work
          </p>
        </div>
      </header>

      {/* Body card */}
      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        {/* Built by / Website / Enable rail */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-8">
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Built by
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                ChatPRD
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Website
              </div>
              <a
                href="https://chatprd.ai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ChatPRD website (opens in new tab)"
                className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
              >
                <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
                chatprd.ai
              </a>
            </div>
          </div>
          <Button
            size="sm"
            asChild
            aria-label="Enable ChatPRD (opens in new tab)"
          >
            <a
              href="https://chatprd.ai"
              target="_blank"
              rel="noopener noreferrer"
            >
              Enable
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
            </a>
          </Button>
        </div>

        {/* Screenshot tiles */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Left tile — lavender with Activity panel */}
          <div
            aria-hidden
            className="relative aspect-[4/3] overflow-hidden rounded-lg p-3"
            style={{
              background:
                "linear-gradient(135deg, #e9defc 0%, #d6c2f7 60%, #b69cf2 100%)",
            }}
          >
            <div className="absolute top-3 right-1/2 left-3 pr-3 text-[8px] leading-tight font-medium text-zinc-800">
              Mention <span className="font-mono text-pink-600">@chatprd</span>{" "}
              to add an AI-powered product manager in to any issue
            </div>
            <div className="absolute right-2 bottom-2 w-[58%] rounded-md bg-white p-1.5 text-[6.5px] text-zinc-900 shadow-lg">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-0.5">
                <span className="font-medium">Activity</span>
                <span className="text-zinc-400">Unsubscribe</span>
              </div>
              <div className="mt-1 space-y-0.5 text-zinc-600">
                <div className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-zinc-300" />
                  <span>claireve created the issue</span>
                  <span className="text-zinc-400">· 9d ago</span>
                </div>
                <div className="flex items-center gap-1">
                  <ChatPrdLogo className="size-1.5 text-pink-500" />
                  <span>chatprd moved from Backlog to In Progress</span>
                  <span className="text-zinc-400">· 9d ago</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="rounded bg-zinc-100 px-0.5 font-mono text-zinc-700">
                    chatprd-devlocal
                  </span>
                  <span>added issue to Cycle 44</span>
                  <span className="text-zinc-400">· 9d ago</span>
                </div>
              </div>
              <div className="mt-1 border-t border-zinc-200 pt-1">
                <div className="flex items-center gap-1">
                  <ChatPrdLogo className="size-1.5 text-pink-500" />
                  <span className="font-medium">chatprd</span>
                  <span className="text-zinc-400">9d ago</span>
                </div>
                <div className="leading-tight text-zinc-600">
                  I&apos;ve been assigned to this task! I&apos;ll help manage
                  this issue and can assist with requirements,
                  <br />
                  subtasks, or any questions you have. Just @mention me in a
                  comment.
                </div>
              </div>
              <div className="mt-1 border-t border-zinc-200 pt-1">
                <div className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-zinc-300" />
                  <span className="font-medium">claireve</span>
                  <span className="text-zinc-400">9d ago</span>
                </div>
                <div className="leading-tight text-zinc-600">
                  Can you improve the description of this task?
                </div>
              </div>
              <div className="mt-1 border-t border-zinc-200 pt-1">
                <div className="flex items-center gap-1">
                  <ChatPrdLogo className="size-1.5 text-pink-500" />
                  <span className="rounded bg-zinc-100 px-0.5 font-mono text-zinc-700">
                    chatprd-devlocal
                  </span>
                </div>
                <div className="mt-0.5 inline-flex items-center gap-1 rounded bg-zinc-100 px-1 py-0.5 text-zinc-700">
                  ✨ Issue Updated
                </div>
                <div className="mt-0.5 leading-tight text-zinc-600">
                  I&apos;ve improved the issue title and description to make
                  them clearer and more actionable.
                </div>
                <div className="mt-1 font-semibold text-zinc-700">
                  Changes Made
                </div>
                <div className="leading-tight text-zinc-600">
                  <div>Original Title: Welcome email to new users</div>
                  <div>
                    New Title: Implement Automated Welcome Email for New Users
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right tile — coral with email content */}
          <div
            aria-hidden
            className="relative aspect-[4/3] overflow-hidden rounded-lg p-3"
            style={{
              background:
                "linear-gradient(135deg, #fde6c7 0%, #ffb38a 55%, #ff7a55 100%)",
            }}
          >
            <div className="absolute top-3 right-1/2 left-3 pr-3 text-[8px] leading-tight font-medium text-zinc-800">
              Get product feedback from{" "}
              <span className="font-mono text-pink-700">@chatprd</span> without
              leaving your workflow
            </div>
            <div className="absolute right-2 bottom-2 w-[58%] rounded-md bg-white p-1.5 text-[6.5px] text-zinc-900 shadow-lg">
              <div className="flex items-center gap-1 border-b border-zinc-200 pb-0.5">
                <span className="size-1.5 rounded-full bg-zinc-300" />
                <span className="font-medium">claireve</span>
                <span className="text-zinc-400">just now</span>
              </div>
              <div className="mt-0.5 leading-tight text-zinc-700">
                <span className="font-mono text-pink-600">@chatprd</span> can
                you actually write the copy we would use in the email?
              </div>
              <div className="mt-1 border-t border-zinc-200 pt-1">
                <div className="flex items-center gap-1">
                  <ChatPrdLogo className="size-1.5 text-pink-500" />
                  <span className="font-medium">chatprd</span>
                  <span className="text-zinc-400">just now</span>
                </div>
                <div className="leading-tight text-zinc-600">
                  Certainly! Here&apos;s a draft for the welcome email content:
                </div>
                <div className="mt-1 space-y-0.5 leading-tight text-zinc-700">
                  <div className="font-semibold">
                    Subject: Welcome to [Your Product Name] — Let&apos;s Get
                    Started!
                  </div>
                  <div>Hi [User&apos;s First Name],</div>
                  <div>
                    Welcome aboard to [Your Product Name] — we&apos;re thrilled
                    to have you join our community at [Company Name], our goal
                    is to provide you with a seamless experience that empowers
                    you to achieve more.
                  </div>
                  <div className="font-semibold">
                    Explore the Key Features of [Your Product Name]:
                  </div>
                  <div>
                    • Feature 1: Brief description of how it benefits the user.
                  </div>
                  <div>
                    • Feature 2: Brief description of how it benefits the user.
                  </div>
                  <div>
                    • Feature 3: Brief description of how it benefits the user.
                  </div>
                  <div>
                    To ensure a smooth start, don&apos;t forget to check out our
                    [resource page/support resources] where you&apos;ll find
                    essential guides and FAQs to assist you.
                  </div>
                  <div>
                    Should you have any questions or need support, our team is
                    here to help. Reach out to us anytime at [contact
                    information].
                  </div>
                  <div>
                    Looking forward to helping you unlock the full potential of
                    [Your Product Name].
                  </div>
                  <div>Best,</div>
                  <div>The [Your Product Name] Team</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overview */}
        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            ChatPRD&apos;s Linear integration brings AI-powered product
            management directly into your Linear workspace. Instantly improve
            issue descriptions, break down work into actionable sub-issues, and
            get product feedback by simply mentioning{" "}
            <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">
              @chatprd
            </code>{" "}
            in comments. This integration helps teams write clearer
            requirements, accelerate collaboration, and ensure every issue is
            ready for development—without ever leaving Linear.
          </p>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-sm font-semibold">How it works</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            The ChatPRD integration for Linear is an AI-powered product manager
            right in your organization&apos;s workflow. By assigning issues to{" "}
            <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">
              @chatprd
            </code>{" "}
            or mentioning{" "}
            <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">
              @chatprd
            </code>{" "}
            in any issue comment, you can ask for improvements to descriptions,
            request a breakdown of work into actionable sub-issues, or get
            clarification on requirements—all within Linear.
          </p>
          <p className="text-muted-foreground mt-4 text-sm leading-6">
            When you ask for help, ChatPRD considers the context of the issue
            and your specific request, then replies in the thread with clear,
            structured suggestions. It can rewrite issue titles and descriptions
            to follow product management best practices, generate
            discipline-specific sub-issues with done criteria, or point out
            missing information. You can continue the conversation in the same
            thread to refine requirements or request more detail.
          </p>
          <p className="text-muted-foreground mt-4 text-sm leading-6">
            This integration is built for teams and organizations, needing
            consistent, high-quality issue documentation and planning. ChatPRD
            only responds when prompted—by issue creation, assignment, or direct
            mention—so you stay in control of when and how it helps. The goal is
            to make it easier for teams to move from idea to implementation with
            clarity and less manual effort.
          </p>
        </section>

        {/* Configure */}
        <section>
          <h2 className="text-sm font-semibold">Configure</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Navigate to ChatPRD&apos;s integrations{" "}
            <a
              href="https://chatprd.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              settings
            </a>{" "}
            and select to connect Linear. After successful authentication,
            you&apos;ll be able to mention and assign issues to{" "}
            <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">
              @chatprd
            </code>{" "}
            from Linear.
          </p>
        </section>
      </div>
    </div>
  )
}

// Charlie integration detail. Third-party agent (BUILT BY Charlie Labs,
// WEBSITE charlielabs.ai, external Enable). Body card has two light tiles
// with neon-yellow "sticky-note" tags annotating the screenshots —
// left: a comment thread where Charlie diagnoses an issue and opens a PR;
// right: a Charlie-authored Implementation Plan with a small metrics
// table — followed by Overview, How it works (with three labelled
// sub-steps), and Configure prose.
// ---------------------------------------------------------------------------
function CharlieIntegrationDetail() {
  const planRows = [
    {
      n: 1,
      metric: "Agent runs – total",
      def: "Count of agent_runs rows in period",
      consumer: "Ops, Product",
    },
    {
      n: 2,
      metric: "Agent runs – success rate",
      def: "completed / (completed + error)",
      consumer: "Ops",
    },
    {
      n: 3,
      metric: "Agent run avg. duration",
      def: "AVG(completed_at − started_at)",
      consumer: "Perf / Cost",
    },
    {
      n: 4,
      metric: "Webhook events",
      def: "Count of …",
      consumer: "Ops",
    },
  ]

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#C7F154] text-black">
          <CharlieLogo className="size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">Charlie</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Plans, implements, and reviews your TypeScript PRs
          </p>
        </div>
      </header>

      {/* Body card */}
      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        {/* Built by / Website / Enable rail */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-8">
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Built by
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                Charlie Labs
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Website
              </div>
              <a
                href="https://charlielabs.ai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Charlie Labs website (opens in new tab)"
                className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
              >
                <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
                charlielabs.ai
              </a>
            </div>
          </div>
          <Button
            size="sm"
            asChild
            aria-label="Enable Charlie (opens in new tab)"
          >
            <a
              href="https://charlielabs.ai"
              target="_blank"
              rel="noopener noreferrer"
            >
              Enable
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
            </a>
          </Button>
        </div>

        {/* Screenshot tiles */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Left tile — diagnose + creates PR */}
          <div
            aria-hidden
            className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-zinc-50 p-3"
          >
            <span
              className="absolute top-3 right-4 inline-block rotate-[8deg] rounded-sm bg-[#C7F154] px-1.5 py-0.5 text-[7px] font-bold tracking-wider text-black"
              style={{ fontFamily: "var(--font-mono, monospace)" }}
            >
              CODE SEARCH &amp; PLANNING
            </span>
            <div className="mt-1 space-y-1.5 rounded-md bg-white px-2 py-1.5 text-[7px] text-zinc-900 shadow-sm">
              <div>
                <div className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-zinc-300" />
                  <span className="font-medium">steve</span>
                  <span className="text-zinc-400">32m ago</span>
                </div>
                <div className="leading-tight text-zinc-700">
                  @Charlie can you diagnose this issue?
                </div>
              </div>
              <div className="border-t border-zinc-200 pt-1">
                <div className="flex items-center gap-1">
                  <span className="grid size-2 place-items-center rounded-sm bg-[#C7F154]">
                    <CharlieLogo className="size-1.5 text-black" />
                  </span>
                  <span className="font-medium">Charlie</span>
                  <span className="text-zinc-400">29m ago</span>
                </div>
                <div className="leading-tight text-zinc-700">
                  I found an issue in the React router. Let me know if you want
                  me to fix it.
                </div>
                <div className="mt-0.5 flex items-center gap-1 text-zinc-500">
                  <span>▸</span>
                  <span>Here is a detailed plan of how to solve it.</span>
                </div>
              </div>
              <div className="border-t border-zinc-200 pt-1">
                <div className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-zinc-300" />
                  <span className="font-medium">steve</span>
                  <span className="text-zinc-400">22m ago</span>
                </div>
                <div className="leading-tight text-zinc-700">
                  @Charlie please open a pr to fix this issue
                </div>
              </div>
              <div className="border-t border-zinc-200 pt-1 leading-tight text-zinc-600">
                <div className="flex items-center gap-1">
                  <span className="text-zinc-400">⌥</span>
                  <span>Github linked</span>
                  <span className="text-zinc-400">⌥</span>
                  <span className="font-mono text-[6.5px] text-zinc-700">
                    fix(react): router misconfiguration
                  </span>
                  <span className="text-zinc-400">by @Charlie · 18m ago</span>
                </div>
                <div className="mt-0.5 flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  <span>Github moved from In Progress to Done</span>
                </div>
              </div>
            </div>
            <span
              className="absolute right-3 bottom-10 inline-block rotate-[-6deg] rounded-sm bg-[#C7F154] px-1.5 py-0.5 text-[7px] font-bold tracking-wider text-black"
              style={{ fontFamily: "var(--font-mono, monospace)" }}
            >
              CREATES PRs
            </span>
          </div>

          {/* Right tile — implementation plan with metrics table */}
          <div
            aria-hidden
            className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-zinc-50 p-3"
          >
            <span
              className="absolute top-3 right-4 inline-block rotate-[8deg] rounded-sm bg-[#C7F154] px-1.5 py-0.5 text-[7px] font-bold tracking-wider text-black"
              style={{ fontFamily: "var(--font-mono, monospace)" }}
            >
              DETAILED PLANS &amp; SCOPE
            </span>
            <div className="mt-1 space-y-1.5 rounded-md bg-white px-2 py-1.5 text-[7px] text-zinc-900 shadow-sm">
              <div>
                <div className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-zinc-300" />
                  <span className="font-medium">steve</span>
                  <span className="text-zinc-400">7min ago</span>
                </div>
                <div className="leading-tight text-zinc-700">
                  @charlie come up with a plan to implement this feature
                </div>
              </div>
              <div className="border-t border-zinc-200 pt-1">
                <div className="flex items-center gap-1">
                  <span className="grid size-2 place-items-center rounded-sm bg-[#C7F154]">
                    <CharlieLogo className="size-1.5 text-black" />
                  </span>
                  <span className="font-medium">charlie</span>
                  <span className="text-zinc-400">3min ago</span>
                </div>
                <div className="mt-0.5 font-semibold text-zinc-800">
                  Implementation Plan — Initial Metrics Presentation
                </div>
                <div className="mt-0.5 font-semibold text-zinc-800">
                  1. Initial Metric Set
                </div>
                <table className="mt-1 w-full table-fixed border-collapse text-[6.5px]">
                  <thead>
                    <tr className="text-zinc-500">
                      <th className="w-4 border border-zinc-200 px-0.5 py-0.5 text-left font-medium">
                        #
                      </th>
                      <th className="border border-zinc-200 px-0.5 py-0.5 text-left font-medium">
                        Metric
                      </th>
                      <th className="border border-zinc-200 px-0.5 py-0.5 text-left font-medium">
                        Definition
                      </th>
                      <th className="border border-zinc-200 px-0.5 py-0.5 text-left font-medium">
                        Primary Consumer(s)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-zinc-700">
                    {planRows.map((r) => (
                      <tr key={r.n}>
                        <td className="border border-zinc-200 px-0.5 py-0.5">
                          {r.n}
                        </td>
                        <td className="border border-zinc-200 px-0.5 py-0.5">
                          {r.metric}
                        </td>
                        <td className="border border-zinc-200 px-0.5 py-0.5">
                          <code className="rounded bg-zinc-100 px-0.5 font-mono">
                            {r.def}
                          </code>
                        </td>
                        <td className="border border-zinc-200 px-0.5 py-0.5">
                          {r.consumer}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Overview */}
        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Charlie is an autonomous TypeScript engineer capable of creating
            pull requests from Linear issues. Charlie can fix bugs, perform
            migrations, and implement new features.
          </p>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-sm font-semibold">How it works</h2>

          <div className="mt-3 space-y-4">
            <div>
              <h3 className="text-sm font-semibold">
                Create an implementation plan
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                Charlie can create and iterate on a detailed implementation plan
                tailored specifically to the existing code in your repo.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold">Generate a pull request</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                Assign an issue to Charlie and Charlie will implement the plan,
                ensure it passes CI, and open a pull request linked back to
                Linear. You can also mention @Charlie to ask it to start working
                on an issue.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold">Review and improve</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                Need to change something? Leave a review on Charlie&apos;s pull
                request and Charlie will implement the changes and push a
                commit.
              </p>
            </div>
          </div>
        </section>

        {/* Configure */}
        <section>
          <h2 className="text-sm font-semibold">Configure</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Hire Charlie on your team today. To get started,{" "}
            <a
              href="https://charlielabs.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              sign up
            </a>{" "}
            for Charlie and then follow the steps listed{" "}
            <a
              href="https://charlielabs.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              here
            </a>{" "}
            to activate your account.
          </p>
        </section>
      </div>
    </div>
  )
}

// Cursor MCP integration detail. AI client (BUILT BY Cursor, WEBSITE
// cursor.com — no external Enable button on this row). Body card has a
// single large hero tile with the Linear-x-Cursor pairing and a
// "LINEAR INTEGRATIONS" caption, followed by an Overview paragraph and a
// numbered Setup instructions list with inline Kbd shortcuts and a
// JSON config code block.
// ---------------------------------------------------------------------------
function CursorMcpIntegrationDetail() {
  const mcpConfig = `{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.linear.app/mcp"]
    }
  }
}`

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-700 to-zinc-900 text-white">
          <CursorLogo className="size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">Cursor MCP</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Connect Cursor to the Linear MCP server
          </p>
        </div>
      </header>

      {/* Body card */}
      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        {/* Built by / Website rail (no external Enable for AI clients) */}
        <div className="flex flex-wrap items-start gap-8">
          <div>
            <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Built by
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
              <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
              Cursor
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Website
            </div>
            <a
              href="https://cursor.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Cursor website (opens in new tab)"
              className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
            >
              <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
              cursor.com
            </a>
          </div>
        </div>

        {/* Hero pairing tile */}
        <div
          aria-hidden
          className="relative flex aspect-[16/9] flex-col items-center justify-center overflow-hidden rounded-lg border bg-zinc-950 px-6 py-8 text-white"
        >
          <div className="flex items-center gap-10">
            {/* Linear-style striped circle */}
            <svg viewBox="0 0 64 64" className="size-16 text-white" aria-hidden>
              <defs>
                <clipPath id="cursor-mcp-linear-clip">
                  <circle cx="32" cy="32" r="30" />
                </clipPath>
              </defs>
              <g clipPath="url(#cursor-mcp-linear-clip)">
                <rect width="64" height="64" fill="currentColor" />
                <g stroke="#000" strokeWidth="3">
                  <line x1="-20" y1="40" x2="84" y2="-64" />
                  <line x1="-20" y1="56" x2="84" y2="-48" />
                  <line x1="-20" y1="72" x2="84" y2="-32" />
                  <line x1="-20" y1="88" x2="84" y2="-16" />
                </g>
              </g>
            </svg>
            <span className="text-xl text-white/40">×</span>
            <CursorLogo className="size-16 text-white" />
          </div>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.2em] text-white/50">
            LINEAR INTEGRATIONS
          </div>
        </div>

        {/* Overview */}
        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Cursor is a code editor designed for AI-assisted development.
            Connecting Linear&apos;s MCP server lets Cursor&apos;s inline agent
            open context from your issues or create new issues without leaving
            the IDE.
          </p>
        </section>

        {/* Setup instructions */}
        <section>
          <h2 className="text-sm font-semibold">Setup instructions</h2>
          <ol className="text-muted-foreground mt-3 list-decimal space-y-3 pl-6 text-sm leading-6">
            <li>
              <span className="inline-flex items-center gap-1 align-middle">
                <Kbd>CTRL/CMD</Kbd>
                <Kbd>Shift</Kbd>
                <Kbd>J</Kbd>
              </span>{" "}
              to open Cursor Settings.
            </li>
            <li>
              Select <span className="text-foreground font-medium">MCP</span>.
            </li>
            <li>
              Select{" "}
              <span className="text-foreground font-medium">
                Add new global MCP server
              </span>
              .
            </li>
            <li>
              Add the following:
              <pre className="bg-muted mt-3 overflow-x-auto rounded-md border p-4 font-mono text-[12px] leading-relaxed text-zinc-200">
                <code>
                  {"{\n  "}
                  <span className="text-amber-300">&quot;mcpServers&quot;</span>
                  {": {\n    "}
                  <span className="text-amber-300">&quot;linear&quot;</span>
                  {": {\n      "}
                  <span className="text-amber-300">&quot;command&quot;</span>
                  {": "}
                  <span className="text-emerald-300">&quot;npx&quot;</span>
                  {",\n      "}
                  <span className="text-amber-300">&quot;args&quot;</span>
                  {": ["}
                  <span className="text-emerald-300">&quot;-y&quot;</span>
                  {", "}
                  <span className="text-emerald-300">
                    &quot;mcp-remote&quot;
                  </span>
                  {", "}
                  <span className="text-emerald-300">
                    &quot;https://mcp.linear.app/mcp&quot;
                  </span>
                  {"]\n    }\n  }\n}"}
                </code>
              </pre>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard
                    ?.writeText(mcpConfig)
                    .then(() => toast.success("MCP config copied"))
                    .catch(() => toast.error("Couldn't copy"))
                }}
                className="text-muted-foreground hover:text-foreground mt-2 text-xs underline"
              >
                Copy config
              </button>
            </li>
          </ol>
        </section>
      </div>
    </div>
  )
}

// ChatGPT integration detail. AI client (BUILT BY OpenAI, WEBSITE
// chatgpt.com, external Enable). Body card has a single hero tile on a
// pastel gradient showing the ChatGPT deep-research surface with a
// "Sources" popover where Linear is enabled, followed by Overview / How
// it works / Configure prose with a "connector settings" link.
// ---------------------------------------------------------------------------
function ChatGptIntegrationDetail() {
  const sources = [
    { name: "Web search", state: "on" as const },
    { name: "Linear", state: "on" as const },
    { name: "Dropbox", state: "connect" as const },
    { name: "GitHub", state: "connect" as const },
    { name: "Gmail", state: "connect" as const },
    { name: "Google Calendar", state: "connect" as const },
  ]

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white text-black">
          <OpenAILogo className="size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">ChatGPT</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Connect ChatGPT deep research to Linear
          </p>
        </div>
      </header>

      {/* Body card */}
      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        {/* Built by / Website / Enable rail */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-8">
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Built by
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                OpenAI
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Website
              </div>
              <a
                href="https://chatgpt.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ChatGPT website (opens in new tab)"
                className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
              >
                <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
                chatgpt.com
              </a>
            </div>
          </div>
          <Button
            size="sm"
            asChild
            aria-label="Enable ChatGPT (opens in new tab)"
          >
            <a
              href="https://chatgpt.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Enable
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
            </a>
          </Button>
        </div>

        {/* Hero — ChatGPT research surface on pastel gradient */}
        <div
          aria-hidden
          className="relative aspect-[16/10] overflow-hidden rounded-lg p-6"
          style={{
            background:
              "linear-gradient(135deg, #b8d8e6 0%, #d6c2e8 45%, #f5c8b5 100%)",
          }}
        >
          <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center rounded-md bg-white p-4 text-zinc-900 shadow-xl">
            <div className="text-base font-semibold">
              What are you researching?
            </div>

            {/* Composer card */}
            <div className="relative mt-4 w-full">
              <div className="rounded-xl border border-zinc-200 bg-white p-2.5 shadow-sm">
                <div className="text-xs text-zinc-700">
                  What issues should I work on today?
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="grid size-5 place-items-center rounded-full text-zinc-500 hover:bg-zinc-100">
                    +
                  </span>
                  <span className="grid size-5 place-items-center rounded-full text-zinc-500 hover:bg-zinc-100">
                    ⇌
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">
                    <span className="size-1.5 rounded-full bg-blue-500" />{" "}
                    Research <span className="text-blue-400">×</span>
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-700">
                    <HugeiconsIcon icon={GlobeIcon} className="size-2.5" />
                    <span className="size-2 rounded-full bg-blue-400" />
                    Sources <span className="text-zinc-500">▾</span>
                  </span>
                  <span className="ml-auto flex items-center gap-1.5">
                    <span className="text-zinc-400">🎙</span>
                    <span className="grid size-5 place-items-center rounded-full bg-zinc-900 text-white">
                      ↑
                    </span>
                  </span>
                </div>
              </div>

              {/* Sources popover */}
              <div className="absolute top-full right-2 mt-1.5 w-56 rounded-lg border border-zinc-200 bg-white p-1 shadow-xl">
                {sources.map((s) => (
                  <div
                    key={s.name}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 text-[11px] text-zinc-800 hover:bg-zinc-50"
                  >
                    <span className="flex items-center gap-1.5">
                      {s.name === "Web search" && (
                        <HugeiconsIcon
                          icon={GlobeIcon}
                          className="size-3 text-zinc-700"
                        />
                      )}
                      {s.name === "Linear" && (
                        <span className="grid size-3 place-items-center rounded-sm bg-blue-500 text-[7px] text-white">
                          L
                        </span>
                      )}
                      {s.name === "Dropbox" && (
                        <span className="text-blue-500">📦</span>
                      )}
                      {s.name === "GitHub" && (
                        <span className="text-zinc-800">⏣</span>
                      )}
                      {s.name === "Gmail" && (
                        <span className="text-red-500">✉</span>
                      )}
                      {s.name === "Google Calendar" && (
                        <span className="text-blue-600">▦</span>
                      )}
                      {s.name}
                    </span>
                    {s.state === "on" ? (
                      <span className="flex h-3 w-5 items-center rounded-full bg-blue-500 px-0.5">
                        <span className="ml-auto size-2 rounded-full bg-white" />
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-400">Connect</span>
                    )}
                  </div>
                ))}
                <div className="mt-0.5 flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] text-zinc-700 hover:bg-zinc-50">
                  <span className="text-zinc-500">⊞</span>
                  Connect more
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overview */}
        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Connect Linear to ChatGPT through deep research to reference
            internal sources &amp; pull in real-time context—keeping existing
            user-level permissions.
          </p>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-sm font-semibold">How it works</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            The ChatGPT Connector for Linear helps you explore and reference
            your team&apos;s work while staying in the flow of research. When
            used in Deep Research Mode, it enhances ChatGPT&apos;s ability to
            surface Linear issues, projects, and discussions relevant to your
            current context.
          </p>
        </section>

        {/* Configure */}
        <section>
          <h2 className="text-sm font-semibold">Configure</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Connect Linear to ChatGPT from the{" "}
            <a
              href="https://chatgpt.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              connector settings
            </a>
            .
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            Once connected, you can add Linear as a source when using deep
            research mode in ChatGPT. The Linear connector is available in deep
            research for Plus &amp; Pro users (excl. EEA, CH, UK) and Team,
            Enterprise &amp; Edu users.
          </p>
        </section>
      </div>
    </div>
  )
}

// Claude integration detail. AI client (BUILT BY Claude, WEBSITE
// claude.ai, no external Enable). Body card has a Linear×Claude pairing
// hero on a black tile, an Overview block, and Setup instructions split
// into "Browser and desktop app" (deep link to connectors) and
// "Claude Code" (mcp add command + /mcp note).
function ClaudeIntegrationDetail() {
  const claudeMcpCmd =
    "claude mcp add --transport http linear-server https://mcp.linear.app/mcp"

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#f3ead8] text-[#d97757]">
          <ClaudeLogo className="size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">Claude</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Connect Claude to the Linear MCP server
          </p>
        </div>
      </header>

      {/* Body card */}
      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        {/* Built by / Website rail (no external Enable for AI clients) */}
        <div className="flex flex-wrap items-start gap-8">
          <div>
            <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Built by
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
              <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
              Claude
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Website
            </div>
            <a
              href="https://claude.ai"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Claude website (opens in new tab)"
              className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
            >
              <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
              claude.ai
            </a>
          </div>
        </div>

        {/* Hero pairing tile — Linear × Claude on black */}
        <div
          aria-hidden
          className="relative flex aspect-[16/9] flex-col items-center justify-center overflow-hidden rounded-lg border bg-zinc-950 px-6 py-8 text-white"
        >
          <div className="flex items-center gap-10">
            <svg viewBox="0 0 64 64" className="size-16 text-white" aria-hidden>
              <defs>
                <clipPath id="claude-mcp-linear-clip">
                  <circle cx="32" cy="32" r="30" />
                </clipPath>
              </defs>
              <g clipPath="url(#claude-mcp-linear-clip)">
                <rect width="64" height="64" fill="currentColor" />
                <g stroke="#000" strokeWidth="3">
                  <line x1="-20" y1="40" x2="84" y2="-64" />
                  <line x1="-20" y1="56" x2="84" y2="-48" />
                  <line x1="-20" y1="72" x2="84" y2="-32" />
                  <line x1="-20" y1="88" x2="84" y2="-16" />
                </g>
              </g>
            </svg>
            <span className="text-xl text-white/40">×</span>
            <ClaudeLogo className="size-16 text-white" />
          </div>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.2em] text-white/50">
            LINEAR INTEGRATIONS
          </div>
        </div>

        {/* Overview */}
        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Claude is a conversational AI assistant from Anthropic. By
            connecting it to Linear via the MCP server, Claude can search,
            create, and update Linear issues, projects, and comments directly
            from a conversation.
          </p>
        </section>

        {/* Setup instructions */}
        <section>
          <h2 className="text-sm font-semibold">Setup instructions</h2>

          <h3 className="text-foreground mt-3 text-sm font-medium">
            Browser and desktop app
          </h3>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Navigate to the{" "}
            <a
              href="https://claude.ai/settings/connectors"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              connectors
            </a>{" "}
            page in Claude settings and connect Linear.
          </p>

          <h3 className="text-foreground mt-5 text-sm font-medium">
            Claude Code
          </h3>
          <pre className="bg-muted mt-3 overflow-x-auto rounded-md border p-4 font-mono text-[12px] leading-relaxed text-zinc-200">
            <code>{claudeMcpCmd}</code>
          </pre>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard
                ?.writeText(claudeMcpCmd)
                .then(() => toast.success("Command copied"))
                .catch(() => toast.error("Couldn't copy"))
            }}
            className="text-muted-foreground hover:text-foreground mt-2 text-xs underline"
          >
            Copy command
          </button>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            then run{" "}
            <code className="bg-muted rounded px-1 py-0.5 font-mono text-[12px]">
              /mcp
            </code>{" "}
            once you&apos;ve opened a Claude Code session to go through the
            authentication flow.
          </p>
        </section>
      </div>
    </div>
  )
}

// v0 by Vercel MCP connector. AI client (BUILT BY Vercel, WEBSITE v0.app,
// external Enable). Body card has a v0 prompt-surface hero, Overview /
// How it works prose, and a Configure section that deep-links into v0
// settings.
function V0IntegrationDetail() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-black text-white">
          <V0Logo className="size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">
            v0 by Vercel MCP connector
          </h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Connect v0 and Linear through MCP
          </p>
        </div>
      </header>

      {/* Body card */}
      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        {/* Built by / Website / Enable rail */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-8">
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Built by
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                Vercel
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Website
              </div>
              <a
                href="https://v0.app"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="v0 website (opens in new tab)"
                className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
              >
                <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
                v0.app
              </a>
            </div>
          </div>
          <Button size="sm" asChild aria-label="Enable v0 (opens in new tab)">
            <a href="https://v0.app" target="_blank" rel="noopener noreferrer">
              Enable
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
            </a>
          </Button>
        </div>

        {/* Hero — v0 prompt surface on black */}
        <div
          aria-hidden
          className="relative aspect-[16/10] overflow-hidden rounded-lg bg-black p-6 text-white"
        >
          {/* Faded watermark V0 in the background */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-center text-[260px] font-bold tracking-tighter text-white/[0.04] select-none"
          >
            V0
          </div>

          <div className="relative mx-auto flex h-full max-w-md flex-col items-center justify-center">
            <div className="text-2xl font-semibold tracking-tight">
              What do you want to create?
            </div>

            {/* Prompt card */}
            <div className="mt-5 w-full rounded-xl border border-white/10 bg-zinc-900/80 p-3 text-left text-[11px] leading-snug text-zinc-200 shadow-xl backdrop-blur">
              <div>
                I just got assigned a Linear issue in the v0 Chat project
                (AI-4744) to create an enterprise contact sales form. Can you
                read that issue and implement it? I want black on black styling
                with thin white outlines.
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-zinc-400">
                <span className="grid size-4 place-items-center rounded-full border border-white/10 text-[10px]">
                  +
                </span>
                <span className="grid size-4 place-items-center rounded-full border border-white/10 text-[10px]">
                  ⇌
                </span>
                <span className="flex items-center gap-1 rounded-full border border-white/10 px-1.5 py-0.5 text-[9px] font-medium">
                  <span className="size-1 rounded-full bg-white/60" />
                  v0 Agent <span className="text-zinc-500">▾</span>
                </span>
                <span className="ml-auto grid size-4 place-items-center rounded-full bg-white text-[9px] text-black">
                  ↑
                </span>
              </div>
            </div>

            {/* Quick-action chips */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-[9px] text-zinc-300">
              <span className="rounded-full border border-white/10 bg-zinc-900/60 px-2 py-0.5">
                ◎ Clone a Screenshot
              </span>
              <span className="rounded-full border border-white/10 bg-zinc-900/60 px-2 py-0.5">
                ▢ Import from Figma
              </span>
              <span className="rounded-full border border-white/10 bg-zinc-900/60 px-2 py-0.5">
                ⇪ Upload a Project
              </span>
              <span className="rounded-full border border-white/10 bg-zinc-900/60 px-2 py-0.5">
                ▦ Landing Page
              </span>
            </div>
          </div>
        </div>

        {/* Overview */}
        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Connect the Linear MCP server to v0 so that you can pull issues,
            projects, and specs directly from Linear into v0 and start building.
            No more copy-pasting issues or switching between tabs — your Linear
            workspace becomes part of your development workflow in v0.
          </p>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-sm font-semibold">How it works</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            v0 is an AI agent that helps anyone create real code and full-stack
            apps. Ship features, refine designs, update copy, and create live
            prototypes — all with a prompt. Deploy to production immediately, or
            open a pull request for review.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            The integration connects your issue tracking directly to your
            development environment in v0. Pull any Linear issue, project brief,
            or feature spec into v0 and use it as context while you build.
            Whether you&apos;re working on a bug fix, new feature, or technical
            task, you can reference the original Linear issue without leaving
            v0.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            Once you&apos;ve pulled an issue into v0, you can build the feature,
            iterate on it, and push to production. This integration is built for
            teams that live in Linear and want to close the gap between issue
            tracking and shipping code. Instead of managing context in multiple
            tools, you can go from Linear issue to deployed feature in one
            workflow. Your specs, bug reports, and feature requests become
            immediately actionable.
          </p>
        </section>

        {/* Configure */}
        <section>
          <h2 className="text-sm font-semibold">Configure</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            To enable access to the Linear MCP server from v0, open your v0
            settings and connect your Linear workspace{" "}
            <a
              href="https://v0.app/chat/settings/integrations"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              here
            </a>
            . Once connected, you can toggle on the connection from the main v0
            input page.
          </p>
        </section>
      </div>
    </div>
  )
}

// Windsurf integration detail. AI client (BUILT BY Windsurf, WEBSITE
// windsurf.com, no external Enable). Body card has a Linear×Windsurf
// pairing hero on black, an Overview block, and a Setup section with
// Cascade plugin notes followed by manual MCP-server JSON.
function WindsurfIntegrationDetail() {
  const mcpConfig = `{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.linear.app/mcp"]
    }
  }
}`

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#f3ead8] text-black">
          <WindsurfLogo className="size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">Windsurf</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Connect Windsurf to the Linear MCP server
          </p>
        </div>
      </header>

      {/* Body card */}
      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        {/* Built by / Website rail (no external Enable for AI clients) */}
        <div className="flex flex-wrap items-start gap-8">
          <div>
            <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Built by
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
              <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
              Windsurf
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Website
            </div>
            <a
              href="https://windsurf.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Windsurf website (opens in new tab)"
              className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
            >
              <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
              windsurf.com
            </a>
          </div>
        </div>

        {/* Hero pairing tile — Linear × Windsurf on black */}
        <div
          aria-hidden
          className="relative flex aspect-[16/9] flex-col items-center justify-center overflow-hidden rounded-lg border bg-zinc-950 px-6 py-8 text-white"
        >
          <div className="flex items-center gap-10">
            <svg viewBox="0 0 64 64" className="size-16 text-white" aria-hidden>
              <defs>
                <clipPath id="windsurf-mcp-linear-clip">
                  <circle cx="32" cy="32" r="30" />
                </clipPath>
              </defs>
              <g clipPath="url(#windsurf-mcp-linear-clip)">
                <rect width="64" height="64" fill="currentColor" />
                <g stroke="#000" strokeWidth="3">
                  <line x1="-20" y1="40" x2="84" y2="-64" />
                  <line x1="-20" y1="56" x2="84" y2="-48" />
                  <line x1="-20" y1="72" x2="84" y2="-32" />
                  <line x1="-20" y1="88" x2="84" y2="-16" />
                </g>
              </g>
            </svg>
            <span className="text-xl text-white/40">×</span>
            <WindsurfLogo className="size-16 text-white" />
          </div>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.2em] text-white/50">
            LINEAR INTEGRATIONS
          </div>
        </div>

        {/* Overview */}
        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Windsurf is a next-generation AI IDE that keeps you &ldquo;in
            flow&rdquo; by letting agents reason over your entire project.
            Adding Linear&apos;s MCP server makes Linear data available to those
            agents.
          </p>
        </section>

        {/* Setup instructions */}
        <section>
          <h2 className="text-sm font-semibold">Setup instructions</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Select the Cascade plugins icon and scroll to find and install the
            Linear MCP server.
          </p>

          <p className="text-muted-foreground mt-3 text-sm leading-6">
            To configure manually, follow these steps:
          </p>

          <ol className="text-muted-foreground mt-3 list-decimal space-y-3 pl-6 text-sm leading-6">
            <li>
              <span className="inline-flex items-center gap-1 align-middle">
                <Kbd>CTRL/CMD</Kbd>
                <Kbd>,</Kbd>
              </span>{" "}
              to open Windsurf settings.
            </li>
            <li>
              Under Scroll to Cascade →{" "}
              <span className="text-foreground font-medium">MCP servers</span>
            </li>
            <li>
              Select{" "}
              <span className="text-foreground font-medium">Add Server</span> →{" "}
              <span className="text-foreground font-medium">
                Add custom server
              </span>
            </li>
            <li>
              Add the following:
              <pre className="bg-muted mt-3 overflow-x-auto rounded-md border p-4 font-mono text-[12px] leading-relaxed text-zinc-200">
                <code>
                  {"{\n  "}
                  <span className="text-amber-300">&quot;mcpServers&quot;</span>
                  {": {\n    "}
                  <span className="text-amber-300">&quot;linear&quot;</span>
                  {": {\n      "}
                  <span className="text-amber-300">&quot;command&quot;</span>
                  {": "}
                  <span className="text-emerald-300">&quot;npx&quot;</span>
                  {",\n      "}
                  <span className="text-amber-300">&quot;args&quot;</span>
                  {": ["}
                  <span className="text-emerald-300">&quot;-y&quot;</span>
                  {", "}
                  <span className="text-emerald-300">
                    &quot;mcp-remote&quot;
                  </span>
                  {", "}
                  <span className="text-emerald-300">
                    &quot;https://mcp.linear.app/mcp&quot;
                  </span>
                  {"]\n    }\n  }\n}"}
                </code>
              </pre>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard
                    ?.writeText(mcpConfig)
                    .then(() => toast.success("MCP config copied"))
                    .catch(() => toast.error("Couldn't copy"))
                }}
                className="text-muted-foreground hover:text-foreground mt-2 text-xs underline"
              >
                Copy config
              </button>
            </li>
          </ol>
        </section>
      </div>
    </div>
  )
}

// Replit integration detail. AI agent / connector platform (BUILT BY
// Replit, WEBSITE replit.com, external Enable). Body card has two
// LinearPilot screenshot tiles side-by-side on a warm orange gradient,
// followed by Overview / How it works / Configure prose.
function ReplitIntegrationDetail() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[#F26207]">
          <ReplitLogo className="size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">Replit</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Build Apps &amp; Automations
          </p>
        </div>
      </header>

      {/* Body card */}
      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        {/* Built by / Website / Enable rail */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-8">
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Built by
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                Replit
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Website
              </div>
              <a
                href="https://replit.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Replit website (opens in new tab)"
                className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
              >
                <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
                replit.com
              </a>
            </div>
          </div>
          <Button
            size="sm"
            asChild
            aria-label="Enable Replit (opens in new tab)"
          >
            <a
              href="https://replit.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Enable
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
            </a>
          </Button>
        </div>

        {/* Screenshot tiles — two LinearPilot windows on warm gradient */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[0, 1].map((idx) => (
            <div
              key={idx}
              aria-hidden
              className="relative aspect-[4/3] overflow-hidden rounded-lg p-3"
              style={{
                background:
                  "linear-gradient(135deg, #ffd266 0%, #ff8a3d 50%, #f26207 100%)",
              }}
            >
              {/* Window chrome */}
              <div className="absolute inset-2 overflow-hidden rounded-md bg-white shadow-xl">
                <div className="flex items-center gap-1 border-b border-zinc-200 px-2 py-1">
                  <span className="size-1.5 rounded-full bg-zinc-300" />
                  <span className="text-[7px] font-medium text-zinc-700">
                    LinearPilot
                  </span>
                  <span className="ml-auto flex items-center gap-1 text-[6px] text-zinc-500">
                    <span className="rounded bg-zinc-100 px-1 py-px">Plan</span>
                    <span className="rounded bg-blue-50 px-1 py-px text-blue-600">
                      Build
                    </span>
                  </span>
                </div>
                {/* Body — chat lines */}
                <div className="flex flex-col gap-1 p-1.5">
                  <div className="ml-auto w-[78%] rounded-md bg-blue-50 p-1 text-[5.5px] leading-snug text-zinc-800">
                    {idx === 0
                      ? "Perfect! I'll create a plan for a Slack bot that can help you manage Linear. This bot will respond to your messages in Slack and can resolve questions, create tickets, and answer questions about your Linear workspace."
                      : "Go through my Linear and help me build an agent that I can use the Linear connector, provide me updates, create new tickets, etc. It should be an agent I can ask any questions with."}
                  </div>
                  {idx === 0 ? (
                    <>
                      <div className="text-[5px] font-semibold text-zinc-700">
                        I&apos;ll include the following features:
                      </div>
                      <ul className="ml-2 list-disc space-y-px text-[5px] text-zinc-600">
                        <li>
                          Slack bot that responds to messages about Linear
                        </li>
                        <li>
                          Integration with Linear to fetch issues and project
                          data
                        </li>
                        <li>
                          Ability to access new Linear tickets through
                          conversational commands
                        </li>
                        <li>
                          Answer questions about existing tickets, projects, and
                          team activity
                        </li>
                        <li>
                          Natural language understanding for Linear operations
                        </li>
                      </ul>
                      <div className="ml-auto rounded-full bg-zinc-100 px-1.5 py-0.5 text-[5px] text-zinc-700">
                        ☐ Change plan
                      </div>
                      <div className="text-[5px] text-zinc-700">
                        I&apos;ve created a feature list based on your request.
                        If everything looks good, we can start creating.
                      </div>
                      <div className="text-[5px] font-medium text-zinc-700">
                        How do you want to continue?
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <div className="rounded border border-zinc-200 p-1">
                          <div className="text-[5px] font-semibold text-zinc-800">
                            Build the entire app
                          </div>
                          <div className="text-[4.5px] text-zinc-500">
                            20+ mins
                          </div>
                          <div className="mt-0.5 text-[4.5px] text-zinc-500">
                            Best if you want Agent to build out the full
                            functionality of your app
                          </div>
                        </div>
                        <div className="rounded border border-zinc-200 p-1">
                          <div className="text-[5px] font-semibold text-zinc-800">
                            Start with a design
                          </div>
                          <div className="text-[4.5px] text-zinc-500">
                            5-10 mins
                          </div>
                          <div className="mt-0.5 text-[4.5px] text-zinc-500">
                            Best if you want to see a design prototype first,
                            then iterate on visuals or features
                          </div>
                        </div>
                      </div>
                      <div className="ml-auto rounded-full bg-blue-500 px-2 py-0.5 text-[5px] font-medium text-white">
                        Start building →
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-[5px] text-zinc-700">
                        I&apos;ll help you create an agent that can interact
                        with Linear. Let me first search for the Linear
                        integration to ensure we can connect to your Linear
                        workspace.
                      </div>
                      <div className="text-[5px] text-zinc-500">
                        ⊞ Searched Replit&apos;s integrations for
                        &ldquo;Linear&rdquo;
                      </div>
                      <div className="text-[5px] text-zinc-700">
                        Now let me request authorization for the Linear
                        integration.
                      </div>
                      <div className="text-[5px] text-zinc-700">
                        Great! Your Linear integration is now authorized. Before
                        I create the plan, I need to clarify one thing:
                      </div>
                      <div className="text-[5px] font-medium text-zinc-800">
                        How would you like to interact with this agent?
                      </div>
                      <div className="text-[5px] text-zinc-700">
                        Would you like it to be:
                      </div>
                      <ul className="ml-2 list-disc space-y-px text-[5px] text-zinc-600">
                        <li>
                          A <span className="font-semibold">Slack bot</span>{" "}
                          that you can message in Slack to ask questions and
                          manage Linear tickets?
                        </li>
                        <li>
                          A <span className="font-semibold">Telegram bot</span>{" "}
                          that you can message in Telegram?
                        </li>
                        <li>
                          Or a{" "}
                          <span className="font-semibold">
                            web-based chat interface
                          </span>{" "}
                          where you can interact with the agent directly in your
                          browser?
                        </li>
                      </ul>
                      <div className="text-[5px] text-zinc-700">
                        This will help me design the right solution for you.
                      </div>
                      <div className="ml-auto rounded-full bg-zinc-100 px-1.5 py-0.5 text-[5px] text-zinc-700">
                        Slack bot
                      </div>
                      <div className="ml-auto rounded-full bg-zinc-100 px-1.5 py-0.5 text-[5px] text-zinc-700">
                        Just text
                      </div>
                      <div className="text-[5px] text-zinc-700">
                        Perfect! I&apos;ll create a plan for a Slack bot that
                        can help you manage Linear. This bot will...
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Overview */}
        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Connectors make it effortless to extend your applications with
            services like Google, Dropbox, Salesforce, Linear, Notion, and
            more—without the hassle of managing credentials or reinventing
            integrations from scratch.
          </p>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-sm font-semibold">How it works</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Each Connector provides the infrastructure you need to work with
            external apps:
          </p>
          <ul className="text-muted-foreground mt-3 space-y-1.5 text-sm leading-6">
            <li>
              -{" "}
              <span className="text-foreground font-medium">
                One-Click Connect:
              </span>{" "}
              Log in once, build unlimited applications
            </li>
            <li>
              -{" "}
              <span className="text-foreground font-medium">
                Reliable Integrations:
              </span>{" "}
              Build with official SDKs following platform conventions
            </li>
            <li>
              -{" "}
              <span className="text-foreground font-medium">Native Feel:</span>{" "}
              Every integration behaves like a first-class extension of your app
            </li>
          </ul>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            For OAuth-based services, there are no credentials to manage. Just
            authenticate and start building. For API-key-based services, there
            is a streamlined flow to make it just as smooth.
          </p>
        </section>

        {/* Configure */}
        <section>
          <h2 className="text-sm font-semibold">Configure</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            To get started go to{" "}
            <a
              href="https://replit.com/integrations"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              https://replit.com/integrations
            </a>{" "}
            and search for the Linear connector to connect.
          </p>
        </section>
      </div>
    </div>
  )
}

// Dust integration detail. AI agent platform (BUILT BY Dust, WEBSITE
// dust.tt, external Enable). Body card has two screenshot tiles —
// "Create issues from Slack" (blue accent) and "Get instant Linear
// insights" (orange accent with chart) — followed by Overview / How
// it works / Configure prose with a beta-script setup walkthrough.
function DustIntegrationDetail() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white">
          <DustLogo className="size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">Dust</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Build AI workflows with Linear issues
          </p>
        </div>
      </header>

      {/* Body card */}
      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        {/* Built by / Website / Enable rail */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-8">
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Built by
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                Dust
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Website
              </div>
              <a
                href="https://dust.tt"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Dust website (opens in new tab)"
                className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
              >
                <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
                dust.tt
              </a>
            </div>
          </div>
          <Button size="sm" asChild aria-label="Enable Dust (opens in new tab)">
            <a href="https://dust.tt" target="_blank" rel="noopener noreferrer">
              Enable
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
            </a>
          </Button>
        </div>

        {/* Screenshot tiles — Slack issue creation + insights chart */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Left tile — Slack thread */}
          <div
            aria-hidden
            className="relative aspect-[4/3] overflow-hidden rounded-lg bg-white p-3"
          >
            {/* Decorative blobs */}
            <span className="absolute -top-6 -left-6 size-20 rounded-full bg-sky-200/70" />
            <span className="absolute -right-4 bottom-0 size-16 rounded-full bg-blue-500/80" />

            <div className="relative z-10 flex h-full gap-2">
              {/* Headline */}
              <div className="flex max-w-[50%] flex-col justify-center text-[11px] leading-snug font-semibold text-zinc-900">
                Create issues directly from Slack conversations with{" "}
                <span className="font-mono text-sky-600">@dust</span>
              </div>
              {/* Slack thread card */}
              <div className="ml-auto w-[55%] rounded-md bg-white p-1.5 text-[6px] text-zinc-900 shadow-lg ring-1 ring-zinc-200">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-0.5">
                  <span className="font-medium">Thread</span>
                  <span className="text-zinc-400">▢ ⎋ ✕</span>
                </div>
                <div className="mt-1 flex items-start gap-1">
                  <span className="grid size-2 place-items-center rounded-sm bg-pink-200 text-[5px] text-pink-900">
                    F
                  </span>
                  <div>
                    <div className="font-medium">
                      Frank{" "}
                      <span className="font-normal text-zinc-400">
                        Just now
                      </span>
                    </div>
                    <div className="text-zinc-700">
                      <span className="text-sky-600">@Dust</span> What issues
                      are open for my team?
                    </div>
                    <div className="text-[5px] text-zinc-400">1 reply</div>
                  </div>
                </div>
                <div className="mt-1 flex items-start gap-1">
                  <span className="grid size-2 place-items-center rounded-sm bg-emerald-200 text-[5px] text-emerald-900">
                    D
                  </span>
                  <div>
                    <div className="font-medium">
                      Dust APP{" "}
                      <span className="font-normal text-zinc-400">
                        Just now
                      </span>
                    </div>
                    <div className="text-sky-600">@LinearInsights</div>
                    <div className="text-zinc-700">
                      Let me provide you with an analysis of the open issues for
                      your team:
                    </div>
                    <div className="mt-0.5 text-[5px] font-semibold text-zinc-800">
                      Key Metrics Overview:
                    </div>
                    <ol className="ml-2 list-decimal space-y-px text-[5px] text-zinc-700">
                      <li>Active issues: 7 total open issues</li>
                      <li>
                        Distribution by State:
                        <ul className="ml-2 list-disc">
                          <li>In Progress: 4 issues</li>
                          <li>Todo: 3 issues</li>
                          <li>Backlog: 3 issues</li>
                        </ul>
                      </li>
                    </ol>
                    <div className="mt-0.5 text-[5px] text-zinc-700">
                      Here&apos;s a breakdown of the currently open issues:
                    </div>
                    <div className="text-[5px] font-semibold text-zinc-800">
                      In Progress Issues:
                    </div>
                    <div className="text-[5px] text-zinc-700">
                      1. FRANK-17: ...
                    </div>
                    <div className="text-[5px] text-sky-600">See more</div>
                    <div className="mt-0.5 grid grid-cols-2 gap-px text-[5px] text-sky-600">
                      <span>[1] linear-issue-715a...</span>
                      <span>[2] linear-issue-9295...</span>
                      <span>[3] linear-issue-3bc3...</span>
                      <span>[4] linear-issue-c011...</span>
                      <span>[5] linear-issue-8703...</span>
                    </div>
                    <div className="mt-1 border-t border-zinc-100 pt-0.5 text-[5px] text-zinc-500">
                      Go to full conversation | Browse agents | Use Dust in
                      Slack | Learn more
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-2 left-3">
              <DustLogo className="size-4" />
            </div>
          </div>

          {/* Right tile — Linear insights chart */}
          <div
            aria-hidden
            className="relative aspect-[4/3] overflow-hidden rounded-lg bg-white p-3"
          >
            <span className="absolute -top-4 -left-4 size-16 rounded-full bg-amber-400" />
            <span className="absolute -right-6 bottom-2 size-20 rounded-full bg-emerald-300" />

            <div className="relative z-10 flex h-full gap-2">
              <div className="flex max-w-[40%] flex-col justify-center text-[11px] leading-snug font-semibold text-zinc-900">
                Get instant Linear insights on Dust
              </div>
              {/* Insight card */}
              <div className="ml-auto w-[60%] rounded-md bg-white p-1.5 text-[6px] text-zinc-900 shadow-lg ring-1 ring-zinc-200">
                <div className="flex items-center gap-1 border-b border-zinc-200 pb-0.5">
                  <span className="grid size-2 place-items-center rounded-sm bg-rose-200 text-[5px] text-rose-900">
                    J
                  </span>
                  <span className="font-medium">John Smith</span>
                </div>
                <div className="mt-1 text-sky-600">@LinearInsights</div>
                <div className="text-zinc-700">
                  show me a visualization of our engineering issues by status
                  and priority over the last month.
                </div>
                <div className="mt-0.5 flex items-center gap-1 text-zinc-500">
                  <span className="grid size-2 place-items-center rounded-sm bg-sky-100 text-[5px] text-sky-800">
                    L
                  </span>
                  <span className="text-sky-600">@LinearInsights</span>
                </div>
                <div className="text-zinc-700">
                  Based on the retrieved data, I will now create a visualization
                  to display the engineering issues by status and priority over
                  the last month. The data includes various issues with
                  different statuses such as &ldquo;In Progress&rdquo;,
                  &ldquo;Cancelled&rdquo;, &ldquo;Todo&rdquo;, and priorities
                  ranging from &ldquo;Urgent&rdquo; to &ldquo;Low&rdquo;.
                </div>
                <div className="mt-1 text-[5px] font-semibold text-zinc-800">
                  Engineering Issues by Status and Priority (Last month)
                </div>
                {/* mini stacked bar chart */}
                <svg
                  viewBox="0 0 80 28"
                  className="mt-0.5 h-8 w-full"
                  aria-hidden
                >
                  {/* In Progress */}
                  <g>
                    <rect x="6" y="14" width="10" height="6" fill="#3b82f6" />
                    <rect x="6" y="6" width="10" height="8" fill="#22c55e" />
                    <rect x="6" y="2" width="10" height="4" fill="#ef4444" />
                  </g>
                  {/* Cancelled */}
                  <g>
                    <rect x="22" y="18" width="10" height="2" fill="#3b82f6" />
                    <rect x="22" y="14" width="10" height="4" fill="#22c55e" />
                    <rect x="22" y="10" width="10" height="4" fill="#facc15" />
                  </g>
                  {/* Todo */}
                  <g>
                    <rect x="38" y="12" width="10" height="8" fill="#3b82f6" />
                    <rect x="38" y="6" width="10" height="6" fill="#22c55e" />
                  </g>
                  {/* Backlog */}
                  <g>
                    <rect x="54" y="16" width="10" height="4" fill="#3b82f6" />
                  </g>
                  {/* baseline */}
                  <line
                    x1="2"
                    y1="20"
                    x2="78"
                    y2="20"
                    stroke="#e5e7eb"
                    strokeWidth="0.5"
                  />
                </svg>
                <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[5px] text-zinc-700">
                  <span className="flex items-center gap-0.5">
                    <span className="size-1.5 rounded-sm bg-red-500" /> Urgent
                  </span>
                  <span className="flex items-center gap-0.5">
                    <span className="size-1.5 rounded-sm bg-amber-400" /> High
                  </span>
                  <span className="flex items-center gap-0.5">
                    <span className="size-1.5 rounded-sm bg-emerald-500" />{" "}
                    Medium
                  </span>
                  <span className="flex items-center gap-0.5">
                    <span className="size-1.5 rounded-sm bg-sky-500" /> Low
                  </span>
                </div>
              </div>
            </div>
            <div className="absolute bottom-2 left-3">
              <DustLogo className="size-4" />
            </div>
          </div>
        </div>

        {/* Overview */}
        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Transform your Linear issues into a data source for AI agents.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            The integration automatically syncs your team&apos;s issues,
            comments, and project data to Dust, letting you build AI agents that
            understand your projects and can help with tasks like summarizing
            updates, answering questions about past decisions, or tracking
            project status.
          </p>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-sm font-semibold">How it works</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            The Linear-Dust integration seamlessly syncs your Linear issues and
            related data into Dust, to let you create AI agents using your
            Linear data. The integration captures the complete context of your
            projects, including issue details, comments, attachments, labels,
            issue relations, history, subscribers, parent/child hierarchy, cycle
            information, and organization details.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            Once synced, your Linear data becomes searchable and accessible to
            Dust agents. Team members can ask questions about project status,
            find historical decisions, retrieve technical specifications, or get
            summaries of discussions—all without having to navigate through
            Linear manually. Agents understand the relationships between issues,
            comments, and project structure, providing responses that reflect
            the full context of your work.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            This creates a powerful extension of your Linear platform, making
            your Linear knowledge more accessible to your Dust agents and
            actionable through natural language.
          </p>
        </section>

        {/* Configure */}
        <section>
          <h2 className="text-sm font-semibold">Configure</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            To set up the beta Linear integration, you must use a script, a
            Node.js application designed to sync Linear issue data into Dust
            data sources.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            You&apos;ll need to:
          </p>
          <ol className="text-muted-foreground mt-2 list-decimal space-y-1 pl-6 text-sm leading-6">
            <li>Clone a given repository</li>
            <li>Install dependencies</li>
            <li>
              Create a .env file with variables detailed{" "}
              <a
                href="https://docs.dust.tt/docs/linear"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                here
              </a>
            </li>
          </ol>
        </section>
      </div>
    </div>
  )
}

// ADK (Google Agent Development Kit) integration detail. AI client
// (BUILT BY Google, WEBSITE google.github.io, external Enable). Body
// card has a Linear×ADK pairing hero on a near-black tile (each side
// drawn as its own rounded-square badge), then Overview / How it works
// / Configuration prose with a docs link.
function AdkIntegrationDetail() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      {/* Header */}
      <header className="flex items-start gap-4">
        <div
          className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white"
          style={{
            background:
              "conic-gradient(from 90deg at 50% 50%, #4285F4 0deg, #34A853 90deg, #FBBC04 180deg, #EA4335 270deg, #4285F4 360deg)",
            padding: 2,
          }}
        >
          <span className="flex size-full items-center justify-center rounded-[14px] bg-white text-zinc-900">
            <AdkLogo className="size-9" />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">ADK</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Connect your Google ADK agents to Linear
          </p>
        </div>
      </header>

      {/* Body card */}
      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        {/* Built by / Website / Enable rail */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-8">
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Built by
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                Google
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Website
              </div>
              <a
                href="https://google.github.io/adk-docs/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ADK website (opens in new tab)"
                className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
              >
                <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
                google.github.io
              </a>
            </div>
          </div>
          <Button size="sm" asChild aria-label="Enable ADK (opens in new tab)">
            <a
              href="https://google.github.io/adk-docs/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Enable
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
            </a>
          </Button>
        </div>

        {/* Hero pairing tile — Linear × ADK on near-black */}
        <div
          aria-hidden
          className="relative flex aspect-[16/9] flex-col items-center justify-center overflow-hidden rounded-lg bg-zinc-950 px-6 py-8"
        >
          <div className="flex items-center gap-10">
            {/* Linear badge */}
            <div className="flex size-24 items-center justify-center rounded-2xl bg-zinc-900 shadow-inner ring-1 ring-white/5">
              <svg
                viewBox="0 0 64 64"
                className="size-14 text-white"
                aria-hidden
              >
                <defs>
                  <clipPath id="adk-mcp-linear-clip">
                    <circle cx="32" cy="32" r="30" />
                  </clipPath>
                </defs>
                <g clipPath="url(#adk-mcp-linear-clip)">
                  <rect width="64" height="64" fill="currentColor" />
                  <g stroke="#000" strokeWidth="3">
                    <line x1="-20" y1="40" x2="84" y2="-64" />
                    <line x1="-20" y1="56" x2="84" y2="-48" />
                    <line x1="-20" y1="72" x2="84" y2="-32" />
                    <line x1="-20" y1="88" x2="84" y2="-16" />
                  </g>
                </g>
              </svg>
            </div>
            <span className="text-xl text-white/40">×</span>
            {/* ADK badge */}
            <div className="flex size-24 items-center justify-center rounded-2xl bg-zinc-900 shadow-inner ring-1 ring-white/5">
              <AdkLogo className="size-14 text-white" />
            </div>
          </div>
        </div>

        {/* Overview */}
        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Agent Development Kit (ADK) is a flexible and modular framework for
            developing and deploying AI agents. While optimized for Gemini and
            the Google ecosystem, ADK is model-agnostic, deployment-agnostic,
            and is built for compatibility with other frameworks.
          </p>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-sm font-semibold">How it works</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Use Linear&apos;s MCP server to connect your ADK agents to Linear so
            they can take actions in your workspace. Create and update issues,
            projects, documents and other objects.
          </p>
        </section>

        {/* Configuration */}
        <section>
          <h2 className="text-sm font-semibold">Configuration</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Learn more about connecting your ADK agents to Linear{" "}
            <a
              href="https://google.github.io/adk-docs/tools/mcp-tools/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              here
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}

// Shared layout primitive for the Engineering-section integration pages.
// Renders the standard header + body card with built-by/docs/enable rail
// and the standard issue-detail screenshot rail used by Linear's first-
// party engineering connectors.
function EngineeringIntegrationShell({
  name,
  blurb,
  builtBy,
  docsHref,
  enableHref,
  enableVariant = "external",
  preinstalled = false,
  websiteLabel,
  websiteHref,
  tileBg,
  tileText,
  logo,
  gradient,
  hero,
  overview,
  features,
  footer,
}: {
  name: string
  blurb: string
  builtBy: string
  docsHref?: string
  enableHref?: string
  enableVariant?: "native" | "external"
  preinstalled?: boolean
  websiteLabel?: string
  websiteHref?: string
  tileBg: string
  tileText: string
  logo: React.ReactNode
  gradient: string
  hero?: React.ReactNode
  overview: React.ReactNode
  features?: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      {/* Header */}
      <header className="flex items-start gap-4">
        <div
          className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${tileBg} ${tileText}`}
        >
          {logo}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">{name}</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            {blurb}
          </p>
        </div>
      </header>

      {/* Body card */}
      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        {/* Built by / Docs|Website / Enable rail */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-8">
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Built by
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                {builtBy}
              </div>
            </div>
            {docsHref && (
              <div>
                <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                  Docs
                </div>
                <a
                  href={docsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${name} integration docs (opens in new tab)`}
                  className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
                >
                  <HugeiconsIcon icon={Book02Icon} className="size-3.5" />
                  Docs
                </a>
              </div>
            )}
            {websiteHref && (
              <div>
                <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                  Website
                </div>
                <a
                  href={websiteHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${name} website (opens in new tab)`}
                  className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
                >
                  <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
                  {websiteLabel}
                </a>
              </div>
            )}
          </div>
          {preinstalled ? (
            <span className="text-muted-foreground text-sm font-medium">
              Pre-installed
            </span>
          ) : (
            enableHref && (
              <Button
                size="sm"
                asChild
                aria-label={`Enable ${name}${enableVariant === "external" ? " (opens in new tab)" : ""}`}
              >
                <a
                  href={enableHref}
                  target={enableVariant === "external" ? "_blank" : undefined}
                  rel={
                    enableVariant === "external"
                      ? "noopener noreferrer"
                      : undefined
                  }
                >
                  {enableVariant === "native" && (
                    <HugeiconsIcon icon={PuzzleIcon} className="size-3.5" />
                  )}
                  Enable
                  {enableVariant === "external" && (
                    <HugeiconsIcon
                      icon={ArrowUpRight01Icon}
                      className="size-3.5"
                    />
                  )}
                </a>
              </Button>
            )
          )}
        </div>

        {hero ? (
          hero
        ) : (
          /* Hero pairing tile */
          <div
            aria-hidden
            className="relative aspect-[16/9] overflow-hidden rounded-lg p-6"
            style={{ background: gradient }}
          >
            <div className="absolute inset-0 flex items-center justify-center gap-10 text-white">
              {/* Linear striped circle */}
              <svg viewBox="0 0 64 64" className="size-16" aria-hidden>
                <defs>
                  <clipPath id={`eng-clip-${name.replace(/\s+/g, "-")}`}>
                    <circle cx="32" cy="32" r="30" />
                  </clipPath>
                </defs>
                <g clipPath={`url(#eng-clip-${name.replace(/\s+/g, "-")})`}>
                  <rect width="64" height="64" fill="currentColor" />
                  <g stroke="#000" strokeWidth="3" opacity="0.6">
                    <line x1="-20" y1="40" x2="84" y2="-64" />
                    <line x1="-20" y1="56" x2="84" y2="-48" />
                    <line x1="-20" y1="72" x2="84" y2="-32" />
                    <line x1="-20" y1="88" x2="84" y2="-16" />
                  </g>
                </g>
              </svg>
              <span className="text-xl text-white/40">×</span>
              <div
                className={`flex size-16 items-center justify-center ${tileText}`}
              >
                {logo}
              </div>
            </div>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.2em] text-white/60">
              LINEAR INTEGRATIONS
            </div>
          </div>
        )}

        {/* Overview */}
        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <div className="text-muted-foreground mt-2 text-sm leading-6">
            {overview}
          </div>
        </section>

        {features}
      </div>

      {footer}
    </div>
  )
}

// PagerDuty Triage Responsibility — automates the rotation of triage
// duty using PagerDuty schedules. Built by Linear, links to docs and
// the PagerDuty website with an Enable button.
function PagerDutyIntegrationDetail() {
  const rotation = [
    {
      initial: "p",
      color: "#1f2937",
      name: "paco",
      range: "Oct 30, 2:00 AM – Nov 3, 10:00 AM",
      current: false,
    },
    {
      initial: "u",
      color: "#a3a3a3",
      name: "uros",
      range: "Nov 6, 1:00 AM – Nov 10, 9:00 AM",
      current: true,
    },
    {
      initial: "m",
      color: "#9ca3af",
      name: "mufeez",
      range: "Nov 13, 1:00 AM – Nov 17, 9:00 AM",
      current: false,
    },
    {
      initial: "t",
      color: "#f97316",
      name: "tom",
      range: "Nov 20, 1:00 AM – Nov 24, 9:00 AM",
      current: false,
    },
    {
      initial: "s",
      color: "#fbbf24",
      name: "smcgivern",
      range: "Nov 27, 1:00 AM – Dec 1, 9:00 AM",
      current: false,
    },
  ]

  return (
    <EngineeringIntegrationShell
      name="PagerDuty Triage Responsibility"
      blurb="Automate the rotation of triage responsibility with PagerDuty schedules"
      builtBy="Linear"
      docsHref="https://linear.app/docs/pagerduty"
      websiteLabel="pagerduty.com"
      websiteHref="https://pagerduty.com"
      enableHref="https://linear.app/settings/api"
      enableVariant="native"
      tileBg="bg-[#06AC38]"
      tileText="text-white"
      logo={<PagerDutyLogo className="size-9" />}
      gradient="linear-gradient(135deg, #0fdf4f 0%, #06ac38 50%, #036b21 100%)"
      hero={
        <div
          aria-hidden
          className="relative overflow-hidden rounded-lg p-8"
          style={{
            background: "linear-gradient(135deg, #d6f5dc 0%, #b8ebc4 100%)",
          }}
        >
          <div className="mx-auto max-w-[420px] rounded-md bg-white p-4 text-[11px] text-neutral-800 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.18)]">
            <div className="text-[13px] font-semibold text-neutral-900">
              Triage responsibility
            </div>
            <div className="mt-1 text-[11px] text-neutral-500">
              Define how incoming issues and requests are handled in triage.
            </div>

            <div className="mt-4 text-[10px] font-semibold text-neutral-900">
              Action
            </div>
            <div className="mt-0.5 flex items-center justify-between gap-3">
              <div className="text-[10px] text-neutral-500">
                When a new issue is added to triage, take the following action.
              </div>
              <div className="flex shrink-0 items-center gap-1.5 rounded border border-neutral-200 bg-white px-2 py-1 text-[10px] text-neutral-700">
                <span className="size-2 rounded-full bg-neutral-300" />
                Notify
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  className="size-2.5 rotate-90 text-neutral-400"
                />
              </div>
            </div>

            <div className="mt-3 rounded-md border border-neutral-200">
              <div className="flex items-center justify-between border-b border-neutral-200 px-2.5 py-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-neutral-700">
                  <span
                    className="grid size-3.5 place-items-center rounded-[2px] text-[7px] font-bold text-white"
                    style={{ background: "#06AC38" }}
                  >
                    P
                  </span>
                  PagerDuty: Goalie
                </div>
                <HugeiconsIcon
                  icon={ArrowUpRight01Icon}
                  className="size-2.5 text-neutral-400"
                />
              </div>
              <div className="divide-y divide-neutral-100">
                {rotation.map((r) => (
                  <div
                    key={r.name}
                    className="flex items-center justify-between px-2.5 py-1.5"
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="grid size-3.5 place-items-center rounded-full text-[7px] font-semibold text-white"
                        style={{ background: r.color }}
                      >
                        {r.initial}
                      </span>
                      <span className="text-[10px] text-neutral-700">
                        {r.name}
                      </span>
                      {r.current && (
                        <span className="rounded-sm bg-neutral-100 px-1 py-px text-[8px] font-medium text-neutral-600">
                          Current
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-neutral-500">
                      {r.range}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-2 text-right text-[9px] text-neutral-400">
              Unlink PagerDuty schedule…
            </div>
          </div>
        </div>
      }
      overview={
        <p>
          Connect a PagerDuty schedule to a Linear team to automatically assign
          the &ldquo;triage responsible&rdquo; role to whoever is on-call.
          Whenever the schedule rotates, Linear updates the assignee on incoming
          triage issues so the right person is paged without manual handoff.
        </p>
      }
      features={
        <section>
          <h2 className="text-sm font-semibold">How it works</h2>
          <ul className="text-muted-foreground mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6">
            <li>Pick a PagerDuty schedule and a Linear team to bind it to.</li>
            <li>
              Linear sets the team&apos;s triage responsible to the current
              on-call person.
            </li>
            <li>
              When the on-call rotation changes, Linear updates the triage
              assignment automatically.
            </li>
          </ul>
        </section>
      }
    />
  )
}

// Sentry — Linear's first-party Sentry integration. Surfaces
// "Create issue" actions on Sentry alerts and links Sentry events to
// Linear issues for two-way status sync.
function SentryIntegrationDetail() {
  return (
    <EngineeringIntegrationShell
      name="Sentry"
      blurb="Create and link issues with Sentry and automate issue creation"
      builtBy="Linear"
      docsHref="https://linear.app/docs/sentry"
      websiteLabel="sentry.io"
      websiteHref="https://sentry.io"
      enableHref="https://sentry.io/settings/integrations/linear/"
      enableVariant="native"
      tileBg="bg-[#362D59]"
      tileText="text-white"
      logo={<SentryLogo className="size-9" />}
      gradient="linear-gradient(135deg, #6e5fb8 0%, #362d59 60%, #1d1736 100%)"
      hero={
        <div aria-hidden className="grid grid-cols-2 gap-3">
          <div
            className="relative overflow-hidden rounded-lg p-5"
            style={{
              background: "linear-gradient(135deg, #6e5fb8 0%, #362d59 100%)",
            }}
          >
            <div className="rounded-md bg-white p-2.5 text-[9px] text-neutral-800 shadow-[0_6px_18px_-8px_rgba(0,0,0,0.4)]">
              <div className="text-[10px] font-semibold text-neutral-900">
                Linear Issue
              </div>
              <div className="mt-1.5 flex gap-3 border-b border-neutral-200 text-[8px]">
                <span className="border-b border-neutral-900 pb-0.5 font-medium text-neutral-900">
                  Create
                </span>
                <span className="pb-0.5 text-neutral-400">Link</span>
              </div>
              <div className="mt-1.5 space-y-1.5">
                <div>
                  <div className="text-[7px] text-neutral-500">Title *</div>
                  <div className="rounded-sm border border-neutral-200 px-1.5 py-0.5 text-[8px]">
                    NullPointerException
                  </div>
                </div>
                <div>
                  <div className="text-[7px] text-neutral-500">
                    Description *
                  </div>
                  <div className="rounded-sm border border-neutral-200 px-1.5 py-1 text-[7px] leading-[1.3] text-neutral-500">
                    Sentry issue:
                    [SENTRY-AS3-9R](https://sentry.io/organizations/sentry-test/issues/29723A6491/?referrer=Linear)
                    <br />
                    at
                    <br />
                    java.lang.NullPointerException: null
                    <br />
                    at
                    com.datastax.driver.core.HostConnectionPool.closeAsync(HostConnectionPool.java:691)
                    <br />
                    at
                  </div>
                </div>
                <div>
                  <div className="text-[7px] text-neutral-500">Team *</div>
                  <div className="flex items-center justify-between rounded-sm border border-neutral-200 px-1.5 py-0.5 text-[8px]">
                    Linear
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      className="size-2 rotate-90 text-neutral-400"
                    />
                  </div>
                </div>
                <div>
                  <div className="text-[7px] text-neutral-500">Assignee</div>
                </div>
              </div>
              <div className="mt-2 flex justify-end">
                <span className="rounded-sm bg-[#5e6ad2] px-1.5 py-0.5 text-[7px] font-medium text-white">
                  Save Changes
                </span>
              </div>
            </div>
          </div>
          <div
            className="relative overflow-hidden rounded-lg p-5"
            style={{
              background: "linear-gradient(135deg, #6e5fb8 0%, #362d59 100%)",
            }}
          >
            <div className="rounded-md bg-[#1c1129] p-3 text-white shadow-[0_6px_18px_-8px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="grid size-3.5 place-items-center rounded-sm bg-amber-400/20 text-[8px]">
                    !
                  </span>
                  <span className="text-[10px] font-semibold">
                    NullPointerException
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[8px] text-white/60">
                  First seen 1 hour ago
                  <HugeiconsIcon
                    icon={ArrowUpRight01Icon}
                    className="size-2.5"
                  />
                </div>
              </div>
              <div className="mt-4 border-t border-white/10 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-medium">Activity</span>
                  <div className="flex items-center gap-1 text-[8px] text-white/50">
                    Subscribe
                    <span className="grid size-2.5 place-items-center rounded-full border border-white/30">
                      <span className="size-1 rounded-full bg-white/30" />
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[8px] text-white/70">
                  <span className="grid size-3 place-items-center rounded-full bg-pink-400/40 text-[6px] font-semibold">
                    r
                  </span>
                  <span className="text-white">raissa</span>
                  <span>created the issue.</span>
                  <span className="text-white/40">1 day ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
      overview={
        <p>
          Turn Sentry events into actionable Linear issues. From any alert you
          can create a new Linear issue or attach to an existing one, and Sentry
          will keep the link visible so engineers can jump back to the
          underlying error trace.
        </p>
      }
      features={
        <section>
          <h2 className="text-sm font-semibold">What you get</h2>
          <ul className="text-muted-foreground mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6">
            <li>One-click issue creation from Sentry alerts.</li>
            <li>Bidirectional status sync — resolve in either tool.</li>
            <li>
              Issue links surfaced in Sentry&apos;s alert detail view for quick
              context.
            </li>
            <li>
              Automation rules that file Linear issues when alerts trigger.
            </li>
          </ul>
        </section>
      }
    />
  )
}

// VS Code — links Linear issues to VS Code via Linear Connect, letting
// extensions act on the user's behalf.
function VSCodeIntegrationDetail() {
  return (
    <EngineeringIntegrationShell
      name="VS Code"
      blurb="Easily build VS Code extensions with Linear Connect"
      builtBy="Linear"
      websiteLabel="code.visualstudio.com"
      websiteHref="https://code.visualstudio.com"
      enableHref="https://marketplace.visualstudio.com/search?term=linear&target=VSCode"
      tileBg="bg-[#007ACC]"
      tileText="text-white"
      logo={<VSCodeLogo className="size-9" />}
      gradient="linear-gradient(135deg, #2faaff 0%, #007acc 55%, #003a5c 100%)"
      hero={
        <div aria-hidden className="grid grid-cols-2 gap-3">
          <div className="relative overflow-hidden rounded-lg bg-[#16151a] p-5">
            <div className="absolute top-3 left-1/2 -translate-x-1/2 rounded-md border border-white/10 bg-[#1f1d26] px-2 py-1 text-[9px] font-medium text-white/80 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.6)]">
              <span className="mr-1 inline-block size-2 rounded-full bg-[#5e6ad2] align-middle" />
              Linear Connect
            </div>
            <div className="mt-9 rounded-md bg-[#0f0e13] p-3 text-[8px] leading-[1.5] text-white/80 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
              <div className="mb-1.5 flex gap-1">
                <span className="size-1.5 rounded-full bg-red-400/70" />
                <span className="size-1.5 rounded-full bg-yellow-400/70" />
                <span className="size-1.5 rounded-full bg-green-400/70" />
              </div>
              <div className="font-mono text-white/40">
                <span className="text-purple-300">import</span>{" "}
                <span className="text-amber-200">* as vscode</span>{" "}
                <span className="text-purple-300">from</span>{" "}
                <span className="text-emerald-300">&quot;vscode&quot;</span>;
              </div>
              <div className="font-mono text-white/40">
                <span className="text-purple-300">import</span>{" "}
                <span>&#123; LinearClient &#125;</span>{" "}
                <span className="text-purple-300">from</span>{" "}
                <span className="text-emerald-300">
                  &quot;@linear/sdk&quot;
                </span>
                ;
              </div>
              <div className="mt-1.5 font-mono text-white/40">
                <span className="text-purple-300">const</span>{" "}
                <span className="text-blue-300">session</span> ={" "}
                <span className="text-purple-300">await</span>{" "}
                vscode.authentication.getSession(
              </div>
              <div className="ml-2 font-mono text-white/40">
                <span className="text-emerald-300">&quot;linear&quot;</span>,{" "}
                <span className="text-white/30">
                  {"// Linear VS Code authentication provider ID"}
                </span>
              </div>
              <div className="ml-2 font-mono text-white/40">
                [<span className="text-emerald-300">&quot;read&quot;</span>],{" "}
                <span className="text-white/30">
                  {"// OAuth scopes we're requesting"}
                </span>
              </div>
              <div className="ml-2 font-mono text-white/40">
                &#123; createIfNone:{" "}
                <span className="text-amber-200">true</span> &#125;
              </div>
              <div className="font-mono text-white/40">);</div>
              <div className="mt-1.5 font-mono text-white/40">
                <span className="text-purple-300">if</span> (session) &#123;
              </div>
              <div className="ml-2 font-mono text-white/40">
                <span className="text-purple-300">const</span> linearClient ={" "}
                <span className="text-purple-300">new</span>{" "}
                <span className="text-yellow-200">LinearClient</span>(&#123;
              </div>
              <div className="ml-4 font-mono text-white/40">
                accessToken: session.accessToken,
              </div>
              <div className="ml-2 font-mono text-white/40">&#125;);</div>
              <div className="mt-1.5 ml-2 font-mono text-white/40">
                console.<span className="text-yellow-200">log</span>(
                <span className="text-emerald-300">
                  &quot;Acquired a Linear API session&quot;
                </span>
                , &#123;
              </div>
              <div className="ml-4 font-mono text-white/40">
                account: session.account,
              </div>
              <div className="ml-2 font-mono text-white/40">&#125;);</div>
              <div className="font-mono text-white/40">
                &#125; <span className="text-purple-300">else</span> &#123;
              </div>
              <div className="ml-2 font-mono text-white/40">
                console.<span className="text-yellow-200">error</span>(
              </div>
              <div className="ml-4 font-mono text-white/40">
                <span className="text-emerald-300">
                  &quot;Something went wrong, could not acquire a Linear API
                  session.&quot;
                </span>
              </div>
              <div className="ml-2 font-mono text-white/40">);</div>
              <div className="font-mono text-white/40">&#125;</div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg bg-[#16151a] p-5">
            <div className="absolute top-4 right-4 flex items-center gap-1 text-white/60">
              <Kbd className="px-1 text-[8px]">⌘</Kbd>
              <Kbd className="px-1 text-[8px]">⇧</Kbd>
              <Kbd className="px-1 text-[8px]">P</Kbd>
            </div>
            <div className="mt-12 rounded-md border border-white/10 bg-[#1f1d26] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)]">
              <div className="border-b border-white/10 px-3 py-2 text-[10px] text-white/80">
                <span className="border-b border-white/40">&gt;open is</span>
                <span className="ml-px inline-block h-2.5 w-px animate-pulse bg-white/80" />
              </div>
              <div className="px-3 py-2">
                <div className="flex items-center justify-between text-[10px] text-white/80">
                  <span>
                    <span className="font-semibold text-[#5ea2ff]">
                      Linear:
                    </span>{" "}
                    <span className="font-medium">Open issue</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
      overview={
        <p>
          Linear Connect lets VS Code extensions sign in to Linear with a single
          click and act on the user&apos;s behalf — opening issues, creating
          branches from issue identifiers, or commenting from the editor without
          juggling personal API keys.
        </p>
      }
      features={
        <>
          <section>
            <h2 className="text-sm font-semibold">How it works</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              This integration is an extension that exposes an authentication
              provider to connect to the Linear API. It makes it easy to
              interact with the Linear API whenever you build a VS Code
              extension.
            </p>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              To see how the extension can be used, view the demo{" "}
              <em>Open issue in Linear</em>{" "}
              <a
                href="https://github.com/linear/vscode-extension-demo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline-offset-4 hover:underline"
              >
                extension
              </a>
              .
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold">To configure</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              Install{" "}
              <a
                href="https://marketplace.visualstudio.com/items?itemName=linear.linear-connect"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline-offset-4 hover:underline"
              >
                Linear Connect
              </a>{" "}
              from the Visual Studio Marketplace and follow the instructions.
              You can develop and contribute to the extension, too.
            </p>
          </section>
        </>
      }
    />
  )
}

// Datadog — opens issues from Datadog monitor alerts so triage can
// happen in Linear instead of via email or Slack.
function DatadogIntegrationDetail() {
  return (
    <EngineeringIntegrationShell
      name="Datadog"
      blurb="Create issues from Datadog"
      builtBy="Datadog"
      websiteLabel="datadoghq.com"
      websiteHref="https://datadoghq.com"
      enableHref="https://app.datadoghq.com/integrations"
      tileBg="bg-[#632CA6]"
      tileText="text-white"
      logo={<DatadogLogo className="size-9" />}
      gradient="linear-gradient(135deg, #a474e0 0%, #632ca6 55%, #2b1252 100%)"
      hero={
        <div aria-hidden className="grid grid-cols-2 gap-3">
          <div
            className="relative overflow-hidden rounded-lg p-5"
            style={{
              background:
                "linear-gradient(135deg, #ff5fb0 0%, #7d2ad9 50%, #4a1aa3 100%)",
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
              }}
            />
            <div className="relative flex items-center justify-between gap-3">
              <div className="text-[11px] leading-tight font-semibold text-white">
                Configure templates
                <br />
                for creating Linear
                <br />
                tickets in Datadog
              </div>
              <div className="rounded-md bg-white p-2 text-[7px] text-neutral-700 shadow-[0_6px_18px_-6px_rgba(0,0,0,0.4)]">
                <div className="text-[8px] font-semibold text-neutral-900">
                  New Issue Template
                </div>
                <div className="mt-1.5 space-y-1">
                  {[
                    ["Name", "cache-service"],
                    ["Account", "shopin"],
                    ["Team", "Caching"],
                    ["Project", "Select project"],
                    ["Assignee", "John Doe"],
                    ["Labels", "Bug"],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div className="text-[6px] text-neutral-500">{k} *</div>
                      <div className="rounded-sm border border-neutral-200 px-1 py-0.5 text-[7px]">
                        {v}
                      </div>
                    </div>
                  ))}
                  <div className="text-[6px] text-neutral-500">
                    On Monitor Resolve *
                  </div>
                  <div className="flex gap-1.5 text-[6px]">
                    <span>○ Comment</span>
                    <span>○ Transition</span>
                  </div>
                </div>
                <div className="mt-1.5 flex justify-end">
                  <span className="rounded-sm bg-[#5e6ad2] px-1.5 py-0.5 text-[6px] font-medium text-white">
                    Save
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div
            className="relative overflow-hidden rounded-lg p-5"
            style={{
              background:
                "linear-gradient(135deg, #ff5fb0 0%, #7d2ad9 50%, #4a1aa3 100%)",
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
              }}
            />
            <div className="relative flex items-center justify-between gap-3">
              <div className="text-[11px] leading-tight font-semibold text-white">
                Create tickets from
                <br />
                monitors
              </div>
              <div className="rounded-md bg-white p-2 text-[7px] text-neutral-700 shadow-[0_6px_18px_-6px_rgba(0,0,0,0.4)]">
                <div className="flex items-center gap-1 text-[7px]">
                  <span className="border-b border-neutral-900 pb-px font-medium text-neutral-900">
                    Edit
                  </span>
                  <span className="pb-px text-neutral-400">Preview</span>
                </div>
                <div className="mt-1 flex gap-1 text-[6px] text-neutral-400">
                  <span>B</span>
                  <span>I</span>
                  <span>U</span>
                  <span>S</span>
                  <span>•</span>
                  <span>1</span>
                  <span>“</span>
                  <span>&lt;/&gt;</span>
                  <span>—</span>
                  <span>≡</span>
                  <span>≡</span>
                  <span>≡</span>
                </div>
                <div className="mt-1.5 space-y-0.5 text-[7px]">
                  <div>@linear-memo-service</div>
                  <div>@linear-cache-service</div>
                  <div>@linear-auth-service</div>
                  <div className="mt-1 text-[6px] text-neutral-500">
                    Datadog Bot
                  </div>
                  <div className="text-[6px] text-neutral-400">
                    linkedin@datadog.bot
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
      overview={
        <p>
          The integration allows you to create Linear issues directly from
          Datadog monitors, bringing native observability context into Linear.
        </p>
      }
      features={
        <>
          <section>
            <h2 className="text-sm font-semibold">How it works</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              The integration enables teams to streamline monitoring into
              actionable work. Once installed from the Linear integration tile
              within Datadog and authorized through Linear, users can create
              Linear issues directly from monitor alerts. This setup bridges
              observability and project management, making it easier to track
              incidents and improvements within existing workflows.
            </p>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              After installation, users can configure issue templates that
              define how alert data is translated into Linear issues. Templates
              can include teams, projects, assignees, and labels. Users can also
              choose to comment on or transition issues when a monitor resolves.
              Once configured, these templates can be referenced in monitors
              using handles like{" "}
              <code className="bg-muted rounded px-1 py-0.5 text-[12px]">
                @linear-my-template
              </code>{" "}
              to automatically generate issues when alerts trigger.
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold">Configure</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              For configuration, see more{" "}
              <a
                href="https://docs.datadoghq.com/integrations/linear/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline-offset-4 hover:underline"
              >
                here
              </a>
              .
              <br />
              To authorize the integration within Datadog, the user will need to
              be an admin in Linear.
            </p>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              Datadog is also available as an{" "}
              <a
                href="https://docs.datadoghq.com/integrations/mcp/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline-offset-4 hover:underline"
              >
                MCP server
              </a>{" "}
              for use with Linear Agent
            </p>
          </section>
        </>
      }
    />
  )
}

// incident.io — pulls active incidents into Linear so post-incident
// follow-up work and triage rotations live alongside engineering work.
function IncidentIoIntegrationDetail() {
  return (
    <EngineeringIntegrationShell
      name="incident.io"
      blurb="Manage incidents and triage responsibility directly in Linear"
      builtBy="incident.io"
      websiteLabel="incident.io"
      websiteHref="https://incident.io"
      enableHref="https://app.incident.io/settings/integrations"
      tileBg="bg-[#FF4500]"
      tileText="text-white"
      logo={<IncidentIoLogo className="size-9" />}
      gradient="linear-gradient(135deg, #ffb066 0%, #ff4500 55%, #8a1d00 100%)"
      hero={
        <div aria-hidden className="grid grid-cols-2 gap-3">
          <div
            className="relative flex flex-col gap-3 overflow-hidden rounded-lg p-5"
            style={{
              background: "linear-gradient(180deg, #f9f3eb 0%, #efe2ce 100%)",
            }}
          >
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-neutral-800">
              <span
                className="grid size-3.5 place-items-center rounded-sm text-[8px] text-white"
                style={{ background: "#FF4500" }}
              >
                <IncidentIoLogo className="size-2.5" />
              </span>
              incident.io
            </div>
            <div className="rounded-md border border-neutral-200 bg-white p-2 text-[8px] text-neutral-700 shadow-[0_4px_12px_-6px_rgba(0,0,0,0.15)]">
              <div className="flex items-center justify-between">
                <span className="text-[7px] font-semibold text-neutral-500">
                  Incidents
                </span>
              </div>
              <div className="mt-1 text-[9px] font-semibold text-neutral-900">
                INC-7978 Timeout loading the activity log
              </div>
              <div className="mt-1 flex gap-3 border-b border-neutral-200 pb-0.5 text-[7px]">
                <span className="text-neutral-400">Overview</span>
                <span className="border-b border-neutral-900 pb-0.5 font-medium text-neutral-900">
                  Post-incident
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-[7px] font-semibold text-neutral-700">
                  Follow-ups
                </span>
                <span className="text-[6px] text-neutral-500">
                  + Add follow-up
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between rounded border border-neutral-200 px-1.5 py-1">
                <div className="flex items-center gap-1">
                  <span className="size-2 rounded-sm border border-neutral-300" />
                  <span className="text-[7px]">Automate database failover</span>
                </div>
                <span className="rounded-sm bg-neutral-100 px-1 py-px text-[6px]">
                  Low ↓
                </span>
              </div>
            </div>
            <div className="absolute right-6 bottom-16 rounded-md border border-neutral-200 bg-white py-1 text-[8px] text-neutral-700 shadow-[0_6px_18px_-6px_rgba(0,0,0,0.2)]">
              <div className="flex items-center gap-1.5 px-2 py-0.5">
                <span className="text-neutral-400">✎</span>
                Edit
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5">
                <span className="text-neutral-400">✓</span>
                Resolve thread
              </div>
              <div className="flex items-center gap-1.5 bg-neutral-50 px-2 py-0.5">
                <span style={{ color: "#FF4500" }}>●</span>
                Create or link a Linear issue
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 text-red-500">
                <span>🗑</span>
                Delete
              </div>
            </div>
            <div className="mt-auto pt-2 text-[12px] leading-tight font-semibold text-neutral-900">
              Create Linear issues
              <br />
              from incident follow-
              <br />
              ups with one click
            </div>
          </div>
          <div
            className="relative flex flex-col gap-3 overflow-hidden rounded-lg p-5"
            style={{
              background: "linear-gradient(180deg, #f9f3eb 0%, #efe2ce 100%)",
            }}
          >
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-neutral-800">
              <span
                className="grid size-3.5 place-items-center rounded-sm text-[8px] text-white"
                style={{ background: "#FF4500" }}
              >
                <IncidentIoLogo className="size-2.5" />
              </span>
              incident.io
            </div>
            <div className="text-[12px] leading-tight font-semibold text-neutral-900">
              Automatically link
              <br />
              incidents and issues
            </div>
            <div className="absolute top-10 right-4 w-[55%] rounded-md border border-neutral-200 bg-white p-2 text-[7px] text-neutral-700 shadow-[0_6px_18px_-6px_rgba(0,0,0,0.18)]">
              <div className="flex items-center gap-1">
                <span className="text-amber-500">!</span>
                <span className="text-[6px] font-semibold tracking-wider text-neutral-500 uppercase">
                  Active
                </span>
              </div>
              <div className="mt-0.5 text-[8px] font-semibold text-neutral-900">
                Timeout loading the activity log
              </div>
              <div className="mt-1.5 space-y-0.5">
                {[
                  ["Status", "In Progress"],
                  ["Severity", "Minor"],
                  ["Reported", "Dec 8, 11:52am"],
                  ["Linked Issues", "DES-002"],
                  ["Created from", "INC-7978"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center gap-1.5 text-[6px]">
                    <span className="w-14 text-neutral-500">{k}:</span>
                    <span className="text-neutral-800">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      }
      overview={
        <p>
          Connect incidents to Linear issues and keep follow-ups and engineering
          work in sync automatically.
        </p>
      }
      features={
        <>
          <section>
            <h2 className="text-sm font-semibold">How it works</h2>
            <ul className="text-muted-foreground mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6">
              <li>
                <span className="text-foreground font-medium">
                  Create Linear issues from incident follow-ups
                </span>{" "}
                with one click
              </li>
              <li>
                <span className="text-foreground font-medium">
                  Automatically link incidents and issues
                </span>{" "}
                so engineering can see why the work exists
              </li>
              <li>
                <span className="text-foreground font-medium">
                  Sync updates between{" "}
                  <a
                    href="https://incident.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#5e6ad2] underline-offset-4 hover:underline"
                  >
                    incident.io
                  </a>{" "}
                  and Linear
                </span>
                , reducing manual updates
              </li>
              <li>
                <span className="text-foreground font-medium">
                  Keep operational and engineering work aligned
                </span>
                , with full incident context attached to each issue
              </li>
              <li>
                <span className="text-foreground font-medium">
                  Improve post-incident reviews
                </span>
                , with a clear picture of completed and outstanding actions
              </li>
            </ul>
            <p className="text-muted-foreground mt-4 text-sm leading-6">
              This integration helps engineering managers, SREs, and responders
              close the loop between firefighting and continuous improvement,
              without switching tools.
            </p>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              Connect Linear and{" "}
              <a
                href="https://incident.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#5e6ad2] underline-offset-4 hover:underline"
              >
                incident.io
              </a>{" "}
              to make follow-ups actionable, visible, and easy for engineering
              teams to execute—long after the incident is resolved.
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold">Triage responsibility</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              <a
                href="https://linear.app/docs/triage"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#5e6ad2] underline-offset-4 hover:underline"
              >
                Triage responsibility
              </a>{" "}
              is a feature available on our Business and Enterprise plans which
              enables you to handle incoming requests. Once triage
              responsibility is set, there is the option to connect your
              incident.io schedule to automate the rotation of first responders.
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold">Configure</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              Adding Linear to incident.io is simple. Just log into your
              incident.io web app, go to <em>Settings &gt; Integrations</em> and
              hit <em>Connect</em> next to Linear. Log into your Linear account
              and you&apos;re all set.
            </p>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              Incident.io is also available as an{" "}
              <a
                href="https://docs.incident.io/integrations/mcp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#5e6ad2] underline-offset-4 hover:underline"
              >
                MCP server
              </a>{" "}
              for use with Linear Agent
            </p>
          </section>
        </>
      }
    />
  )
}

// Raycast — Linear's Raycast extension. Lets you create, search, and
// modify issues from the launcher anywhere on macOS.
function RaycastIntegrationDetail() {
  return (
    <EngineeringIntegrationShell
      name="Raycast"
      blurb="Create, search, and modify your issues from anywhere"
      builtBy="Raycast"
      websiteLabel="raycast.com"
      websiteHref="https://www.raycast.com"
      enableHref="https://www.raycast.com/linear/linear"
      tileBg="bg-[#FF6363]"
      tileText="text-white"
      logo={<RaycastLogo className="size-9" />}
      gradient="linear-gradient(135deg, #ff9b9b 0%, #ff6363 55%, #a82323 100%)"
      hero={
        <div aria-hidden className="grid grid-cols-2 gap-3">
          <div
            className="relative overflow-hidden rounded-lg p-4"
            style={{
              background:
                "linear-gradient(135deg, #b3a3ff 0%, #5b6cff 70%, #4a55d4 100%)",
            }}
          >
            <div className="rounded-md bg-[#1c1f2e]/95 p-2.5 text-[8px] text-white shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-1 border-b border-white/10 pb-1.5 text-[8px]">
                <span className="grid size-2.5 place-items-center rounded-sm bg-[#5e6ad2] text-[6px] font-semibold">
                  ⊕
                </span>
                <span className="font-medium">Create Issue</span>
              </div>
              <div className="mt-1.5 space-y-1">
                {[
                  ["Title", "Automate Icon implementation flow"],
                  [
                    "Description",
                    "Add some details (supports Markdown, e.g. **bold**)",
                  ],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2 text-[7px]">
                    <span className="w-12 text-white/50">{k}</span>
                    <span className="flex-1 truncate rounded bg-white/5 px-1 py-0.5 text-white/80">
                      {v}
                    </span>
                  </div>
                ))}
                {[
                  ["Status", "○ Todo"],
                  ["Priority", "▥ Medium"],
                  ["Assignee", "● nichlas"],
                  ["Estimation", "≣ No estimate"],
                  ["Labels", "● design ×"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2 text-[7px]">
                    <span className="w-12 text-white/50">{k}</span>
                    <span className="flex-1 rounded bg-white/5 px-1 py-0.5 text-white/80">
                      {v}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-end border-t border-white/10 pt-1.5">
                <span className="rounded bg-[#5e6ad2] px-1.5 py-0.5 text-[7px] font-medium">
                  Create Issue
                </span>
              </div>
            </div>
          </div>
          <div
            className="relative overflow-hidden rounded-lg p-4"
            style={{
              background:
                "linear-gradient(135deg, #b3a3ff 0%, #5b6cff 70%, #4a55d4 100%)",
            }}
          >
            <div className="rounded-md bg-[#1c1f2e]/95 p-2.5 text-[7px] text-white shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-1 border-b border-white/10 pb-1.5 text-[8px]">
                <span className="grid size-2.5 place-items-center rounded-sm bg-[#5e6ad2] text-[6px] font-semibold">
                  ≣
                </span>
                <span className="font-medium">Assigned Issues</span>
              </div>
              <div className="mt-1.5 flex items-center gap-1 text-[7px] text-white/40">
                <span>⌕</span>
                <span>
                  Filter by key, title, status, assignee or priority...
                </span>
              </div>
              <div className="mt-1.5">
                <div className="text-[6px] tracking-wider text-white/40 uppercase">
                  Todo &nbsp; <span className="text-white/30">3 issues</span>
                </div>
                {[
                  [
                    "Support loading of both list and detail view",
                    "RAY-5444",
                    "23 May",
                  ],
                  ["Accessorise elements on grid items", "RAY-6099", "19 May"],
                  ["Set sizing rules on window", "RAY-5841", "20 Apr"],
                ].map(([t, id, d]) => (
                  <div
                    key={id}
                    className="mt-1 flex items-center justify-between text-[7px]"
                  >
                    <div className="flex items-center gap-1 truncate text-white/80">
                      <span className="text-white/40">○</span>
                      <span className="truncate">{t}</span>
                      <span className="text-white/40">{id}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/40">
                      <span>○</span>
                      <span>{d}</span>
                      <span>●</span>
                    </div>
                  </div>
                ))}
                <div className="mt-1.5 text-[6px] tracking-wider text-white/40 uppercase">
                  Backlog &nbsp; <span className="text-white/30">4 issues</span>
                </div>
                {[
                  ["Raycast Admin Extension icon", "RAY-5472"],
                  [
                    "Highlight missing accessibility permission if snippet exp...",
                    "",
                  ],
                  ["Show rich text in clipboard history", "RAY-5736"],
                  ["Add OG image", "RAY-5573"],
                ].map(([t, id], i) => (
                  <div
                    key={i}
                    className="mt-1 flex items-center justify-between text-[7px]"
                  >
                    <div className="flex items-center gap-1 truncate text-white/80">
                      <span className="text-white/40">○</span>
                      <span className="truncate">{t}</span>
                      {id && <span className="text-white/40">{id}</span>}
                    </div>
                  </div>
                ))}
                <div className="mt-1.5 text-[6px] tracking-wider text-white/40 uppercase">
                  Done &nbsp; <span className="text-white/30">28 issues</span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-[7px] text-white/80">
                  <span className="text-white/40">○</span>
                  <span>Floating Notes • 5 Themes</span>
                  <span className="text-white/40">RAY-5837</span>
                </div>
              </div>
            </div>
            <div className="absolute top-12 right-4 w-[42%] rounded-md border border-white/10 bg-[#1c1f2e]/95 p-1.5 text-[6px] text-white shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)]">
              <div className="flex items-center justify-between border-b border-white/10 pb-1">
                <span className="text-white/40">RAY-5444</span>
                <span>⌥</span>
              </div>
              <div className="mt-1 space-y-0.5 text-[6px]">
                {[
                  ["Show Details", "⌃"],
                  ["Open Issue in Linear", "↗"],
                  ["Set Status...", "× ⌘ S"],
                  ["Set Priority...", "× ⌘ P"],
                ].map(([t, k]) => (
                  <div
                    key={t}
                    className="flex items-center justify-between px-1 py-0.5"
                  >
                    <span>{t}</span>
                    <span className="text-white/40">{k}</span>
                  </div>
                ))}
              </div>
              <div className="mt-1 flex items-center justify-between border-t border-white/10 px-1 pt-1 text-white/40">
                <span>Search for action...</span>
              </div>
            </div>
          </div>
        </div>
      }
      overview={
        <p>
          This integration brings the speed, quality, and joy of the Linear app
          to every corner of your Mac. Create and assign issues, search for
          issues and projects, and stay on top of your team&apos;s active cycle.
          Everything is quickly accessible via a global hotkey to minimize
          context switching.
        </p>
      }
      features={
        <>
          <section>
            <h2 className="text-sm font-semibold">How it works</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              Using Linear in Raycast is simple. After installing the
              integration, you can search for Linear in Raycast. It shows you
              all available commands, e.g. Create Issue, Assigned Issues, Search
              Issues, and more. Open a command to use it.
            </p>
            <p className="text-muted-foreground mt-3 text-sm leading-6">
              Raycast is globally available on your Mac. Open it with a hotkey
              to quickly execute a command. The integration is great for going
              through your assigned issues and creating issues during the day
              without getting distracted.
            </p>
            <p className="text-muted-foreground mt-3 text-sm leading-6">
              One pro tip to share: assign a hotkey to the <em>Create Issue</em>{" "}
              command via the Raycast preferences (e.g.{" "}
              <Kbd className="text-[11px]">⌥</Kbd>{" "}
              <Kbd className="text-[11px]">C</Kbd>) to create issues even
              quicker.
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold">Configure</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              Install the integration from the{" "}
              <a
                href="https://www.raycast.com/linear/linear"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#5e6ad2] underline-offset-4 hover:underline"
              >
                Raycast Store
              </a>{" "}
              and log in to your Linear workspace afterwards. Then, search for
              Linear in Raycast to familarize yourself with the available
              commands.
            </p>
          </section>
        </>
      }
    />
  )
}

// Linear Asks for Slack — turns Slack messages and emails into Linear
// Asks/issues with helpdesk workflows. Built by Linear, native enable.
function LinearAsksIntegrationDetail() {
  return (
    <EngineeringIntegrationShell
      name="Linear Asks for Slack"
      blurb="Turn requests from Slack or email into actionable issues and enable helpdesk workflows"
      builtBy="Linear"
      enableHref="https://linear.app/settings/integrations/asks"
      enableVariant="native"
      tileBg="bg-violet-600"
      tileText="text-white"
      logo={<LinearAsksLogo className="size-9" />}
      gradient="linear-gradient(135deg, #b3a3ff 0%, #7c3aed 60%, #4c1d95 100%)"
      hero={
        <div aria-hidden className="grid grid-cols-2 gap-3">
          <div
            className="relative overflow-hidden rounded-lg p-5"
            style={{
              background: "linear-gradient(180deg, #fbe7e0 0%, #f4d2c7 100%)",
            }}
          >
            <div className="text-center text-[11px] font-semibold text-neutral-800">
              Create and manage requests in Slack
            </div>
            <div className="mt-3 ml-auto w-[80%] rounded-md bg-white p-2 text-[7px] text-neutral-700 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.18)]">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-1">
                <div className="flex items-center gap-1 text-[8px] font-semibold text-neutral-900">
                  <span>Thread</span>
                  <span className="text-[6px] text-neutral-400">
                    ▸ platform-asks
                  </span>
                </div>
                <span className="text-neutral-400">×</span>
              </div>
              <div className="mt-1 flex items-start gap-1.5">
                <span className="size-3.5 rounded-sm bg-rose-300" />
                <div>
                  <div className="flex items-center gap-1 text-[7px]">
                    <span className="font-semibold text-neutral-900">
                      leela
                    </span>
                    <span className="text-neutral-400">1 day ago</span>
                  </div>
                  <div className="text-[7px] leading-snug">
                    A customer is hitting a bug with the theme selector. See
                    this{" "}
                    <span className="text-[#5e6ad2] underline">thread</span> for
                    screenshots.
                  </div>
                </div>
              </div>
              <div className="mt-1.5 ml-5 text-[6px] text-neutral-400">
                <span className="text-neutral-600">↩ 1</span>
                <span className="ml-2 inline-block">😀</span>
              </div>
              <div className="mt-1.5 flex items-start gap-1.5">
                <span className="grid size-3.5 place-items-center rounded-sm bg-violet-600 text-[6px] font-bold text-white">
                  A
                </span>
                <div className="w-full">
                  <div className="flex items-center gap-1 text-[7px]">
                    <span className="font-semibold text-neutral-900">
                      Linear Asks
                    </span>
                    <span className="rounded-sm bg-neutral-100 px-1 py-px text-[5px] font-medium text-neutral-500">
                      APP
                    </span>
                    <span className="text-neutral-400">1 day ago</span>
                  </div>
                  <div className="text-[7px] font-medium">
                    Erin Frey added a new bug report on behalf of @leela
                  </div>
                  <div className="mt-1 rounded border border-neutral-200 p-1.5">
                    <div className="text-[7px] font-medium text-[#5e6ad2]">
                      PLA-24 Theme selector broken
                    </div>
                    <div className="mt-0.5 text-[6px] text-neutral-500">
                      A customer is hitting a bug with the theme selector. See
                      this{" "}
                      <span className="text-[#5e6ad2] underline">thread</span>{" "}
                      for screenshots.
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1.5 text-[6px] text-neutral-500">
                      <span>
                        <span className="font-medium text-neutral-700">
                          Status:
                        </span>{" "}
                        Triage
                      </span>
                      <span>
                        <span className="font-medium text-neutral-700">
                          Assignee:
                        </span>{" "}
                        Erin Frey
                      </span>
                    </div>
                    <div className="mt-1 text-[6px] text-neutral-500">
                      ⇆ Synced with Slack
                    </div>
                  </div>
                  <div className="mt-1 text-[6px] text-neutral-500">
                    Platform | Yesterday 9:15 AM
                  </div>
                  <div className="mt-1 inline-flex items-center gap-1 rounded border border-neutral-200 px-1.5 py-0.5 text-[6px]">
                    Triage
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      className="size-2 rotate-90 text-neutral-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className="relative overflow-hidden rounded-lg p-5"
            style={{
              background: "linear-gradient(180deg, #fbece0 0%, #f4d8b4 100%)",
            }}
          >
            <div className="ml-auto w-[80%] rounded-md bg-white p-2 text-[7px] text-neutral-700 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.18)]">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-1">
                <div className="flex items-center gap-1 text-[8px] font-semibold text-neutral-900">
                  <span className="grid size-3 place-items-center rounded-sm bg-violet-600 text-[5px] font-bold text-white">
                    A
                  </span>
                  Bug report
                </div>
                <div className="flex items-center gap-1 text-neutral-400">
                  <span>↗</span>
                  <span>×</span>
                </div>
              </div>
              <div className="mt-1 text-[6px] text-neutral-500">
                Support engineering
              </div>
              <div className="mt-1.5 space-y-1">
                <div>
                  <div className="text-[6px] text-neutral-500">Bug report</div>
                  <div className="rounded border border-neutral-200 px-1 py-0.5 text-[7px] text-neutral-400">
                    ▾
                  </div>
                </div>
                <div>
                  <div className="text-[6px] text-neutral-500">Title</div>
                  <div className="rounded border border-neutral-200 px-1 py-0.5 text-[7px]">
                    Theme selector broken
                  </div>
                </div>
                <div>
                  <div className="text-[6px] text-neutral-500">
                    Description (optional)
                  </div>
                  <div className="rounded border border-neutral-200 px-1 py-1 text-[6px] leading-snug text-neutral-600">
                    They&apos;re on a free trial, so a quick fix would be a win.
                  </div>
                </div>
                <div>
                  <div className="text-[6px] text-neutral-500">
                    Linked message
                  </div>
                  <div className="rounded border border-neutral-200 p-1 text-[6px] leading-snug text-neutral-600">
                    A customer is hitting a bug with the theme selector. See
                    this{" "}
                    <span className="text-[#5e6ad2] underline">thread</span> for
                    screenshots.
                  </div>
                </div>
                <div className="text-[5px] text-neutral-400">
                  Sent by ▴ leela
                </div>
              </div>
              <div className="mt-1.5 flex justify-end gap-1 border-t border-neutral-200 pt-1">
                <span className="rounded border border-neutral-200 px-1.5 py-0.5 text-[6px]">
                  Cancel
                </span>
                <span className="rounded bg-emerald-500 px-1.5 py-0.5 text-[6px] font-medium text-white">
                  Submit
                </span>
              </div>
            </div>
            <div className="mt-3 text-center text-[11px] leading-tight font-semibold text-neutral-800">
              Streamline intake with templates that
              <br />
              route issues to the right team
            </div>
          </div>
        </div>
      }
      overview={
        <p>
          Linear Asks gives organizations a powerful tool to manage common
          workplace requests. Once enabled, anyone can create an Ask to send
          their request to the relevant Linear team—even if they don&apos;t have
          a Linear account—via Slack or email.
        </p>
      }
      features={
        <>
          <section>
            <h2 className="text-sm font-semibold">How it works</h2>
          </section>
          <section>
            <h2 className="text-sm font-semibold">Configure</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              Admins on Business and Enterprise plans can enable the integration
              in Linear from{" "}
              <a
                href="https://linear.app/settings/integrations/asks"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#5e6ad2] underline-offset-4 hover:underline"
              >
                settings
              </a>
              . Try Asks and other Business features for 30 days with a free
              trial.
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold">Learn more</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              More information about Asks is available in our{" "}
              <a
                href="https://linear.app/docs/asks"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#5e6ad2] underline-offset-4 hover:underline"
              >
                documentation
              </a>
              .
            </p>
          </section>
        </>
      }
    />
  )
}

// Notion — live previews of Linear issues, views and projects in Notion
// pages, plus Notion AI Connector for querying Linear via Notion.
function NotionIntegrationDetail() {
  return (
    <EngineeringIntegrationShell
      name="Notion"
      blurb="Previews of Linear issues, views and projects and query Notion AI"
      builtBy="Linear"
      enableHref="https://www.notion.so/integrations/linear"
      enableVariant="external"
      tileBg="bg-white"
      tileText="text-neutral-900"
      logo={<NotionLogo className="size-9" />}
      gradient="linear-gradient(135deg, #f5f5f5 0%, #d4d4d4 60%, #737373 100%)"
      hero={
        <div
          aria-hidden
          className="rounded-lg bg-white p-6 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.5)]"
        >
          <div className="rounded-lg bg-white p-4 ring-1 ring-neutral-200">
            <div className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-red-400" />
              <span className="size-2 rounded-full bg-amber-400" />
              <span className="size-2 rounded-full bg-emerald-400" />
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <span className="grid size-5 place-items-center rounded-sm bg-neutral-200 text-neutral-700">
                <span className="block size-1 rounded-full bg-neutral-700" />
                <span className="ml-0.5 block size-1 rounded-full bg-neutral-700" />
                <span className="ml-0.5 block size-1 rounded-full bg-neutral-700" />
              </span>
            </div>
            <h3 className="mt-3 text-base font-semibold text-neutral-900">
              Project Shiva Laser
            </h3>
            <div className="mt-4 text-[11px] font-medium text-neutral-500">
              Latest tasks
            </div>
            <div className="mt-2 space-y-2">
              <div className="rounded-md border border-neutral-200 bg-white p-2 shadow-sm">
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="grid size-3.5 place-items-center rounded-sm bg-[#5e6ad2] text-[8px] font-bold text-white">
                    L
                  </span>
                  <span className="font-medium text-neutral-900">
                    Implement laser in ENCOM system
                  </span>
                  <span className="rounded bg-amber-100 px-1 py-px text-[9px] font-medium text-amber-800">
                    In Progress
                  </span>
                </div>
                <div className="mt-0.5 text-[10px] font-medium text-neutral-700">
                  SHV 20905 digitizing laser
                </div>
                <div className="mt-1 text-[9px] text-neutral-500">
                  USP-1710 · Linear US · Assignee: julian · Last updated:
                  September 14, 2022
                </div>
              </div>
              <div className="rounded-md border border-neutral-200 bg-white p-2 shadow-sm">
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="grid size-3.5 place-items-center rounded-sm bg-[#5e6ad2] text-[8px] font-bold text-white">
                    L
                  </span>
                  <span className="font-medium text-neutral-900">
                    Add glowing strips to light suit
                  </span>
                  <span className="rounded bg-neutral-100 px-1 py-px text-[9px] font-medium text-neutral-600">
                    Todo
                  </span>
                </div>
                <div className="mt-0.5 text-[10px] font-medium text-neutral-700">
                  (Use fluorescent material)
                </div>
                <div className="mt-1 text-[9px] text-neutral-500">
                  OPS2-699 · Ops · Assignee: zoe · Last updated: September 14,
                  2022
                </div>
              </div>
            </div>
            <div className="mt-3 text-[10px] text-neutral-400">
              Type &apos;/&apos; for commands
            </div>
          </div>
        </div>
      }
      overview={
        <>
          <p>
            This integration brings the magic of Linear to Notion with live
            previews for issues, projects, and views. Additionally, use the
            Notion AI Connector for Linear to ask questions about your
            workspace.
          </p>
          <a
            href="https://linear.app/docs/notion"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground mt-3 inline-block text-sm underline-offset-4 hover:underline"
          >
            Read more
          </a>
        </>
      }
      footer={
        <div className="bg-card flex items-center justify-between rounded-lg border p-5">
          <div>
            <div className="text-sm font-medium">Connect your user account</div>
            <div className="text-muted-foreground mt-0.5 text-xs">
              Preview issues, projects, and views within Notion
            </div>
          </div>
          <Button size="sm" variant="ghost" asChild>
            <a
              href="https://www.notion.so/integrations/linear"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Connect Notion (opens in new tab)"
            >
              Connect
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
            </a>
          </Button>
        </div>
      }
    />
  )
}

// Zapier — automation tool that lets users create Linear issues,
// comments, projects and more without code.
function ZapierIntegrationDetail() {
  return (
    <EngineeringIntegrationShell
      name="Zapier"
      blurb="Build custom automations to create or update Linear issues"
      builtBy="Linear"
      docsHref="https://linear.app/docs/zapier"
      enableHref="https://zapier.com/apps/linear/integrations"
      enableVariant="external"
      tileBg="bg-[#FF4A00]"
      tileText="text-white"
      logo={<ZapierLogo className="size-9" />}
      gradient="linear-gradient(135deg, #ff8a4a 0%, #ff4a00 55%, #b33000 100%)"
      hero={
        <div aria-hidden className="grid grid-cols-2 gap-3">
          <div
            className="relative overflow-hidden rounded-lg p-5"
            style={{
              background: "linear-gradient(180deg, #fbe7d4 0%, #f5d4b3 100%)",
            }}
          >
            <div className="rounded-md bg-white p-2 text-[7px] text-neutral-700 shadow-[0_6px_18px_-6px_rgba(0,0,0,0.18)]">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-1 text-[7px]">
                <div className="flex items-center gap-1">
                  <span className="grid size-3 place-items-center rounded bg-orange-100 text-orange-600">
                    📅
                  </span>
                  <div>
                    <div className="text-[6px] text-neutral-500">Trigger</div>
                    <div className="font-semibold text-neutral-900">
                      1. Every Month in Schedule by Zapier
                    </div>
                  </div>
                </div>
                <span className="text-neutral-400">⋯</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[7px]">
                <span>Choose app & event</span>
                <span className="text-emerald-500">✓</span>
              </div>
              <div className="mt-1.5 rounded border border-neutral-200 p-1.5">
                <div className="flex items-center justify-between text-[7px]">
                  <span className="font-medium">Schedule by Zapier</span>
                  <span className="rounded bg-neutral-100 px-1 py-px text-[6px]">
                    Change
                  </span>
                </div>
                <div className="mt-1 text-[6px] text-neutral-500">
                  Event (required)
                </div>
                <div className="rounded border border-neutral-200 px-1 py-0.5 text-[7px]">
                  Every Month
                </div>
                <div className="mt-1 text-[5px] text-neutral-400">
                  This is when this Zap runs.
                </div>
                <div className="mt-1.5 flex justify-center">
                  <span className="rounded bg-[#5e6ad2] px-3 py-0.5 text-[7px] font-medium text-white">
                    Continue
                  </span>
                </div>
              </div>
              <div className="mt-1 flex items-center gap-1 text-[7px]">
                <span>Set up trigger</span>
              </div>
            </div>
            <div className="mt-2 rounded-md bg-white p-1.5 text-[7px] shadow-[0_6px_18px_-6px_rgba(0,0,0,0.18)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="grid size-3 place-items-center rounded bg-[#5e6ad2]/15 text-[6px] font-bold text-[#5e6ad2]">
                    L
                  </span>
                  <div>
                    <div className="text-[6px] text-neutral-500">Action</div>
                    <div className="font-semibold text-neutral-900">
                      2. Create Issue in Linear (2.1.3)
                    </div>
                  </div>
                </div>
                <span className="text-neutral-400">⋯</span>
              </div>
            </div>
          </div>
          <div
            className="relative overflow-hidden rounded-lg p-5"
            style={{
              background: "linear-gradient(180deg, #fbe7d4 0%, #f5d4b3 100%)",
            }}
          >
            <div className="rounded-md bg-white p-1.5 text-[7px] shadow-[0_6px_18px_-6px_rgba(0,0,0,0.18)]">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-1">
                <div className="flex items-center gap-1">
                  <span className="grid size-3 place-items-center rounded bg-orange-100 text-orange-600">
                    📅
                  </span>
                  <div>
                    <div className="text-[6px] text-neutral-500">Trigger</div>
                    <div className="font-semibold text-neutral-900">
                      1. Every Month in Schedule by Zapier
                    </div>
                  </div>
                </div>
                <span className="text-neutral-400">⋯</span>
              </div>
            </div>
            <div className="my-1 flex justify-center text-neutral-400">+</div>
            <div className="rounded-md bg-white p-2 text-[7px] shadow-[0_6px_18px_-6px_rgba(0,0,0,0.18)]">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-1">
                <div className="flex items-center gap-1">
                  <span className="grid size-3 place-items-center rounded bg-[#5e6ad2]/15 text-[6px] font-bold text-[#5e6ad2]">
                    L
                  </span>
                  <div>
                    <div className="text-[6px] text-neutral-500">Action</div>
                    <div className="font-semibold text-neutral-900">
                      2. Create Issue in Linear (2.1.3)
                    </div>
                  </div>
                </div>
                <span className="text-neutral-400">⋯</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[7px]">
                <span>Choose app & event</span>
                <span className="text-emerald-500">✓</span>
              </div>
              <div className="mt-1 rounded border border-neutral-200 p-1.5">
                <div className="flex items-center justify-between text-[7px]">
                  <span className="font-medium">Linear (2.1.3)</span>
                  <span className="rounded bg-neutral-100 px-1 py-px text-[6px]">
                    Change
                  </span>
                </div>
                <div className="mt-1 text-[6px] text-neutral-500">
                  Event (required)
                </div>
                <div className="rounded border border-neutral-200 px-1 py-0.5 text-[7px]">
                  Create Issue
                </div>
                <div className="mt-1 text-[5px] text-neutral-400">
                  This is published when this Zap runs.
                </div>
                <div className="mt-1.5 flex justify-center">
                  <span className="rounded bg-[#5e6ad2] px-3 py-0.5 text-[7px] font-medium text-white">
                    Continue
                  </span>
                </div>
              </div>
              <div className="mt-1 flex items-center justify-between text-[7px]">
                <span>Choose account</span>
                <span className="text-emerald-500">✓</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[7px]">
                <span>Set up action</span>
                <span className="text-emerald-500">✓</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[7px]">
                <span>Test action</span>
                <span className="text-emerald-500">✓</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[7px]">
                <span>Close</span>
              </div>
            </div>
          </div>
        </div>
      }
      overview={
        <p>
          Use Zapier to create issues, build automations, and design custom
          workflows using Linear actions.
        </p>
      }
      features={
        <section>
          <h2 className="text-sm font-semibold">How it works</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Zapier provides an out-of-the-box solution for automation. While
            Linear&apos;s API provides more customizability, Zapier is faster to
            implement, does not require technical knowledge, and easily connects
            to many popular tools.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            Create a Zapier account and then go use our{" "}
            <a
              href="https://zapier.com/apps/linear/integrations"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#5e6ad2] underline-offset-4 hover:underline"
            >
              Zapier integration
            </a>{" "}
            to build workflows. You&apos;ll select other apps or Zapier actions
            (e.g. do something daily at 10AM).
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            This integration supports automating the creation of issues,
            projects, issue attachments, comments and more in Linear.
            Alternatively, use Linear as a trigger at the start of your Zap to
            take actions in other applications. Learn more about what&apos;s
            possible with Zapier{" "}
            <a
              href="https://zapier.com/apps/linear/integrations"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#5e6ad2] underline-offset-4 hover:underline"
            >
              here
            </a>
            .
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            If you&apos;re not seeing full functionality, ensure the Zap in
            question is running the{" "}
            <a
              href="https://zapier.com/apps/linear/integrations"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#5e6ad2] underline-offset-4 hover:underline"
            >
              latest version
            </a>{" "}
            of the Linear integration.
          </p>
        </section>
      }
    />
  )
}

// Bird Eats Bug — turns rich bug-replay sessions into Linear issues
// pre-filled with console logs, system info, and network requests.
function BirdEatsBugIntegrationDetail() {
  return (
    <EngineeringIntegrationShell
      name="Bird Eats Bug"
      blurb="Speed up your bug reporting workflow with Bird Eats Bug"
      builtBy="Bird Eats Bug"
      websiteLabel="birdeatsbug.com"
      websiteHref="https://birdeatsbug.com"
      enableHref="https://app.birdeatsbug.com/settings/integrations"
      enableVariant="external"
      tileBg="bg-[#FF3D3D]"
      tileText="text-white"
      logo={<BirdEatsBugLogo className="size-9" />}
      gradient="linear-gradient(135deg, #ff7a7a 0%, #ff3d3d 55%, #a01818 100%)"
      hero={
        <div aria-hidden className="grid grid-cols-2 gap-3">
          <div
            className="relative overflow-hidden rounded-lg p-5"
            style={{ background: "#fbd435" }}
          >
            <div className="rounded-md bg-[#1f1f24] p-2 text-[7px] text-white/85 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.45)]">
              <div className="flex items-center justify-between border-b border-white/10 pb-1">
                <div className="flex items-center gap-1.5 text-[7px] text-white/70">
                  <span className="grid size-2.5 place-items-center rounded-sm bg-rose-400 text-[5px] font-bold text-white">
                    A
                  </span>
                  <span className="text-white/40">Linear</span>
                  <span className="text-white/40">›</span>
                  <span>High</span>
                  <span className="text-white/40">›</span>
                  <span>Bug</span>
                  <span className="text-white/40">›</span>
                  <span>Quick fix</span>
                  <span className="ml-1 rounded bg-emerald-500/20 px-1 text-[5px] font-medium text-emerald-300">
                    Save Pin
                  </span>
                </div>
                <div className="flex gap-0.5 text-white/40">
                  <span>‹</span>
                  <span>›</span>
                  <span>×</span>
                </div>
              </div>
              <div className="mt-1 grid grid-cols-[1fr_1.4fr] gap-1">
                <div className="space-y-0.5">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div key={i} className="h-1 rounded-sm bg-white/5" />
                  ))}
                </div>
                <div className="space-y-0.5">
                  <div className="flex gap-1 text-[5px] text-white/40">
                    <span>Console</span>
                    <span>Network</span>
                    <span>System</span>
                  </div>
                  <div className="rounded bg-white/5 p-1 text-[5px] leading-tight text-white/50">
                    <div>
                      09 Channel: tracking - timeout
                      (?))(?:storage.googleapis.com/birdeatsbug-resources)
                    </div>
                    <div className="mt-0.5">
                      Failed to load resource: the server responded with a
                      status
                    </div>
                    <div className="mt-0.5">
                      Unrecognized Content-Security-Policy directive
                      &apos;upgrade-i…&apos;
                    </div>
                    <div className="mt-0.5">
                      Failed to load resource: the server responded with a
                      status
                    </div>
                    <div className="mt-0.5">Click eb6f5b21eb2b dataframe…</div>
                    <div className="mt-0.5">
                      The resource &lt;https://s.dq.com/segments_64&gt; was
                      preloaded using link preload but…
                    </div>
                    <div className="mt-0.5">
                      Failed to load resource: the server responded with a
                      status
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[5px] text-white/40">
                <span>0:31 / 0:32</span>
                <span className="h-px flex-1 bg-white/15" />
                <span>⏵</span>
                <span>⊕</span>
              </div>
              <div className="mt-1.5 border-t border-white/10 pt-1">
                <div className="text-[7px] font-semibold">
                  This is a bad bug
                </div>
                <div className="mt-0.5 text-[5px] leading-snug text-white/50">
                  When you replay bugs with the Bird Eats Bug{" "}
                  <span className="text-blue-300 underline">
                    browser extension
                  </span>
                  , all the technical information is gathered automatically, in
                  the background. No need to switch between applications to
                  collect bug information that developers need. Each Linear
                  issue comes complete with console logs, system information,
                  network requests, click events, and more.
                </div>
                <div className="mt-1 flex items-center gap-1">
                  <span className="size-2 rounded-full bg-rose-400" />
                  <span className="text-[5px] text-white/60">Janly</span>
                  <span className="text-[5px] text-white/30">2 hours ago</span>
                </div>
                <div className="text-[5px] text-white/50">
                  Ok, this is a nasty one.{" "}
                  <span className="text-blue-300 underline">@Daniel</span> could
                  you please take a look?
                </div>
              </div>
            </div>
          </div>
          <div
            className="relative flex items-center justify-center overflow-hidden rounded-lg p-5"
            style={{ background: "#ff8b6a" }}
          >
            <div className="rounded-md bg-[#1f1f24] p-2 text-[6px] text-white/85 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.45)]">
              <div className="flex items-center gap-1 border-b border-white/10 pb-1">
                <span className="grid size-2.5 place-items-center rounded-full bg-white/10">
                  🗑
                </span>
                <span className="grid size-2.5 place-items-center rounded-full bg-white/10">
                  ↗
                </span>
                <span className="grid size-2.5 place-items-center rounded-full bg-emerald-500/20 text-emerald-300">
                  L
                </span>
                <span className="rounded bg-emerald-500/20 px-1 text-emerald-300">
                  ⛓ Copy link
                </span>
                <span className="text-white/40">▾</span>
                <span className="ml-auto grid size-2.5 place-items-center rounded-full bg-white/10 text-[5px]">
                  ▾
                </span>
              </div>
              <div className="mt-1 text-[5px] text-white/40">
                Share in Linear
              </div>
              <div className="mt-1.5 flex gap-1 text-[5px]">
                <span>system</span>
                <span className="text-amber-300">⚠ Logs</span>
                <span className="text-amber-300">⚠ Warn</span>
                <span className="text-rose-300">! Errors</span>
                <span className="text-emerald-300">⇄ Network Errors</span>
              </div>
              <div className="mt-1 rounded bg-white/5 p-1 text-[5px] leading-tight text-white/55">
                <div className="text-blue-300 underline">
                  https://linear.app/
                </div>
                <div className="mt-0.5">
                  Failed to load resource:
                  https://storage.googleapis.com/birdeatsbug-resources/KQB7P
                </div>
                <div className="mt-0.5">
                  d resource: the server responded with a status
                </div>
              </div>
            </div>
          </div>
        </div>
      }
      overview={
        <p>
          Create Linear issues directly from Bird Eats Bug bug reports and
          optimize your development workflow with a single click. There is no
          need to switch between applications to collect information that
          developers need. Each Linear issue comes complete with console logs,
          system information, network requests, click events, and more.
        </p>
      }
      features={
        <>
          <section>
            <h2 className="text-sm font-semibold">How it works</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              Bird Eats Bug makes creating and collaborating on bug reports fast
              and easy, saving up to 50% of the time spent reporting bugs and
              preventing unnecessary back and forth between your teams (only 3%
              of reports require follow-up questions).
            </p>
            <p className="text-muted-foreground mt-3 text-sm leading-6">
              With the Bird Eats Bug browser extension you can easily replay
              bugs after they happen, create screen recordings or take simple
              screenshots, while automatically capturing relevant technical data
              like Console logs, System information, Network requests, Click
              events, and URL changes—everything developers need to diagnose and
              debug faster.
            </p>
            <p className="text-muted-foreground mt-3 text-sm leading-6">
              With this integration, you can send bug reports directly from Bird
              Eats Bug to your team&apos;s Linear projects. You&apos;ll tackle
              bug issues as usual, except with much better bug reports.
            </p>
            <p className="text-muted-foreground mt-3 text-sm leading-6">
              To create a Linear issue from a Bird Eats Bug report you just
              created:
            </p>
            <ol className="text-muted-foreground mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-6">
              <li>
                Click on the Linear icon button, at the top right of the bug
                report.
              </li>
              <li>
                A new pre-filled Linear issue with the bug report link, title,
                and description will be opened
              </li>
              <li>
                Click the Save button and a new Linear ticket will be created in
                your Linear account
              </li>
            </ol>
          </section>
          <section>
            <h2 className="text-sm font-semibold">Configure</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              Follow there steps to set up this integration:
            </p>
            <ol className="text-muted-foreground mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-6">
              <li>
                Go to your Workspace settings at Bird Eats Bug and navigate to
                Integration settings
              </li>
              <li>Enable the Linear toggle</li>
              <li>
                Go back to the session list and open a session that you want to
                push to Linear
              </li>
              <li>
                On the top right, click on the Linear icon button to open the
                authentication steps to connect Bird Eats Bug to your Linear
                account
              </li>
            </ol>
          </section>
        </>
      }
    />
  )
}

// Honeybadger — opens a Linear issue from each new error and keeps the
// issue's status in sync with whether the error is resolved.
function HoneybadgerIntegrationDetail() {
  return (
    <EngineeringIntegrationShell
      name="Honeybadger"
      blurb="Manage Honeybadger errors via Linear issues"
      builtBy="Honeybadger"
      websiteLabel="honeybadger.io"
      websiteHref="https://honeybadger.io"
      enableHref="https://app.honeybadger.io/settings/integrations"
      enableVariant="external"
      tileBg="bg-[#E0432B]"
      tileText="text-white"
      logo={<HoneybadgerLogo className="size-9" />}
      gradient="linear-gradient(135deg, #ff7d65 0%, #e0432b 55%, #8a1d10 100%)"
      hero={
        <div aria-hidden className="grid grid-cols-2 gap-3">
          <div className="relative overflow-hidden rounded-lg bg-white p-4 ring-1 ring-neutral-200">
            <div className="text-[10px] font-semibold text-neutral-900">
              [Honeybadger App] Occurred: RuntimeError
              <br />
              (83091183)
            </div>
            <div className="mt-2 text-[8px] text-neutral-700">
              RuntimeError: [Honeybadger] API failure:
              &#123;&quot;error&quot;:&quot;Rate Limit Exceeded&quot;&#125;
            </div>
            <div className="mt-1.5 text-[8px] text-neutral-700">Backtrace:</div>
            <div className="mt-1 rounded bg-neutral-50 p-1.5 font-mono text-[8px] text-neutral-700">
              line 105 of honeybadger.rb: &lt;main&gt;
            </div>
            <div className="mt-2 text-[8px] text-neutral-600">
              View full backtrace and more info at{" "}
              <span className="text-blue-500">honeybadger.io</span>:
            </div>
            <div className="text-[8px] text-blue-500">
              https://app.honeybadger.io/projects/1/faults/83091183
            </div>
            <div className="mt-3 text-[8px] text-neutral-500">
              + Add sub-issues
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg bg-white p-4 ring-1 ring-neutral-200">
            <div className="text-[10px] font-semibold text-neutral-900">
              Linear Settings
            </div>
            <div className="mt-2 flex items-center gap-1 text-[8px]">
              <span className="size-2 rounded-sm border border-neutral-400 bg-neutral-200" />
              <span>Enable Linear</span>
            </div>
            <div className="mt-2 space-y-1.5 text-[8px]">
              <div>
                <div className="text-neutral-500">* Team</div>
                <div className="rounded border border-neutral-200 px-1.5 py-0.5">
                  Honeybadger
                </div>
              </div>
              <div>
                <div className="text-neutral-500">Project</div>
                <div className="rounded border border-neutral-200 px-1.5 py-0.5">
                  Honeybadger App
                </div>
              </div>
              <div>
                <div className="text-neutral-500">Labels</div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1">
                    <span className="size-1.5 rounded-sm border border-neutral-400" />
                    <span>Open</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="size-1.5 rounded-sm border border-neutral-400" />
                    <span>Improvement</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="size-1.5 rounded-sm border border-neutral-400 bg-neutral-700" />
                    <span>Bug</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="size-1.5 rounded-sm border border-neutral-400 bg-neutral-700" />
                    <span>Feature</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-neutral-500">Unresolved state</div>
                <div className="rounded border border-neutral-200 px-1.5 py-0.5">
                  Todo
                </div>
                <div className="mt-0.5 text-[6px] text-neutral-400">
                  We will use this state for new issues and when an existing
                  issue is reopened.
                </div>
              </div>
              <div>
                <div className="text-neutral-500">Resolved state</div>
                <div className="rounded border border-neutral-200 px-1.5 py-0.5">
                  Done
                </div>
              </div>
            </div>
          </div>
        </div>
      }
      overview={
        <p>
          Turbocharge your bug fixes by connecting your errors to Linear issues.
          Manage communication and planning around resolving an error in Linear
          while keeping track of error occurrences in Honeybadger.
        </p>
      }
      features={
        <>
          <section>
            <h2 className="text-sm font-semibold">How it works</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              If a new error arrives, the integration will automatically create
              a Linear issue. You customize the team, project, labels, and
              transition states added when issues are created. Want to create
              high-priority issues for those 500 responses? Use error filtering
              combined with multiple Linear integrations, and you can
              accommodate any workflow requirements.
            </p>
            <p className="text-muted-foreground mt-3 text-sm leading-6">
              When you mark an error as resolved in Honeybadger, the
              corresponding issue will automatically transition to your{" "}
              <em>Done</em> status. If the error happens again, the integration
              will transition the issue back to the <em>Todo</em> state.
            </p>
            <p className="text-muted-foreground mt-3 text-sm leading-6">
              Suppose you don&apos;t want to create issues for new errors
              automatically. In that case, you can still manually create them
              from the Honeybadger UI instead. Either way, you&apos;ll see a
              link to the Linear issue from Honeybadger.
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold">Configure</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              Add the Linear integration via{" "}
              <em>Settings &gt; Alerts &amp; Integrations</em> for any projects
              you want to connect.
            </p>
          </section>
        </>
      }
    />
  )
}

// Jam — captures bug reports with full technical context (console logs,
// network requests, user actions, device info) and turns them into
// developer-ready Linear issues with one click.
function JamIntegrationDetail() {
  return (
    <EngineeringIntegrationShell
      name="Jam"
      blurb="Create Linear issues with all the details developers need to resolve bugs faster"
      builtBy="Jam.dev"
      websiteLabel="jam.dev"
      websiteHref="https://jam.dev"
      enableHref="https://jam.dev/settings/integrations/linear"
      enableVariant="external"
      tileBg="bg-[#FF3B5C]"
      tileText="text-white"
      logo={<JamLogo className="size-9" />}
      gradient="linear-gradient(135deg, #ff7a8c 0%, #ff3b5c 55%, #a31238 100%)"
      hero={
        <div aria-hidden className="grid grid-cols-2 gap-3">
          <div
            className="relative overflow-hidden rounded-lg p-4"
            style={{ background: "#fff5cc" }}
          >
            <div className="rounded-md bg-white p-2 text-[7px] text-neutral-700 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.25)] ring-1 ring-neutral-200">
              <div className="flex items-center gap-1 border-b border-neutral-200 pb-1 text-[6px] text-neutral-500">
                <span className="rounded bg-amber-300/70 px-1 text-neutral-800">
                  0:01
                </span>
                <span>▶ User clicked</span>
                <span className="rounded bg-neutral-100 px-1">Add to cart</span>
                <span className="ml-auto rounded bg-amber-100 px-1 text-amber-700">
                  1 user event
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-1 text-[6px] text-neutral-500">
                <span className="rounded bg-amber-300/70 px-1 text-neutral-800">
                  0:02
                </span>
                <span>⚠ Warning: Missing required field</span>
                <span className="ml-auto rounded bg-amber-200 px-1 text-amber-800">
                  1 warning
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-1 text-[6px] text-neutral-500">
                <span className="rounded bg-rose-300/70 px-1 text-neutral-800">
                  0:00
                </span>
                <span>⚡ Network error: POST request to</span>
                <span className="ml-auto rounded bg-rose-200 px-1 text-rose-800">
                  1 error
                </span>
              </div>
              <div className="mt-1.5 grid grid-cols-[1fr_1fr] gap-1.5">
                <div className="rounded bg-neutral-50 p-1 ring-1 ring-neutral-200">
                  <div className="aspect-video rounded bg-gradient-to-br from-rose-200 to-rose-400" />
                  <div className="mt-1 rounded bg-rose-50 p-0.5 text-[5px] text-rose-700">
                    We couldn&apos;t add this item to your cart. Unknown error
                  </div>
                </div>
                <div className="space-y-0.5 text-[5px] text-neutral-600">
                  <div className="text-[6px] font-semibold text-neutral-800">
                    Create a Linear issue
                  </div>
                  <div className="rounded bg-neutral-50 px-1 py-0.5">
                    Add to cart button is broken
                  </div>
                  <div className="mt-1 space-y-0.5">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Project</span>
                      <span>Catalogue redesign</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Label</span>
                      <span>Bug</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Priority</span>
                      <span>None</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Assignee</span>
                      <span>martin</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Add fields</span>
                      <span>+</span>
                    </div>
                  </div>
                  <div className="mt-1 flex items-center gap-0.5 rounded bg-indigo-500 px-1 py-0.5 text-center text-[5px] font-medium text-white">
                    <span className="mx-auto">Create issue</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className="relative overflow-hidden rounded-lg p-4"
            style={{ background: "#1a1a1a" }}
          >
            <div className="rounded-md bg-[#0f0f12] p-2 text-[6px] text-white/85 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.45)] ring-1 ring-white/10">
              <div className="flex items-center gap-1 border-b border-white/10 pb-1 text-[5px] text-white/40">
                <span className="size-1.5 rounded-full bg-rose-400" />
                <span className="size-1.5 rounded-full bg-amber-400" />
                <span className="size-1.5 rounded-full bg-emerald-400" />
                <span>JAM-8273: Add to cart button is broken</span>
              </div>
              <div className="mt-1.5 text-[7px] font-semibold">
                Add to cart button is broken
              </div>
              <div className="mt-1 text-[5px] text-white/50">
                Watch the screen recording here:{" "}
                <span className="text-blue-300 underline">
                  https://jam.dev/bb20e328-c981-45e8-9c3c-002ca45ea305
                </span>
              </div>
              <div className="mt-1 text-[5px] text-white/50">
                <div className="text-white/70">Website URL:</div>
                <div className="text-blue-300 underline">
                  https://yourwebsite.com
                </div>
              </div>
              <div className="mt-1 text-[5px] text-white/50">
                <div className="text-white/70">Device and browser info:</div>
                <div>
                  Arc Version 1.67.0 (55463) (1753×1265) | Mac OS (arm) 10.15.7
                </div>
              </div>
              <div className="mt-1 text-[5px] text-white/50">
                <div className="text-white/70">Date and time:</div>
                <div>October 11th 2024 | 9:11pm UTC</div>
              </div>
              <div className="mt-1 text-[5px] text-white/50">
                View developer information (console logs, network requests &amp;
                timing):
                <div className="break-all text-blue-300 underline">
                  jam.dev/bb20e328-c981-45e8-9c3c-002ca45ea305
                </div>
              </div>
              <div className="mt-1 text-[5px] text-white/40">
                Captured with{" "}
                <span className="text-blue-300 underline">jam.dev</span>
              </div>
              <div className="mt-1.5 flex flex-col gap-0.5 border-t border-white/10 pt-1 text-[5px] text-white/50">
                <div className="flex justify-between">
                  <span>Properties</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Needs triage</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">High</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">martin</span>
                </div>
                <div className="flex justify-between">
                  <span>Labels</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="size-1 rounded-full bg-rose-400" />
                  <span>Bug</span>
                </div>
                <div className="flex justify-between">
                  <span>Project</span>
                  <span>Catalogue redesign</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
      overview={
        <>
          <p>
            Send bug reports directly to Linear with all the details developers
            need. Jam auto-captures technical logs, and creates developer-ready
            bug reports in seconds.
          </p>
          <p className="mt-3">
            Each Linear issue comes with screenshots or screen recordings and
            all technical logs of exactly what went wrong, so developers can
            start resolving issues faster with full context of what happened.
          </p>
        </>
      }
      features={
        <>
          <section>
            <h2 className="text-sm font-semibold">How it works</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              With this integration, you can send bug reports directly from Jam
              to your team&apos;s Linear projects. No more copying and pasting
              between tools or asking for missing information.
            </p>
            <p className="text-muted-foreground mt-3 text-sm leading-6">
              Creating Linear issues with Jam is simple:
            </p>
            <ol className="text-muted-foreground mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-6">
              <li>
                Find a bug and record it with Jam&apos;s browser extension
              </li>
              <li>Click the Linear button in your recorded Jam</li>
              <li>
                Add a title, description and fill in any ticket properties
              </li>
              <li>Get a developer-ready Linear issue with all the details</li>
            </ol>
            <p className="text-muted-foreground mt-3 text-sm leading-6">
              Your team gets complete bug reports in Linear, including:
            </p>
            <ul className="text-muted-foreground mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6">
              <li>
                Screenshots or screen recordings that show exactly what happened
              </li>
              <li>Console logs, network errors, and user actions</li>
              <li>Device info and system details</li>
              <li>Step-by-step replay of user actions</li>
            </ul>
          </section>
          <section>
            <h2 className="text-sm font-semibold">Configure</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              Connect Jam to Linear in three quick steps:
            </p>
            <ol className="text-muted-foreground mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-6">
              <li>
                Install Jam&apos;s browser extension by visiting{" "}
                <a
                  href="https://jam.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  jam.dev
                </a>
              </li>
              <li>Open your Jam workspace settings</li>
              <li>
                Turn on Linear the integration and connect your Linear account
              </li>
            </ol>
            <p className="text-muted-foreground mt-3 text-sm leading-6">
              Jam is also available as an{" "}
              <a
                href="https://jam.dev/mcp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                MCP server
              </a>{" "}
              for use with Linear Agent
            </p>
          </section>
        </>
      }
    />
  )
}

// Vercel — converts feedback comments on Vercel Preview Deployments into
// actionable Linear issues, with the comment screenshot and replies attached.
function VercelIntegrationDetail() {
  return (
    <EngineeringIntegrationShell
      name="Vercel"
      blurb="Turn Vercel Preview Deployment comments into action items"
      builtBy="Vercel"
      websiteLabel="vercel.com"
      websiteHref="https://vercel.com"
      enableHref="https://vercel.com/integrations/linear"
      enableVariant="external"
      tileBg="bg-black"
      tileText="text-white"
      logo={<VercelLogo className="size-9" />}
      gradient="linear-gradient(135deg, #2a2a2a 0%, #0a0a0a 55%, #000000 100%)"
      hero={
        <div aria-hidden className="grid grid-cols-2 gap-3">
          <div className="relative overflow-hidden rounded-lg bg-[#1a1a2e] p-4 ring-1 ring-white/10">
            <div className="rounded-md bg-[#0f0f1e] p-2 text-[6px] text-white/85 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.45)] ring-1 ring-white/10">
              <div className="flex items-center justify-between border-b border-white/10 pb-1 text-[5px] text-white/40">
                <div className="flex items-center gap-1.5">
                  <span>Features</span>
                  <span>Characters</span>
                  <span>Pricing</span>
                  <span>Compare</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>Log in</span>
                  <span className="rounded bg-white px-1 text-black">
                    Sign up
                  </span>
                </div>
              </div>
              <div className="mt-1 flex items-start gap-1">
                <div className="flex-1">
                  <div className="text-[7px] leading-tight font-semibold text-white">
                    Linear is a better way to build products
                  </div>
                  <div className="mt-0.5 text-[5px] leading-snug text-white/50">
                    Meet the new standard for modern software development.
                    Streamline issues, sprints, and product roadmaps.
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="rounded bg-indigo-500 px-1 py-0.5 text-[5px] text-white">
                      Get started →
                    </span>
                  </div>
                </div>
                <div className="flex-1 rounded bg-white/5 p-1">
                  <div className="text-[5px] text-white/60">paco</div>
                  <div className="mt-0.5 text-[5px] text-white/40">
                    Can we make this app simpler?
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[5px]">
                    <span className="text-white/40">edge</span>
                    <span className="text-white/60">
                      Get started by clicking the gradient icon
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-1 rounded bg-white/5 p-1 text-[5px] text-white/50">
                <div>edge</div>
                <div className="mt-0.5 text-white/40">
                  Not entirely sure if we&apos;ve updated the copy across all of
                  our subtitles.
                </div>
              </div>
              <div className="mt-1 rounded bg-emerald-500/10 p-1 text-[5px] text-emerald-300">
                Hi guys — updated and pushed!
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg bg-[#1a1a2e] p-4 ring-1 ring-white/10">
            <div className="rounded-md bg-[#0f0f1e] p-2 text-[6px] text-white/85 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.45)] ring-1 ring-white/10">
              <div className="text-center text-[7px] leading-tight font-semibold text-white">
                Linear is a better way
              </div>
              <div className="mt-1.5 rounded bg-white/5 p-1.5 ring-1 ring-white/10">
                <div className="text-[6px] font-semibold text-white">
                  Convert to Issue
                </div>
                <div className="mt-1 space-y-0.5 text-[5px] text-white/50">
                  <div className="rounded bg-white/5 px-1 py-0.5 text-white/70">
                    DRAFT: Surface
                  </div>
                  <div className="text-white/40">Description</div>
                  <div className="rounded bg-white/5 px-1 py-0.5 leading-snug text-white/40">
                    User edgekarl from a comment on @snaggycat: <br />
                    Can we try changing the call-to-action from &quot;Get
                    Started&quot; to &quot;Try Now&quot;?
                  </div>
                  <div className="text-blue-300 underline">
                    View in Vercel preview
                  </div>
                </div>
                <div className="mt-1.5 flex items-center justify-end gap-1">
                  <span className="rounded bg-white/10 px-1 py-0.5 text-[5px] text-white/60">
                    CANCEL
                  </span>
                  <span className="rounded bg-indigo-500 px-1 py-0.5 text-[5px] text-white">
                    CREATE ISSUE
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
      overview={
        <p>
          The Vercel Comments Linear Integration allows Vercel users to convert
          feedback from comments on Preview Deployments to actionable Linear
          issues.
        </p>
      }
      features={
        <>
          <section>
            <h2 className="text-sm font-semibold">How it works</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              When leaving comments on Vercel Preview Deployments you&apos;ll
              have the option to &lsquo;Convert to Issue&rsquo; which will
              prompt you to create an issue that will appear in your Linear
              board under a selected project. Your comment screenshots and
              replies will also appear in your issue.
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold">Configure</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              Configure the integration from{" "}
              <a
                href="https://vercel.com/integrations/linear"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                here
              </a>
              . When setting up the Integration, you will be asked to log into
              your desired Linear workspace. This integration will have access
              to all public Linear projects.
            </p>
            <p className="text-muted-foreground mt-3 text-sm leading-6">
              This integration is available for:
            </p>
            <ul className="text-muted-foreground mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6">
              <li>Hobby accounts (public repositories only)</li>
              <li>Pro and Enterprise accounts (all repositories)</li>
            </ul>
          </section>
        </>
      }
    />
  )
}

// Arc — pre-installed in Arc Browser; ⌘T → "New Linear issue" opens the
// Linear issue creation modal in a fresh tab.
function ArcIntegrationDetail() {
  return (
    <EngineeringIntegrationShell
      name="Arc"
      blurb="Create new issues right from your browser command bar"
      builtBy="The Browser Company"
      websiteLabel="arc.net"
      websiteHref="https://arc.net"
      enableHref="https://arc.net/download"
      enableVariant="external"
      tileBg="bg-white"
      tileText="text-[#1f5fff]"
      logo={<ArcLogo className="size-9" />}
      gradient="linear-gradient(135deg, #b9f4c8 0%, #f5d3e3 55%, #f0a8d0 100%)"
      hero={
        <div
          aria-hidden
          className="relative flex aspect-[16/9] items-center justify-center overflow-hidden rounded-lg p-8"
          style={{
            background:
              "linear-gradient(135deg, #b9f4c8 0%, #f5d3e3 55%, #f0a8d0 100%)",
          }}
        >
          <div className="w-full max-w-md rounded-lg bg-white p-2 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)] ring-1 ring-black/5">
            <div className="flex items-center gap-2 px-2 py-1.5 text-sm">
              <span className="size-3 rounded-full bg-neutral-200" />
              <span className="text-neutral-900">new linear</span>
              <span className="ml-0.5 inline-block h-3.5 w-px animate-pulse bg-neutral-900" />
            </div>
            <div className="mt-1 space-y-0.5">
              <div className="flex items-center gap-2 rounded-md bg-emerald-200/70 px-2 py-1.5 text-sm text-neutral-900">
                <span className="grid size-4 place-items-center rounded bg-emerald-300/80 text-[10px]">
                  ⌕
                </span>
                New Linear Issue
              </div>
              <div className="flex items-center gap-2 px-2 py-1 text-xs text-neutral-500">
                <span className="grid size-4 place-items-center rounded bg-neutral-200 text-[10px]">
                  ⌕
                </span>
                new linear
              </div>
              <div className="flex items-center gap-2 px-2 py-1 text-xs text-neutral-500">
                <span className="grid size-4 place-items-center rounded bg-neutral-200 text-[10px]">
                  ⌕
                </span>
                new linear fusion rifle
              </div>
              <div className="flex items-center gap-2 px-2 py-1 text-xs text-neutral-500">
                <span className="grid size-4 place-items-center rounded bg-neutral-200 text-[10px]">
                  ⌕
                </span>
                new linear switches
              </div>
              <div className="flex items-center gap-2 px-2 py-1 text-xs text-neutral-500">
                <span className="grid size-4 place-items-center rounded bg-neutral-200 text-[10px]">
                  ⌕
                </span>
                new linear fusion
              </div>
            </div>
          </div>
        </div>
      }
      overview={
        <p>
          With this integration you can create new Linear issues directly from
          your Arc command bar.
        </p>
      }
      features={
        <>
          <section>
            <h2 className="text-sm font-semibold">How it works</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              In Arc, simply hit{" "}
              <span className="ml-0.5 inline-flex items-center gap-1 align-middle">
                <Kbd>⌘</Kbd>
                <Kbd>T</Kbd>
              </span>{" "}
              to open the command bar. Then type &quot;New Linear issue&quot;
              and press{" "}
              <span className="ml-0.5 inline-flex items-center gap-1 align-middle">
                <Kbd>Enter ↵</Kbd>
              </span>
              . You will now see a new tab with Linear&apos;s issue creation
              modal already open.
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold">Configure</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              This integration is pre-installed in Arc and doesn&apos;t require
              any extra configuration.
            </p>
          </section>
        </>
      }
    />
  )
}

// Create issues via email — pre-installed automation that turns inbound mail
// to a per-team intake address into Linear issues, falling into Triage.
function CreateIssuesViaEmailIntegrationDetail() {
  return (
    <EngineeringIntegrationShell
      name="Create issues via email"
      blurb="Set up email addresses for teams or templates to create issues via email"
      builtBy="Linear"
      docsHref="https://linear.app/docs/email"
      preinstalled
      tileBg="bg-[#5e6ad2]"
      tileText="text-white"
      logo={<EmailIntakeLogo className="size-9" />}
      gradient="linear-gradient(135deg, #ff6a8a 0%, #d24f96 55%, #5b6ad8 100%)"
      hero={
        <div
          aria-hidden
          className="relative overflow-hidden rounded-lg p-8"
          style={{
            background:
              "linear-gradient(135deg, #ff5a7a 0%, #c63d8e 55%, #4a5cd2 100%)",
          }}
        >
          <div className="rounded-md bg-[#1c1f2e] p-3 text-[8px] text-white shadow-[0_20px_60px_-20px_rgba(0,0,0,0.45)] ring-1 ring-white/10">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
              <div className="flex items-center gap-1 text-white/40">
                <span className="size-2 rounded-full bg-rose-400" />
                <span className="size-2 rounded-full bg-amber-300" />
                <span className="size-2 rounded-full bg-emerald-400" />
                <span className="ml-1.5">←</span>
                <span>→</span>
                <span>↻</span>
              </div>
              <div className="rounded bg-white/5 px-2 py-0.5 text-white/60">
                ⚙ Mobile
              </div>
              <div className="text-white/40">+</div>
            </div>
            <div className="mt-2 grid grid-cols-[110px_1fr] gap-3">
              <div className="space-y-1 text-[7px]">
                <div className="text-white/40">‹ Settings</div>
                <div className="mt-1 flex items-center gap-1 text-white/80">
                  <span>▾</span>
                  <span>📱 Mobile</span>
                </div>
                <div className="ml-3 rounded bg-white/10 px-1.5 py-0.5 text-white/90">
                  General
                </div>
                <div className="ml-3 px-1.5 py-0.5 text-white/50">Members</div>
                <div className="ml-3 px-1.5 py-0.5 text-white/50">Workflow</div>
                <div className="ml-3 px-1.5 py-0.5 text-white/50">Triage</div>
                <div className="ml-3 px-1.5 py-0.5 text-white/50">Labels</div>
              </div>
              <div className="rounded-md bg-white/[0.03] p-2 ring-1 ring-white/10">
                <div className="text-[8px] font-semibold text-white">
                  Create by email
                </div>
                <div className="mt-2 rounded bg-white/[0.04] p-2 ring-1 ring-white/10">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[7px] font-medium text-white">
                        Enable issue creation by email
                      </div>
                      <div className="mt-0.5 text-[6px] leading-snug text-white/50">
                        Use a unique email address created for your team to send
                        or forward emails to and we&apos;ll automatically create
                        issues from them.
                      </div>
                    </div>
                    <span className="mt-0.5 inline-flex h-3 w-6 items-center rounded-full bg-indigo-500 p-0.5">
                      <span className="ml-auto block size-2 rounded-full bg-white" />
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <div className="flex flex-1 items-center justify-between rounded bg-white/[0.06] px-2 py-1 text-[7px] text-white/70 ring-1 ring-white/10">
                      <span className="truncate">
                        mobile-6f6590a2926c@intake.linear.app
                      </span>
                      <span className="text-white/40">↻</span>
                    </div>
                    <span className="rounded bg-indigo-500 px-2 py-1 text-[7px] font-medium text-white">
                      📋 Copy
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
      overview={
        <>
          <p>
            Bring your email-based workflows into Linear by turning emails into
            issues.
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>
              Quickly create bug reports and feature requests from customer
              emails
            </li>
            <li>
              Forward reports to general emails like security@ to specific
              Linear teams
            </li>
            <li>
              Automatically turn email notifications from service providers into
              issues
            </li>
          </ul>
        </>
      }
      features={
        <section>
          <h2 className="text-sm font-semibold">How it works</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Set up a unique intake email for your team so that each new
            conversation emails sent or forwarded to that address will go to
            Triage or your team&apos;s default workflow status. You can also
            create unique intake emails for individual templates to automate the
            issue creation process further and apply specific fields. Replies to
            a message will not continue to create new issues.{" "}
            <a
              href="https://linear.app/docs/email"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Learn more
            </a>{" "}
            and generate intake email addresses from team or template settings.
          </p>
        </section>
      }
    />
  )
}

// Jira — pairs a Linear workspace with a Jira instance so projects keep
// updating in Jira while teams work in Linear.
function JiraIntegrationDetail() {
  const [instancesOpen, setInstancesOpen] = useState(false)
  const [overviewExpanded, setOverviewExpanded] = useState(false)

  return (
    <EngineeringIntegrationShell
      name="Jira"
      blurb="Smoothly transition from Jira to Linear"
      builtBy="Linear"
      docsHref="https://linear.app/docs/jira"
      enableHref="https://linear.app/settings/integrations/jira-au"
      enableVariant="native"
      tileBg="bg-[#0052CC]"
      tileText="text-white"
      logo={<JiraLogo className="size-9" />}
      gradient="linear-gradient(135deg, #5b9bff 0%, #2962ff 55%, #0033a0 100%)"
      hero={
        <div aria-hidden className="grid grid-cols-2 gap-3">
          <div
            className="relative overflow-hidden rounded-lg p-5"
            style={{
              background:
                "linear-gradient(135deg, #6c8bff 0%, #3a6bff 55%, #1f3aa8 100%)",
            }}
          >
            <div className="rounded-md bg-[#1c1f2e] p-2.5 text-[7px] text-white/85 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.45)] ring-1 ring-white/10">
              <div className="text-[8px] font-semibold text-white">
                Set up Jira Link
              </div>
              <div className="mt-1.5 space-y-1.5">
                <div>
                  <div className="text-[6px] font-medium text-white/70">
                    API Access Token
                  </div>
                  <div className="mt-0.5 text-[5px] leading-tight text-white/40">
                    Find or create your personal access token in{" "}
                    <span className="text-white/70">Atlassian settings</span>
                  </div>
                  <div className="mt-1 rounded bg-white/[0.06] px-1.5 py-1 text-[6px] text-white/70 ring-1 ring-white/10">
                    DR5sUgE1054nN8MOnnpxF9Ez
                  </div>
                </div>
                <div>
                  <div className="text-[6px] font-medium text-white/70">
                    The email address you use for your Jira account
                  </div>
                  <div className="mt-1 rounded bg-white/[0.06] px-1.5 py-1 text-[6px] text-white/70 ring-1 ring-white/10">
                    erin@linear.app
                  </div>
                </div>
                <div>
                  <div className="text-[6px] font-medium text-white/70">
                    Jira installation or cloud hostname
                  </div>
                  <div className="mt-1 rounded bg-white/[0.06] px-1.5 py-1 text-[6px] text-white/70 ring-1 ring-white/10">
                    encom.atlassian.net
                  </div>
                </div>
              </div>
              <div className="mt-2 flex justify-end">
                <span className="rounded bg-indigo-500 px-2 py-0.5 text-[6px] font-medium text-white">
                  Connect
                </span>
              </div>
            </div>
          </div>
          <div
            className="relative overflow-hidden rounded-lg p-5"
            style={{
              background:
                "linear-gradient(135deg, #6c8bff 0%, #3a6bff 55%, #1f3aa8 100%)",
            }}
          >
            <div className="rounded-md bg-[#1c1f2e] p-2.5 text-[7px] text-white/85 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.45)] ring-1 ring-white/10">
              <div className="flex items-center justify-between text-[7px]">
                <div className="flex items-center gap-1 truncate">
                  <span className="text-white/40">⚡</span>
                  <span className="truncate text-white/80">
                    [ENC-11] GraphQL execution failed
                  </span>
                </div>
                <div className="flex items-center gap-1 text-white/40">
                  <span>1 hour ago</span>
                  <span>↗</span>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-1.5 text-[6px]">
                <span className="text-white/70">Activity</span>
                <span className="text-white/40">Subscribe</span>
              </div>
              <div className="mt-1 flex items-center gap-1 text-[6px] text-white/60">
                <span className="size-2 rounded-full bg-rose-400" />
                <span className="text-white/70">raissa</span>
                <span>created the issue.</span>
                <span className="ml-auto text-white/40">1 day ago</span>
              </div>
            </div>
          </div>
        </div>
      }
      overview={
        <>
          <p>
            If you want to switch from Jira to Linear, this integration makes
            the process smoother by keeping projects up to date in Jira as you
            use Linear.
          </p>
          {overviewExpanded ? (
            <p className="mt-3">
              Connect a Jira Cloud instance to mirror status changes and
              comments back to Jira while your team continues to work in Linear.
              Issue creators and assignees from a Jira import are attributed to
              the matching Linear users when you connect your personal Jira
              account below.
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => setOverviewExpanded((v) => !v)}
            className="text-muted-foreground hover:text-foreground mt-2 text-xs"
            aria-expanded={overviewExpanded}
          >
            {overviewExpanded ? "Show less" : "Read more"}
          </button>
        </>
      }
      footer={
        <>
          <Link
            href="/settings?section=connected-accounts"
            scroll={false}
            className="bg-card hover:border-foreground/20 flex items-start justify-between gap-4 rounded-lg border p-4 transition-colors"
            aria-label="Connect personal Jira account"
          >
            <div className="min-w-0">
              <div className="text-sm font-medium">
                Connect personal account
              </div>
              <p className="text-muted-foreground mt-1 text-xs leading-5">
                Connecting your Jira account will allow you to be correctly
                attributed as the assignee or creator of issues coming from Jira
                Sync or from a Jira import
              </p>
            </div>
            <span className="text-muted-foreground flex shrink-0 items-center gap-1 text-xs">
              Connect
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
            </span>
          </Link>

          <div className="mt-6">
            <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Connection
            </div>
            <Collapsible
              open={instancesOpen}
              onOpenChange={setInstancesOpen}
              className="mt-2"
            >
              <CollapsibleTrigger
                className="bg-card hover:border-foreground/20 flex w-full items-center justify-between rounded-lg border p-4 text-left transition-colors"
                aria-label="Connected instances"
              >
                <span className="text-sm font-medium">Connected instances</span>
                <HugeiconsIcon
                  icon={PlusSignIcon}
                  className="text-muted-foreground size-4"
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="bg-card mt-2 rounded-lg border p-4">
                <p className="text-muted-foreground text-xs">
                  No Jira instances connected yet. Enable the integration above
                  to link an Atlassian Cloud workspace.
                </p>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </>
      }
    />
  )
}

// Fivetran — automated ELT connector for Linear data; pulls issues, projects,
// cycles, history etc. into your warehouse on an incremental schedule.
function FivetranIntegrationDetail() {
  return (
    <EngineeringIntegrationShell
      name="Fivetran"
      blurb="Sync your Linear data with the Fivetran connector"
      builtBy="Fivetran"
      docsHref="https://fivetran.com/docs/applications/linear"
      websiteLabel="fivetran.com"
      websiteHref="https://fivetran.com"
      enableHref="https://fivetran.com/dashboard/connectors"
      enableVariant="external"
      tileBg="bg-[#0073E6]"
      tileText="text-white"
      logo={<FivetranLogo className="size-9" />}
      gradient="linear-gradient(135deg, #5b9bff 0%, #1271e6 55%, #0a3d99 100%)"
      hero={
        <div
          aria-hidden
          className="relative overflow-hidden rounded-lg p-10"
          style={{
            backgroundColor: "#0a0a0a",
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        >
          <div className="rounded-lg bg-white p-4 text-[8px] text-neutral-700 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
              <div className="text-[9px] font-semibold text-neutral-900">
                Select connector data source
              </div>
              <div className="flex items-center gap-1 rounded-md border border-neutral-200 px-2 py-0.5 text-[7px] text-neutral-400">
                <span>⌕</span>
                <span>Search</span>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-[140px_1fr] gap-3">
              <div className="space-y-1.5 text-[7px]">
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full border border-neutral-300" />
                  <span className="text-neutral-600">All data sources</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-sm border border-blue-400 bg-blue-100" />
                  <span className="font-medium text-neutral-900">
                    Databases ›
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full border border-neutral-300" />
                  <span className="text-neutral-600">Marketing Analytics</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full border border-neutral-300" />
                  <span className="text-neutral-600">Sales Analytics</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full border border-neutral-300" />
                  <span className="text-neutral-600">Product Analytics</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full border border-neutral-300" />
                  <span className="text-neutral-600">
                    Finance &amp; Ops Analytics
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full border border-neutral-300" />
                  <span className="text-neutral-600">Support Analytics</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full border border-neutral-300" />
                  <span className="text-neutral-600">
                    Engineering Analytics
                  </span>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="text-[7px] text-neutral-500">
                    167+ sources
                  </div>
                </div>
                <div className="flex items-center gap-1.5 rounded-md border border-blue-300 bg-blue-50 px-2 py-1 text-[7px] text-neutral-900">
                  <span className="grid size-3 place-items-center rounded bg-neutral-900 text-[6px] text-white">
                    L
                  </span>
                  Linear
                </div>
                <div className="h-1.5 w-3/4 rounded bg-neutral-100" />
                <div className="h-1.5 w-2/3 rounded bg-neutral-100" />
                <div className="h-1.5 w-3/5 rounded bg-neutral-100" />
                <div className="h-1.5 w-1/2 rounded bg-neutral-100" />
                <div className="h-1.5 w-2/3 rounded bg-neutral-100" />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-neutral-200 pt-3">
              <div className="rounded-md bg-blue-600 px-3 py-1.5 text-[8px] font-semibold tracking-wide text-white uppercase shadow-sm">
                ⚡ Add connector
              </div>
              <div className="flex items-center gap-1 text-[8px] font-semibold tracking-wide text-blue-700 uppercase">
                Continue setup <span>→</span>
              </div>
            </div>
          </div>
        </div>
      }
      overview={
        <>
          <p>
            The Fivetran integration for Linear allows you to automate moving
            data out of, into and across your cloud data platforms.
          </p>
          <p className="mt-3">
            With the Linear connector you can automate the most time-consuming
            parts of the ELT process so your data engineers can focus on higher
            impact projects with total pipeline peace of mind.
          </p>
        </>
      }
      features={
        <>
          <section>
            <h2 className="text-sm font-semibold">How it works</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              Once connected, Fivetran incrementally syncs tables and their
              child tables. Sync records such as attachments, comments, cycles,
              history, issues, projects and more.
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold">Configure</h2>
            <ol className="text-muted-foreground mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-6">
              <li>
                Create a personal API in your{" "}
                <Link
                  href="/settings?section=api"
                  scroll={false}
                  className="text-blue-500 hover:underline"
                >
                  Linear account settings
                </Link>
              </li>
              <li>
                Set up the connector in Fivetran for your chosen destination
                schema through the steps{" "}
                <a
                  href="https://fivetran.com/docs/applications/linear/setup-guide"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  found here
                </a>
                <br />
                Fivetran will take it from here and sync your Linear data.
              </li>
            </ol>
          </section>
        </>
      }
    />
  )
}

// Axolo — pairs each Slack pull-request channel with the originating Linear
// issue so reviewers stay in context.
function AxoloIntegrationDetail() {
  return (
    <EngineeringIntegrationShell
      name="Axolo"
      blurb="Make code reviews easier by syncing your pull request channels with your Linear issues"
      builtBy="Axolo"
      websiteLabel="axolo.co"
      websiteHref="https://axolo.co"
      enableHref="https://app.axolo.co"
      enableVariant="external"
      tileBg="bg-[#10b981]"
      tileText="text-white"
      logo={<AxoloLogo className="size-9" />}
      gradient="linear-gradient(135deg, #6ee7b7 0%, #10b981 55%, #047857 100%)"
      hero={
        <div
          aria-hidden
          className="relative flex flex-col items-center gap-3 overflow-hidden rounded-lg p-8"
          style={{
            background:
              "linear-gradient(135deg, #2e1065 0%, #4c1d95 55%, #2e1065 100%)",
          }}
        >
          <div className="text-center text-base leading-tight font-semibold text-white">
            Automatically add your Linear
            <br />
            issues in pull request channels
          </div>
          <div className="w-full max-w-md rounded-md bg-[#1c1f2e] p-2 text-[7px] text-white/85 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.55)] ring-1 ring-white/10">
            <div className="flex items-center justify-between border-b border-white/10 pb-1 text-[7px] text-white/60">
              <div className="flex items-center gap-1">
                <span># _pr_acoudouy_onboarding_team_channel_axo_883 ▾</span>
              </div>
              <div className="flex items-center gap-1 text-white/40">
                <span>acoudouy wants to merge into master from axo-883</span>
                <span className="rounded bg-white/10 px-1">2</span>
                <span>👤</span>
              </div>
            </div>
            <div className="mt-1 flex items-center gap-2 border-b border-white/10 pb-1 text-[6px] text-white/50">
              <span>↻ PR #1842</span>
              <span>⊕ Commits (2)</span>
              <span>✓ Checks (2/2)</span>
              <span>📁 Files changed (21)</span>
              <span>diff +344 -320</span>
              <span className="ml-auto rounded bg-blue-500/30 px-1 text-blue-200">
                ▣ Linear Issue
              </span>
              <span>+</span>
            </div>
            <div className="mt-1 text-[8px] font-semibold text-white">
              # _pr_acoudouy_onboarding_team_channel_axo_883
            </div>
            <div className="mt-0.5 text-[6px] leading-snug text-white/60">
              <span className="text-emerald-300">@Axolo</span> created this
              channel on January 26th. This is the very beginning of the #
              _pr_acoudouy_onboarding_team_channel_axo_883 channel.
            </div>
            <div className="mt-1 flex items-center gap-2 text-[6px] text-emerald-300">
              <span>+ Add description</span>
              <span>👥 Add people</span>
              <span>✉ Send emails to channel</span>
            </div>
            <div className="mt-1.5 flex justify-center text-[6px] text-white/40">
              ── Thursday, January 26th ──
            </div>
            {[
              {
                avatar: "bg-emerald-400",
                name: "Axolo",
                tag: "APP",
                time: "8:13 AM",
                msg: "joined #_pr_acoudouy_onboarding_team_channel_axo_883.",
              },
              {
                avatar: "bg-emerald-400",
                name: "Axolo",
                tag: "APP",
                time: "8:14 AM",
                msg: "set the channel topic: acoudouy wants to merge into master from axo-883",
              },
              {
                avatar: "bg-emerald-400",
                name: "Axolo",
                tag: "APP",
                time: "8:14 AM",
                msg: (
                  <>
                    acoudouy opened{" "}
                    <span className="text-blue-300 underline">PR #1842</span>:
                    onboarding team channel in{" "}
                    <span className="text-blue-300 underline">
                      api.axolo.co
                    </span>
                    <span className="ml-1 rounded bg-white/10 px-1 text-[6px] text-white/70">
                      See PR
                    </span>
                  </>
                ),
              },
              {
                avatar: "bg-rose-400",
                name: "Arthur",
                time: "8:14 AM",
                msg: "was added to #_pr_acoudouy_onboarding_team_channel_axo_883 by Axolo.",
              },
              {
                avatar: "bg-rose-400",
                name: "Arthur",
                time: "8:14 AM",
                msg: (
                  <>
                    Enable creation of general channel during onboarding and
                    some refacto <span className="text-white/40">(edited)</span>
                  </>
                ),
              },
              {
                avatar: "bg-emerald-400",
                name: "Axolo",
                tag: "APP",
                time: "8:14 AM",
                msg: (
                  <>
                    <div>Mergeability check: success ✅</div>
                    <div className="mt-0.5 rounded bg-emerald-500/15 p-1 text-[5px] text-emerald-200">
                      This branch has no conflict with the base branch and all
                      checks/commit statuses are successful. 👏
                    </div>
                    <div className="mt-1 rounded bg-emerald-500/15 p-1 text-[5px] text-emerald-200">
                      <div>
                        All checks &amp; commit statuses completed: success
                      </div>
                      <div>build ✅</div>
                      <div>CircleCI Checks ✅</div>
                    </div>
                  </>
                ),
              },
            ].map((m, i) => (
              <div key={i} className="mt-1.5 flex gap-1.5">
                <span className={`size-3 shrink-0 rounded ${m.avatar}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-[6px]">
                    <span className="font-semibold text-white">{m.name}</span>
                    {m.tag && (
                      <span className="rounded bg-white/10 px-1 text-white/60">
                        {m.tag}
                      </span>
                    )}
                    <span className="text-white/40">{m.time}</span>
                  </div>
                  <div className="text-[6px] leading-snug text-white/70">
                    {m.msg}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      }
      overview={
        <p>
          Use the Axolo Linear integration to ensure that your pull/merge
          request channels and Linear issues stay synchronized.
        </p>
      }
      features={
        <>
          <section>
            <h2 className="text-sm font-semibold">How it works</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              Axolo scans your pull/merge requests and automatically adds the
              Linear issue link to the corresponding Slack channel bookmarks.
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold">Configure</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              Make sure you&apos;ve set up your Linear with GitHub or GitLab
              integration, and that you&apos;ve added your issue ID to your
              branch. More information in the{" "}
              <a
                href="https://docs.axolo.co/integrations/linear"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                documentation
              </a>
              .
            </p>
            <p className="text-muted-foreground mt-3 text-sm leading-6">
              Axolo will then automatically bring your Linear context inside
              your pull request channels.
            </p>
          </section>
        </>
      }
    />
  )
}

// Capybara (Move Work Forward) — bridges Jira tickets with Linear issues so
// support and engineering teams can collaborate without leaving their tools.
function CapybaraIntegrationDetail() {
  return (
    <EngineeringIntegrationShell
      name="Capybara"
      blurb="Create Linear issues and comments based on Jira tasks"
      builtBy="Move Work Forward"
      websiteLabel="moveworkforward.com"
      websiteHref="https://moveworkforward.com"
      enableHref="https://marketplace.atlassian.com/apps/capybara-for-jira-and-linear"
      enableVariant="external"
      tileBg="bg-[#7C3AED]"
      tileText="text-white"
      logo={<CapybaraLogo className="size-9" />}
      gradient="linear-gradient(135deg, #b794f4 0%, #7c3aed 55%, #4c1d95 100%)"
      hero={
        <div aria-hidden className="grid grid-cols-2 gap-3">
          <div
            className="relative overflow-hidden rounded-lg p-4"
            style={{
              background:
                "linear-gradient(135deg, #1e3a8a 0%, #1e40af 55%, #1e293b 100%)",
            }}
          >
            <div className="text-center text-[8px] font-semibold text-white">
              Synchronize work between teams
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <div className="rounded bg-white p-1.5 text-[6px] text-neutral-700 ring-1 ring-neutral-200">
                <div className="text-[5px] text-neutral-500">
                  Link your Jira Service Management requests to Linear issues.
                </div>
                <div className="mt-1 rounded border border-neutral-200 p-1">
                  <div className="text-[6px] font-semibold text-neutral-900">
                    ⚡ Capybara
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-[5px]">
                    <span className="size-1.5 rounded-full bg-indigo-500" />
                    <span className="text-neutral-700">Linear</span>
                  </div>
                  <div className="mt-1 rounded bg-neutral-50 p-0.5 text-[5px]">
                    <span className="rounded bg-rose-500/20 px-0.5 text-rose-600">
                      #MOV-46
                    </span>{" "}
                    <span className="text-neutral-700">
                      Robert Created a Line...
                    </span>
                    <span className="ml-1 rounded bg-amber-200 px-0.5 text-amber-800">
                      In Review
                    </span>
                    <span className="ml-1 rounded bg-emerald-100 px-0.5 text-emerald-700">
                      ● Robert Stanley
                    </span>
                    <span className="ml-1 text-neutral-500">5</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[5px] text-indigo-600">
                    <span>+ Add Link</span>
                    <span>+ Create new issue</span>
                  </div>
                </div>
              </div>
              <div className="rounded bg-white p-1.5 text-[6px] text-neutral-700 ring-1 ring-neutral-200">
                <div className="text-[6px] font-semibold text-neutral-900">
                  Create new issue
                </div>
                <div className="mt-0.5 text-[5px] text-neutral-500">
                  This is a Linear issue created through Capybara
                </div>
                <div className="mt-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Team</span>
                    <span className="rounded bg-neutral-100 px-1">
                      Team list
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Estimate</span>
                    <span className="rounded bg-neutral-100 px-1">Medium</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Status</span>
                    <span className="rounded bg-neutral-100 px-1">Todo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Assignee</span>
                    <span className="rounded bg-neutral-100 px-1">
                      Robert Stanley
                    </span>
                  </div>
                </div>
                <div className="mt-1 flex items-center justify-end gap-1">
                  <span className="text-neutral-500">Cancel</span>
                  <span className="rounded bg-indigo-500 px-1 text-white">
                    Save changes
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-2 text-[6px] leading-snug text-white/70">
              Create a new development task based on the current support
              request. Comment development tasks directly from Jira.
            </div>
          </div>
          <div
            className="relative overflow-hidden rounded-lg p-4"
            style={{
              background:
                "linear-gradient(135deg, #1e3a8a 0%, #1e40af 55%, #1e293b 100%)",
            }}
          >
            <div className="text-center text-[8px] font-semibold text-white">
              Receive status updates and comments automagically
            </div>
            <div className="mt-1 text-center text-[5px] leading-snug text-white/70">
              Capybara reflects status changes and comments as internal comments
              on Jira or Jira Service Managements requests.
            </div>
            <div className="mt-2 rounded bg-white p-1.5 text-[6px] text-neutral-700 ring-1 ring-neutral-200">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-1">
                <div className="text-[6px] font-semibold text-neutral-900">
                  Activity
                </div>
                <div className="text-[5px] text-neutral-500">
                  Newest first ↓
                </div>
              </div>
              <div className="mt-1 flex items-center gap-1 text-[5px]">
                <span className="text-neutral-500">Show:</span>
                <span className="rounded bg-neutral-100 px-1">All</span>
                <span className="rounded bg-indigo-500 px-1 text-white">
                  Comments
                </span>
                <span className="rounded bg-neutral-100 px-1">History</span>
                <span className="rounded bg-neutral-100 px-1">Work log</span>
              </div>
              <div className="mt-1.5 rounded border border-neutral-200 p-1">
                <div className="flex items-center gap-1">
                  <span className="size-2 rounded-full bg-rose-400" />
                  <span className="flex-1 text-neutral-400">
                    Add a comment...
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-[5px]">
                  <span className="rounded bg-emerald-100 px-0.5 text-emerald-700">
                    👍 Looks good!
                  </span>
                  <span className="rounded bg-amber-100 px-0.5 text-amber-700">
                    🆘 Need help?
                  </span>
                  <span className="rounded bg-rose-100 px-0.5 text-rose-700">
                    🚫 This is blocked...
                  </span>
                  <span className="rounded bg-yellow-100 px-0.5 text-yellow-700">
                    ❓ Can you clarify...?
                  </span>
                  <span className="rounded bg-emerald-100 px-0.5 text-emerald-700">
                    ✅ This is on it
                  </span>
                </div>
                <div className="mt-1 text-[5px] text-neutral-500">
                  Pro tips: press @ to comment
                </div>
              </div>
              <div className="mt-1.5 rounded bg-neutral-50 p-1 text-[5px]">
                <div className="font-semibold text-neutral-900">
                  Capybara: GitHub, Linear, Azure DevOps for Jira &amp; JSM
                </div>
                <div className="text-neutral-400">15 seconds ago</div>
                <div className="mt-0.5 text-neutral-700">
                  New comment on{" "}
                  <span className="text-blue-500 underline">
                    Issue #MOV-81 &quot;Test Work Item&quot;
                  </span>{" "}
                  added by Robert Stanley
                </div>
                <div className="mt-0.5 text-neutral-700">Test Comment 1</div>
                <div className="mt-1 flex items-center gap-1 text-blue-500">
                  <span>↩ Reply</span>
                  <span>· Edit</span>
                  <span>· Delete</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
      overview={
        <p>
          Capybara bridges Jira with GitHub, Linear and Azure DevOps,
          streamlining support and development collaboration.
        </p>
      }
      features={
        <>
          <section>
            <h2 className="text-sm font-semibold">How it works</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              The Capybara integration for Linear helps connect or create Linear
              issues to Jira tasks. Synchronise comments and statuses from
              Linear issues back to Jira to help solve customer&apos;s problems
              across tools faster.
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold">Configure</h2>
            <ol className="text-muted-foreground mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-6">
              <li>
                Install Jira app from the marketplace{" "}
                <a
                  href="https://marketplace.atlassian.com/apps/capybara-for-jira-and-linear"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  here
                </a>
                .
              </li>
              <li>
                Go to a Jira task or support request and open Capybara panel.
              </li>
              <li>
                Click &quot;Connect to Linear&quot; and login into Linear.
              </li>
            </ol>
          </section>
        </>
      }
    />
  )
}

// Circleback — turns meeting action items into Linear issues via a
// Circleback automation that you author and gate with conditions.
function CirclebackIntegrationDetail() {
  return (
    <EngineeringIntegrationShell
      name="Circleback"
      blurb="Automatically create Linear issues from meeting action items"
      builtBy="Circleback"
      websiteLabel="circleback.ai"
      websiteHref="https://circleback.ai"
      enableHref="https://app.circleback.ai/integrations/linear"
      enableVariant="external"
      tileBg="bg-[#FF5722]"
      tileText="text-white"
      logo={<CirclebackLogo className="size-9" />}
      gradient="linear-gradient(135deg, #ff8a65 0%, #ff5722 55%, #b71c1c 100%)"
      hero={
        <div aria-hidden className="grid grid-cols-2 gap-3">
          <div className="relative overflow-hidden rounded-lg bg-neutral-50 p-4 ring-1 ring-neutral-200">
            <div className="rounded-md bg-white p-2 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.15)] ring-1 ring-neutral-200">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-1">
                <div className="flex items-center gap-1 text-[7px] text-neutral-700">
                  <span className="size-2 rounded-sm bg-indigo-500" />
                  <span>Create issues in Linear</span>
                </div>
                <span className="text-[7px] text-neutral-400">▴</span>
              </div>
              <div className="mt-2 text-[7px] font-semibold text-neutral-900">
                Connect Linear
              </div>
              <div className="mt-0.5 text-[6px] leading-snug text-neutral-500">
                Connect your Linear account to have issues automatically created
                after meetings.
              </div>
              <div className="mt-2 flex items-center justify-between rounded border border-neutral-200 px-1.5 py-1">
                <div className="flex items-center gap-1 text-[7px] text-neutral-700">
                  <span className="size-2.5 rounded-sm bg-indigo-500" />
                  <span>Linear</span>
                </div>
                <span className="rounded bg-indigo-500 px-1.5 py-0.5 text-[6px] font-medium text-white">
                  Connect
                </span>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg bg-neutral-50 p-4 ring-1 ring-neutral-200">
            <div className="text-[8px] font-semibold text-neutral-900">
              Update Linear
            </div>
            <div className="mt-2 rounded-md bg-white p-1.5 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)] ring-1 ring-neutral-200">
              <div className="flex items-center justify-between text-[7px] text-neutral-700">
                <div className="flex items-center gap-1">
                  <span className="text-amber-500">⚡</span>
                  <span>After every meeting where tags include Planning</span>
                </div>
                <span className="text-neutral-400">▾</span>
              </div>
            </div>
            <div className="mx-auto mt-3 h-3 w-px bg-neutral-300" />
            <div className="rounded-md bg-white p-1.5 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)] ring-1 ring-neutral-200">
              <div className="flex items-center justify-between text-[7px] text-neutral-700">
                <div className="flex items-center gap-1">
                  <span className="size-2 rounded-sm bg-indigo-500" />
                  <span>Create issues in Linear</span>
                </div>
                <span className="text-neutral-400">▾</span>
              </div>
            </div>
            <div className="mx-auto mt-3 size-1.5 rounded-full bg-neutral-300" />
          </div>
        </div>
      }
      overview={
        <p>
          The Circleback integration allows you to keep Linear up-to-date with
          meeting action items.
        </p>
      }
      features={
        <>
          <section>
            <h2 className="text-sm font-semibold">How it works</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              Set up the integration by creating an automation on Circleback
              with a step to create Linear issues for meeting action items. You
              can add conditions to the automation to have it only run for the
              meetings you choose (e.g. planning meetings, customer demos).
              Issues will be automatically assigned to the right person if
              they&apos;re a part of your workspace.
            </p>
            <p className="text-muted-foreground mt-3 text-sm leading-6">
              Automations can be shared with your team, allowing you to keep
              track of action items across team meetings in Linear. Create
              multiple automations for different types of meetings to have
              issues be associated with the appropriate Linear team.
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold">Configure</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              To get started, create an automation on Circleback and choose
              which meetings to run the automation after by adding conditions.
              By default, the automation will run after every meeting.
            </p>
            <p className="text-muted-foreground mt-3 text-sm leading-6">
              Then, add a Linear step to the automation and connect your Linear
              account if you haven&apos;t already. Once connected, select the
              team you want to create issues in. Create the automation and
              you&apos;re all set. A new Linear issue will be created for each
              meeting action item each time this automation runs.
            </p>
          </section>
        </>
      }
    />
  )
}

// ---------------------------------------------------------------------------
// Microsoft Teams — Linear-built collaboration integration. Mirrors the
// production layout: header + Built-by/Enable rail, two screenshot tiles
// (create issues from conversations, ask questions about your work),
// Overview with Read more, then a Personal Microsoft account row and a
// Connections / Connected tenants section beneath.
// ---------------------------------------------------------------------------
function MicrosoftTeamsIntegrationDetail() {
  const [overviewExpanded, setOverviewExpanded] = useState(false)
  const [tenantsOpen, setTenantsOpen] = useState(false)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#6264A7]">
          <MicrosoftTeamsLogo className="size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">
            Microsoft Teams
          </h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Drive work forward by turning conversations into issues, projects,
            and documents
          </p>
        </div>
      </header>

      {/* Body card */}
      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        {/* Built by / Enable rail */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-8">
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Built by
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                Linear
              </div>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() =>
              toast.info("Microsoft Teams OAuth connect flow coming soon")
            }
            aria-label="Enable Microsoft Teams integration"
          >
            <HugeiconsIcon icon={PuzzleIcon} className="size-3.5" />
            Enable
          </Button>
        </div>

        {/* Screenshot tiles */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div
            aria-hidden
            className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-neutral-100 p-3"
          >
            <div className="text-[9px] font-semibold text-neutral-700">
              Create
              <br />
              issues from
              <br />
              conversations
            </div>
            <div className="bg-background absolute right-2 bottom-2 left-12 rounded-md border p-1.5 text-[7px] shadow-sm">
              <div className="text-muted-foreground text-[6px]">
                Wednesday, 12:34 AM
              </div>
              <div className="mt-1 flex items-start gap-1">
                <span className="size-3 rounded-full bg-[#6264A7]" />
                <div className="flex-1">
                  <div className="text-[7px] font-medium">karri</div>
                  <div className="text-muted-foreground leading-tight">
                    Flagging a bug I ran into this morning on the Rider app.
                    After entering a destination…
                  </div>
                </div>
              </div>
              <div className="bg-muted/40 mt-1 rounded border-l-2 border-indigo-500 p-1">
                <div className="font-medium">Linear</div>
                <div className="text-muted-foreground leading-tight">
                  Created issue id-1620
                </div>
                <div className="text-muted-foreground mt-0.5">
                  Linear · file a bug for this
                </div>
              </div>
              <div className="text-muted-foreground mt-1 flex justify-between">
                <span>Reply in thread</span>
                <span>Send to · linear-only</span>
              </div>
            </div>
            <div className="absolute bottom-1.5 left-2 flex items-center gap-1">
              <span className="size-2 rounded-sm bg-[#6264A7]" />
              <span className="text-[6px] font-semibold text-neutral-700">
                Linear
              </span>
            </div>
          </div>
          <div
            aria-hidden
            className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-neutral-100 p-3"
          >
            <div className="text-[9px] font-semibold text-neutral-700">
              Ask
              <br />
              questions
              <br />
              about your
              <br />
              work
            </div>
            <div className="bg-background absolute right-2 bottom-2 left-12 rounded-md border p-1.5 text-[7px] shadow-sm">
              <div className="flex items-start gap-1">
                <span className="size-3 rounded-full bg-emerald-500" />
                <div className="flex-1">
                  <div className="text-[7px] font-medium">karri</div>
                  <div className="text-muted-foreground leading-tight">
                    Notifications aren&apos;t coming through for me on mobile,
                    so they should be. I&apos;ve past the 5 minute desktop
                    timeout. Linear who usually works in this area?
                  </div>
                </div>
              </div>
              <div className="bg-muted/40 mt-1 rounded border-l-2 border-indigo-500 p-1">
                <div className="font-medium">Linear</div>
                <div className="text-muted-foreground leading-tight">
                  On mobile notifications, @bob is usually the go-to on iOS, and
                  @alice works on Android.
                </div>
              </div>
              <div className="text-muted-foreground mt-1 flex justify-between">
                <span>Reply in thread</span>
                <span>···</span>
              </div>
            </div>
            <div className="absolute bottom-1.5 left-2 flex items-center gap-1">
              <span className="size-2 rounded-sm bg-[#6264A7]" />
              <span className="text-[6px] font-semibold text-neutral-700">
                Linear
              </span>
            </div>
          </div>
        </div>

        {/* Overview */}
        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Mention <span className="font-medium">@Linear</span> in any
            Microsoft Teams channel to turn your discussions into actionable
            work. You can file issues, update projects, or ask questions about
            your Linear workspace without leaving Teams.
          </p>
          {overviewExpanded ? (
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              Linear replies inline with rich previews so context never has to
              leave the conversation. Issues created from Teams keep a backlink
              to the original message, and assignees are inferred automatically
              when the agent recognises a teammate from the thread.
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => setOverviewExpanded((v) => !v)}
            className="text-muted-foreground hover:text-foreground mt-2 text-xs"
            aria-expanded={overviewExpanded}
          >
            {overviewExpanded ? "Show less" : "Read more"}
          </button>
        </section>
      </div>

      {/* Personal account */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">Personal account</h2>
        <Link
          href="/settings?section=connected-accounts"
          scroll={false}
          className="bg-card hover:border-foreground/20 flex items-center justify-between rounded-lg border p-4 transition-colors"
          aria-label="Personal Microsoft account: connect to sync attribution"
        >
          <div className="min-w-0">
            <div className="text-sm font-medium">
              Personal Microsoft account
            </div>
            <div className="text-muted-foreground mt-0.5 text-xs">
              Sync attribution of your Microsoft Teams messages
            </div>
          </div>
          <span className="text-muted-foreground flex items-center gap-1 text-xs">
            Connect
            <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
          </span>
        </Link>
      </section>

      {/* Connections */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">Connections</h2>
        <Collapsible open={tenantsOpen} onOpenChange={setTenantsOpen}>
          <CollapsibleTrigger
            className="bg-card hover:border-foreground/20 flex w-full items-center justify-between rounded-lg border p-4 text-left transition-colors"
            aria-label="Connected tenants"
          >
            <span className="text-sm font-medium">Connected tenants</span>
            <HugeiconsIcon
              icon={PlusSignIcon}
              className="text-muted-foreground size-4"
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="bg-card mt-2 rounded-lg border p-4">
            <p className="text-muted-foreground text-xs">
              No Microsoft Teams tenants are connected yet. Enable the
              integration above to add one.
            </p>
          </CollapsibleContent>
        </Collapsible>
      </section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Discord — Linear-built integration that creates issues from Discord
// channels and lets users mention /linear to query their workspace. Layout
// mirrors the production page: header, Built-by/Docs/Enable rail, two
// indigo screenshot tiles, Overview with Read more, then a single
// "Connect your user account" row beneath.
// ---------------------------------------------------------------------------
function DiscordIntegrationDetail() {
  const [overviewExpanded, setOverviewExpanded] = useState(false)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#5865F2]">
          <DiscordLogo className="size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">Discord</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Create issues, share updates, and keep everyone in sync
          </p>
        </div>
      </header>

      {/* Body card */}
      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        {/* Built by / Docs / Enable rail */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-8">
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Built by
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                Linear
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Docs
              </div>
              <a
                href="https://linear.app/docs/discord"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord integration docs (opens in new tab)"
                className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
              >
                <HugeiconsIcon icon={Book02Icon} className="size-3.5" />
                Docs
              </a>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => toast.info("Discord OAuth connect flow coming soon")}
            aria-label="Enable Discord integration"
          >
            <HugeiconsIcon icon={PuzzleIcon} className="size-3.5" />
            Enable
          </Button>
        </div>

        {/* Screenshot tiles */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div
            aria-hidden
            className="relative aspect-[4/3] overflow-hidden rounded-lg p-3"
            style={{
              background:
                "linear-gradient(135deg, #818cf8 0%, #6366f1 55%, #4f46e5 100%)",
            }}
          >
            <div className="rounded-md bg-[#1f2235] p-2 text-[7px] text-white shadow-sm ring-1 ring-white/10">
              <div className="flex items-center gap-1 border-b border-white/10 pb-1">
                <span className="rounded bg-[#5865F2] px-1 py-0.5 text-[6px] font-semibold">
                  /linear issue
                </span>
                <span className="text-white/60">Create an issue on Linear</span>
              </div>
              <div className="mt-1 flex items-center gap-1">
                <span className="size-2.5 rounded-full bg-[#5865F2]" />
                <span className="rounded bg-[#5865F2] px-1 py-0.5 text-[6px] font-semibold">
                  /linear issue
                </span>
                <span className="text-white/70">title</span>
                <span className="rounded bg-white/10 px-1 py-0.5">
                  Redesign sidebar
                </span>
                <span className="text-white/70">team</span>
                <span className="rounded bg-white/10 px-1 py-0.5">Design</span>
                <span className="text-white/70">+4 more</span>
              </div>
            </div>
            <div className="mt-2 rounded-md bg-[#1f2235] p-2 text-[7px] text-white shadow-sm ring-1 ring-white/10">
              <div className="flex items-center gap-1 text-white/60">
                <span className="font-mono text-[6px]">10:03 AM</span>
                <span className="font-semibold text-white">adrien used</span>
                <span className="rounded bg-[#5865F2]/30 px-1 py-0.5 font-mono text-[6px] text-[#a5b4fc]">
                  /linear
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-1">
                <span className="rounded bg-[#5865F2] px-1 py-0.5 text-[6px] font-semibold">
                  BOT
                </span>
                <span className="text-white/80">
                  Linear Issue{" "}
                  <span className="rounded bg-white/10 px-1 text-white">
                    DES-52
                  </span>{" "}
                  created.
                </span>
              </div>
              <div className="mt-1 rounded border-l-2 border-[#a5b4fc] bg-white/5 p-1">
                <div className="font-semibold text-white">
                  DES-52 — Redesign sidebar
                </div>
                <div className="mt-0.5 text-white/60">
                  Status <span className="text-white">Triage</span>
                </div>
                <div className="text-white/60">Design · Today at 10:03 AM</div>
              </div>
            </div>
          </div>
          <div
            aria-hidden
            className="relative aspect-[4/3] overflow-hidden rounded-lg p-3"
            style={{
              background:
                "linear-gradient(135deg, #818cf8 0%, #6366f1 55%, #4f46e5 100%)",
            }}
          >
            <div className="rounded-md bg-[#1f2235] p-2 text-[7px] text-white shadow-sm ring-1 ring-white/10">
              <div className="flex items-center gap-1 text-white/60">
                <span className="font-mono text-[6px]">7:15 PM</span>
                <span className="font-semibold text-white">adrien used</span>
                <span className="rounded bg-[#5865F2]/30 px-1 py-0.5 font-mono text-[6px] text-[#a5b4fc]">
                  /linear
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-1">
                <span className="rounded bg-[#5865F2] px-1 py-0.5 text-[6px] font-semibold">
                  BOT
                </span>
                <span className="text-white/80">
                  <span className="font-semibold text-white">Linear</span>{" "}
                  Started:
                </span>
              </div>
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-white/70">
                <li>Redesign sidebar</li>
                <li>Secure enclave</li>
                <li>Snooze for notifications</li>
              </ul>
              <div className="mt-1 font-semibold text-white">Completed:</div>
              <ul className="mt-0.5 list-disc space-y-0.5 pl-4 text-white/70">
                <li>Add images for integrations</li>
                <li>Special hover effect on the &quot;install&quot; button</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Overview */}
        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            This integration connects your Linear workspace to your Discord
            server so that you can create issues from Discord. Additional
            features let you search for and then post a link to an existing
            issue as well as share a summary of your day&apos;s work.
          </p>
          {overviewExpanded ? (
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              Use the <span className="font-medium">/linear</span> slash command
              in any channel to create or look up issues. Linear posts a rich
              preview back into the channel so the rest of the team stays in the
              loop.
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => setOverviewExpanded((v) => !v)}
            className="text-muted-foreground hover:text-foreground mt-2 text-xs"
            aria-expanded={overviewExpanded}
          >
            {overviewExpanded ? "Show less" : "Read more"}
          </button>
        </section>
      </div>

      {/* Connect your user account */}
      <Link
        href="/settings?section=connected-accounts"
        scroll={false}
        className="bg-card hover:border-foreground/20 flex items-center justify-between rounded-lg border p-4 transition-colors"
        aria-label="Connect your Discord user account"
      >
        <div className="min-w-0">
          <div className="text-sm font-medium">Connect your user account</div>
          <div className="text-muted-foreground mt-0.5 text-xs">
            Sync attribution of your messages, and enable Discord slash commands
          </div>
        </div>
        <span className="text-muted-foreground flex items-center gap-1 text-xs">
          Connect
          <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
        </span>
      </Link>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Glean — third-party search integration. Layout matches the production
// page: header, Built-by / Website / Enable (external) rail, a stacked
// isometric hero illustration, Overview, How it works, and a Configure
// section with bullet steps plus a callout that Glean is also available as
// an MCP server for use with Linear Agent.
// ---------------------------------------------------------------------------
function GleanIntegrationDetail() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white">
          <GleanLogo className="size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">Glean</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Search Linear for instant insights
          </p>
        </div>
      </header>

      {/* Body card */}
      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        {/* Built by / Website / Enable rail */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-8">
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Built by
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                Glean
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Website
              </div>
              <a
                href="https://glean.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Glean website (opens in new tab)"
                className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
              >
                <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
                glean.com
              </a>
            </div>
          </div>
          <Button
            size="sm"
            asChild
            aria-label="Enable Glean integration (opens in new tab)"
          >
            <a
              href="https://app.glean.com/admin/setup/apps"
              target="_blank"
              rel="noopener noreferrer"
            >
              Enable
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
            </a>
          </Button>
        </div>

        {/* Hero — stacked isometric tiles */}
        <div
          aria-hidden
          className="relative flex aspect-[16/10] items-center justify-center overflow-hidden rounded-lg"
          style={{
            background:
              "radial-gradient(circle at 50% 40%, #2a2a2e 0%, #18181b 70%, #0b0b0f 100%)",
          }}
        >
          <div className="relative">
            {/* Top tile (Glean) */}
            <div
              className="flex size-24 items-center justify-center rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)]"
              style={{
                background: "linear-gradient(135deg, #f4f4f2 0%, #d6d6d2 100%)",
                transform: "rotate(-14deg) translateY(-12px)",
              }}
            >
              <svg
                viewBox="0 0 64 64"
                className="size-14"
                aria-hidden
                fill="none"
              >
                <path
                  d="M44 24a14 14 0 1 0 0 16"
                  stroke="#0b0b0f"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            {/* Connecting chevrons */}
            <div className="my-3 flex flex-col items-center gap-0.5 text-white/50">
              <span className="text-xs">⌃</span>
              <span className="text-xs">⌃</span>
              <span className="text-xs">⌃</span>
            </div>
            {/* Bottom tile (Linear) */}
            <div
              className="flex size-24 items-center justify-center rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)]"
              style={{
                background: "linear-gradient(135deg, #1a1b26 0%, #0a0b12 100%)",
                transform: "rotate(14deg) translateY(12px)",
              }}
            >
              <svg viewBox="0 0 64 64" className="size-14" aria-hidden>
                <defs>
                  <clipPath id="glean-linear-clip">
                    <circle cx="32" cy="32" r="26" />
                  </clipPath>
                </defs>
                <g clipPath="url(#glean-linear-clip)">
                  <rect width="64" height="64" fill="#fff" />
                  <g stroke="#0b0b0f" strokeWidth="3" opacity="0.85">
                    <line x1="-20" y1="40" x2="84" y2="-64" />
                    <line x1="-20" y1="56" x2="84" y2="-48" />
                    <line x1="-20" y1="72" x2="84" y2="-32" />
                    <line x1="-20" y1="88" x2="84" y2="-16" />
                  </g>
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* Overview */}
        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            The Glean integration for Linear enables you to search your Linear
            project plans, teams, and workflows for immediate insights into
            timelines, issues, and status.
          </p>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-sm font-semibold">How it works</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Glean indexes your Linear environment to capture project content and
            issues so that you can query it easily to gain insight into project
            timelines, milestones, and issue updates across teams. Glean enables
            you to easily stay up to date with product development in your
            organization.
          </p>
        </section>

        {/* Configure */}
        <section>
          <h2 className="text-sm font-semibold">Configure</h2>
          <ul className="text-muted-foreground mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6">
            <li>
              To connect Linear to Glean, log into your Glean account and
              navigate to the Admin console.
            </li>
            <li>
              In the Admin console, go to the &quot;Data sources&quot; section
              and click on the &quot;Add data source&quot; button.
            </li>
            <li>
              From the list of connectors, choose Linear and follow the steps.
            </li>
          </ul>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            Glean is also available as an{" "}
            <a
              href="https://docs.glean.com/mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              MCP server
            </a>{" "}
            for use with Linear Agent
          </p>
        </section>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Range — third-party async check-ins integration. Layout follows the
// production page: header + Built-by/Website/Enable (external) rail, two
// blue/teal screenshot tiles (Connected Tools list, Plan check-in feed),
// then Overview / How it works / Configure prose sections.
// ---------------------------------------------------------------------------
function RangeIntegrationDetail() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white">
          <RangeLogo className="size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">Range</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Pull Linear issues into async check-ins to keep your software
            development team in sync
          </p>
        </div>
      </header>

      {/* Body card */}
      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        {/* Built by / Website / Enable rail */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-8">
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Built by
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                Range
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Website
              </div>
              <a
                href="https://range.co"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Range website (opens in new tab)"
                className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
              >
                <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
                range.co
              </a>
            </div>
          </div>
          <Button
            size="sm"
            asChild
            aria-label="Enable Range integration (opens in new tab)"
          >
            <a
              href="https://range.co/integrations/linear"
              target="_blank"
              rel="noopener noreferrer"
            >
              Enable
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
            </a>
          </Button>
        </div>

        {/* Screenshot tiles */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Left tile — Connected Tools / Recent Activity */}
          <div
            aria-hidden
            className="relative aspect-[4/3] overflow-hidden rounded-lg p-3"
            style={{
              background:
                "radial-gradient(circle at 30% 20%, #dbeafe 0%, #bfdbfe 60%, #93c5fd 100%)",
            }}
          >
            <div className="grid h-full grid-cols-2 gap-1.5">
              <div className="rounded-md bg-white p-1.5 text-[6px] text-neutral-700 ring-1 ring-neutral-200">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-1">
                  <span className="font-semibold text-neutral-900">
                    Connected Tools
                  </span>
                  <span className="text-neutral-400">⌄</span>
                </div>
                <div className="mt-1 space-y-0.5">
                  <div className="flex items-center gap-1 rounded bg-indigo-100 px-1 py-0.5">
                    <span className="size-1.5 rounded-sm bg-indigo-500" />
                    <span className="text-neutral-900">Linear</span>
                  </div>
                  <div className="flex items-center gap-1 px-1 py-0.5">
                    <span className="size-1.5 rounded-sm bg-neutral-800" />
                    <span>Github</span>
                  </div>
                  <div className="flex items-center gap-1 px-1 py-0.5">
                    <span className="size-1.5 rounded-sm bg-emerald-500" />
                    <span>PagerDuty</span>
                  </div>
                  <div className="flex items-center gap-1 px-1 py-0.5">
                    <span className="size-1.5 rounded-sm bg-blue-500" />
                    <span>Google Docs</span>
                  </div>
                  <div className="flex items-center gap-1 px-1 py-0.5">
                    <span className="size-1.5 rounded-sm bg-blue-400" />
                    <span>Google Calendar</span>
                  </div>
                  <div className="flex items-center gap-1 px-1 py-0.5">
                    <span className="size-1.5 rounded-sm bg-yellow-400" />
                    <span>Google Drive</span>
                  </div>
                </div>
              </div>
              <div className="rounded-md bg-white p-1.5 text-[6px] text-neutral-700 ring-1 ring-neutral-200">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-1">
                  <span className="flex items-center gap-1 font-semibold text-neutral-900">
                    <span className="size-1.5 rounded-sm bg-indigo-500" />
                    Linear
                    <span className="ml-0.5 rounded bg-emerald-100 px-0.5 text-[5px] text-emerald-700">
                      Connected
                    </span>
                  </span>
                  <span className="text-neutral-400">⚙</span>
                </div>
                <div className="mt-1 text-neutral-500">Recent Activity</div>
                <div className="mt-0.5 space-y-0.5">
                  <div className="rounded bg-neutral-50 p-0.5">
                    <div className="font-semibold text-neutral-900">
                      ApplicationStore support for new...
                    </div>
                    <div className="text-neutral-500">
                      Assigned · To Do · Backend Cleanup
                    </div>
                  </div>
                  <div className="rounded bg-neutral-50 p-0.5">
                    <div className="font-semibold text-neutral-900">
                      Error handling for empty userStri...
                    </div>
                    <div className="text-neutral-500">
                      Completed · To Do · Registration Upd...
                    </div>
                  </div>
                  <div className="rounded bg-neutral-50 p-0.5">
                    <div className="font-semibold text-neutral-900">
                      Config Zapier with new events
                    </div>
                    <div className="text-neutral-500">Viewed · PR#11480</div>
                  </div>
                  <div className="rounded bg-neutral-50 p-0.5">
                    <div className="font-semibold text-neutral-900">
                      Tech Spec: Renewing certificate...
                    </div>
                    <div className="text-neutral-500">
                      Commented · Google Docs
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Right tile — Plan check-in feed */}
          <div
            aria-hidden
            className="relative aspect-[4/3] overflow-hidden rounded-lg p-3"
            style={{
              background:
                "radial-gradient(circle at 70% 30%, #d1fae5 0%, #a7f3d0 60%, #6ee7b7 100%)",
            }}
          >
            <div className="rounded-md bg-white p-1.5 text-[6px] text-neutral-700 shadow-sm ring-1 ring-neutral-200">
              <div className="flex items-center gap-1 border-b border-neutral-200 pb-1">
                <span className="size-2 rounded-full bg-orange-300" />
                <span className="font-semibold text-neutral-900">
                  Allison Curtis
                </span>
              </div>
              <div className="mt-1 font-semibold text-neutral-900">Plan</div>
              <div className="mt-1 space-y-0.5">
                <div className="flex items-center gap-1">
                  <span className="size-1.5 rounded-sm bg-emerald-500" />
                  <span className="flex-1 text-neutral-700">
                    Starting this today. Reach o...
                  </span>
                </div>
                <div className="ml-3 rounded bg-neutral-50 p-0.5">
                  <span className="text-neutral-500">for me!</span>
                  <span className="ml-0.5 rounded bg-blue-100 px-0.5 text-blue-700">
                    #backend
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="size-1.5 rounded-sm bg-indigo-500" />
                  <span className="flex-1 text-neutral-700">
                    Error handling for empty userStrings
                  </span>
                </div>
                <div className="ml-3 rounded bg-neutral-50 p-0.5 text-neutral-500">
                  ▢ Weekly Leads Meeting
                </div>
                <div className="flex items-center gap-1">
                  <span className="size-1.5 rounded-sm bg-indigo-500" />
                  <span className="flex-1 text-neutral-700">
                    Update social params for new c...
                  </span>
                </div>
                <div className="ml-3 rounded bg-neutral-50 p-0.5 text-neutral-500">
                  Assigned · To Do · Website Updates
                </div>
                <div className="flex items-center gap-1">
                  <span className="size-1.5 rounded-sm bg-emerald-500" />
                  <span className="text-neutral-700">
                    Released the updated{" "}
                    <span className="rounded bg-blue-100 px-0.5 text-blue-700">
                      #social
                    </span>{" "}
                    params
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="size-1.5 rounded-sm bg-emerald-500" />
                  <span className="text-neutral-700">
                    Update social params for new campaigns
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="size-1.5 rounded-sm bg-emerald-500" />
                  <span className="text-neutral-700">
                    1:1 Allison / Natasha
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="rounded bg-amber-100 px-0.5 text-amber-700">
                    FYI
                  </span>
                  <span className="text-neutral-700">
                    I rolled back the changes to the compilers from...
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overview */}
        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            This integration makes it possible for teams to pull Linear issues
            into their asynchronous Team Check-ins in Range. Once the
            integration is connected, easily drag and drop recent Linear issues
            into Range Check-ins to update your team on your progress each day.
          </p>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-sm font-semibold">How it works</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Range Check-ins reduce meeting load by keeping every team member
            informed and connected day-to-day. Check-in asynchronously on a
            personal and professional level so the whole team feels in sync,
            wherever you are.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            With the Linear and Range integration, you can pull Linear activity
            directly into your Range Check-ins. Once you&rsquo;ve connected your
            Linear and Range workspaces, any Linear issues that you create,
            comment on, or update will appear in your Range sidebar as suggested
            items to include in your Check-in.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            Messages like &ldquo;Completed&rdquo; and &ldquo;Assigned&rdquo;
            will appear alongside Linear issues in Range when you make an update
            to one of your assigned issues.
          </p>
        </section>

        {/* Configure */}
        <section>
          <h2 className="text-sm font-semibold">Configure</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            In Range, visit{" "}
            <span className="text-foreground font-medium">
              Settings &gt; Integrations
            </span>{" "}
            and locate Linear. Click{" "}
            <span className="text-foreground font-medium">Set this up</span> and
            complete the authorization step. Once you&rsquo;ve connected your
            team&rsquo;s Linear and Range workspaces, every team member will
            need to click{" "}
            <span className="text-foreground font-medium">Link</span> under{" "}
            <span className="text-foreground font-medium">
              Settings &gt; Integrations &gt; Linear
            </span>{" "}
            in Range to start syncing their Linear activity to Range.
          </p>
        </section>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Canva AI Connector — third-party design integration. Layout matches the
// production page: header + Built-by/Website/Enable (external) rail, a
// large dark hero with the Linear ↔ Canva pairing illustration above a
// browser mock, then Overview / How it works / Configure prose with a
// numbered configure list.
// ---------------------------------------------------------------------------
function CanvaIntegrationDetail() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#0c1220]">
          <CanvaLogo className="size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">
            Canva AI Connector
          </h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Create and link Linear workflow content directly within Canva
          </p>
        </div>
      </header>

      {/* Body card */}
      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        {/* Built by / Website / Enable rail */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-8">
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Built by
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                Canva
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Website
              </div>
              <a
                href="https://canva.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Canva website (opens in new tab)"
                className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
              >
                <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
                canva.com
              </a>
            </div>
          </div>
          <Button
            size="sm"
            asChild
            aria-label="Enable Canva AI Connector (opens in new tab)"
          >
            <a
              href="https://www.canva.com/ai/connectors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Enable
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
            </a>
          </Button>
        </div>

        {/* Hero */}
        <div
          aria-hidden
          className="relative overflow-hidden rounded-lg p-6"
          style={{
            background:
              "linear-gradient(180deg, #1a1d28 0%, #0e1018 50%, #060810 100%)",
          }}
        >
          {/* Pairing logos */}
          <div className="flex items-center justify-center gap-6">
            <div className="flex size-12 items-center justify-center rounded-full bg-[#0b0b0f] ring-1 ring-white/15">
              <svg viewBox="0 0 64 64" className="size-7" aria-hidden>
                <defs>
                  <clipPath id="canva-linear-clip">
                    <circle cx="32" cy="32" r="28" />
                  </clipPath>
                </defs>
                <g clipPath="url(#canva-linear-clip)">
                  <rect width="64" height="64" fill="#fff" />
                  <g stroke="#0b0b0f" strokeWidth="3" opacity="0.85">
                    <line x1="-20" y1="40" x2="84" y2="-64" />
                    <line x1="-20" y1="56" x2="84" y2="-48" />
                    <line x1="-20" y1="72" x2="84" y2="-32" />
                    <line x1="-20" y1="88" x2="84" y2="-16" />
                  </g>
                </g>
              </svg>
            </div>
            <div className="flex items-center gap-1 text-white/40">
              <span className="size-1 rounded-full bg-white/40" />
              <span className="size-1 rounded-full bg-white/40" />
              <span className="size-1 rounded-full bg-white/40" />
            </div>
            <div className="flex size-12 items-center justify-center rounded-full bg-white shadow-[0_0_30px_rgba(60,196,255,0.45)]">
              <CanvaLogo className="size-8" />
            </div>
          </div>

          {/* Browser mock */}
          <div className="mt-6 overflow-hidden rounded-t-xl border border-white/10 bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)]">
            <div
              className="relative flex h-44 items-center justify-center"
              style={{
                background:
                  "linear-gradient(180deg, #f5f3ff 0%, #ffffff 60%, #ecfeff 100%)",
              }}
            >
              {/* Left rail */}
              <div className="absolute top-2 bottom-2 left-2 flex w-7 flex-col items-center gap-1 rounded-md bg-white/70 py-1.5 ring-1 ring-neutral-200">
                <span className="size-3 rounded bg-neutral-200" />
                <span className="size-3 rounded bg-violet-300" />
                <span className="size-2.5 rounded bg-neutral-200" />
                <span className="size-2.5 rounded bg-neutral-200" />
                <span className="size-2.5 rounded bg-neutral-200" />
              </div>
              {/* Headline */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[11px] font-semibold tracking-tight">
                <span
                  style={{
                    background:
                      "linear-gradient(90deg, #7B8DFF, #3CC4FF, #28E0CF)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  What will you design today?
                </span>
              </div>
              {/* Prompt input */}
              <div className="absolute right-6 bottom-3 left-12 rounded-lg border border-violet-200 bg-white px-2 py-2 shadow-[0_10px_24px_-12px_rgba(124,58,237,0.35)]">
                <div className="flex items-center gap-1.5 text-[10px] text-neutral-700">
                  <span className="flex size-4 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
                    +
                  </span>
                  <span className="flex-1 truncate">
                    List all high-priority issues from the current cycle in
                    Linear
                  </span>
                  <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[8px] font-medium text-white">
                    Linh
                  </span>
                  <span className="flex size-5 items-center justify-center rounded-full bg-violet-600 text-white">
                    →
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overview */}
        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Connect Linear to Canva AI to bring your issues, projects, and team
            context directly into your design workflow. Use Linear data as
            context to generate presentations, social posts, reports, and other
            designs without leaving Canva.
          </p>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-sm font-semibold">How it works</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            The Canva integration for Linear connects your Linear workspace to
            Canva AI, letting you pull issues, projects, and team data into your
            conversations. Once connected, you can ask Canva AI to retrieve
            information from Linear and use it as context to generate designs,
            documents, and visual content. For example, you could ask Canva AI
            to create a sprint review presentation based on your recently
            completed issues, or summarize a project&rsquo;s progress in a
            status report.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            To get started, open Canva AI and select the Linear connector from
            the connectors menu. You&rsquo;ll be prompted to authenticate with
            your Linear account via OAuth. Once connected, Canva AI can access
            your Linear data and use it alongside its design and content
            generation capabilities. You can reference your Linear issues,
            projects, and workflows naturally in your prompts, and Canva AI will
            fetch the relevant context to inform what it creates.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            The integration is read-only, meaning Canva AI can retrieve data
            from your Linear workspace but will not create, modify, or delete
            any issues or other data in Linear. You can disconnect the
            integration at any time from the connectors menu in Canva AI.
          </p>
        </section>

        {/* Configure */}
        <section>
          <h2 className="text-sm font-semibold">Configure</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            To get started, open Canva AI and select the Linear connector from
            the connectors menu. You&rsquo;ll be prompted to authenticate with
            your Linear account via OAuth.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            Once connected, Canva AI can access your Linear data and use it
            alongside its design and content generation capabilities. You can
            reference your Linear issues, projects, and workflows naturally in
            your prompts, and Canva AI will fetch the relevant context to inform
            what it creates.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            To configure:
          </p>
          <ol className="text-muted-foreground mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-6">
            <li>
              Open Canva AI from{" "}
              <a
                href="https://canva.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                canva.com
              </a>{" "}
              and click the connectors menu (the + button).
            </li>
            <li>Select Linear from the list of available connectors.</li>
            <li>
              Authenticate with your Linear account when prompted. This uses a
              standard OAuth flow.
            </li>
            <li>
              Once connected, Linear will appear as an enabled connector in your
              Canva AI session. You can start referencing your Linear data in
              prompts immediately.
            </li>
          </ol>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            No admin permissions are required. Any Linear user can connect their
            own account. To disconnect, open the connectors menu and toggle
            Linear off.
          </p>
        </section>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Claap — third-party screen-recording integration that creates Linear
// issues from recorded videos. Header + Built-by / Website / Enable
// (external) rail, two screenshot tiles (the Claap → Linear automation
// card on the left, the "Add Linear issue" modal on the right), then
// Overview / How it works / Configure prose with a deep link to Claap
// settings.
// ---------------------------------------------------------------------------
function ClaapIntegrationDetail() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#FF5C7A]">
          <ClaapLogo className="size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">Claap</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Record bugs and directly create issues in Linear
          </p>
        </div>
      </header>

      {/* Body card */}
      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        {/* Built by / Website / Enable rail */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-8">
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Built by
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                Claap
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Website
              </div>
              <a
                href="https://claap.io"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Claap website (opens in new tab)"
                className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
              >
                <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
                claap.io
              </a>
            </div>
          </div>
          <Button
            size="sm"
            asChild
            aria-label="Enable Claap integration (opens in new tab)"
          >
            <a
              href="https://app.claap.io/integrations/linear"
              target="_blank"
              rel="noopener noreferrer"
            >
              Enable
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
            </a>
          </Button>
        </div>

        {/* Screenshot tiles */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Left tile — automation card */}
          <div
            aria-hidden
            className="relative aspect-[4/3] overflow-hidden rounded-lg p-4"
            style={{
              background:
                "linear-gradient(135deg, #6B2A6E 0%, #4A1F58 60%, #2A1138 100%)",
            }}
          >
            <div className="flex h-full items-center justify-center gap-2">
              <div className="flex flex-col items-center gap-2 rounded-lg bg-white/5 p-2 ring-1 ring-white/15">
                <ClaapLogo className="size-7" />
                <div className="text-center text-[7px] leading-tight text-white/85">
                  When a claap video
                  <br />
                  is shared in
                  <br />
                  the topic{" "}
                  <span className="rounded bg-rose-500/20 px-1 text-rose-200">
                    🐞 Bug Report
                  </span>
                </div>
              </div>
              <span className="text-white/60">→</span>
              <div className="flex flex-col items-center gap-2 rounded-lg bg-white/5 p-2 ring-1 ring-white/15">
                <svg viewBox="0 0 32 32" className="size-7" aria-hidden>
                  <defs>
                    <clipPath id="claap-linear-clip">
                      <circle cx="16" cy="16" r="14" />
                    </clipPath>
                  </defs>
                  <g clipPath="url(#claap-linear-clip)">
                    <rect width="32" height="32" fill="#fff" />
                    <g stroke="#0b0b0f" strokeWidth="2" opacity="0.85">
                      <line x1="-12" y1="20" x2="44" y2="-32" />
                      <line x1="-12" y1="28" x2="44" y2="-24" />
                      <line x1="-12" y1="36" x2="44" y2="-16" />
                    </g>
                  </g>
                </svg>
                <div className="text-center text-[7px] leading-tight text-white/85">
                  Create an issue{" "}
                  <span className="text-rose-200">in Linear</span>
                </div>
              </div>
            </div>
          </div>
          {/* Right tile — Add Linear issue modal */}
          <div
            aria-hidden
            className="relative aspect-[4/3] overflow-hidden rounded-lg p-3"
            style={{
              background:
                "linear-gradient(135deg, #C2410C 0%, #7C2D12 55%, #1f0f0a 100%)",
            }}
          >
            <div className="rounded-md bg-[#1a1c25] p-1.5 text-[6px] text-white/85 shadow-sm ring-1 ring-white/10">
              <div className="flex items-center justify-between border-b border-white/10 pb-1">
                <span className="font-semibold">▸ Add Linear issue</span>
                <span className="text-white/40">···</span>
              </div>
              <div className="mt-1 grid grid-cols-3 gap-1">
                <div className="col-span-1 space-y-0.5">
                  <div className="rounded bg-white/5 p-0.5">
                    <div className="text-white/50">Create new issue</div>
                    <div className="font-medium">Live editing bug</div>
                  </div>
                  <div className="rounded bg-white/5 p-0.5 text-white/50">
                    Team
                    <div className="text-white">Claap</div>
                  </div>
                  <div className="rounded bg-white/5 p-0.5 text-white/50">
                    Assignee
                    <div className="text-white">Search assignee</div>
                  </div>
                  <div className="rounded bg-white/5 p-0.5 text-white/50">
                    Labels (Optional)
                  </div>
                </div>
                <div className="col-span-2 space-y-0.5 rounded bg-white/5 p-1">
                  <div className="text-white/50">Title</div>
                  <div className="rounded bg-white/10 p-0.5">
                    Live editing bug
                  </div>
                  <div className="text-white/50">Description (Optional)</div>
                  <div className="rounded bg-white/10 p-0.5 leading-snug text-white/70">
                    Reference of this Claap version:
                  </div>
                  <div className="text-blue-300 underline">
                    https://app.claap.io/...
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[5px] text-white/50">
                    <span>+ Add Attachment</span>
                    <span className="rounded bg-rose-500 px-1 py-0.5 text-white">
                      Submit
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overview */}
        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            This integration lets you create Linear issues directly from Claap.
            Get your support team to report bugs with videos and annotations and
            create detailed Linear issues in seconds.
          </p>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-sm font-semibold">How it works</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Create Linear issues from Claap by using the 🔌 Integrations icon on
            a Claap video. A pop-up will appear to create the issue from Claap.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            Creating Linear issues from Claap is particularly useful for support
            teams reporting issues. It allows them to easily transform their
            screen recordings and annotations in Claap into Linear issues.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            The app will turn automatically the link into an embedded video so
            you can play it directly from the issue description.
          </p>
        </section>

        {/* Configure */}
        <section>
          <h2 className="text-sm font-semibold">Configure</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            If it&rsquo;s your first time using Linear with Claap, you will be
            prompted to authorize the integration. Follow the prompts to
            complete the authorization process.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            You can also configure this integration in{" "}
            <a
              href="https://app.claap.io/settings/integrations"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Claap Settings
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Descript — pre-installed Linear-built embed integration. Layout mirrors
// the production page: header + Built-by/Docs/Pre-installed rail, a tall
// blue hero with a mock Linear comment containing an embedded Descript
// video player, then short Overview / How it works / Configure prose.
// ---------------------------------------------------------------------------
function DescriptIntegrationDetail() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#2D7FF9]">
          <DescriptLogo className="size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">Descript</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Embed Descript share URLs in Linear issues and documents
          </p>
        </div>
      </header>

      {/* Body card */}
      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        {/* Built by / Docs / Pre-installed rail */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-8">
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Built by
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                Linear
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Docs
              </div>
              <a
                href="https://linear.app/docs/descript"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Descript integration docs (opens in new tab)"
                className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
              >
                <HugeiconsIcon icon={Book02Icon} className="size-3.5" />
                Docs
              </a>
            </div>
          </div>
          <span className="text-muted-foreground text-sm font-medium">
            Pre-installed
          </span>
        </div>

        {/* Hero */}
        <div
          aria-hidden
          className="relative aspect-[16/10] overflow-hidden rounded-lg p-6"
          style={{
            background:
              "linear-gradient(180deg, #2D7FF9 0%, #2563EB 60%, #1D4ED8 100%)",
          }}
        >
          {/* Background blobs */}
          <span className="absolute -top-6 -left-6 size-32 rounded-full bg-white/10" />
          <span className="absolute right-2 bottom-6 size-28 rounded-full bg-white/10" />
          <span className="absolute right-12 -bottom-2 size-20 rounded-full bg-white/10" />

          {/* Comment card */}
          <div className="relative mx-auto w-full max-w-md rounded-lg bg-[#1c1f24] p-3 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.45)] ring-1 ring-white/10">
            <div className="flex items-center gap-1.5 text-[10px] text-white/85">
              <span className="flex size-4 items-center justify-center rounded-full bg-emerald-500 text-[7px] font-semibold text-white">
                e
              </span>
              <span className="font-semibold">erin</span>
              <span className="text-white/45">15 minutes ago</span>
            </div>
            <div className="mt-1.5 text-[10px] text-white/85">
              I just had a call with one of our customers
            </div>
            {/* Embedded Descript video */}
            <div className="mt-2 overflow-hidden rounded-md ring-1 ring-white/10">
              <div
                className="relative flex aspect-video items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #232634 0%, #15171c 100%)",
                }}
              >
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 text-[7px] text-white/85">
                  <span className="flex size-3 items-center justify-center rounded-full bg-emerald-500 text-[6px] font-semibold text-white">
                    E
                  </span>
                  <div>
                    <div className="font-semibold">Feature demo</div>
                    <div className="text-white/50">By Erin Frey</div>
                    <div className="text-white/50">June 1, 2022</div>
                  </div>
                </div>
                {/* Icon grid */}
                <div className="grid grid-cols-6 gap-1">
                  <span className="size-3 rounded bg-rose-500/80" />
                  <span className="size-3 rounded bg-amber-400/80" />
                  <span className="size-3 rounded bg-emerald-500/80" />
                  <span className="size-3 rounded bg-teal-400/80" />
                  <span className="size-3 rounded bg-sky-400/80" />
                  <span className="size-3 rounded bg-rose-400/80" />
                  <span className="size-3 rounded bg-emerald-400/80" />
                  <span className="size-3 rounded bg-fuchsia-500/80" />
                  <span className="size-3 rounded bg-rose-500/80" />
                  <span className="size-3 rounded bg-amber-400/80" />
                  <span className="size-3 rounded bg-violet-500/80" />
                  <span className="size-3 rounded bg-rose-500/80" />
                </div>
                {/* Player controls */}
                <div className="absolute right-1.5 bottom-1.5 left-1.5 flex items-center justify-between text-[6px] text-white/70">
                  <div className="flex items-center gap-1">
                    <span>▶</span>
                    <span>🔊</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="rounded bg-white/10 px-0.5">CC</span>
                    <span>⛶</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-1 text-[8px] text-white/50">
              View on Descript
            </div>
            <div className="mt-1.5 flex items-center gap-1 text-[8px] text-white/50">
              <span className="rounded bg-white/10 px-1 py-0.5">👍 1</span>
              <span className="rounded bg-white/10 px-1 py-0.5">＠</span>
            </div>
          </div>
        </div>

        {/* Overview */}
        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            This integration embeds Descript share URLs into Linear issues,
            comments, and documents.
          </p>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-sm font-semibold">How it works</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Paste any Descript share link into Linear&apos;s Markdown editor.
            The app will turn the link into an embedded video automatically so
            that you can play it directly from the issue description, comment,
            or document.
          </p>
        </section>

        {/* Configure */}
        <section>
          <h2 className="text-sm font-semibold">Configure</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            None required. Descript links automatically embed in the text
            editor.
          </p>
        </section>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Loom — pre-installed Linear-built embed integration. Header + Built-by/Docs
// rail with Pre-installed pill, indigo hero with mock Linear comment containing
// an embedded Loom video player, then short Overview / How it works / Configure
// prose.
// ---------------------------------------------------------------------------
function LoomIntegrationDetail() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#625DF5]">
          <LoomLogo className="size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">Loom</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Embed Loom videos in Linear issues and documents
          </p>
        </div>
      </header>

      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-8">
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Built by
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                Linear
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Docs
              </div>
              <a
                href="https://linear.app/docs/loom"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Loom integration docs (opens in new tab)"
                className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
              >
                <HugeiconsIcon icon={Book02Icon} className="size-3.5" />
                Docs
              </a>
            </div>
          </div>
          <span className="text-muted-foreground text-sm font-medium">
            Pre-installed
          </span>
        </div>

        {/* Hero — purple gradient with diagonal light streaks and a Linear
            comment card containing an embedded Loom video tile. */}
        <div
          aria-hidden
          className="relative aspect-[16/10] overflow-hidden rounded-lg p-6"
          style={{
            background:
              "linear-gradient(135deg, #5852F2 0%, #625DF5 45%, #8B86F8 100%)",
          }}
        >
          <span className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,transparent_38%,rgba(255,255,255,0.18)_42%,transparent_46%,transparent_54%,rgba(255,255,255,0.12)_58%,transparent_62%)]" />

          <div className="relative mx-auto w-full max-w-md rounded-lg bg-[#1c1f24] p-3 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.45)] ring-1 ring-white/10">
            <div className="flex items-center gap-1.5 text-[10px] text-white/85">
              <span className="flex size-4 items-center justify-center rounded-full bg-emerald-500 text-[7px] font-semibold text-white">
                j
              </span>
              <span className="font-semibold">julian</span>
              <span className="text-white/45">15 minutes ago</span>
            </div>
            <div className="mt-1.5 text-[10px] text-white/85">
              Can you try this?
            </div>
            <div className="mt-2 overflow-hidden rounded-md ring-1 ring-white/10">
              <div
                className="relative flex aspect-video items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #2a2f3a 0%, #1a1c25 100%)",
                }}
              >
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 text-[7px] text-white/85">
                  <span className="flex size-3 items-center justify-center rounded-sm bg-rose-500 text-[6px] font-semibold text-white">
                    B
                  </span>
                  <span className="font-semibold">Bug recording</span>
                </div>
                <div className="absolute bottom-1.5 left-1.5 text-[7px] text-white/60">
                  ⏱ 3 min
                </div>
                <span className="flex size-7 items-center justify-center rounded-full bg-white/85 text-[10px] text-[#1c1f24]">
                  ▶
                </span>
              </div>
            </div>
            <div className="mt-1 text-[8px] text-white/50">View on Loom</div>
            <div className="mt-1.5 flex items-center gap-1 text-[8px] text-white/50">
              <span className="rounded bg-white/10 px-1 py-0.5">👍 1</span>
              <span className="rounded bg-emerald-500/30 px-1 py-0.5 text-emerald-200">
                ✓ 1
              </span>
              <span className="rounded bg-white/10 px-1 py-0.5">＠</span>
            </div>
          </div>
        </div>

        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            This integration embeds Loom videos into Linear issues, comments,
            and documents.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold">How it works</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Paste any Loom link into Linear&apos;s Markdown editor. The app will
            turn the link into an embedded video automatically so that you can
            play it directly from the issue description, comment, or document.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold">Configure</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            None required. Loom links automatically embed in the text editor.
          </p>
        </section>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Miro — third-party integration with Enable button. Header + Built-by/Website
// rail, two screenshot tiles (edit/create flow), then Overview / How it works /
// Security & Access / Availability / Configure prose.
// ---------------------------------------------------------------------------
function MiroIntegrationDetail() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#FFD02F]">
          <MiroLogo className="size-8" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">Miro</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Import, create and manage issues directly in Miro
          </p>
        </div>
      </header>

      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-8">
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Built by
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                Miro
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Website
              </div>
              <a
                href="https://miro.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Miro website (opens in new tab)"
                className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
              >
                <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
                miro.com
              </a>
            </div>
          </div>
          <Button
            size="sm"
            asChild
            aria-label="Enable Miro integration (opens in new tab)"
          >
            <a
              href="https://miro.com/marketplace/linear/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Enable
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
            </a>
          </Button>
        </div>

        {/* Twin screenshot tiles — left: editing a Linear ticket on a Miro
            board, right: creating a new ticket from a sticky note. */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            {
              title: "Edit Linear issues right on the board",
              header: "Edit Ticket",
            },
            {
              title: "Instantly transform ideas into new issues",
              header: "Add Ticket",
            },
          ].map((tile) => (
            <div
              key={tile.header}
              aria-hidden
              className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#F5F5F2] p-3"
            >
              <div className="flex items-center justify-center gap-1 text-[8px] font-semibold text-[#0b0b0f]">
                <MiroLogo className="size-3" />
                <span>miro</span>
                <span className="text-[#0b0b0f]/40">×</span>
                <span className="flex size-3 items-center justify-center rounded-sm bg-[#0b0b0f] text-[6px] text-white">
                  L
                </span>
                <span>Linear</span>
              </div>
              <div className="mt-1 text-center text-[7px] font-medium text-[#0b0b0f]">
                {tile.title}
              </div>
              <div className="mt-2 rounded-md bg-white p-1.5 text-[6px] shadow-sm ring-1 ring-black/5">
                <div className="flex items-center justify-between border-b border-black/5 pb-1 text-[#0b0b0f]">
                  <span className="font-semibold">{tile.header}</span>
                  <span className="text-[#0b0b0f]/40">···</span>
                </div>
                <div className="mt-1 grid grid-cols-2 gap-1">
                  <div className="space-y-0.5 text-[#0b0b0f]/60">
                    <div>Type</div>
                    <div>Priority</div>
                    <div>Reporter</div>
                    <div>Assignee</div>
                    <div>Status</div>
                    <div>Due</div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="rounded bg-amber-200/70 px-0.5 text-[#0b0b0f]">
                      Update user guides and technical
                      <br />
                      documentation
                    </div>
                    <div className="flex flex-wrap gap-0.5">
                      <span className="rounded bg-emerald-200 px-0.5 text-[#0b0b0f]">
                        ToDo
                      </span>
                      <span className="rounded bg-rose-200 px-0.5 text-[#0b0b0f]">
                        VPN-123
                      </span>
                      <span className="rounded bg-sky-200 px-0.5 text-[#0b0b0f]">
                        Trivial
                      </span>
                    </div>
                    <div className="text-[#0b0b0f]/70">
                      Enhance data transmission efficiency
                    </div>
                    <div className="flex flex-wrap gap-0.5">
                      <span className="rounded bg-emerald-200 px-0.5 text-[#0b0b0f]">
                        ToDo
                      </span>
                      <span className="rounded bg-rose-200 px-0.5 text-[#0b0b0f]">
                        VPN-122
                      </span>
                      <span className="rounded bg-sky-200 px-0.5 text-[#0b0b0f]">
                        Trivial
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-1 flex items-center gap-0.5 border-t border-black/5 pt-1 text-[#0b0b0f]/40">
                  <span>B</span>
                  <span>I</span>
                  <span>U</span>
                  <span>≡</span>
                  <span>≣</span>
                  <span>⌗</span>
                  <span>🔗</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            The Linear integration for Miro transforms how teams manage their
            workflows by connecting visual collaboration with project tracking.
            Import, view, and edit Linear issues directly within Miro boards
            without switching between tools, ensuring your workflows stay
            synchronized and teams remain productive.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold">How it works</h2>
          <h3 className="mt-2 text-sm font-medium">Issue Management in Miro</h3>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Discover and organize issues using the built-in ticket picker that
            lets you filter by assignee, project, or status before importing
            them into your Miro board. Once imported, edit issue details, update
            statuses, and create new issues directly from the board.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            Real-time synchronization ensures that any changes made in Linear
            are immediately reflected on your Miro board, maintaining
            consistency across your entire workflow. Action buttons provide
            quick shortcuts for common tasks, letting you open the issue picker
            or create new tickets with a single click.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold">Security &amp; Access</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Users authenticate with their Linear credentials to interact with
            the integration, ensuring secure access based on their existing
            permissions. Admin controls allow workspace administrators to manage
            access permissions and integration settings for their teams.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold">Availability</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            This integration is available for Miro Business and Enterprise plan
            customers. Teams can start using the integration immediately after
            connecting their Linear workspace to Miro.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold">Configure</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Connect your Linear workspace through Miro&apos;s integration
            settings or the{" "}
            <a
              href="https://miro.com/marketplace/linear/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              marketplace
            </a>
            . Once configured, team members can begin importing issues, creating
            action buttons, and managing their Linear workflow directly from
            Miro boards while maintaining full synchronization between both
            platforms.
          </p>
        </section>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Screenpresso — third-party Windows screen-capture utility. Header +
// Built-by/Website rail with Enable button, hero showing the Screenpresso
// "create Linear issue" dialog, then Overview / How it works / Configure prose.
// ---------------------------------------------------------------------------
function ScreenpressoIntegrationDetail() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#E0322B]">
          <ScreenpressoLogo className="size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">Screenpresso</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Effectively report an issue with embedded screenshots and videos
          </p>
        </div>
      </header>

      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-8">
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Built by
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                Learnpulse SAS
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Website
              </div>
              <a
                href="https://screenpresso.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Screenpresso website (opens in new tab)"
                className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
              >
                <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
                screenpresso.com
              </a>
            </div>
          </div>
          <Button
            size="sm"
            asChild
            aria-label="Enable Screenpresso integration (opens in new tab)"
          >
            <a
              href="https://www.screenpresso.com/download/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Enable
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
            </a>
          </Button>
        </div>

        {/* Hero — magenta-to-coral gradient with a mock Screenpresso capture
            tray on the left and the Linear issue dialog on the right. */}
        <div
          aria-hidden
          className="relative aspect-[16/10] overflow-hidden rounded-lg p-5"
          style={{
            background:
              "linear-gradient(120deg, #6D2FA9 0%, #C8389A 45%, #E85B7B 100%)",
          }}
        >
          <div className="flex h-full items-center justify-center gap-3">
            {/* Capture tray */}
            <div className="grid grid-cols-2 gap-1.5">
              {["08h03_44", "08h11_18", "08h16_22", "08h19_07"].map((stamp) => (
                <div
                  key={stamp}
                  className="flex aspect-[4/3] w-20 flex-col rounded-sm bg-white/90 p-1 ring-1 ring-black/5"
                >
                  <div className="flex-1 rounded-sm bg-gradient-to-br from-slate-200 to-slate-400" />
                  <div className="mt-0.5 truncate text-[5px] text-[#0b0b0f]">
                    2022-09-20_{stamp}.png
                  </div>
                </div>
              ))}
              <div className="col-span-2 mt-0.5 flex items-center justify-center gap-3 rounded-md bg-black/30 p-1">
                <span className="flex size-6 items-center justify-center rounded-full ring-2 ring-rose-400">
                  <span className="text-[10px]">📷</span>
                </span>
                <span className="flex size-6 items-center justify-center rounded-full ring-2 ring-rose-400">
                  <span className="text-[10px]">🎥</span>
                </span>
              </div>
            </div>

            {/* Linear issue dialog */}
            <div className="w-56 rounded-sm bg-[#f3f3f3] p-1.5 text-[6px] text-[#0b0b0f] shadow-lg ring-1 ring-black/10">
              <div className="flex items-center justify-between border-b border-black/10 pb-0.5">
                <span className="font-semibold">Linear</span>
                <span className="flex gap-0.5 text-[#0b0b0f]/50">
                  <span>—</span>
                  <span>▢</span>
                  <span>×</span>
                </span>
              </div>
              <div className="mt-1 grid grid-cols-2 gap-1">
                <label className="flex flex-col gap-0.5">
                  Title:
                  <input
                    readOnly
                    value="Bad color in main text"
                    className="rounded-sm border border-black/20 bg-white px-0.5 text-[5px] text-[#0b0b0f]"
                  />
                </label>
                <label className="flex flex-col gap-0.5">
                  Priority:
                  <input
                    readOnly
                    className="rounded-sm border border-black/20 bg-white px-0.5 text-[5px]"
                  />
                </label>
              </div>
              <div className="mt-1 flex flex-col gap-0.5">
                Description:
                <div className="h-10 rounded-sm border border-black/20 bg-white p-0.5 leading-tight">
                  Please check this issue:
                  <br />
                  2022-09-20_08h19_07.png
                  <br />
                  <br />
                  Thank you for your help.
                </div>
              </div>
              <div className="mt-1 grid grid-cols-2 gap-1">
                <label className="flex flex-col gap-0.5">
                  Team:
                  <input
                    readOnly
                    value="Learnpulse"
                    className="rounded-sm border border-black/20 bg-white px-0.5 text-[5px]"
                  />
                </label>
                <label className="flex flex-col gap-0.5">
                  Assignee:
                  <input
                    readOnly
                    className="rounded-sm border border-black/20 bg-white px-0.5 text-[5px]"
                  />
                </label>
              </div>
              <div className="mt-1">
                <div>Labels:</div>
                <div className="mt-0.5 grid grid-cols-3 gap-x-1 text-[5px]">
                  <label className="flex items-center gap-0.5">
                    <span className="size-1 border border-black/40" />
                    ScreenpressoCloud
                  </label>
                  <label className="flex items-center gap-0.5">
                    <span className="size-1 border border-black/40" />
                    To be reviewed
                  </label>
                  <label className="flex items-center gap-0.5">
                    <span className="size-1 border border-black/40" />
                    Improvement
                  </label>
                  <label className="flex items-center gap-0.5">
                    <span className="size-1 border border-black/40" />
                    Reviewed
                  </label>
                  <label className="flex items-center gap-0.5">
                    <span className="size-1 border border-black/40" />
                    Invalid
                  </label>
                  <label className="flex items-center gap-0.5">
                    <span className="size-1 border border-black/40" />
                    Feature
                  </label>
                  <label className="flex items-center gap-0.5">
                    <span className="size-1 border border-black/40" />
                    Study
                  </label>
                  <label className="flex items-center gap-0.5">
                    <span className="size-1 border border-black/40" />
                    WinForms
                  </label>
                  <label className="flex items-center gap-0.5 rounded-sm bg-sky-300/80 px-0.5">
                    <span className="size-1 border border-black/60 bg-white" />
                    Bug
                  </label>
                  <label className="flex items-center gap-0.5">
                    <span className="size-1 border border-black/40" />
                    Website
                  </label>
                  <label className="flex items-center gap-0.5">
                    <span className="size-1 border border-black/40" />
                    WPF
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Using Screenpresso, you can take screenshots and annotate them, or
            record videos with the Webcam, then quickly create Linear issues
            with these captures embedded.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold">How it works</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Screenpresso is the best screen capture for Microsoft Windows. You
            can capture high quality images then annotate them using beautiful
            and useful drawing tools. You can also capture high resolution
            videos with the audio, webcam and zoom on specific areas.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            Once this is done, simply click on the{" "}
            <span className="font-semibold">Publish</span> button to create
            Linear issues. In the description field you can embed these captures
            at the right position.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold">Configure</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Download Screenpresso from the official site:
          </p>
          <p className="mt-2 text-sm leading-6">
            <a
              href="https://www.screenpresso.com/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              https://www.screenpresso.com/download/
            </a>
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            Run the exe. It does not require to be installed and does not
            require administrator privileges.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            Open the settings and link your Linear account with Screenpresso.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            More details in this short{" "}
            <a
              href="https://www.youtube.com/results?search_query=screenpresso+linear"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Youtube demonstration.
            </a>
          </p>
        </section>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tella — third-party screen-recorder embed integration. Header +
// Built-by/Website rail with Enable button, indigo hero with side-by-side
// screenshots of the Tella editor and a desktop-with-comments capture, then
// the multi-paragraph How it works prose from the production page.
// ---------------------------------------------------------------------------
function TellaIntegrationDetail() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#5B4DFF]">
          <TellaLogo className="size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">Tella</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Embed Tella videos in Linear
          </p>
        </div>
      </header>

      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-8">
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Built by
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                Tella
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Website
              </div>
              <a
                href="https://tella.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Tella website (opens in new tab)"
                className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
              >
                <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
                tella.com
              </a>
            </div>
          </div>
          <Button
            size="sm"
            asChild
            aria-label="Enable Tella integration (opens in new tab)"
          >
            <a
              href="https://tella.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Enable
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
            </a>
          </Button>
        </div>

        {/* Hero — indigo backdrop with caption banner and overlapping
            screenshots: Tella editor on the left, desktop-with-comments
            capture on the right. */}
        <div
          aria-hidden
          className="relative aspect-[16/10] overflow-hidden rounded-lg p-5"
          style={{
            background:
              "linear-gradient(180deg, #4F46E5 0%, #5B4DFF 55%, #6F4DFF 100%)",
          }}
        >
          <div className="text-center text-[11px] font-semibold text-white">
            Embed videos into issues and comments
          </div>

          <div className="relative mt-3 flex items-end justify-center gap-2">
            {/* Left: Tella editor screenshot */}
            <div className="relative w-1/2 overflow-hidden rounded-md ring-1 ring-white/10">
              <div
                className="aspect-video"
                style={{
                  background:
                    "linear-gradient(135deg, #6B5BFF 0%, #4F46E5 60%, #1E1B4B 100%)",
                }}
              >
                <div className="flex items-center justify-between px-1.5 pt-1 text-[5px] text-white/85">
                  <div className="flex items-center gap-0.5">
                    <span className="font-semibold">TELLA</span>
                    <span className="text-white/40">›</span>
                    <span className="rounded-sm bg-white/10 px-0.5">
                      Template
                    </span>
                  </div>
                  <span className="rounded-sm bg-white/10 px-0.5">Sign up</span>
                </div>
                <div className="px-1.5 pt-1 text-[5px] text-white/85">
                  Website bug
                </div>
                <div className="px-1.5 text-[4px] text-white/70">
                  Here&apos;s a quick reproduction:
                </div>
                <div className="mt-1 px-1.5 text-[4px] text-white/60">
                  Minor bug found while checking screen features ⓘ
                </div>
                <div className="mt-1 grid grid-cols-2 gap-1 px-1.5">
                  <div className="space-y-0.5">
                    <div className="rounded-sm bg-white/10 p-0.5">
                      <div className="font-semibold text-white">
                        Grant Shaddick
                      </div>
                      <div className="text-white/60">Log in</div>
                    </div>
                    <div className="text-[8px] leading-tight font-bold text-white">
                      ecord
                      <br />
                      ble videos
                    </div>
                    <div className="text-[4px] text-white/70">
                      een recorder that edits
                      <br />
                      eos for you.
                    </div>
                    <div className="rounded-sm bg-white/15 px-0.5 py-0.5 text-[4px] text-white">
                      Get started
                    </div>
                  </div>
                  <div className="space-y-0.5 rounded-sm bg-white/5 p-0.5 text-[3px] text-white/60">
                    <div>{"<div class='hero'>"}</div>
                    <div>{"<h1>Record</h1>"}</div>
                    <div>{"<p>screen + cam</p>"}</div>
                    <div>{"<button/>"}</div>
                    <div>{"</div>"}</div>
                    <div>{"<style>"}</div>
                    <div>{"  body {bg:#fff}"}</div>
                    <div>{"</style>"}</div>
                  </div>
                </div>
                {/* Bug callout */}
                <div className="absolute right-12 bottom-3 rounded-sm bg-[#0b0b0f] px-1 py-0.5 text-[5px] text-white">
                  bug here.
                </div>
                {/* Player chrome */}
                <div className="absolute right-1.5 bottom-1.5 left-1.5 flex items-center gap-1 text-[5px] text-white/85">
                  <span>▶</span>
                  <div className="h-0.5 flex-1 rounded-full bg-white/15">
                    <span className="block h-full w-1/4 rounded-full bg-white" />
                  </div>
                  <span>00:02 / 00:13</span>
                  <span className="rounded-sm bg-white/15 px-0.5">1.3×</span>
                </div>
              </div>
            </div>

            {/* Right: desktop-with-comments capture, slightly above the left */}
            <div className="absolute top-3 right-4 w-[58%] -translate-y-1 overflow-hidden rounded-md shadow-[0_25px_45px_-15px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
              <div
                className="aspect-video"
                style={{
                  background:
                    "linear-gradient(135deg, #1f1f2b 0%, #281f33 50%, #b14a2a 100%)",
                }}
              >
                <div className="absolute top-1 left-2 rounded bg-[#0b0b0f]/80 px-1 py-0.5 text-[5px] text-white">
                  <div className="flex items-center gap-0.5">
                    <span className="flex size-1.5 items-center justify-center rounded-full bg-emerald-400 text-[3px] text-[#0b0b0f]">
                      G
                    </span>
                    <span className="font-semibold">Grant</span>
                    <span className="text-white/50">just now</span>
                  </div>
                  <div className="text-[4px] text-white/85">
                    Design walkthrough:
                  </div>
                </div>
                {/* Pseudo desktop windows */}
                <div className="absolute top-3.5 left-4 grid grid-cols-3 gap-0.5">
                  <div className="aspect-[3/4] w-8 rounded-sm bg-white/10 p-0.5">
                    <div className="space-y-0.5">
                      <div className="h-px bg-white/40" />
                      <div className="h-px bg-white/30" />
                      <div className="h-px bg-white/30" />
                      <div className="h-px bg-white/30" />
                    </div>
                  </div>
                  <div className="aspect-[3/4] w-8 rounded-sm bg-white/10 p-0.5">
                    <div className="space-y-0.5">
                      <div className="h-px bg-white/40" />
                      <div className="h-px bg-white/30" />
                      <div className="h-px bg-white/30" />
                    </div>
                  </div>
                  <div className="aspect-[3/4] w-8 rounded-sm bg-white/10 p-0.5">
                    <div className="space-y-0.5 text-[3px] text-white/85">
                      <div className="h-1 bg-emerald-400/70" />
                      <div className="h-1 bg-rose-400/70" />
                      <div className="h-1 bg-sky-400/70" />
                    </div>
                  </div>
                </div>
                {/* Webcam bubble */}
                <div className="absolute right-1 bottom-3 size-7 overflow-hidden rounded-full bg-gradient-to-br from-amber-200 to-amber-500 ring-2 ring-white/20" />
                {/* Caption banner */}
                <div className="absolute bottom-1 left-1 rounded bg-[#0b0b0f]/85 px-1 py-0.5 text-[5px] text-white">
                  And then at the bottom you{" "}
                  <span className="text-white/60">can see we&apos;ve</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Tella videos now embed in Linear, so you can paste a link and
            instantly share screen recordings, walkthroughs, or demos right
            where your team works. It makes bug reports clearer, async updates
            more personal, and keeps context visible without switching apps.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold">How it works</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            When you paste a Tella video link into Linear, it automatically
            embeds and displays a playable preview. This works in issue
            descriptions, comments, and project documents - anywhere you&apos;d
            normally share a link. Your team can watch videos inline without
            leaving Linear, keeping all the context in one place.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            This makes it easy to share bug reproductions, feature demos, design
            walkthroughs, or quick async updates with your team.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            To use the integration, simply copy the share link from any Tella
            video and paste it into Linear and select the embed option. The
            embed appears automatically, no configuration or authentication
            required. Videos remain linked to the original Tella recording, so
            if you update the video in Tella, the embedded version in Linear
            stays current.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold">Configure</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            No configuration is required. The Tella integration is available to
            all Linear users by default - just paste a Tella link and it embeds
            automatically.
          </p>
        </section>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// YouTube — pre-installed Linear-built embed integration. Header +
// Built-by/Docs rail with Pre-installed pill, dark hero with red ribbon
// shapes and a Linear comment containing an embedded YouTube player, then
// short Overview / How it works / Configure prose.
// ---------------------------------------------------------------------------
function YouTubeIntegrationDetail() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#1f1f23]">
          <YouTubeLogo className="size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">YouTube</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Embed YouTube videos in Linear issues and documents
          </p>
        </div>
      </header>

      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-8">
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Built by
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                Linear
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Docs
              </div>
              <a
                href="https://linear.app/docs/youtube"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube integration docs (opens in new tab)"
                className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
              >
                <HugeiconsIcon icon={Book02Icon} className="size-3.5" />
                Docs
              </a>
            </div>
          </div>
          <span className="text-muted-foreground text-sm font-medium">
            Pre-installed
          </span>
        </div>

        {/* Hero — dark backdrop with red abstract ribbon shapes and a Linear
            comment containing an embedded YouTube player. */}
        <div
          aria-hidden
          className="relative aspect-[16/10] overflow-hidden rounded-lg p-6"
          style={{
            background:
              "linear-gradient(135deg, #1a1a1a 0%, #232323 60%, #2c2c2c 100%)",
          }}
        >
          {/* Red ribbon blobs */}
          <span className="absolute top-1/2 -left-12 size-56 -translate-y-1/2 rounded-full bg-[#FF3B30]/80 blur-xl" />
          <span className="absolute -top-8 -right-12 size-48 rounded-full bg-white/10 blur-md" />
          <span className="absolute right-12 -bottom-10 size-40 rounded-full bg-[#FF3B30]/40 blur-lg" />

          {/* Linear comment card */}
          <div className="relative mx-auto w-full max-w-md rounded-lg bg-[#1c1f24] p-3 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.55)] ring-1 ring-white/10">
            <div className="flex items-center gap-1.5 text-[10px] text-white/85">
              <span className="flex size-4 items-center justify-center rounded-full bg-emerald-500 text-[7px] font-semibold text-white">
                q
              </span>
              <span className="font-semibold">quinn</span>
              <span className="text-white/45">15 minutes ago</span>
            </div>
            <div className="mt-1.5 text-[10px] text-white/85">
              <span className="text-blue-400">@erin</span> Take a look at this!
            </div>
            <div className="mt-2 overflow-hidden rounded-md ring-1 ring-white/10">
              <div
                className="relative flex aspect-video items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #15171c 0%, #1f2329 100%)",
                }}
              >
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 text-[7px] text-white/85">
                  <span className="flex size-3 items-center justify-center rounded-sm bg-amber-400 text-[6px] font-semibold text-[#0b0b0f]">
                    L
                  </span>
                  <span className="font-semibold">
                    How to create custom views in Linear
                  </span>
                </div>
                <div className="absolute top-1.5 right-1.5 rounded bg-white/10 px-0.5 text-[6px] text-white/85">
                  Save this view ⌥V
                </div>
                {/* Editor hints + play button */}
                <div className="absolute bottom-2 left-1.5 flex items-center gap-1 text-[7px] text-white/60">
                  <span>+</span>
                  <span>···</span>
                  <span className="flex items-center gap-0.5 rounded bg-white/10 px-0.5">
                    <span className="size-1 rounded-full bg-amber-400" />
                    Progress
                  </span>
                  <span>0</span>
                </div>
                <span className="flex size-7 items-center justify-center rounded-full bg-[#FF0000] text-[10px] text-white">
                  ▶
                </span>
                <div className="absolute right-2 bottom-2 text-[7px] text-white/60">
                  +
                </div>
                {/* Pseudo person row */}
                <div className="absolute bottom-6 left-2 flex items-center gap-0.5 text-[6px] text-white/70">
                  <span className="size-2 rounded-full bg-rose-400" />
                  <span>ed Einstein</span>
                </div>
                {/* Watch on YouTube chip */}
                <div className="absolute bottom-1 left-1 flex items-center gap-0.5 rounded bg-black/70 px-1 py-0.5 text-[6px] text-white">
                  Watch on
                  <span className="flex items-center gap-0.5">
                    <span className="flex size-2 items-center justify-center rounded-sm bg-[#FF0000]">
                      <span className="text-[4px] text-white">▶</span>
                    </span>
                    YouTube
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-1 text-[8px] text-white/50">View on YouTube</div>
            <div className="mt-1.5 flex items-center gap-1 text-[8px] text-white/50">
              <span className="rounded bg-white/10 px-1 py-0.5">👍 1</span>
              <span className="rounded bg-white/10 px-1 py-0.5">＠</span>
            </div>
          </div>
        </div>

        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            This integration embeds YouTube videos into Linear issues, comments,
            and documents.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold">How it works</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Paste any YouTube link into Linear&apos;s Markdown editor. The app
            will turn the link into an embedded video automatically so that you
            can play it directly from the issue description, comment, or
            document.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold">Configure</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            None required. YouTube links automatically embed in the text editor.
          </p>
        </section>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Airbyte — Linear-built ELT connector. Header + Built-by/Docs rail with
// Enable button, two screenshot tiles for Source setup and Destination
// selection on a magenta-to-blue gradient, then Overview / How it works /
// Configure prose.
// ---------------------------------------------------------------------------
function AirbyteIntegrationDetail() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#6E4FF6]">
          <AirbyteLogo className="size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">Airbyte</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Connect Linear to Airbyte and consolidate data in data warehouses,
            lakes, and databases
          </p>
        </div>
      </header>

      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-8">
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Built by
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                Linear
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Docs
              </div>
              <a
                href="https://linear.app/docs/airbyte"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Airbyte integration docs (opens in new tab)"
                className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
              >
                <HugeiconsIcon icon={Book02Icon} className="size-3.5" />
                Docs
              </a>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => toast.info("Airbyte OAuth connect flow coming soon")}
            aria-label="Enable Airbyte integration"
          >
            <HugeiconsIcon icon={PuzzleIcon} className="size-3.5" />
            Enable
          </Button>
        </div>

        {/* Twin screenshot tiles — left: "Set up the source" wizard with
            Linear chosen as source, right: "New destination" picker with a
            stack of supported warehouses. Both sit on a magenta-to-blue
            gradient like the Linear marketing screenshots. */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            {
              title: "Set up the source",
              right: false,
              steps: [
                { label: "Create a source", active: true },
                { label: "Create a destination" },
                { label: "Set up connection" },
              ],
              fields: [
                { label: "Source type", value: "Linear" },
                {
                  label:
                    "Name * — Pick a name to help you identify this source",
                  value: "Linear",
                },
                {
                  label: "Airbyte Integration API Key * —",
                  value: "•••••••••••••••••••••••",
                },
              ],
              cta: "Set up source",
            },
            {
              title: "Set up the destination",
              right: true,
              steps: [],
              destinations: [
                { name: "BigQuery", color: "bg-rose-400", letter: "B" },
                { name: "Snowflake", color: "bg-sky-400", letter: "❄" },
                { name: "E2E Testing", color: "bg-violet-400", letter: "E" },
                { name: "S3", color: "bg-orange-400", letter: "S" },
                { name: "Scylla", color: "bg-blue-400", letter: "S" },
                {
                  name: "BigQuery (denormalized typed struct)",
                  color: "bg-rose-400",
                  letter: "B",
                  beta: true,
                },
                {
                  name: "Google Cloud Storage (GCS)",
                  color: "bg-amber-400",
                  letter: "G",
                  beta: true,
                },
                { name: "+ Request a new connector" },
              ],
            },
          ].map((tile) => (
            <div
              key={tile.title}
              aria-hidden
              className="relative aspect-[4/3] overflow-hidden rounded-lg p-3"
              style={{
                background:
                  "linear-gradient(135deg, #1d4ed8 0%, #6E4FF6 45%, #ec4899 100%)",
              }}
            >
              <div className="rounded-md bg-white p-1.5 text-[6px] text-neutral-700 shadow-md ring-1 ring-black/5">
                {/* Step rail or destination header */}
                {!tile.right ? (
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-1">
                    <div className="flex items-center gap-0.5 font-semibold text-neutral-900">
                      <AirbyteLogoMini />
                      <span>New connection</span>
                    </div>
                    <div className="flex items-center gap-1 text-[5px] text-neutral-500">
                      {tile.steps?.map((s) => (
                        <span
                          key={s.label}
                          className={
                            s.active
                              ? "rounded bg-blue-100 px-0.5 font-medium text-blue-700"
                              : ""
                          }
                        >
                          {s.label}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-1">
                    <div className="flex items-center gap-0.5 font-semibold text-neutral-900">
                      <AirbyteLogoMini />
                      <span>New destination</span>
                    </div>
                  </div>
                )}

                {/* Body */}
                {!tile.right ? (
                  <div className="mt-1.5 grid grid-cols-[44px_1fr] gap-1.5">
                    <div className="space-y-0.5 text-[5px] text-neutral-500">
                      <div className="rounded bg-blue-50 px-0.5 py-px font-medium text-blue-700">
                        ⚡ Connections
                      </div>
                      <div className="px-0.5">⚡ Sources</div>
                      <div className="px-0.5">⚡ Destinations</div>
                      <div className="mt-1 px-0.5">⚙ Update</div>
                      <div className="px-0.5">📚 Resources</div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[6px] font-semibold text-neutral-900">
                        Set up the source
                      </div>
                      {tile.fields?.map((f) => (
                        <div key={f.label} className="space-y-px">
                          <div className="text-[5px] text-neutral-500">
                            {f.label}
                          </div>
                          <div className="rounded border border-neutral-200 px-0.5 py-px text-[5px] text-neutral-800">
                            {f.value}
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-end pt-1">
                        <span className="rounded bg-blue-600 px-1 py-px text-[5px] font-semibold tracking-wide text-white uppercase">
                          {tile.cta}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1.5 space-y-0.5">
                    <div className="text-[5px] text-neutral-500">
                      Destination type
                    </div>
                    <div className="rounded border border-neutral-200 px-0.5 py-px text-[5px] text-neutral-500">
                      Type to search for a connector
                    </div>
                    <div className="space-y-0.5 pt-0.5">
                      {tile.destinations?.map((d) => (
                        <div
                          key={d.name}
                          className="flex items-center gap-1 rounded px-0.5 py-px text-[5px] text-neutral-800 hover:bg-neutral-50"
                        >
                          {d.color && (
                            <span
                              className={`flex size-2 items-center justify-center rounded-sm ${d.color} text-[4px] font-semibold text-white`}
                            >
                              {d.letter}
                            </span>
                          )}
                          <span className="flex-1 truncate">{d.name}</span>
                          {d.beta && (
                            <span className="rounded bg-amber-100 px-0.5 text-[4px] font-semibold tracking-wide text-amber-700 uppercase">
                              Beta
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            With the Airbyte integration you can connect your Linear data into
            any data warehouse, lakes, or databases in minutes. Create custom
            analytics and dashboards for your company and update it on any
            schedule through Airbyte.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold">How it works</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Airbyte allows you to connect Linear as a source to link with a
            destination such as Snowflake, MongoDB, BigQuery, and more. Once
            connected, you can choose how often it syncs, which data streams to
            pull from Linear, and easily remove, pause or set up new
            destinations at any time.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold">Configure</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Go to{" "}
            <Link
              href="/settings?section=api"
              scroll={false}
              className="text-blue-500 hover:underline"
            >
              settings
            </Link>{" "}
            to generate your Linear workspace API key to set up Airbyte and
            follow the detailed steps in the{" "}
            <a
              href="https://docs.airbyte.com/integrations/sources/linear"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              documentation
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Retool — third-party low-code platform. Header + Built-by/Website rail with
// Enable button, twin screenshot tiles on a violet card showing the
// "Incidents" Retool app and a "Use Linear as a resource" config panel, then
// Overview / How it works / Configure prose with bulleted examples and an
// API/OAuth setup outline.
// ---------------------------------------------------------------------------
function RetoolIntegrationDetail() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#1f1f1f]">
          <RetoolLogo className="size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">Retool</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Create, update, and analyze Linear issues in custom internal tools
          </p>
        </div>
      </header>

      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-8">
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Built by
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                Retool
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Website
              </div>
              <a
                href="https://retool.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Retool website (opens in new tab)"
                className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
              >
                <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
                retool.com
              </a>
            </div>
          </div>
          <Button
            size="sm"
            asChild
            aria-label="Enable Retool integration (opens in new tab)"
          >
            <a
              href="https://retool.com/integrations/linear"
              target="_blank"
              rel="noopener noreferrer"
            >
              Enable
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
            </a>
          </Button>
        </div>

        {/* Twin tiles — left: an "Incidents > INC-150" Retool app mock,
            right: the "Use Linear as a resource in Retool" config panel.
            Both sit on a violet panel like the production marketing
            screenshots. */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div
            aria-hidden
            className="relative aspect-[4/3] overflow-hidden rounded-lg p-3"
            style={{
              background:
                "linear-gradient(135deg, #6E59E0 0%, #5E4ED9 60%, #4A3CB7 100%)",
            }}
          >
            <div className="text-center text-[8px] font-semibold text-white">
              Create and update
              <br />
              Linear issues from
              <br />
              your Retool app
            </div>
            <div className="mt-2 rounded-md bg-[#0f1014] p-1.5 text-[5px] text-white/85 ring-1 ring-white/10">
              <div className="flex items-center justify-between border-b border-white/10 pb-0.5">
                <span className="font-semibold">Incidents › INC-150 ⛚</span>
              </div>
              <div className="mt-1 font-semibold text-white">
                New incident 150—created from Retool
              </div>
              <div className="mt-1 space-y-0.5 text-white/80">
                <div className="flex items-center gap-0.5">
                  <span className="size-1 rounded-sm bg-sky-400" />
                  <span>Google Doc</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <span className="size-1 rounded-sm bg-emerald-400" />
                  <span>PagerDuty incident created</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <span className="size-1 rounded-sm bg-rose-400" />
                  <span>New row added to incidents table in DB</span>
                </div>
                <div className="text-white/40">+ Sub-issues (4)</div>
              </div>
              <div className="mt-1.5 border-t border-white/10 pt-1">
                <div className="font-semibold">Activity</div>
                <div className="mt-0.5 flex items-start gap-0.5 text-white/70">
                  <span className="size-1.5 rounded-full bg-amber-400" />
                  <span>
                    <span className="text-white/85">natemei</span> created the
                    issue · less than a minute ago
                  </span>
                </div>
                <div className="mt-0.5 flex items-start gap-0.5 text-white/70">
                  <span className="size-1.5 rounded-full bg-amber-400" />
                  <span>
                    <span className="text-white/85">natemei</span> added label{" "}
                    <span className="rounded bg-rose-500/30 px-0.5 text-rose-200">
                      regression-metrics-v/x
                    </span>{" "}
                    · less than a minute ago
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div
            aria-hidden
            className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#E8E5FB] p-3"
          >
            <div className="text-center text-[8px] font-semibold text-[#0b0b0f]">
              Use Linear as a
              <br />
              resource in Retool
            </div>
            <div className="mt-2 rounded-md bg-white p-1.5 text-[5px] text-neutral-700 shadow-sm ring-1 ring-black/5">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-0.5">
                <span className="font-semibold text-neutral-900">Linear</span>
                <span className="text-neutral-400">···</span>
              </div>
              <div className="mt-1 space-y-0.5">
                <div className="text-neutral-500">* Name</div>
                <div className="rounded border border-neutral-200 px-0.5 text-neutral-400">
                  The name for this resource when creating queries in the Retool
                  editor
                </div>
                <div className="text-neutral-400">GENERAL</div>
                <div className="text-neutral-500">Base URL</div>
                <div className="rounded border border-neutral-200 px-0.5 text-neutral-700">
                  https://api.linear.app/graphql
                </div>
                <div className="text-neutral-400">
                  (Use the absolute URL, e.g. https://example.com)
                </div>
                <div className="text-neutral-500">URL parameters</div>
                <div className="text-blue-600 underline">+ Add new</div>
                <div className="text-neutral-500">HEADERS</div>
                <div className="grid grid-cols-2 gap-0.5">
                  <div className="rounded border border-neutral-200 px-0.5 text-neutral-700">
                    Authorization
                  </div>
                  <div className="rounded border border-neutral-200 px-0.5 text-neutral-700">
                    Bearer OAUTH_TOKEN
                  </div>
                </div>
                <div className="text-blue-600 underline">+ Add new</div>
              </div>
            </div>
          </div>
        </div>

        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Retool is the fast way to build custom internal tools. Stop jumping
            between multiple SaaS apps to get your work done—build your full
            workflow into a single app by combining other data sources and APIs
            with Linear using Retool. For example, you can respond faster to
            engineering incidents with a custom Retool app that adds a new row
            in your incidents table within your database, kicks off a PagerDuty
            incident, and creates a new Linear ticket for proper tracking.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold">How it works</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Retool&rsquo;s integration puts the full power of{" "}
            <a
              href="https://developers.linear.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Linear&rsquo;s API
            </a>{" "}
            at your fingertips—on your team&rsquo;s terms. Set up Linear as a
            Retool resource connection with a single shared API key or use OAuth
            to ensure every user inherits their Linear permissions.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            When building a Retool app, simply connect to Linear using the
            GraphQL API. Then, customize the Retool app to accomplish any
            workflow that needs to leverage Linear.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            Examples of what you can do:
          </p>
          <ul className="text-muted-foreground mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6">
            <li>
              Create Linear issues with context from other systems and details
            </li>
            <li>
              Report on Linear issues over time with a Retool dashboard app
            </li>
            <li>
              Update existing Linear issues alongside your customer support
              tooling
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-semibold">Configure</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Follow the steps outlined in{" "}
            <a
              href="https://docs.retool.com/data-sources/quickstarts/api/linear"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Retool&rsquo;s documentation
            </a>{" "}
            to configure a Linear resource in your Retool account.
          </p>
          <ul className="text-muted-foreground mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6">
            <li>
              To use API key authentication go to{" "}
              <span className="italic">
                Linear &gt; Account Menu &gt; Settings &gt; API &gt; Personal
                API Keys
              </span>{" "}
              and create a key for Retool.
            </li>
            <li>
              To use OAuth authentication go to{" "}
              <span className="italic">
                Linear &gt; Account Menu &gt; Settings &gt; API &gt; Your
                Applications
              </span>{" "}
              and create an OAuth2 application for Retool.
            </li>
          </ul>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            Once the resource is created, any users with Retool permissions will
            be able to query Linear.
          </p>
        </section>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Span — third-party developer-intelligence platform. Header + Built-by /
// Website rail with Enable button, twin marketing tiles on a warm beige
// background (left: API-key Connect dialog, right: a "where your time goes"
// percentage breakdown), then Overview / How it works / Configure prose.
// ---------------------------------------------------------------------------
function SpanIntegrationDetail() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white">
          <SpanLogo className="size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">Span</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            See how work translates into engineering impact
          </p>
        </div>
      </header>

      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-8">
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Built by
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                Span
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Website
              </div>
              <a
                href="https://span.app"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Span website (opens in new tab)"
                className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
              >
                <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
                span.app
              </a>
            </div>
          </div>
          <Button
            size="sm"
            asChild
            aria-label="Enable Span integration (opens in new tab)"
          >
            <a
              href="https://span.app/integrations/linear"
              target="_blank"
              rel="noopener noreferrer"
            >
              Enable
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
            </a>
          </Button>
        </div>

        {/* Twin marketing tiles on a warm beige background. Left: a tiny
            "Connect" dialog showing Linear ↔ Span with an API key field.
            Right: a percentage chart breakdown of where time really goes. */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div
            aria-hidden
            className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#F4EEE2] p-3"
          >
            <div className="text-center text-[8px] font-semibold text-[#0b0b0f]">
              Connect Linear to Span&rsquo;s
              <br />
              developer intelligence platform
            </div>
            <div className="absolute right-3 bottom-3 left-3 rounded-md bg-white p-1.5 text-[5px] text-neutral-700 shadow-sm ring-1 ring-black/5">
              <div className="flex items-center justify-center gap-1">
                <span className="grid size-3 place-items-center rounded-sm bg-[#5E5BFF] text-[5px] font-bold text-white">
                  L
                </span>
                <span className="text-neutral-400">⇆</span>
                <span className="grid size-3 place-items-center rounded-sm bg-[#0b0b0f] text-[5px] font-bold text-white">
                  ∧
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1 rounded border border-neutral-200 bg-neutral-50 px-1 py-0.5">
                <span className="grid size-2 place-items-center rounded-sm bg-[#5E5BFF] text-[4px] font-bold text-white">
                  L
                </span>
                <span className="font-medium text-neutral-900">Linear</span>
              </div>
              <div className="mt-1 text-neutral-500">API Key</div>
              <div className="mt-0.5 rounded border border-neutral-200 px-1 py-0.5 text-neutral-700">
                ••••••••••••••••••••• ⓘ
              </div>
              <div className="mt-1 rounded bg-blue-600 py-0.5 text-center text-[5px] font-semibold tracking-wide text-white uppercase">
                Connect
              </div>
            </div>
          </div>

          <div
            aria-hidden
            className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#F4EEE2] p-3"
          >
            <div className="text-center text-[8px] font-semibold text-[#0b0b0f]">
              See where your time
              <br />
              really goes…
            </div>
            <div className="mt-2 rounded-md bg-white p-1.5 text-[5px] text-neutral-700 shadow-sm ring-1 ring-black/5">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-0.5">
                <span className="font-semibold text-neutral-900">
                  Maintenance
                </span>
              </div>
              <div className="mt-1 grid grid-cols-[40px_1fr] gap-1">
                <div className="space-y-0.5 text-neutral-500">
                  <div className="rounded bg-neutral-100 px-0.5">
                    Workstreams
                  </div>
                  <div className="rounded bg-neutral-50 px-0.5 font-medium text-neutral-900">
                    Work Type
                  </div>
                  <div className="rounded bg-neutral-50 px-0.5">
                    New features
                  </div>
                </div>
                <div className="space-y-0.5">
                  <div>
                    <span className="text-[7px] font-bold text-neutral-900">
                      32.3%
                    </span>{" "}
                    <span className="text-neutral-500">/of total work</span>
                  </div>
                  <div className="space-y-0.5">
                    {[
                      { color: "bg-rose-700", name: "Performance", pct: "52%" },
                      { color: "bg-rose-400", name: "Bug Fix", pct: "18%" },
                      {
                        color: "bg-amber-300",
                        name: "Infrastructure",
                        pct: "15%",
                      },
                    ].map((row) => (
                      <div key={row.name} className="flex items-center gap-1">
                        <span className={`size-1 rounded-sm ${row.color}`} />
                        <span className="flex-1 truncate text-neutral-800">
                          {row.name}
                        </span>
                        <span className="text-neutral-500">{row.pct}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            See how planned work translates into real engineering impact.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            The Span + Linear integration brings your project data into Span,
            giving you a clear view of how planned work moves through
            development. By connecting your Linear workspace, you can see how
            issues, projects, and milestones translate into code activity and
            delivery outcomes. This unified view helps teams spot bottlenecks,
            track progress against plans, and measure real engineering impact.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold">How it works</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            The integration syncs project and issue data from Linear with
            Span&rsquo;s developer intelligence platform. It allows you to see
            how initiatives, projects, milestones, and issues move through your
            development lifecycle and how they relate to engineering activity
            and impact.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            Once connected, you can:
          </p>
          <ul className="text-muted-foreground mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6">
            <li>
              Track high-priority delivery. Verify that urgent or
              customer-critical issues in Linear turn into pull requests and
              merges within expected timeframes.
            </li>
            <li>
              Compare plans to execution. Overlay Linear project milestones with
              actual PR activity to spot delays, scope changes, or last-minute
              delivery spikes.
            </li>
            <li>
              Measure issue-to-code cycle time. See how long it takes work to
              move from issue creation in Linear to code merged in production.
            </li>
            <li>
              Quantify investment by initiative. Group Linear issues by roadmap
              theme and see where engineering time and effort are really going.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-semibold">Configure</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Span admins set up the integration by adding a Linear API key in
            Span&rsquo;s settings. Once authenticated, it verifies access to
            your Linear organization and begins syncing five data streams:
            initiatives, issues, projects, milestones, and users. The data is
            made available alongside other sources such as GitHub and calendar
            data for cross-platform analytics.
          </p>
        </section>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Jellyfish — third-party engineering insights platform (BUILT BY Jellyfish,
// WEBSITE jellyfish.co, external Enable). Body card has two purple-gradient
// tiles for the marketing visuals (PR cycle chart + Work in Flight table),
// followed by Overview / How it works (with bullet list) / Configure prose.
// ---------------------------------------------------------------------------
function JellyfishIntegrationDetail() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#7C3AED]">
          <JellyfishLogo className="size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">Jellyfish</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Developer productivity insights and AI impact signals in one
            dashboard
          </p>
        </div>
      </header>

      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        {/* Built by / Website / Enable rail */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-8">
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Built by
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                Jellyfish
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Website
              </div>
              <a
                href="https://jellyfish.co"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Jellyfish website (opens in new tab)"
                className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
              >
                <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
                jellyfish.co
              </a>
            </div>
          </div>
          <Button
            size="sm"
            asChild
            aria-label="Enable Jellyfish integration (opens in new tab)"
          >
            <a
              href="https://jellyfish.co"
              target="_blank"
              rel="noopener noreferrer"
            >
              Enable
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
            </a>
          </Button>
        </div>

        {/* Marketing tiles — bright violet→yellow gradient with Jellyfish
            dashboard cards floating on top. */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Left tile — PR Cycle Time chart */}
          <div
            aria-hidden
            className="relative aspect-[4/3] overflow-hidden rounded-lg p-3"
            style={{
              background:
                "linear-gradient(135deg, #d6f25d 0%, #a385f5 55%, #6c39e0 100%)",
            }}
          >
            <div className="text-[7px] leading-tight font-semibold text-white">
              Get visibility into key
              <br />
              engineering metrics by
              <br />
              combining Linear and
              <br />
              GitHub data
            </div>
            <div className="absolute right-2 bottom-2 left-2 rounded-md bg-white p-1.5 text-[5px] text-neutral-700 shadow-sm ring-1 ring-black/5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-900">
                  PR Cycle Time (Median)
                </span>
                <span className="text-neutral-400">⋯</span>
              </div>
              <div className="mt-0.5 text-[5px] font-bold text-neutral-900">
                0.78
              </div>
              <div className="relative mt-1 h-8 rounded bg-neutral-50">
                {/* Sparkline-style line */}
                <svg
                  viewBox="0 0 100 32"
                  className="absolute inset-0 h-full w-full"
                  preserveAspectRatio="none"
                >
                  <polyline
                    points="0,24 15,18 30,22 45,12 60,16 75,8 90,14 100,6"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1"
                  />
                  <polyline
                    points="0,28 15,26 30,24 45,22 60,20 75,18 90,16 100,14"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="1"
                  />
                  <polyline
                    points="0,20 15,22 30,18 45,20 60,14 75,16 90,10 100,8"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="1"
                  />
                </svg>
              </div>
              <div className="mt-1 flex items-center justify-between text-[4px] text-neutral-500">
                <span>Q1 2025</span>
                <span>Q2 2025</span>
                <span>Q3 2025</span>
                <span>Q4 2025</span>
              </div>
            </div>
          </div>

          {/* Right tile — Work in Flight project table */}
          <div
            aria-hidden
            className="relative aspect-[4/3] overflow-hidden rounded-lg p-3"
            style={{
              background:
                "linear-gradient(135deg, #c8a8ff 0%, #8a4ff0 55%, #4f1fb8 100%)",
            }}
          >
            <div className="text-[7px] leading-tight font-semibold text-white">
              Track work in flight, identify bottlenecks, and expected
              <br />
              delivery dates for Projects, Milestones, and Initiatives
            </div>
            <div className="absolute right-2 bottom-2 left-2 rounded-md bg-white p-1.5 text-[5px] text-neutral-700 shadow-sm ring-1 ring-black/5">
              <div className="flex items-center gap-1 border-b border-neutral-200 pb-0.5">
                <span className="font-semibold text-neutral-900">
                  Work in Flight
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-1 text-neutral-500">
                <span className="rounded bg-neutral-100 px-0.5 font-medium text-neutral-900">
                  In Progress
                </span>
                <span>Months</span>
                <span>Quarters</span>
                <span className="ml-auto rounded bg-neutral-100 px-0.5">
                  Q1 2026
                </span>
              </div>
              <div className="mt-1 text-neutral-500">Projects (13)</div>
              <div className="mt-0.5 grid grid-cols-[1fr_24px_24px_24px] gap-1 border-b border-neutral-200 pb-0.5 text-[4px] text-neutral-500">
                <span>Epic</span>
                <span>Status</span>
                <span>Progress</span>
                <span>Lifetime effort</span>
              </div>
              {[
                { name: "Strategic initiatives action items Eng…", pct: "20%" },
                { name: "Aggregate sticky infrastructure", pct: "12%" },
                { name: "Architect front-end systems", pct: "5.4%" },
                { name: "Generate ubiquitous deliverables", pct: "6.2%" },
              ].map((row, i) => (
                <div
                  key={row.name}
                  className="mt-0.5 grid grid-cols-[1fr_24px_24px_24px] items-center gap-1 text-[4px]"
                >
                  <span className="truncate text-neutral-800">{row.name}</span>
                  <span className="rounded bg-neutral-100 px-0.5 text-neutral-600">
                    {i === 0 ? "1 wk" : i === 1 ? "2 wk" : "Done"}
                  </span>
                  <span className="rounded bg-emerald-100 px-0.5 text-emerald-700">
                    {row.pct}
                  </span>
                  <span className="text-neutral-500">{row.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Overview */}
        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Linear customers now have the ability to see their work alongside
            key engineering productivity metrics directly in the Jellyfish
            platform. Get a better view of how software development work is
            allocated and whether teams are focused on priority projects, as
            well as the ability to more easily identify bottlenecks, eliminate
            friction and ship products faster.
          </p>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-sm font-semibold">How it works</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            The Linear-Jellyfish integration gives developers and engineering
            leaders the tools they need to better plan and allocate work while
            ensuring teams are aligned to key business priorities and
            efficiently delivering products to market.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            Key integration capabilities include:
          </p>
          <ul className="text-muted-foreground mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6">
            <li>
              Detailed dashboards to surface trends and insights, giving team
              leads the ability to take action and report performance to
              executive stakeholders
            </li>
            <li>
              Visibility into work allocation across teams and individuals to
              spot bottlenecks and areas for improvement
            </li>
            <li>
              Ability to visualize investment levels by project, enabling
              leaders to understand whether teams are aligned to business
              priorities
            </li>
            <li>
              Industry-standard engineering productivity metrics like DORA, as
              well as delivery forecasts to pinpoint bottlenecks and
              course-correct as needed
            </li>
            <li>
              AI-driven work categorization, providing even companies with
              &ldquo;messy data&rdquo; access to automated accurate data
              analysis and insights
            </li>
            <li>
              Access to Jellyfish AI Impact, giving engineering leaders the data
              and guidance to measure — AI progress, adapt quickly, and deliver
              lasting business impact
            </li>
          </ul>
        </section>

        {/* Configure */}
        <section>
          <h2 className="text-sm font-semibold">Configure</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Connect your Linear workspace to Jellyfish to automatically sync
            issue, project, and comment events{" "}
            <a
              href="https://jellyfish.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              here
            </a>
            . This integration uses webhooks to keep Jellyfish updated in real
            time as your teams create, update, and complete work in Linear.
          </p>
        </section>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Coda by Packs4Coda — unofficial Coda Pack (BUILT BY Packs4Coda, WEBSITE
// packs4coda.com, external Enable). Body card has two light tiles showing
// the Coda action builder + Linear sync table picker, followed by Overview,
// an italic disclaimer, How it works prose, and a Configure link to the
// Packs4Coda doc.
// ---------------------------------------------------------------------------
function CodaIntegrationDetail() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#F46A54]">
          <CodaLogo className="size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">
            Coda by Packs4Coda
          </h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Analyze your team&apos;s performance, project lifecycles, issues and
            more with the Linear Pack for Coda
          </p>
        </div>
      </header>

      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        {/* Built by / Website / Enable rail */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-8">
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Built by
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                Packs4Coda
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Website
              </div>
              <a
                href="https://packs4coda.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Packs4Coda website (opens in new tab)"
                className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
              >
                <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
                packs4coda.com
              </a>
            </div>
          </div>
          <Button
            size="sm"
            asChild
            aria-label="Enable Coda Pack (opens in new tab)"
          >
            <a
              href="https://coda.io/@leandro-zubrezki/linear-pack-start-here"
              target="_blank"
              rel="noopener noreferrer"
            >
              Enable
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
            </a>
          </Button>
        </div>

        {/* Marketing tiles — light cards on a white background showing the
            Coda action builder (left) and the sync table picker (right). */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Left tile — Create issue action button form */}
          <div
            aria-hidden
            className="relative flex aspect-[4/3] items-center justify-center rounded-lg bg-white p-3 ring-1 ring-black/5"
          >
            <div className="absolute top-3 right-3 left-3">
              <div className="rounded-md bg-white p-1.5 text-[5px] text-neutral-700 shadow ring-1 ring-black/10">
                <div className="flex items-center gap-1 border-b border-neutral-200 pb-1">
                  <span className="font-semibold text-neutral-900">
                    Button -
                  </span>
                  <span className="ml-auto text-neutral-400">⊘</span>
                </div>
                <div className="mt-1 text-[4px] text-neutral-500 uppercase">
                  Label
                </div>
                <div className="rounded border border-neutral-200 px-1 py-0.5 text-neutral-700">
                  &ldquo;Submit this row to Linear&rdquo;
                </div>
                <div className="mt-1 text-[4px] text-neutral-500 uppercase">
                  Action
                </div>
                <div className="rounded border border-neutral-200 px-1 py-0.5">
                  <span className="text-[#F46A54]">⊞</span>{" "}
                  <span className="text-neutral-800">Create issue</span>
                </div>
                <div className="mt-1 text-[4px] text-neutral-500 uppercase">
                  Account
                </div>
                <div className="flex items-center gap-1 rounded border border-neutral-200 px-1 py-0.5 text-neutral-800">
                  <span className="size-1.5 rounded-full bg-[#F46A54]" />
                  Leandro Zubrezki
                </div>
                <div className="mt-1 text-[4px] text-neutral-500 uppercase">
                  Team ID
                </div>
                <div className="flex items-center gap-1 rounded border border-neutral-200 px-1 py-0.5 text-neutral-800">
                  Teams.B :: First() :: Team ID
                </div>
                <div className="mt-1 text-[4px] text-neutral-500 uppercase">
                  Title
                </div>
                <div className="rounded border border-neutral-200 px-1 py-0.5 text-neutral-700">
                  Title T
                </div>
                <div className="mt-1 text-[4px] text-neutral-500 uppercase">
                  Result column (optional)
                </div>
                <div className="rounded border border-neutral-200 bg-neutral-50 px-1 py-0.5 text-neutral-500">
                  Select column for results
                </div>
                <div className="mt-1 text-[4px] text-neutral-500 uppercase">
                  Description (optional)
                </div>
                <div className="rounded border border-neutral-200 px-1 py-0.5 text-neutral-700">
                  Description T
                </div>
              </div>
            </div>
            <div className="absolute right-3 bottom-2 left-3 text-center text-[7px] font-medium text-neutral-700">
              Use actions to create issues,
              <br />
              projects and documents from Coda.
            </div>
          </div>

          {/* Right tile — Coda sync table picker */}
          <div
            aria-hidden
            className="relative flex aspect-[4/3] items-center justify-center rounded-lg bg-white p-3 ring-1 ring-black/5"
          >
            <div className="absolute right-3 bottom-2 left-3 text-center text-[7px] font-medium text-neutral-700">
              Sync your Linear data
              <br />
              as tables in Coda.
            </div>
            <div className="absolute top-3 right-3 left-3">
              <div className="rounded-md bg-white p-1.5 text-[5px] text-neutral-700 shadow ring-1 ring-black/10">
                <div className="flex items-center gap-1 border-b border-neutral-200 pb-0.5 text-neutral-500">
                  <span className="font-semibold text-neutral-900">
                    Which table do you want to sync from Linear?
                  </span>
                </div>
                <div className="mt-0.5 text-[4px] leading-tight text-neutral-500">
                  Connect to a table to add data tied to one of different
                  topics. Learn more
                </div>
                <div className="mt-1 flex items-center gap-1 rounded bg-neutral-50 px-1 py-0.5">
                  <span className="text-neutral-400">🔍</span>
                  <span className="text-neutral-500">Search</span>
                </div>
                <div className="mt-0.5 flex items-center justify-between border-b border-neutral-200 pb-0.5 text-[4px] text-neutral-500 uppercase">
                  <span>Connect to</span>
                  <span>Views</span>
                </div>
                {[
                  { name: "Projects", count: "0" },
                  { name: "Milestones", count: "0" },
                  { name: "Cycles", count: "0" },
                  { name: "ProjectLinks", count: "0" },
                  { name: "Issues", count: "0" },
                  { name: "Users", count: "0" },
                  { name: "Teams", count: "0" },
                ].map((row, i) => (
                  <div
                    key={row.name}
                    className={`flex items-center justify-between px-0.5 py-0.5 ${
                      i === 4 ? "rounded bg-blue-50 text-blue-700" : ""
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <span className="size-1.5 rounded-sm bg-[#F46A54]" />
                      {row.name}
                    </span>
                    <span className="text-neutral-400">{row.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Overview */}
        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Analyze your team&apos;s performance, project lifecycles, issues and
            more with the available sync tables, all your Linear data available
            in Coda as tables. Create new issues in Linear from Coda, with
            prefilled values and your own business logic. Pull all of your
            Linear projects into a Coda doc. Then use it as part of your
            meetings so each member is on the same page.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6 italic">
            This is unofficial Linear integration for Coda from Packs4Coda
          </p>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-sm font-semibold">How it works</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            The Linear Pack for Coda includes a set of tables, formulas and
            actions to integrate Linear with Coda. You can view your issues,
            projects, teams, milestones, cycles and more as Coda tables that are
            kept in sync. You can then build reports, charts, and use Coda
            formulas to create your own dashboard. Create, update and delete
            your issues and projects. Add links and documents to projects, using
            Coda as your research tool. Manage your inbox notifications and
            build a personal dashboard.
          </p>
        </section>

        {/* Configure */}
        <section>
          <h2 className="text-sm font-semibold">Configure</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Visit{" "}
            <a
              href="https://coda.io/@leandro-zubrezki/linear-pack-start-here"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              https://coda.io/@leandro-zubrezki/linear-pack-start-here
            </a>{" "}
            to get started with installing the Packs4Coda built Coda pack.
          </p>
        </section>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Cycle Report — third-party sprint reporting tool by Mindnow AG (BUILT BY
// Mindnow AG, WEBSITE cycle.report, external Enable). Body card has two dark
// marketing tiles (a Cycle Report dashboard with project progress chart, and
// a Summary panel with two donut metrics), followed by Overview, How it works
// (with the OAuth/webhook paragraph), and a Configure block with a Create-an-
// account link.
// ---------------------------------------------------------------------------
function CycleReportIntegrationDetail() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#1a1230]">
          <CycleReportLogo className="size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">Cycle Report</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Create reports of your cycles that your clients can review and sign
            off on
          </p>
        </div>
      </header>

      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        {/* Built by / Website / Enable rail */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-8">
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Built by
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                Mindnow AG
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Website
              </div>
              <a
                href="https://cycle.report"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Cycle Report website (opens in new tab)"
                className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
              >
                <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
                cycle.report
              </a>
            </div>
          </div>
          <Button
            size="sm"
            asChild
            aria-label="Enable Cycle Report (opens in new tab)"
          >
            <a
              href="https://cycle.report"
              target="_blank"
              rel="noopener noreferrer"
            >
              Enable
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
            </a>
          </Button>
        </div>

        {/* Marketing tiles — dark gradient backdrop with floating Cycle
            Report dashboards. */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Left tile — sprint burnup chart with project progress */}
          <div
            aria-hidden
            className="relative aspect-[4/3] overflow-hidden rounded-lg p-3"
            style={{
              background:
                "linear-gradient(135deg, #1a1230 0%, #2a1d4a 50%, #1a1230 100%)",
            }}
          >
            <div className="text-center text-[8px] leading-tight font-semibold text-white">
              Create reports to share sprint progress
              <br />
              with your clients
            </div>
            <div className="absolute right-2 bottom-2 left-2 rounded-md bg-[#0f0820] p-1.5 text-[5px] text-white/80 ring-1 ring-white/10">
              <div className="flex items-center gap-1 border-b border-white/10 pb-0.5">
                <span className="font-semibold text-white">
                  cyclerep<span className="text-[#A78BFA]">o</span>rt
                </span>
                <span className="ml-auto text-white/40">⊕ Team</span>
              </div>
              <div className="mt-0.5 text-white/60">Sttgt / Debugging</div>
              <div className="relative mt-1 h-10 rounded bg-[#1a1230]">
                <svg
                  viewBox="0 0 100 32"
                  className="absolute inset-0 h-full w-full"
                  preserveAspectRatio="none"
                >
                  <polyline
                    points="0,28 20,24 40,18 60,14 80,10 100,6"
                    fill="none"
                    stroke="#A78BFA"
                    strokeWidth="1.4"
                  />
                  <polyline
                    points="0,28 100,4"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="0.5"
                    strokeDasharray="2 2"
                    opacity="0.5"
                  />
                  <circle cx="60" cy="14" r="1.5" fill="#A78BFA" />
                </svg>
                <div className="absolute top-1 right-1 flex flex-col gap-0.5 text-[3.5px] text-white/70">
                  <span className="flex items-center gap-0.5">
                    <span className="size-1 rounded-sm bg-[#A78BFA]" />
                    Burnup
                  </span>
                  <span className="flex items-center gap-0.5">
                    <span className="size-1 rounded-sm border border-white/40" />
                    Ideal
                  </span>
                </div>
              </div>
              <div className="mt-1 text-white/60">Project progress</div>
              <div className="mt-0.5 grid grid-cols-4 gap-0.5 text-[3.5px]">
                {[
                  { color: "bg-[#A78BFA]" },
                  { color: "bg-emerald-400" },
                  { color: "bg-amber-400" },
                  { color: "bg-rose-400" },
                ].map((c, i) => (
                  <div key={i} className={`h-1 rounded-sm ${c.color}`} />
                ))}
              </div>
              <div className="mt-1 flex items-center justify-between text-[3.5px] text-white/40">
                <span>⊙ Setup</span>
                <span>Admin Dashboard</span>
                <span>⋯</span>
              </div>
            </div>
          </div>

          {/* Right tile — Summary panel with donut KPIs */}
          <div
            aria-hidden
            className="relative aspect-[4/3] overflow-hidden rounded-lg p-3"
            style={{
              background:
                "linear-gradient(135deg, #1a1230 0%, #2a1d4a 50%, #1a1230 100%)",
            }}
          >
            <div className="text-center text-[8px] leading-tight font-semibold text-white">
              Offer your client full
              <br />
              transparency about
              <br />
              their project
            </div>
            <div className="absolute right-2 bottom-2 left-2 rounded-md bg-[#0f0820] p-1.5 text-[5px] text-white/80 ring-1 ring-white/10">
              <div className="flex items-center gap-1 border-b border-white/10 pb-0.5">
                <span className="font-semibold text-white">Summary</span>
              </div>
              <div className="mt-1 grid grid-cols-2 gap-1">
                {[
                  { value: "5/6", pct: "27%", label: "Days" },
                  { value: "46/52", pct: "76%", label: "Points completed" },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="flex items-center gap-1 rounded bg-[#1a1230] p-1"
                  >
                    <svg viewBox="0 0 32 32" className="size-6">
                      <circle
                        cx="16"
                        cy="16"
                        r="12"
                        fill="none"
                        stroke="#3a2a55"
                        strokeWidth="3"
                      />
                      <circle
                        cx="16"
                        cy="16"
                        r="12"
                        fill="none"
                        stroke="#A78BFA"
                        strokeWidth="3"
                        strokeDasharray={`${parseFloat(kpi.pct) * 0.75} 100`}
                        strokeLinecap="round"
                        transform="rotate(-90 16 16)"
                      />
                    </svg>
                    <div>
                      <div className="text-[5px] font-semibold text-white">
                        {kpi.value}
                      </div>
                      <div className="text-[3.5px] text-white/60">
                        {kpi.pct}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-1 text-white/60">Performance</div>
              <div className="relative mt-0.5 h-6 rounded bg-[#1a1230]">
                <svg
                  viewBox="0 0 100 24"
                  className="absolute inset-0 h-full w-full"
                  preserveAspectRatio="none"
                >
                  <polyline
                    points="0,18 20,16 40,14 60,12 80,8 100,4"
                    fill="none"
                    stroke="#A78BFA"
                    strokeWidth="1.4"
                  />
                </svg>
              </div>
              <div className="mt-1 flex items-center justify-between text-[3.5px] text-white/50">
                <span>Sprint 12</span>
                <span>Status: ✓ On track</span>
              </div>
            </div>
          </div>
        </div>

        {/* Overview */}
        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Cycle Report allows you and your clients to work flexibly and stay
            transparent in every step of the process. By fetching information
            about your cycles from Linear into Cycle Report, you&apos;re able to
            create reports for your clients that are easy accessible,
            understandable and ready to sign.
          </p>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-sm font-semibold">How it works</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Cycle Report is all about making manual processes simple and easy to
            understand for everyone. Once connected with Linear, it synchronises
            all relevant data, including information about teams, projects, and
            sprints, with a database in your workspace. It eliminates the need
            for manual reports and makes it easy for non-technical stakeholders
            to understand agile processes.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            By collecting your clients information in the internal client
            database the signing of reports gets fully automated. Simply send
            them the report and let them sign it via SMS-confirmation. No need
            to send your client manual updates, they will get notified if there
            are changes to the agreed scope.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            Cycle Report works as a web app and connects to Linear through the
            official Linear API. Webhooks keep your data updated in real time
            and OAuth 2.0 Authentication will guarantee a secure connection.
          </p>
        </section>

        {/* Configure */}
        <section>
          <h2 className="text-sm font-semibold">Configure</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            <a
              href="https://cycle.report"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              Create an account
            </a>{" "}
            and easily connect Cycle Report with your Linear workspace in a few
            clicks. One tip: Via the help center, that is easily accessible on
            the whole app in the bottom right corner of Cycle Report, you will
            find helpful articles about the whole setup process.
          </p>
        </section>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Aikido Security — third-party AppSec platform (BUILT BY Aikido Security,
// WEBSITE aikido.dev, external Enable). Body card has two indigo-gradient
// tiles (left: an Aikido finding panel with Create task / Autofix / Snooze /
// Ignore actions; right: an Automated Issue Creation form with severity +
// connected team + per-day cap selectors), followed by Overview, How it
// works (multi-paragraph), and Configure pointing at the Aikido docs.
// ---------------------------------------------------------------------------
function AikidoIntegrationDetail() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#5C5BFF]">
          <AikidoLogo className="size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">
            Aikido Security
          </h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Put your application security on autopilot
          </p>
        </div>
      </header>

      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        {/* Built by / Website / Enable rail */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-8">
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Built by
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                Aikido Security
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Website
              </div>
              <a
                href="https://aikido.dev"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Aikido Security website (opens in new tab)"
                className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
              >
                <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
                aikido.dev
              </a>
            </div>
          </div>
          <Button
            size="sm"
            asChild
            aria-label="Enable Aikido Security (opens in new tab)"
          >
            <a
              href="https://aikido.dev"
              target="_blank"
              rel="noopener noreferrer"
            >
              Enable
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
            </a>
          </Button>
        </div>

        {/* Marketing tiles — indigo-on-emerald gradient with a finding-actions
            popover (left) and an Automated Issue Creation form (right). */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Left tile — finding actions menu */}
          <div
            aria-hidden
            className="relative aspect-[4/3] overflow-hidden rounded-lg p-3"
            style={{
              background:
                "linear-gradient(135deg, #0a4a3f 0%, #1a2c6b 55%, #2c1a8a 100%)",
            }}
          >
            <div className="text-[8px] leading-tight font-semibold text-white">
              Put security on
              <br />
              autopilot with Aikido
              <br />
              and Linear
            </div>
            <div className="absolute right-2 bottom-2 w-[58%] rounded-md bg-white p-1.5 text-[5px] text-neutral-700 shadow ring-1 ring-black/10">
              <div className="border-b border-neutral-200 pb-0.5 text-[4px] font-semibold tracking-wide text-neutral-500 uppercase">
                Actions
              </div>
              {[
                {
                  label: "Create task",
                  icon: "✦",
                  iconColor: "text-violet-500",
                  active: true,
                },
                { label: "Autofix", icon: "⚡", iconColor: "text-amber-500" },
                {
                  label: "Snooze",
                  icon: "⏱",
                  iconColor: "text-neutral-500",
                },
                {
                  label: "Ignore",
                  icon: "⊘",
                  iconColor: "text-neutral-400",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className={`mt-0.5 flex items-center gap-1 rounded px-1 py-0.5 ${
                    row.active ? "bg-violet-50" : ""
                  }`}
                >
                  <span className={row.iconColor}>{row.icon}</span>
                  <span
                    className={
                      row.active
                        ? "font-medium text-neutral-900"
                        : "text-neutral-700"
                    }
                  >
                    {row.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right tile — Automated Issue Creation modal */}
          <div
            aria-hidden
            className="relative aspect-[4/3] overflow-hidden rounded-lg p-3"
            style={{
              background:
                "linear-gradient(135deg, #1a2c6b 0%, #2c1a8a 60%, #4a1a8a 100%)",
            }}
          >
            <div className="absolute top-2 left-2 rounded bg-emerald-500/20 px-1 py-0.5 text-[5px] font-semibold text-emerald-300 ring-1 ring-emerald-400/40">
              Option 1
            </div>
            <div className="absolute top-6 right-2 left-2 rounded-md bg-white p-1.5 text-[5px] text-neutral-700 shadow ring-1 ring-black/10">
              <div className="text-[5px] font-semibold text-neutral-900">
                Automated Issue Creation
              </div>
              <div className="mt-1 text-[4px] text-neutral-500 uppercase">
                Severity Level
              </div>
              <div className="rounded border border-neutral-200 px-1 py-0.5 text-neutral-700">
                Critical Issues Only ⌄
              </div>
              <div className="mt-1 text-[4px] text-neutral-500 uppercase">
                Connected Linear Team
              </div>
              <div className="rounded border border-neutral-200 px-1 py-0.5 text-neutral-700">
                Aikido Front-End ⌄
              </div>
              <div className="mt-1 text-[4px] text-neutral-500 uppercase">
                Number Tasks Created per Day
              </div>
              <div className="rounded border border-neutral-200 px-1 py-0.5 text-neutral-700">
                2 tasks per day ⌄
              </div>
              <div className="mt-1 flex items-center justify-end gap-1">
                <span className="rounded border border-neutral-200 px-1 py-0.5 text-neutral-600">
                  Cancel
                </span>
                <span className="rounded bg-violet-600 px-1 py-0.5 text-white">
                  Finish
                </span>
              </div>
            </div>
            <div className="absolute right-2 bottom-2 left-2 text-center text-[8px] leading-tight font-semibold text-white">
              Automatically
              <br />
              create new issues in
              <br />
              Linear
            </div>
          </div>
        </div>

        {/* Overview */}
        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Aikido Security is an all-in-one application security platform that
            gives you a full overview of all your security issues and shows you
            which security issues matter.
          </p>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-sm font-semibold">How it works</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Aikido Security helps you to secure your application by bringing
            together nine different security scanners in one platform. With the
            Aikido integration for Linear, you&apos;re able to easily follow up
            on security work directly in Linear issues.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            You can either fully automate the creation of issues in Linear or
            manually triage and select the issues in Aikido.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            You can easily follow along the progress in Linear in Aikido&apos;s
            Feed. For example to whom the ticket is assigned, and what the
            status is.
          </p>
        </section>

        {/* Configure */}
        <section>
          <h2 className="text-sm font-semibold">Configure</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            To get started for free, create an Aikido Security account and
            connect Linear with your workspace.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            More details can be found on the{" "}
            <a
              href="https://help.aikido.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              Aikido Security docs
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Cloudback — third-party Linear backup service (BUILT BY MYRTLELABS S.A.S.,
// WEBSITE cloudback.it, external Enable). Body card has two light marketing
// tiles (left: connect-account dashboard with provider list; right: backup
// runs table), followed by a long Overview / How it works (multi-paragraph
// describing data scope, storage destinations, retention/restore), and a
// numbered Configure walkthrough.
// ---------------------------------------------------------------------------
function CloudbackIntegrationDetail() {
  const providers = [
    { name: "Connect GitHub", color: "bg-[#0b0b0f]", glyph: "GH" },
    { name: "Connect Azure DevOps", color: "bg-[#0078D4]", glyph: "AZ" },
    { name: "Connect Linear", color: "bg-[#5E5BFF]", glyph: "L" },
    { name: "Connect GitLab", color: "bg-[#FC6D26]", glyph: "GL" },
  ]
  const backupRows = [
    { date: "10 Apr 2026 07:26", size: "7 KB" },
    { date: "01 Apr 2026 07:00", size: "7 KB" },
    { date: "29 Mar 2026 07:12", size: "7 KB" },
    { date: "30 Mar 2026 07:30", size: "7 KB" },
    { date: "29 Mar 2026 07:08", size: "7 KB" },
    { date: "28 Mar 2026 07:01", size: "7 KB" },
    { date: "27 Mar 2026 19:01", size: "7 KB" },
    { date: "27 Mar 2026 07:00", size: "7 KB" },
    { date: "26 Mar 2026 06:44", size: "7 KB" },
    { date: "25 Mar 2026 07:00", size: "7 KB" },
    { date: "24 Mar 2026 06:58", size: "7 KB" },
  ]
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white ring-1 ring-black/10">
          <CloudbackLogo className="size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">Cloudback</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Automated daily backups of your Linear workspace with on-demand
            restore
          </p>
        </div>
      </header>

      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        {/* Built by / Website / Enable rail */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-8">
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Built by
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                MYRTLELABS S.A.S.
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Website
              </div>
              <a
                href="https://cloudback.it"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Cloudback website (opens in new tab)"
                className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
              >
                <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
                cloudback.it
              </a>
            </div>
          </div>
          <Button
            size="sm"
            asChild
            aria-label="Enable Cloudback (opens in new tab)"
          >
            <a
              href="https://app.cloudback.it"
              target="_blank"
              rel="noopener noreferrer"
            >
              Enable
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
            </a>
          </Button>
        </div>

        {/* Marketing tiles — light grey panels with Cloudback dashboard
            mockups: Connect-account picker (left) and Backups table (right). */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Left tile — Connect account dashboard */}
          <div
            aria-hidden
            className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#f1f3f5] p-2 ring-1 ring-black/5"
          >
            <div className="flex h-full overflow-hidden rounded bg-white text-[5px] text-neutral-700 ring-1 ring-black/5">
              {/* Sidebar */}
              <div className="flex w-[34%] flex-col gap-0.5 border-r border-neutral-200 bg-neutral-50 p-1">
                <div className="flex items-center gap-1 font-semibold text-neutral-900">
                  <CloudbackLogo className="size-2" />
                  Cloudback
                </div>
                <div className="mt-0.5 space-y-0.5 text-neutral-600">
                  <div className="rounded bg-white px-0.5 text-neutral-900">
                    ⊞ Dashboard
                  </div>
                  <div>◆ GitHub</div>
                  <div>◇ Azure DevOps</div>
                  <div>L Linear</div>
                  <div>◇ GitLab</div>
                  <div>+ Add Account</div>
                  <div>⊟ Storages</div>
                  <div>⏱ Schedules</div>
                  <div>⊠ Subscription</div>
                  <div>⚙ Account Settings</div>
                  <div>🔔 Notification Settings</div>
                </div>
              </div>
              {/* Content */}
              <div className="flex flex-1 flex-col gap-1 p-1">
                <div className="font-semibold text-neutral-900">
                  Connect account
                </div>
                {providers.map((p) => (
                  <div
                    key={p.name}
                    className="flex items-center gap-1 rounded border border-neutral-200 px-1 py-0.5"
                  >
                    <span
                      className={`grid size-2.5 place-items-center rounded-sm ${p.color} text-[3.5px] font-bold text-white`}
                    >
                      {p.glyph}
                    </span>
                    <div className="min-w-0">
                      <div className="font-medium text-neutral-900">
                        {p.name} ›
                      </div>
                      <div className="truncate text-[3.5px] text-neutral-500">
                        Install the Cloudback app and grant repository
                        permissions
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right tile — Backups runs table */}
          <div
            aria-hidden
            className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#f1f3f5] p-2 ring-1 ring-black/5"
          >
            <div className="flex h-full flex-col gap-0.5 overflow-hidden rounded bg-white p-1 text-[5px] text-neutral-700 ring-1 ring-black/5">
              <div className="flex items-center gap-1 border-b border-neutral-200 pb-0.5">
                <span className="grid size-2 place-items-center rounded-sm bg-[#5E5BFF] text-[3.5px] font-bold text-white">
                  L
                </span>
                <span className="font-semibold text-neutral-900">
                  myrtle-co
                </span>
                <span className="text-neutral-400">acme-co</span>
                <span className="ml-auto flex items-center gap-1">
                  <span className="rounded bg-emerald-500 px-1 py-0.5 text-[3.5px] font-semibold text-white">
                    ◉ Backup now
                  </span>
                  <span className="rounded border border-neutral-200 px-1 py-0.5 text-[3.5px] font-medium text-neutral-700">
                    ↺ Restore now
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1 text-neutral-500">
                <span className="rounded bg-neutral-100 px-0.5 font-medium text-neutral-900">
                  Overview
                </span>
                <span>Backups</span>
                <span>Restores</span>
              </div>
              <div className="grid grid-cols-[12px_1fr_36px_36px_36px_24px] gap-1 border-b border-neutral-200 pb-0.5 text-[3.5px] text-neutral-500">
                <span></span>
                <span>Status</span>
                <span>Start time</span>
                <span>Backup size</span>
                <span>Deduplicated</span>
                <span>Storage</span>
              </div>
              <div className="flex-1 space-y-0.5 overflow-hidden">
                {backupRows.map((row) => (
                  <div
                    key={row.date}
                    className="grid grid-cols-[12px_1fr_36px_36px_36px_24px] items-center gap-1 text-[3.5px]"
                  >
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    <span className="text-neutral-700">Succeeded</span>
                    <span className="text-neutral-500">{row.date}</span>
                    <span className="text-neutral-500">{row.size}</span>
                    <span className="text-neutral-500">✓</span>
                    <span className="text-neutral-500">⊞ ⤓</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Overview */}
        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Cloudback automatically backs up your Linear workspace on a
            configurable schedule, capturing issues, projects, documents,
            cycles, comments, labels, templates, initiatives, embedded files,
            and more. Backups are stored as encrypted, password-protected
            archives in your own cloud storage or built-in Cloudback storage.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            When you need to recover data, Cloudback can restore your workspace
            to a different Linear workspace, making it useful for disaster
            recovery and workspace migration.
          </p>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-sm font-semibold">How it works</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Cloudback connects to your Linear workspace via OAuth and runs
            scheduled backups automatically, with the option to customize the
            schedule. Each backup captures a snapshot of your workspace data:
            issues and sub-issues, comments, projects, project updates, project
            milestones, cycles, documents, labels (issue and project), teams,
            workflow states, attachments, initiatives, initiative updates,
            custom views, templates (issue, project, and document), issue
            relations, external users, project statuses, and
            initiative-to-project links. Files and images hosted on Linear are
            downloaded with authentication and stored directly in the archive.
            The resulting backup is a structured set of JSON files organized by
            entity type.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            You choose where backups are stored: your own AWS S3, Google Cloud
            Storage, Azure Blob Storage, Alibaba Cloud, Wasabi, OneDrive
            (Business or Personal), OpenStack Swift containers, or built-in
            Cloudback regional storages. Backup schedules are fully configurable
            with presets and support for custom cron expressions, and you can
            trigger a manual backup at any time. Retention policies control how
            long backups are kept, and deduplication reduces storage costs when
            workspace data has not changed between runs. Archives can be
            password-protected and encrypted. Cloudback also provides an audit
            log for tracking all backup and restore activity, a Terraform
            provider for infrastructure-as-code workflows, and an official Vanta
            integration for compliance reporting.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            Restoring from a backup recreates all entities in a target Linear
            workspace that must be empty. Cloudback handles the complexity of
            rebuilding your workspace — issues, projects, documents, and all
            other data types are restored with their relationships and links
            intact. Embedded files are re-uploaded to the destination workspace.
            Backup status notifications can be delivered via Slack, Microsoft
            Teams, or Discord. Cloudback also has official integrations with
            GitHub, Azure DevOps, and GitLab, so teams can manage backups for
            all their development platforms in one place.
          </p>
        </section>

        {/* Configure */}
        <section>
          <h2 className="text-sm font-semibold">Configure</h2>
          <ol className="text-muted-foreground mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-6">
            <li>
              Sign in or create an account at{" "}
              <a
                href="https://app.cloudback.it"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                https://app.cloudback.it
              </a>
              . An active Cloudback subscription is required (a free trial is
              available).
            </li>
            <li>
              In the dashboard sidebar, click{" "}
              <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">
                Add Account
              </code>{" "}
              and select{" "}
              <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">
                Linear
              </code>{" "}
              as the platform.
            </li>
            <li>
              You will be redirected to Linear for OAuth authorization. You must
              have admin or owner access to the workspace you want to back up.
            </li>
            <li>
              After authorization, your workspace appears in the dashboard. Open
              the workspace details page to configure your storage destination,
              backup schedule, and retention policy.
            </li>
            <li>
              Backups run automatically on your configured schedule. You can
              also trigger a backup manually at any time from the workspace
              details page.
            </li>
            <li>
              To restore data, click{" "}
              <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">
                Restore
              </code>{" "}
              on any backup. A separate OAuth authorization with write
              permissions is required, and the target workspace must be empty.
            </li>
          </ol>
        </section>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Drata — third-party security/risk/compliance automation platform (BUILT BY
// Drata, WEBSITE try.drata.com, external Enable). Body card has a single
// full-width blue marketing tile showing the Drata Monitoring dashboard with
// a Test details slide-out, followed by Overview / How it works / a numbered
// Configure walkthrough plus a label-naming Note.
// ---------------------------------------------------------------------------
function DrataIntegrationDetail() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#0b1530]">
          <DrataLogo className="size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">Drata</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Simplify risk and managing frameworks like SOC 2, ISO 27001, PCI and
            more
          </p>
        </div>
      </header>

      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        {/* Built by / Website / Enable rail */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-8">
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Built by
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                Drata
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Website
              </div>
              <a
                href="https://try.drata.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Drata website (opens in new tab)"
                className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
              >
                <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
                try.drata.com
              </a>
            </div>
          </div>
          <Button
            size="sm"
            asChild
            aria-label="Enable Drata (opens in new tab)"
          >
            <a
              href="https://try.drata.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Enable
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
            </a>
          </Button>
        </div>

        {/* Single full-width marketing tile — Drata Monitoring dashboard with
            Test details slide-out. */}
        <div
          aria-hidden
          className="relative aspect-[16/9] overflow-hidden rounded-lg p-3"
          style={{
            background:
              "linear-gradient(135deg, #1e3a8a 0%, #2962e5 60%, #3b82f6 100%)",
          }}
        >
          <div className="absolute inset-3 grid grid-cols-[110px_1fr_180px] gap-2 overflow-hidden rounded-md bg-[#1a2c6b] p-2 text-[6px] text-white/80 ring-1 ring-white/10">
            {/* Sidebar */}
            <div className="flex flex-col gap-1 border-r border-white/10 pr-1.5">
              <div className="flex items-center gap-1 text-[7px] font-bold tracking-wider text-white">
                DRATA
                <span className="ml-auto text-white/40">«</span>
              </div>
              <div className="flex items-center gap-1 rounded bg-white/10 px-1 py-0.5">
                <span className="size-2 rounded-sm bg-white/30" />
                <span className="font-medium text-white">Drata Ventures</span>
                <span className="ml-auto">›</span>
              </div>
              <div className="text-[5px] tracking-wider text-white/50 uppercase">
                Compliance
              </div>
              <div className="space-y-0.5 text-white/70">
                <div className="flex items-center gap-1">
                  <span>⊞</span>Controls
                </div>
                <div className="flex items-center gap-1">
                  <span>◇</span>Frameworks
                </div>
                <div className="flex items-center gap-1 rounded bg-white/15 px-1 py-0.5 text-white">
                  <span>📡</span>Monitoring
                </div>
                <div className="flex items-center gap-1">
                  <span>📅</span>Event Tracking
                </div>
                <div className="flex items-center gap-1">
                  <span>📁</span>Evidence Library
                </div>
                <div className="flex items-center gap-1">
                  <span>🔍</span>Audit Hub
                </div>
              </div>
              <div className="mt-1 text-[5px] tracking-wider text-white/50 uppercase">
                Trust
              </div>
              <div className="flex items-center gap-1 text-white/70">
                <span>⊠</span>Trust Center
              </div>
              <div className="mt-1 text-[5px] tracking-wider text-white/50 uppercase">
                Risk
              </div>
              <div className="space-y-0.5 text-white/70">
                <div className="flex items-center gap-1">
                  <span>⊞</span>Risk Assessment
                </div>
                <div className="flex items-center gap-1">
                  <span>⊠</span>Risk Management
                </div>
                <div className="flex items-center gap-1">
                  <span>👥</span>Vendors
                </div>
                <div className="flex items-center gap-1">
                  <span>≡</span>Assets
                </div>
                <div className="flex items-center gap-1">
                  <span>✦</span>Connections
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="flex flex-col gap-1.5 overflow-hidden">
              <div className="flex items-center gap-1 text-[7px] font-semibold text-white">
                Monitoring
                <span className="ml-auto text-white/40">«</span>
              </div>
              <div className="flex items-center gap-1 border-b border-white/10 pb-0.5 text-white/60">
                <span className="rounded bg-white/15 px-1 py-0.5 text-white">
                  Production
                </span>
                <span className="rounded bg-white/5 px-1 py-0.5">
                  Code{" "}
                  <span className="rounded bg-emerald-400/30 px-0.5 text-[4px] text-emerald-200">
                    Beta
                  </span>
                </span>
                <span className="rounded bg-white/5 px-1 py-0.5">
                  Pipeline{" "}
                  <span className="rounded bg-emerald-400/30 px-0.5 text-[4px] text-emerald-200">
                    Beta
                  </span>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="flex items-center gap-1.5 rounded bg-white/5 p-1">
                  <span className="text-[10px] font-bold text-white">39%</span>
                  <span className="text-[5px] text-white/60">
                    Of Tests Passed
                  </span>
                  <span className="ml-auto rounded bg-emerald-400/30 px-1 text-[5px] text-emerald-200">
                    %
                  </span>
                </div>
                <div className="flex items-center gap-1.5 rounded bg-white/5 p-1">
                  <span className="text-[10px] font-bold text-white">69</span>
                  <span className="text-[5px] text-white/60">Failed</span>
                  <span className="ml-auto rounded bg-rose-400/30 px-1 text-[5px] text-rose-200">
                    !
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-white/60">
                <span className="rounded bg-white/15 px-1 text-white">
                  All Tests
                </span>
                <span>Published</span>
                <span>Drafts</span>
                <span className="ml-auto rounded bg-white/5 px-1">🔍 Sea…</span>
              </div>
              <div className="flex items-center gap-1 border-b border-white/10 pb-0.5 text-white/60">
                <span className="font-medium text-white">Test Result</span>
                <span className="ml-auto truncate">Security Issues are P…</span>
              </div>
              <div className="space-y-0.5 text-white/70">
                <div className="flex items-center gap-1">
                  <span className="text-rose-400">⊘</span>Failed
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-emerald-400">✓</span>Passed
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-amber-400">⚠</span>Error
                </div>
              </div>
              <div className="font-medium text-white">Category</div>
              <div className="space-y-0.5 text-white/70">
                <div>📋 Policy</div>
                <div>👤 In Drata</div>
                <div>💻 Device</div>
              </div>
            </div>

            {/* Right-side Test details panel */}
            <div className="flex flex-col gap-1 overflow-hidden rounded bg-white p-1.5 text-[5px] text-neutral-700 shadow-lg">
              <div className="flex items-center gap-1 border-b border-neutral-200 pb-0.5">
                <span className="font-semibold text-neutral-900">
                  Test details
                </span>
                <span className="ml-auto text-neutral-400">⤢</span>
              </div>
              <div className="text-[4px] text-neutral-500 uppercase">
                Test name
              </div>
              <div className="text-neutral-800">
                Security Issues are Prioritized
              </div>
              <div className="text-[4px] text-neutral-500 uppercase">
                Test description
              </div>
              <div className="text-neutral-700">
                Drata inspects Drata Ventures&apos;s task tracking system to
                determine if security issues…{" "}
                <span className="text-blue-600 underline">See more</span>
              </div>
              <div className="text-[4px] text-neutral-500 uppercase">
                Test status
              </div>
              <div className="flex items-center gap-1">
                <span className="flex-1 rounded border border-neutral-200 px-1 py-0.5 text-neutral-700">
                  Enabled ⌄
                </span>
                <span className="rounded bg-blue-600 px-1 py-0.5 text-white">
                  ⚡ Test Now
                </span>
              </div>
              <div className="mt-0.5 border-t border-neutral-200 pt-0.5 text-[4px] font-semibold text-neutral-500 uppercase">
                Last test result
              </div>
              <div className="flex items-center gap-1">
                <span className="rounded bg-emerald-100 px-1 py-0.5 text-emerald-700">
                  ✓ Passed
                </span>
                <span className="text-neutral-500">
                  Last Tested: 5 minutes ago
                </span>
              </div>
              <div className="text-neutral-700">
                Inspected Drata Ventures&apos;s task tracking system and
                confirmed that security issues are being tagged and prioritized
                accordingly.
              </div>
              <div className="rounded border border-blue-300 px-1 py-0.5 text-center text-blue-600">
                Learn More
              </div>
              <div className="border-b-2 border-neutral-900 pb-0.5 font-medium text-neutral-900">
                Included
              </div>
              <div className="flex items-center gap-1">
                <span className="size-1.5 rounded-sm border border-neutral-300" />
                <span className="text-neutral-500">Select All</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="size-1.5 rounded-sm border border-neutral-300" />
                <span className="size-1.5 rounded-full bg-[#5E5BFF]" />
                <span className="text-neutral-700">Linear</span>
                <span className="ml-auto text-neutral-400">⊕</span>
              </div>
            </div>
          </div>
        </div>

        {/* Overview */}
        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Integrate Linear with Drata&rsquo;s security, risk, and compliance
            automation platform to ensure you are getting and staying compliant
            while tackling your day-to-day work.
          </p>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-sm font-semibold">How it works</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            The integration inspects your company task tracking system to
            determine if security issues are being tagged and prioritized
            accordingly. This ensures your company tracks, assigns, and
            prioritizes security deficiencies according to their severity.
          </p>
        </section>

        {/* Configure */}
        <section>
          <h2 className="text-sm font-semibold">Configure</h2>
          <ol className="text-muted-foreground mt-2 list-decimal space-y-1 pl-5 text-sm leading-6">
            <li>
              Select <em>Connections</em> on the lower left corner of Drata
            </li>
            <li>
              In the search bar type <em>Linear</em>
            </li>
            <li>
              Press <em>Connect</em>
            </li>
            <li>The slide-out panel will provide step-by-step instructions</li>
          </ol>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            Note: If you do not use &ldquo;Security&rdquo;as the label within
            Linear to categorize tickets as security issues, be sure to update
            the &apos;Security Label&apos; within the panel.
          </p>
        </section>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Fencer — third-party security findings → Linear bridge (BUILT BY Fencer,
// WEBSITE fencer.dev, external Enable). Body card has two emerald→cyan
// gradient marketing tiles (Create issue form + Link existing issue picker),
// followed by Overview, a long multi-paragraph How it works covering scope,
// bidirectional sync, severity mapping, and a multi-paragraph Configure with
// OAuth + disconnect details.
// ---------------------------------------------------------------------------
function FencerIntegrationDetail() {
  const linkRows = [
    { id: "ENG-224", title: "Audit improvements from te…" },
    { id: "ENG-98", title: "Update internal infrastructure…" },
    { id: "ENG-24", title: "Endpoint security updates for…" },
  ]
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#15c651]">
          <FencerLogo className="size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">Fencer</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Create and link issues directly from Fencer
          </p>
        </div>
      </header>

      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        {/* Built by / Website / Enable rail */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-8">
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Built by
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                Fencer
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Website
              </div>
              <a
                href="https://fencer.dev"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Fencer website (opens in new tab)"
                className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
              >
                <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
                fencer.dev
              </a>
            </div>
          </div>
          <Button
            size="sm"
            asChild
            aria-label="Enable Fencer (opens in new tab)"
          >
            <a
              href="https://fencer.dev"
              target="_blank"
              rel="noopener noreferrer"
            >
              Enable
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
            </a>
          </Button>
        </div>

        {/* Marketing tiles — emerald-to-cyan gradient with light Linear Issue
            cards floating in the centre. */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Left tile — Create Linear Issue form */}
          <div
            aria-hidden
            className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg p-3"
            style={{
              background:
                "linear-gradient(135deg, #d6ff4f 0%, #4be36a 50%, #4ed1ff 100%)",
            }}
          >
            <div className="w-[78%] rounded-md bg-white p-2 text-[5px] text-neutral-700 shadow ring-1 ring-black/10">
              <div className="font-semibold text-neutral-900">Linear Issue</div>
              <div className="mt-0.5 flex items-center gap-1 border-b border-neutral-200 pb-0.5">
                <span className="border-b border-neutral-900 pb-0.5 font-medium text-neutral-900">
                  Create
                </span>
                <span className="text-neutral-400">|</span>
                <span className="text-neutral-500">Link</span>
              </div>
              <div className="mt-0.5 grid grid-cols-[36px_1fr] gap-x-1 gap-y-0.5">
                <span className="text-neutral-500">Title</span>
                <span className="rounded border border-neutral-200 px-1 py-0.5">
                  Safari 26.1 is out of date
                </span>
                <span className="text-neutral-500">Description</span>
                <div className="rounded border border-neutral-200 px-1 py-0.5 leading-tight text-neutral-600">
                  **Fencer Vulnerability**: [VULN-19376]
                  (https://app.fencer.dev/fencer/vulnerabilities/19376)
                  <br />
                  **Description:**
                  <br />
                  Safari is out of date.
                  <br />0 vulnerabilities were found due to this outdated
                  version.
                  <br />
                  Severity breakdown: 1 critical, 2 high, 4 medium, 7 low
                  <br />
                  **Severity**: Critical
                </div>
                <span className="text-neutral-500">Team</span>
                <span className="rounded border border-neutral-200 px-1 py-0.5">
                  Engineering ▾
                </span>
                <span className="text-neutral-500">Assignee</span>
                <span className="rounded border border-neutral-200 px-1 py-0.5">
                  None ▾
                </span>
                <span className="text-neutral-500">Label</span>
                <span className="rounded border border-neutral-200 px-1 py-0.5">
                  Security ▾
                </span>
                <span className="text-neutral-500">Project</span>
                <span className="rounded border border-neutral-200 px-1 py-0.5">
                  Security Posture ▾
                </span>
                <span className="text-neutral-500">Status</span>
                <span className="rounded border border-neutral-200 px-1 py-0.5">
                  To Do ▾
                </span>
                <span className="text-neutral-500">Priority</span>
                <span className="rounded border border-neutral-200 px-1 py-0.5">
                  Urgent ▾
                </span>
              </div>
              <div className="mt-1 flex items-center justify-end gap-1">
                <span className="rounded border border-neutral-200 px-1 py-0.5 text-neutral-600">
                  Cancel
                </span>
                <span className="rounded bg-emerald-500 px-1 py-0.5 font-medium text-white">
                  Create Issue
                </span>
              </div>
            </div>
          </div>

          {/* Right tile — Link existing Linear issue */}
          <div
            aria-hidden
            className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg p-3"
            style={{
              background:
                "linear-gradient(135deg, #d6ff4f 0%, #4be36a 50%, #4ed1ff 100%)",
            }}
          >
            <div className="w-[72%] rounded-md bg-white p-2 text-[5px] text-neutral-700 shadow ring-1 ring-black/10">
              <div className="font-semibold text-neutral-900">Linear Issue</div>
              <div className="mt-0.5 flex items-center gap-1 border-b border-neutral-200 pb-0.5">
                <span className="text-neutral-500">Create</span>
                <span className="text-neutral-400">|</span>
                <span className="border-b border-neutral-900 pb-0.5 font-medium text-neutral-900">
                  Link
                </span>
              </div>
              <div className="mt-1 text-neutral-500">Linear Issue</div>
              <div className="rounded border border-neutral-200 px-1 py-0.5 text-neutral-700">
                Select a Linear issue ▾
              </div>
              <div className="mt-1 flex items-center gap-1 rounded border border-neutral-200 bg-neutral-50 px-1 py-0.5">
                <span className="text-neutral-400">🔍</span>
                <span className="text-neutral-500">Welcome to Linear</span>
              </div>
              <div className="mt-0.5 space-y-0.5">
                {linkRows.map((row) => (
                  <div
                    key={row.id}
                    className="flex items-center gap-1 rounded px-1 py-0.5 hover:bg-neutral-50"
                  >
                    <span className="font-mono text-neutral-500">
                      {row.id}:
                    </span>
                    <span className="truncate text-neutral-800">
                      {row.title}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-neutral-500">⊘ Clear search</span>
                <span className="flex items-center gap-1">
                  <span className="rounded border border-neutral-200 px-1 py-0.5 text-neutral-600">
                    Cancel
                  </span>
                  <span className="rounded bg-emerald-500 px-1 py-0.5 font-medium text-white">
                    Link Issue
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Overview */}
        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Fencer&apos;s Linear integration enables security teams to create
            and track Linear issues directly from security findings, including
            vulnerabilities, detections, and exposed secrets. When issues are
            resolved or canceled in Linear, linked findings are automatically
            updated in Fencer, keeping security workflows in sync without manual
            status tracking.
          </p>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-sm font-semibold">How it works</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Fencer integrates with Linear to streamline security remediation
            workflows. Security engineers can create Linear issues directly from
            vulnerabilities discovered in code scans, cloud infrastructure
            assessments, and SIEM detections. When creating an issue, Fencer
            automatically populates the description with relevant context
            including severity, affected assets, remediation guidance, and links
            to industry standards like CWE, OWASP, and CVE references. Teams can
            also link existing Linear issues to findings or perform bulk
            operations to create multiple issues at once.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            The integration maintains bidirectional synchronization through
            webhooks. When a linked Linear issue transitions to a
            &ldquo;Done&rdquo; state, Fencer automatically marks the associated
            vulnerability as ready for verification or the detection as a
            resolved true positive. Similarly, when an issue is canceled, the
            finding is marked as ignored or a false positive. This ensures
            security status stays current without requiring manual updates in
            both systems.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            Issue creation supports full customization including team
            assignment, labels, projects, workflow states, and priority levels.
            Fencer automatically maps security severity (Critical, High, Medium,
            Low) to Linear&apos;s priority system. Each created issue includes
            an attachment linking back to the original finding in Fencer, making
            it easy for developers to access full vulnerability details and
            remediation steps.
          </p>
        </section>

        {/* Configure */}
        <section>
          <h2 className="text-sm font-semibold">Configure</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            To connect Fencer to Linear, navigate to your Fencer&rsquo;s
            integration settings and select Linear. You must be an organization
            admin in Fencer and have permission to install OAuth applications in
            your Linear workspace.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            Click &ldquo;Connect to Linear&rdquo; to begin the OAuth
            authorization flow. You will be redirected to Linear where you can
            review the requested permissions (read and write access to create
            issues, manage labels, and assign team members) and select which
            workspace to connect. After authorizing, you will be returned to
            Fencer where the connection is automatically configured.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            Once connected, you can create Linear issues from any vulnerability,
            detection, or secret detail page, or use bulk actions to create
            issues for multiple findings at once. To disconnect, return to the
            integration settings page and click &ldquo;Disconnect.&rdquo;
          </p>
        </section>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Kawach AI — third-party GRC compliance bot by Kreeti Technologies (BUILT
// BY Kreeti Technologies, WEBSITE kawach.ai, external Enable). Body card has
// two coloured marketing tiles (cyan + magenta) showcasing the dark Linear
// "Workflow areas" config + the Access Control checkbox grid, followed by
// Overview / multi-paragraph How it works / Configure with link to the
// Kawach docs.
// ---------------------------------------------------------------------------
function KawachIntegrationDetail() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#1f1f23]">
          <KawachLogo className="size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">Kawach AI</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Keep your workspace compliant with org policies using Kawach.AI
          </p>
        </div>
      </header>

      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        {/* Built by / Website / Enable rail */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-8">
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Built by
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                Kreeti Technologies
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Website
              </div>
              <a
                href="https://kawach.ai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Kawach AI website (opens in new tab)"
                className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
              >
                <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
                kawach.ai
              </a>
            </div>
          </div>
          <Button
            size="sm"
            asChild
            aria-label="Enable Kawach AI (opens in new tab)"
          >
            <a
              href="https://kawach.ai"
              target="_blank"
              rel="noopener noreferrer"
            >
              Enable
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
            </a>
          </Button>
        </div>

        {/* Marketing tiles — flat cyan + magenta panels with a dark Linear
            settings dialog floating in the centre. */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Left tile — Workflow areas dialog on cyan */}
          <div
            aria-hidden
            className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-[#3ec7e7] p-3"
          >
            <div className="absolute top-3 left-3 max-w-[60%] text-[8px] leading-tight font-semibold text-white">
              Integrate and automate
              <br />
              evidence collection for
              <br />
              Compliance audits.
            </div>
            <div className="absolute right-3 bottom-3 w-[58%] rounded-md bg-[#1a1a1f] p-1.5 text-[5px] text-white/80 ring-1 ring-white/10">
              <div className="flex items-center gap-1 border-b border-white/10 pb-0.5">
                <span className="font-semibold text-white">Linear</span>
                <span className="rounded bg-emerald-500/30 px-1 text-emerald-200">
                  Connected
                </span>
              </div>
              <div className="mt-1 text-[4px] tracking-wider text-white/40 uppercase">
                Details
              </div>
              <div className="grid grid-cols-[36px_1fr] gap-x-1 gap-y-0.5 text-white/70">
                <span>Workspace</span>
                <span className="truncate text-white">
                  76571dd1-457f-4c19-a76d-9bf3f87236ed Linear
                </span>
                <span>Members</span>
                <span className="text-white">
                  https://api.linear.app/membe…
                </span>
                <span>Frequency</span>
                <span className="text-white">Quarterly: high ▾</span>
                <span>Last Sync</span>
                <span className="text-white">Jan 14, 2026</span>
              </div>
              <div className="mt-1 flex items-center justify-end">
                <span className="rounded bg-violet-500 px-1 py-0.5 text-white">
                  ✕ Disconnect
                </span>
              </div>
              <div className="mt-1 font-medium text-white">Workflow Areas</div>
              <div className="mt-0.5 grid grid-cols-[1fr_auto] items-center gap-1">
                <span>Access Control</span>
                <span className="rounded bg-emerald-500/40 px-1 text-emerald-200">
                  Connected
                </span>
              </div>
              <div className="mt-1 font-medium text-white">
                Security Categorization
              </div>
              <div className="mt-0.5 space-y-0.5 text-white/60">
                <div className="flex items-center justify-between">
                  <span>Confidentiality</span>
                  <span>Not defined</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Integrity</span>
                  <span>Not defined</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Availability</span>
                  <span>Not defined</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right tile — Access Control grid on magenta */}
          <div
            aria-hidden
            className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-[#e91d62] p-3"
          >
            <div className="absolute top-3 right-3 w-[40%] text-[8px] leading-tight font-semibold text-white">
              Ensure compliance with
              <br />
              organization&apos;s Access
              <br />
              Control policies
            </div>
            <div className="absolute bottom-3 left-3 w-[58%] rounded-md bg-[#1a1a1f] p-1.5 text-[5px] text-white/80 ring-1 ring-white/10">
              <div className="flex items-center gap-1 border-b border-white/10 pb-0.5">
                <span className="font-semibold text-white">Access Control</span>
                <span className="ml-auto text-white/40">⊕ ✕</span>
              </div>
              <div className="mt-1 text-[3.5px] text-white/50">
                Configure user-level access categorisation across your Linear
                workspace and ensure access is in line with org policies.
              </div>
              <div className="mt-0.5 grid grid-cols-[1fr_repeat(4,16px)] gap-x-1 border-b border-white/10 pb-0.5 text-[3.5px] text-white/40">
                <span>User</span>
                <span>Member</span>
                <span>Read-only</span>
                <span>Workflow</span>
                <span>Review</span>
              </div>
              <div className="mt-0.5 space-y-0.5 text-[3.5px]">
                {[
                  ["Iris", true, false, true, false],
                  ["Aria", true, false, true, true],
                  ["Marcus", true, true, false, false],
                  ["Joel", true, false, true, true],
                ].map((row) => (
                  <div
                    key={row[0] as string}
                    className="grid grid-cols-[1fr_repeat(4,16px)] items-center gap-x-1"
                  >
                    <span className="text-white">{row[0]}</span>
                    {row.slice(1).map((on, i) => (
                      <span
                        key={i}
                        className={`grid size-2 place-items-center rounded-sm ${
                          on
                            ? "bg-emerald-500 text-[3.5px] font-bold text-white"
                            : "bg-white/10"
                        }`}
                      >
                        {on ? "✓" : ""}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
              <div className="mt-1 flex items-center justify-between text-[3.5px] text-white/60">
                <span>4 of 4 reviewed</span>
                <span className="rounded bg-violet-500 px-1 text-white">
                  Run review
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Overview */}
        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            The Kawach.AI integration continuously monitors the Linear workspace
            to ensure that only entitled users have access to the workspace as
            per the organization&apos;s access policies.
          </p>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-sm font-semibold">How it works</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Kawach.AI is a GRC platform that continuously monitors the
            compliance with various controls and policies of the organization
            and flags any non-compliance. This can then later be also presented
            as an evidence during reviews and audits.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            The integration of Kawach with Linear currently monitors the access
            of organizational users to Linear workspace, and ensures that only
            entitled users have access. If any user is no longer associated with
            the organization or his role has changed such that it warrants
            deactivation of the Linear account, it is flagged to the
            organization admin.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            This compliance record is logged and can be periodically reviewed
            and audited.
          </p>
        </section>

        {/* Configure */}
        <section>
          <h2 className="text-sm font-semibold">Configure</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            The user will need to be a Kawach admin to be able to integrate
            their Linear workspace with Kawach. More details can be found{" "}
            <a
              href="https://kawach.ai/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              here
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Orca Security — third-party CNAPP/AppSec platform (BUILT BY Orca Security,
// WEBSITE orca.security, external Enable). Body card has two dark blue light-
// streak marketing tiles (alert status mapping table + alert template field
// mapping), followed by Overview, a long multi-paragraph How it works with
// inline numbered admin actions, and a numbered Configure with docs link.
// ---------------------------------------------------------------------------
function OrcaSecurityIntegrationDetail() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white ring-1 ring-black/10">
          <OrcaSecurityLogo className="size-10" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">
            Orca Security
          </h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Streamline security fixes by sharing relevant context with the right
            people
          </p>
        </div>
      </header>

      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        {/* Built by / Website / Enable rail */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-8">
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Built by
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                Orca Security
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Website
              </div>
              <a
                href="https://orca.security"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Orca Security website (opens in new tab)"
                className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
              >
                <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
                orca.security
              </a>
            </div>
          </div>
          <Button
            size="sm"
            asChild
            aria-label="Enable Orca Security (opens in new tab)"
          >
            <a
              href="https://orca.security"
              target="_blank"
              rel="noopener noreferrer"
            >
              Enable
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
            </a>
          </Button>
        </div>

        {/* Marketing tiles — dark blue gradient with diagonal light streaks
            and a light Orca status-mapping panel floating to the right. */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Left tile — Orca alert status update / Linear-issue mapping */}
          <div
            aria-hidden
            className="relative aspect-[4/3] overflow-hidden rounded-lg p-3"
            style={{
              background:
                "linear-gradient(135deg, #061a4a 0%, #0a3a8a 50%, #1455c8 100%)",
            }}
          >
            {/* Diagonal light streaks */}
            <span className="pointer-events-none absolute -top-8 -left-4 h-40 w-2 rotate-12 bg-white/20 blur-sm" />
            <span className="pointer-events-none absolute top-2 left-10 h-44 w-2 rotate-12 bg-white/15 blur-sm" />
            <span className="pointer-events-none absolute top-0 left-24 h-48 w-2 rotate-12 bg-white/10 blur-sm" />

            <div className="absolute top-3 left-3 w-[42%] text-[7px] leading-tight font-semibold text-white">
              Maintain consistency
              <br />
              across systems with this
              <br />
              bi-directional integration
            </div>
            <div className="absolute right-3 bottom-3 w-[55%] rounded-md bg-white p-1.5 text-[5px] text-neutral-700 shadow ring-1 ring-black/10">
              <div className="font-semibold text-neutral-900">
                Orca alert status update
              </div>
              <div className="mt-0.5 text-[4px] text-neutral-500">
                Select the Linear issue status to match the Orca alert status
                change.
              </div>
              <div className="mt-1 font-medium text-neutral-900">
                Orca alert to Linear issue
              </div>
              <div className="mt-0.5 grid grid-cols-[44px_18px_1fr] items-center gap-x-1 gap-y-0.5 text-[4px]">
                {[
                  ["Open", "→", "Todo"],
                  ["Closed", "→", "Cancelled"],
                  ["Snoozed", "→", "custom backlog st…"],
                  ["Dismissed", "→", "custom backlog st…"],
                  ["In Progress", "→", "In Progress"],
                ].map((row) => (
                  <React.Fragment key={row[0]}>
                    <span className="text-neutral-700">{row[0]}</span>
                    <span className="text-neutral-400">{row[1]}</span>
                    <span className="rounded border border-neutral-200 px-1 py-0.5 text-neutral-700">
                      {row[2]} ▾
                    </span>
                  </React.Fragment>
                ))}
              </div>
              <div className="mt-1 font-medium text-neutral-900">
                Linear issue status update
              </div>
              <div className="mt-0.5 text-[4px] text-neutral-500">
                Select the Orca alert status to match the Linear issue status
                change.
              </div>
              <div className="mt-0.5 font-medium text-neutral-900">
                Linear issue to Orca alert
              </div>
              <div className="mt-0.5 grid grid-cols-[44px_18px_1fr] items-center gap-x-1 gap-y-0.5 text-[4px]">
                {[
                  ["In Progress", "→", "In Progress"],
                  ["Backlog", "→", "Open"],
                  ["Done", "→", "Closed"],
                  ["custom backlog s…", "→", "Snoozed"],
                  ["Todo", "→", "Open"],
                  ["Cancelled", "→", "Closed"],
                ].map((row) => (
                  <React.Fragment key={`b-${row[0]}`}>
                    <span className="truncate text-neutral-700">{row[0]}</span>
                    <span className="text-neutral-400">{row[1]}</span>
                    <span className="rounded border border-neutral-200 px-1 py-0.5 text-neutral-700">
                      {row[2]} ▾
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Right tile — Linear issue field template mapping */}
          <div
            aria-hidden
            className="relative aspect-[4/3] overflow-hidden rounded-lg p-3"
            style={{
              background:
                "linear-gradient(135deg, #061a4a 0%, #0a3a8a 50%, #1455c8 100%)",
            }}
          >
            <span className="pointer-events-none absolute -top-8 -left-4 h-40 w-2 rotate-12 bg-white/20 blur-sm" />
            <span className="pointer-events-none absolute top-2 left-10 h-44 w-2 rotate-12 bg-white/15 blur-sm" />
            <span className="pointer-events-none absolute top-0 left-24 h-48 w-2 rotate-12 bg-white/10 blur-sm" />

            <div className="absolute top-3 left-3 w-[40%] text-[7px] leading-tight font-semibold text-white">
              Create templates to pass
              <br />
              Orca alert details into
              <br />
              Linear issue fields
            </div>
            <div className="absolute right-3 bottom-3 w-[58%] rounded-md bg-white p-1.5 text-[5px] text-neutral-700 shadow ring-1 ring-black/10">
              <div className="grid grid-cols-2 gap-1 border-b border-neutral-200 pb-0.5 text-[4px] font-semibold tracking-wide text-neutral-500 uppercase">
                <span>Orca fields</span>
                <span>Linear fields</span>
              </div>
              <div className="mt-0.5 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[4px]">
                {[
                  ["Asset Name", "Title"],
                  ["Asset Vendor ID", ""],
                  ["Cloud Vendor", ""],
                  ["Container Name", ""],
                  ["Container ID", ""],
                  ["Cluster Name", ""],
                  ["Cluster Type", ""],
                  ["Image Name", ""],
                  ["Asset State", "Status"],
                  ["Score", "Priority"],
                  ["Description", "Description"],
                  ["Recommendation", ""],
                  ["Compliance", ""],
                  ["Categories", "Labels"],
                ].map((row, i) => (
                  <React.Fragment key={`f-${i}`}>
                    <span className="rounded border border-neutral-200 px-1 py-0.5 text-neutral-700">
                      {row[0]}
                    </span>
                    {row[1] ? (
                      <span className="rounded border border-neutral-200 px-1 py-0.5 text-neutral-700">
                        {row[1]}
                      </span>
                    ) : (
                      <span className="rounded border border-dashed border-neutral-200 px-1 py-0.5 text-neutral-400">
                        —
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Overview */}
        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            The bi-directional integration between Linear and Orca enables
            stronger collaboration between security and cross-functional product
            teams to fix risky cloud security and compliance gaps.
          </p>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-sm font-semibold">How it works</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Command your cloud with Orca Security to identify, prioritize, and
            remediate risks. Orca unifies security across your organization by
            combining critical pre-deployment capabilities (AppSec) and runtime
            security (CNAPP).
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            With Linear as your primary operating tool to streamline product
            development, Orca Security delivers relevant details about alerts to
            help teams prioritize security fixes in the same place they manage
            their workstream. Within the Orca Platform, admins can:
          </p>
          <ol className="text-muted-foreground mt-2 list-decimal space-y-1 pl-5 text-sm leading-6">
            <li>
              Set up templates to organize the data they want to share in Linear
              issues,
            </li>
            <li>
              Set up automation to create Linear issues for a specific group of
              alerts,
            </li>
            <li>
              Allow end-users to manually create Linear issues from the Orca
              Platform UI using the templates from the first step.
            </li>
          </ol>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            The bi-directional sync ensures Orca alerts are linked with Linear
            issues so that statuses are updated automatically when changes are
            made from either platform. This reduces the manual overhead of
            validating the current step of remediation and closing the loop when
            Orca alerts are fully remediated, while maintaining the history as
            your environment changes.
          </p>
        </section>

        {/* Configure */}
        <section>
          <h2 className="text-sm font-semibold">Configure</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            To set up this integration, two things are required:
          </p>
          <ol className="text-muted-foreground mt-2 list-decimal space-y-1 pl-5 text-sm leading-6">
            <li>Authorize Orca&rsquo;s access to Linear</li>
            <li>
              Create a template in the Orca Platform to map to the Linear
              project, fields, and more.
            </li>
          </ol>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            More details can be found in the{" "}
            <a
              href="https://docs.orca.security"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              docs
            </a>{" "}
            portal in your Orca Security account.
          </p>
        </section>
      </div>
    </div>
  )
}

// Mini Airbyte mark used inside the Airbyte hero mockups (small enough that
// the full LoomLogo-style sweep would render as soup at this size).
function AirbyteLogoMini() {
  return (
    <span
      aria-hidden
      className="grid size-2 place-items-center rounded-sm bg-[#6E4FF6] text-[5px] font-bold text-white"
    >
      A
    </span>
  )
}

// ---------------------------------------------------------------------------
// SecureSlate (BUILT BY SecureSlate, WEBSITE getsecureslate.com, external
// Enable). Body card has a single emerald-gradient marketing tile with an
// "Add Task" form mockup, followed by Overview / How it works and a numbered
// Configure walkthrough.
// ---------------------------------------------------------------------------
function SecureSlateIntegrationDetail() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#0a1d17]">
          <SecureSlateLogo className="size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">SecureSlate</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Create and link SecureSlate security tickets to Linear
          </p>
        </div>
      </header>

      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        {/* Built by / Website / Enable rail */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-8">
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Built by
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                SecureSlate
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Website
              </div>
              <a
                href="https://getsecureslate.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="SecureSlate website (opens in new tab)"
                className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
              >
                <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
                getsecureslate.com
              </a>
            </div>
          </div>
          <Button
            size="sm"
            asChild
            aria-label="Enable SecureSlate (opens in new tab)"
          >
            <a
              href="https://getsecureslate.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Enable
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
            </a>
          </Button>
        </div>

        {/* Marketing tile — emerald wash with "Add Task" form mockup. */}
        <div
          aria-hidden
          className="relative aspect-[16/9] overflow-hidden rounded-lg p-5"
          style={{
            background:
              "linear-gradient(135deg, #064e3b 0%, #047857 55%, #10b981 100%)",
          }}
        >
          <div className="max-w-[55%] text-[13px] leading-tight font-semibold text-white">
            Create and assign tickets for your{" "}
            <span className="text-emerald-200">security issues</span> to ensure
            compliance
          </div>
          <div className="absolute right-3 bottom-3 w-[42%] rounded-md bg-white p-2 text-[6px] text-neutral-700 shadow ring-1 ring-black/10">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-1">
              <span className="font-semibold text-neutral-900">Add Task</span>
              <span className="text-neutral-400">×</span>
            </div>
            <div className="mt-1 text-[5px] text-neutral-500 uppercase">
              Task
            </div>
            <div className="rounded border border-neutral-200 px-1 py-0.5 text-neutral-400">
              Enter task name
            </div>
            <div className="mt-1 text-[5px] text-neutral-500 uppercase">
              Priority
            </div>
            <div className="rounded border border-neutral-200 px-1 py-0.5">
              <span className="rounded bg-rose-100 px-1 text-rose-600">
                High
              </span>
            </div>
            <div className="mt-1 text-[5px] text-neutral-500 uppercase">
              Assign
            </div>
            <div className="rounded border border-neutral-200 px-1 py-0.5 text-neutral-400">
              Select owner ⌄
            </div>
            <div className="mt-1 text-[5px] text-neutral-500 uppercase">
              Due Date
            </div>
            <div className="rounded border border-neutral-200 px-1 py-0.5 text-neutral-700">
              1 January, 2024
            </div>
            <div className="mt-1 text-[5px] text-neutral-500 uppercase">
              Delivery
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-700">Send email</span>
              <span className="h-1.5 w-3 rounded-full bg-emerald-500" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-700">Create issue on Linear</span>
              <span className="h-1.5 w-3 rounded-full bg-emerald-500" />
            </div>
            <div className="mt-1 flex items-center justify-end gap-1">
              <span className="rounded border border-neutral-200 px-1 py-0.5 text-neutral-600">
                Cancel
              </span>
              <span className="rounded bg-emerald-500 px-1 py-0.5 text-white">
                Add Task
              </span>
            </div>
          </div>
        </div>

        {/* Overview */}
        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            The SecureSlate integration for Linear will allow you to create and
            push SecureSlate tasks to your Linear project.
          </p>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-sm font-semibold">How it works</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            After connecting the integration, the option to select a Linear team
            will appear each time you create a task. Once you select your Linear
            team, you can link your SecureSlate tasks to Linear. These tickets
            can then be managed directly from your Linear account, allowing you
            to prioritize and set deadlines efficiently.
          </p>
        </section>

        {/* Configure */}
        <section>
          <h2 className="text-sm font-semibold">Configure</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            You&apos;ll need access to a SecureSlate admin account to complete
            the integration process.
          </p>
          <ol className="text-muted-foreground mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-6">
            <li>Go to Integrations page and search for Linear</li>
            <li>Click on connect</li>
            <li>A side bar will appear, click on connect again</li>
            <li>
              You&apos;ll be redirected to Linear and you&apos;ll need to login
              if you haven&apos;t already
            </li>
            <li>
              Allow SecureSlate permission to access your Linear workspace
            </li>
          </ol>
        </section>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Vanta (BUILT BY Vanta, WEBSITE vanta.com, external Enable). Body card has
// two violet marketing tiles (Create Linear issue form + Tasks/items-to-
// remediate dashboard), followed by Overview, How it works (numbered) and a
// numbered Configure walkthrough.
// ---------------------------------------------------------------------------
function VantaIntegrationDetail() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <BackToIntegrationsLink />

      <header className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#1a1a1a]">
          <VantaLogo className="size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold">Vanta</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Automate compliance. Simplify security. Demonstrate trust.
          </p>
        </div>
      </header>

      <div className="bg-card flex flex-col gap-6 rounded-lg border p-5">
        {/* Built by / Website / Enable rail */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-8">
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Built by
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                Vanta
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Website
              </div>
              <a
                href="https://vanta.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Vanta website (opens in new tab)"
                className="hover:text-foreground mt-1 flex items-center gap-1.5 text-sm font-medium"
              >
                <HugeiconsIcon icon={GlobeIcon} className="size-3.5" />
                vanta.com
              </a>
            </div>
          </div>
          <Button
            size="sm"
            asChild
            aria-label="Enable Vanta (opens in new tab)"
          >
            <a
              href="https://vanta.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Enable
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
            </a>
          </Button>
        </div>

        {/* Marketing tiles — violet tiles with Create-Issue form + Tasks
            dashboard mockups. */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div
            aria-hidden
            className="relative aspect-[4/3] overflow-hidden rounded-lg p-3"
            style={{
              background:
                "linear-gradient(135deg, #2e1065 0%, #4c1d95 55%, #6d28d9 100%)",
            }}
          >
            <div className="absolute inset-3 rounded-md bg-white p-2 text-[5px] text-neutral-700 shadow ring-1 ring-black/10">
              <div className="border-b border-neutral-200 pb-0.5 font-semibold text-neutral-900">
                Create Linear Issue
              </div>
              <div className="mt-0.5 text-[4px] text-neutral-500">
                1 Linear issue will be created for selected item.
              </div>
              <div className="mt-0.5 text-[4px] text-neutral-500">
                · Selected item (1)
              </div>
              <div className="mt-1 text-[4px] text-neutral-500 uppercase">
                Team
              </div>
              <div className="rounded border border-neutral-200 px-1 py-0.5">
                Expectations
              </div>
              <div className="mt-1 text-[4px] text-neutral-500 uppercase">
                Assignee
              </div>
              <div className="rounded border border-neutral-200 px-1 py-0.5">
                Unassigned
              </div>
              <div className="mt-1 text-[4px] text-neutral-500 uppercase">
                State
              </div>
              <div className="rounded border border-neutral-200 px-1 py-0.5">
                Unassigned
              </div>
              <div className="mt-1 text-[4px] text-neutral-500 uppercase">
                Priority
              </div>
              <div className="rounded border border-neutral-200 px-1 py-0.5">
                Unassigned
              </div>
              <div className="mt-1 text-[4px] text-neutral-500 uppercase">
                Label(s)
              </div>
              <div className="rounded border border-neutral-200 px-1 py-0.5 text-neutral-400">
                Select labels
              </div>
              <div className="mt-1 text-[4px] text-neutral-500 uppercase">
                Name
              </div>
              <div className="rounded border border-neutral-200 px-1 py-0.5 text-[4px] text-neutral-700">
                [Vanta] Remediate &apos;Employees agree to Incident Response
                Plan with GDPR Addendum and Breach Notification Procedures&apos;
                for [name(s)]
              </div>
              <div className="mt-1 text-[4px] text-neutral-500 uppercase">
                Description
              </div>
              <div className="mt-1 flex items-center justify-end gap-1">
                <span className="rounded border border-neutral-200 px-1 py-0.5 text-neutral-600">
                  Cancel
                </span>
                <span className="rounded bg-violet-600 px-1 py-0.5 text-white">
                  Create
                </span>
              </div>
            </div>
          </div>
          <div
            aria-hidden
            className="relative aspect-[4/3] overflow-hidden rounded-lg p-3"
            style={{
              background:
                "linear-gradient(135deg, #2e1065 0%, #4c1d95 55%, #6d28d9 100%)",
            }}
          >
            <div className="absolute inset-3 rounded-md bg-white p-2 text-[5px] text-neutral-700 shadow ring-1 ring-black/10">
              <div className="flex items-center gap-1 border-b border-neutral-200 pb-0.5">
                <span className="font-semibold text-neutral-900">Tasks</span>
                <span className="ml-auto text-[4px] text-neutral-400">
                  Choose Marketing
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-1 text-[4px] text-neutral-500">
                <span className="rounded bg-neutral-100 px-1">Shortcuts</span>
                <span className="rounded bg-neutral-100 px-1">LinearV2</span>
                <span className="rounded bg-neutral-100 px-1">JIRA</span>
                <span className="rounded bg-neutral-100 px-1">Workspace</span>
                <span className="rounded bg-neutral-100 px-1">Linkedin</span>
              </div>
              <div className="mt-0.5 flex items-center gap-1 border-b border-neutral-200 pb-0.5">
                <span className="text-[4px] font-semibold text-neutral-900">
                  Items to remediate
                </span>
                <span className="ml-auto rounded bg-violet-600 px-1 py-0.5 text-[4px] text-white">
                  Create issue
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-1 text-[4px] text-neutral-500">
                <span className="size-1 rounded-sm bg-neutral-300" />
                <span className="font-medium text-neutral-700">
                  Vendor Test
                </span>
                <span className="ml-auto truncate">[Vanta] task@vanta.com</span>
                <span>August 21, 2023</span>
                <span className="rounded bg-rose-100 px-1 text-rose-600">
                  Due
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Overview */}
        <section>
          <h2 className="text-sm font-semibold">Overview</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            By integrating Linear, admins can create tickets from within Vanta
            to ensure issues are tracked through remediation.
          </p>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-sm font-semibold">How it works</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Managing your security posture while scaling a business is
            complicated. The integration between Vanta and Linear allows joint
            customers to create and manage security-relevant projects without
            worrying about compliance.
          </p>
          <ol className="text-muted-foreground mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-6">
            <li>
              Open up compliance-related tickets in your Vanta profile to track
              failing tests through remediation, ensure critical issues get
              resolved, and pull in security-related tasks that are already
              being tracked in Linear.
            </li>
            <li>
              Confirm the correct team members have access through the real-time
              user list in Vanta.
            </li>
            <li>
              Streamline the vendor procurement process by utilizing
              Vanta&apos;s vendor risk management tool.
            </li>
          </ol>
        </section>

        {/* Configure */}
        <section>
          <h2 className="text-sm font-semibold">Configure</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Once you log into Vanta (must be an admin to make integrations):
          </p>
          <ol className="text-muted-foreground mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-6">
            <li>From the left-hand navigation panel, select Integrations</li>
            <li>Open the Available tab</li>
            <li>Choose Task Management</li>
            <li>
              Select Connect on Linear and follow the instruction prompts to
              complete the connection
            </li>
          </ol>
        </section>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Generic stub used for non-GitHub integrations. Mirrors the previous page
// content so other slugs continue to render without regression.
// ---------------------------------------------------------------------------
function GenericIntegrationDetail({ slug }: { slug: string }) {
  const name = titleFromSlug(slug)

  return (
    <div className="flex max-w-2xl flex-col gap-6 p-6">
      <BackToIntegrationsLink label="Back to integrations" />

      <div>
        <h1 className="text-2xl font-semibold">{name}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Full integration configuration for{" "}
          <span className="font-medium">{name}</span>. Connect your workspace to
          sync data and enable workflow automations.
        </p>
      </div>

      <div className="bg-card rounded-lg border p-5">
        <h2 className="text-sm font-semibold">About</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          This is a stub detail page used by the settings mock. The production
          integration details pane would include a full product description,
          supported features, pricing tier requirements, and release notes.
        </p>
        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            onClick={() => toast.info(`${name} OAuth connect flow coming soon`)}
          >
            <HugeiconsIcon icon={Link01Icon} className="size-3.5" />
            Connect {name}
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a
              href={`https://linear.app/docs/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name} docs (opens in new tab)`}
            >
              Learn more
            </a>
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-5">
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            icon={Shield01Icon}
            className="text-muted-foreground size-4"
          />
          <h2 className="text-sm font-semibold">Permissions</h2>
        </div>
        <ul className="text-muted-foreground mt-3 list-disc space-y-1.5 pl-5 text-sm">
          <li>Read your Linear workspace and teams.</li>
          <li>Create and update issues on your behalf.</li>
          <li>Post notifications to connected channels.</li>
        </ul>
      </div>
    </div>
  )
}
