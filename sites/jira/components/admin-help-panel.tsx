"use client"

import { useState, useRef, useEffect } from "react"
// Input replaced with plain <input> — base-ui Input unreliable

interface Message {
  role: "assistant" | "user"
  content: string
}

const suggestedQuestions = [
  "What is an Atlassian account?",
  "How do I control user access to products?",
  "What are Smart Links?",
]

const knowledgeBase: Record<string, string> = {
  "atlassian account":
    "An Atlassian account is a free account that gives you access to Atlassian products like Jira, Confluence, Trello, and more. Your account stores your profile information, preferences, and lets you manage your product access. You can create one at id.atlassian.com.",
  "user access":
    "To control user access to products:\n\n1. Go to **Admin > Directory > Users**\n2. Select a user to view their product access\n3. Use **App access settings** to set default access for new users\n4. Create **Groups** to manage access for multiple users at once\n5. Use **Access policies** under Security to set organization-wide rules",
  "smart links":
    "Smart Links are intelligent hyperlinks that display rich previews of content from Atlassian and third-party tools. When you paste a URL in Jira or Confluence, Smart Links automatically show a preview with the title, status, and other metadata. You can configure Smart Links under **Apps > App URLs**.",
  "external user":
    "External users are people who collaborate with your team but have a different email address from your company domain. You can manage external user policies under **Security > User security > External users**. To unlock advanced external user settings, you need an Atlassian Guard subscription.",
  security:
    "Atlassian provides multiple security layers:\n\n- **Authentication policies**: Configure login requirements\n- **Access policies**: Control who can access what\n- **Identity providers**: Set up SSO with SAML or Google\n- **Data protection**: Classify data and set security policies\n- **Device security**: Manage IP allowlists and mobile policies\n\nVisit **Security > Security guide** for a comprehensive overview.",
  group:
    "Groups let you organize users and manage their product access collectively. To manage groups:\n\n1. Go to **Admin > Directory > Groups**\n2. Create a new group or select an existing one\n3. Add or remove members\n4. Assign product access to the entire group\n\nDefault groups like 'jira-software-users' are created automatically.",
  domain:
    "Domains help you verify ownership of your company's email domain. Once verified, you can:\n\n- Automatically claim accounts using your domain\n- Apply security policies to all users with your domain email\n- Manage external vs internal users\n\nGo to **Admin > Directory > Domains** to verify a domain.",
  billing:
    "Manage your billing and subscriptions under **Admin > Billing**. Here you can:\n\n- View current plans and usage\n- Update payment methods\n- Download invoices\n- Change subscription tiers\n- Manage user counts for billing purposes",
  "api key":
    "API keys let you authenticate with Atlassian APIs programmatically. Manage them under **Organization settings > API keys**. You can also monitor API token usage under **Insights > API token activity**. Always keep your API keys secure and rotate them regularly.",
  rovo: "Rovo is Atlassian's AI-powered assistant that helps teams find information, learn, and take action. Configure Rovo under:\n\n- **Rovo access**: Control who can use Rovo\n- **Rovo MCP server**: Manage MCP server connections\n- **Rovo insights**: View usage analytics (Beta)\n- **Rovo settings**: Configure Rovo behavior",
  backup:
    "Data backup and restore lets you protect your organization's data. Go to **Data management > Backup and restore** to:\n\n- Create manual backups\n- Schedule automatic backups\n- Restore from a previous backup\n- Export data for compliance purposes",
  "audit log":
    "The audit log records important actions in your organization. Find it under **Insights > Audit log**. You can:\n\n- Search for specific events\n- Filter by user, date, or action type\n- Export logs for compliance\n- Monitor admin changes and security events",
}

function getAIResponse(question: string): string {
  const q = question.toLowerCase()

  for (const [key, value] of Object.entries(knowledgeBase)) {
    if (q.includes(key)) return value
  }

  if (q.includes("help") || q.includes("what can you")) {
    return "I can help you with:\n\n- Managing users, groups, and teams\n- Security settings and policies\n- App access and configuration\n- Billing and subscriptions\n- Data management and backups\n- API keys and integrations\n- Rovo AI settings\n\nJust ask me any question about your Atlassian admin settings!"
  }

  if (q.includes("user") || q.includes("member") || q.includes("people")) {
    return "For user management, go to **Admin > Directory > Users**. From there you can:\n\n- View all users in your organization\n- Manage individual user access\n- See user status (active, suspended, etc.)\n- Manage external users under **Security > User security > External users**\n\nWould you like to know more about a specific user management feature?"
  }

  if (
    q.includes("app") ||
    q.includes("integration") ||
    q.includes("marketplace")
  ) {
    return "You can manage apps and integrations under **Admin > Apps**:\n\n- **Atlassian apps**: Browse and manage installed apps\n- **App access settings**: Control default app access\n- **User requests**: Review app access requests\n- **App URLs**: Configure application URLs\n\nFor third-party app management, check **Shadow IT** settings."
  }

  if (
    q.includes("password") ||
    q.includes("login") ||
    q.includes("auth") ||
    q.includes("sso")
  ) {
    return "For authentication and login settings:\n\n- **Authentication policies**: Set password requirements, 2FA, and session duration under **Security > User security > Authentication policies**\n- **Identity providers**: Configure SSO with SAML or Google under **Security > User security > Identity providers**\n- **Login page**: Customize your login page under **Organization settings > Login page**"
  }

  return "I'd be happy to help with that! As your Atlassian admin assistant, I can provide guidance on user management, security settings, app configuration, billing, and more. Could you provide more details about what you're looking for? You can also try browsing the sidebar navigation to find the specific admin section you need."
}

export function AdminHelpPanel({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi, welcome to Atlassian Support.\n\nYou can get help with any of our apps in this AI-powered chat.\n\nHow can I assist you today?",
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const handleSend = () => {
    if (!input.trim() || isTyping) return
    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsTyping(true)

    setTimeout(
      () => {
        const response = getAIResponse(userMessage)
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: response },
        ])
        setIsTyping(false)
      },
      800 + 700 * 0.5
    )
  }

  const handleSuggestion = (question: string) => {
    setMessages((prev) => [...prev, { role: "user", content: question }])
    setIsTyping(true)

    setTimeout(
      () => {
        const response = getAIResponse(question)
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: response },
        ])
        setIsTyping(false)
      },
      800 + 700 * 0.5
    )
  }

  const handleNewChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Hi, welcome to Atlassian Support.\n\nYou can get help with any of our apps in this AI-powered chat.\n\nHow can I assist you today?",
      },
    ])
    setInput("")
    setIsTyping(false)
  }

  if (!open) return null

  const showSuggestions = messages.length === 1

  return (
    <div className="flex h-full w-80 flex-col border-l bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-base font-semibold">Help</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleNewChat}
            className="flex items-center gap-1 rounded px-2 py-1 text-sm text-muted-foreground hover:bg-accent"
          >
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            New
          </button>
          <button
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:bg-accent"
          >
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-4 ${msg.role === "user" ? "flex justify-end" : ""}`}
          >
            {msg.role === "assistant" ? (
              <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm leading-relaxed text-foreground dark:bg-blue-900/20">
                {msg.content.split("\n").map((line, j) => (
                  <p key={j} className={line === "" ? "h-2" : ""}>
                    {line
                      .split(/(\*\*.*?\*\*)/)
                      .map((part, k) =>
                        part.startsWith("**") && part.endsWith("**") ? (
                          <strong key={k}>{part.slice(2, -2)}</strong>
                        ) : (
                          <span key={k}>{part}</span>
                        )
                      )}
                  </p>
                ))}
              </div>
            ) : (
              <div className="max-w-[85%] rounded-lg bg-blue-600 px-4 py-2.5 text-sm text-white">
                {msg.content}
              </div>
            )}
          </div>
        ))}

        {/* Suggested questions */}
        {showSuggestions && (
          <div className="mt-2 flex flex-col gap-2">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSuggestion(q)}
                className="flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-accent"
              >
                <svg
                  className="size-4 shrink-0 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="mb-4">
            <div className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-4 py-3 dark:bg-blue-900/20">
              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t px-4 py-3">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask a question to get started"
            disabled={isTyping}
            className="w-full rounded-md border bg-background py-2 pr-10 pl-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
          >
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
          <svg
            className="size-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          Uses AI. Verify results
        </p>
      </div>
    </div>
  )
}
