import { afterEach, describe, expect, it } from "vitest"
import {
  OAUTH_SCOPES,
  WEBHOOK_RESOURCES,
  createOAuthApp,
  createWebhook,
  deleteOAuthApp,
  deleteWebhook,
  generateSecret,
  oauthApps,
  parseRedirectUris,
  rotateOAuthClientSecret,
  rotateWebhookSecret,
  validateRedirectUri,
  validateWebhookUrl,
  webhooks,
} from "../lib/api-settings-mocks"

afterEach(() => {
  oauthApps.length = 0
  webhooks.length = 0
})

describe("validateRedirectUri", () => {
  it("accepts http and https URLs", () => {
    expect(validateRedirectUri("https://example.com/cb").success).toBe(true)
    expect(validateRedirectUri("http://localhost:3000/cb").success).toBe(true)
  })

  it("rejects other schemes", () => {
    expect(validateRedirectUri("ftp://example.com").success).toBe(false)
    expect(validateRedirectUri("javascript:alert(1)").success).toBe(false)
  })

  it("rejects empty and garbage", () => {
    expect(validateRedirectUri("").success).toBe(false)
    expect(validateRedirectUri("   ").success).toBe(false)
    expect(validateRedirectUri("nota-url").success).toBe(false)
  })
})

describe("parseRedirectUris", () => {
  it("splits on commas, spaces, newlines and dedupes", () => {
    const r = parseRedirectUris(
      "https://a.com/cb, https://b.com/cb\nhttps://a.com/cb"
    )
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual([
      "https://a.com/cb",
      "https://b.com/cb",
    ])
  })

  it("rejects when any entry is invalid", () => {
    const r = parseRedirectUris("https://a.com/cb, oops")
    expect(r.success).toBe(false)
  })

  it("rejects empty input", () => {
    expect(parseRedirectUris("").success).toBe(false)
  })
})

describe("createOAuthApp", () => {
  it("requires a name and at least one redirect URI", () => {
    expect(createOAuthApp({ redirectUris: "https://a.com/cb" }).success).toBe(
      false
    )
    expect(createOAuthApp({ name: "Demo" }).success).toBe(false)
  })

  it("persists a valid app with client_id and client_secret", () => {
    const r = createOAuthApp({
      name: "Demo",
      description: "A demo",
      redirectUris: "https://a.com/cb",
      scopes: ["read", "write"],
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.id).toMatch(/^oauth_/)
      expect(r.data.clientId).toMatch(/^lin_oauth_/)
      expect(r.data.clientSecret.length).toBeGreaterThanOrEqual(40)
      expect(r.data.redirectUris).toEqual(["https://a.com/cb"])
      expect(r.data.scopes).toEqual(["read", "write"])
      expect(oauthApps).toHaveLength(1)
    }
  })

  it("filters scopes to the canonical set", () => {
    const r = createOAuthApp({
      name: "Demo",
      redirectUris: "https://a.com/cb",
      scopes: ["read", "write", "bogus", "issues:create"],
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.scopes).toEqual(["read", "write", "issues:create"])
    }
  })
})

describe("OAUTH_SCOPES", () => {
  it("matches the spec's canonical scope set", () => {
    expect([...OAUTH_SCOPES]).toEqual([
      "read",
      "write",
      "admin",
      "issues:create",
      "comments:create",
    ])
  })
})

describe("rotateOAuthClientSecret", () => {
  it("returns a new secret each call", () => {
    const c = createOAuthApp({
      name: "Demo",
      redirectUris: "https://a.com/cb",
    })
    if (!c.success) throw new Error("setup")
    const firstSecret = c.data.clientSecret
    const r = rotateOAuthClientSecret(c.data.id)
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.clientSecret).not.toEqual(firstSecret)
  })

  it("404s on unknown id", () => {
    expect(rotateOAuthClientSecret("missing").success).toBe(false)
  })
})

describe("deleteOAuthApp", () => {
  it("removes the app", () => {
    const c = createOAuthApp({
      name: "Demo",
      redirectUris: "https://a.com/cb",
    })
    if (!c.success) throw new Error("setup")
    expect(deleteOAuthApp(c.data.id).success).toBe(true)
    expect(oauthApps).toHaveLength(0)
  })
})

describe("validateWebhookUrl", () => {
  it("accepts http(s)", () => {
    expect(validateWebhookUrl("https://api.example.com/hook").success).toBe(
      true
    )
  })
  it("rejects invalid schemes", () => {
    expect(validateWebhookUrl("slack://foo").success).toBe(false)
  })
  it("rejects empty and bad urls", () => {
    expect(validateWebhookUrl("").success).toBe(false)
    expect(validateWebhookUrl("not a url").success).toBe(false)
  })
})

describe("createWebhook", () => {
  it("requires URL and at least one resource type", () => {
    expect(createWebhook({ resources: ["issues"] }).success).toBe(false)
    expect(
      createWebhook({ url: "https://a.com/hook", resources: [] }).success
    ).toBe(false)
  })

  it("rejects unknown resource types silently (filters them out)", () => {
    // Unknown resources are filtered to []; with only unknowns, creation
    // fails with "at least one resource type".
    const r = createWebhook({
      url: "https://a.com/hook",
      resources: ["bogus"],
    })
    expect(r.success).toBe(false)
  })

  it("persists a valid webhook", () => {
    const r = createWebhook({
      url: "https://a.com/hook",
      resources: ["issues", "comments"],
      teamId: "team-1",
      secret: "abc",
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.resources).toEqual(["issues", "comments"])
      expect(r.data.teamId).toBe("team-1")
      expect(webhooks).toHaveLength(1)
    }
  })

  it("auto-generates a secret when none is supplied", () => {
    const r = createWebhook({
      url: "https://a.com/hook",
      resources: ["issues"],
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.secret.length).toBeGreaterThanOrEqual(40)
  })

  it("accepts newly-added resource types", () => {
    const r = createWebhook({
      url: "https://a.com/hook",
      resources: [
        "initiatives",
        "documents",
        "customer-requests",
        "issue-attachments",
        "project-updates",
      ],
    })
    expect(r.success).toBe(true)
  })
})

describe("rotateWebhookSecret", () => {
  it("returns a new secret each call", () => {
    const c = createWebhook({
      url: "https://a.com/hook",
      resources: ["issues"],
    })
    if (!c.success) throw new Error("setup")
    const first = c.data.secret
    const r = rotateWebhookSecret(c.data.id)
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.secret).not.toEqual(first)
  })
})

describe("deleteWebhook", () => {
  it("removes the webhook", () => {
    const c = createWebhook({
      url: "https://a.com/hook",
      resources: ["issues"],
    })
    if (!c.success) throw new Error("setup")
    expect(deleteWebhook(c.data.id).success).toBe(true)
    expect(webhooks).toHaveLength(0)
  })
})

describe("WEBHOOK_RESOURCES", () => {
  it("includes the expanded Linear resource set", () => {
    const labels = WEBHOOK_RESOURCES.map((r) => r.label)
    for (const label of [
      "Issues",
      "Comments",
      "Projects",
      "Project updates",
      "Cycles",
      "Labels",
      "Reactions",
      "Initiatives",
      "Documents",
      "Customer requests",
      "Issue attachments",
    ]) {
      expect(labels).toContain(label)
    }
  })
})

describe("generateSecret", () => {
  it("returns a base64 string of ~44 chars (32 bytes)", () => {
    const s = generateSecret()
    expect(s).toMatch(/^[A-Za-z0-9+/=]+$/)
    expect(s.length).toBeGreaterThanOrEqual(40)
  })
})
