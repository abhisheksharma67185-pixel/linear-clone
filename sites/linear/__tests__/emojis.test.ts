import { afterEach, describe, expect, it } from "vitest"

import {
  createEmoji,
  deleteEmoji,
  emojis,
  renameEmoji,
  validateShortcode,
} from "../lib/emoji-mocks"

afterEach(() => {
  emojis.length = 0
})

const PNG_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="

describe("shortcode validation", () => {
  it("accepts lowercase alphanumeric + underscores, 2-32 chars", () => {
    expect(validateShortcode("shipit").success).toBe(true)
    expect(validateShortcode("a_b_c").success).toBe(true)
    expect(validateShortcode("ab").success).toBe(true)
    expect(validateShortcode("a".repeat(32)).success).toBe(true)
  })

  it("rejects uppercase, dashes, too short, too long", () => {
    expect(validateShortcode("Shipit").success).toBe(false)
    expect(validateShortcode("ship-it").success).toBe(false)
    expect(validateShortcode("a").success).toBe(false)
    expect(validateShortcode("a".repeat(33)).success).toBe(false)
    expect(validateShortcode("").success).toBe(false)
  })
})

describe("createEmoji", () => {
  it("accepts a valid input", () => {
    const r = createEmoji({
      shortcode: "shipit",
      dataUrl: PNG_DATA_URL,
      mimeType: "image/png",
      sizeBytes: 1024,
      uploaderId: "usr-1",
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.shortcode).toBe("shipit")
      expect(r.data.id).toMatch(/^emj_/)
    }
  })

  it("rejects duplicate shortcode", () => {
    createEmoji({
      shortcode: "shipit",
      dataUrl: PNG_DATA_URL,
      mimeType: "image/png",
      sizeBytes: 1024,
    })
    const r = createEmoji({
      shortcode: "shipit",
      dataUrl: PNG_DATA_URL,
      mimeType: "image/png",
      sizeBytes: 1024,
    })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error).toMatch(/already/i)
  })

  it("rejects wrong mime type", () => {
    const r = createEmoji({
      shortcode: "shipit",
      dataUrl: "data:image/svg+xml;base64,abc",
      mimeType: "image/svg+xml",
      sizeBytes: 1024,
    })
    expect(r.success).toBe(false)
  })

  it("rejects files over 1MB", () => {
    const r = createEmoji({
      shortcode: "bigfile",
      dataUrl: PNG_DATA_URL,
      mimeType: "image/png",
      sizeBytes: 2_000_000,
    })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error).toMatch(/1 MB/i)
  })
})

describe("renameEmoji", () => {
  it("renames an existing emoji", () => {
    const c = createEmoji({
      shortcode: "shipit",
      dataUrl: PNG_DATA_URL,
      mimeType: "image/png",
      sizeBytes: 1024,
    })
    if (!c.success) throw new Error("setup failed")
    const r = renameEmoji(c.data.id, "shipped")
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.shortcode).toBe("shipped")
  })

  it("rejects rename to an existing shortcode", () => {
    const a = createEmoji({
      shortcode: "aa",
      dataUrl: PNG_DATA_URL,
      mimeType: "image/png",
      sizeBytes: 1024,
    })
    const b = createEmoji({
      shortcode: "bb",
      dataUrl: PNG_DATA_URL,
      mimeType: "image/png",
      sizeBytes: 1024,
    })
    if (!a.success || !b.success) throw new Error("setup failed")
    const r = renameEmoji(b.data.id, "aa")
    expect(r.success).toBe(false)
  })
})

describe("deleteEmoji", () => {
  it("removes the emoji", () => {
    const c = createEmoji({
      shortcode: "shipit",
      dataUrl: PNG_DATA_URL,
      mimeType: "image/png",
      sizeBytes: 1024,
    })
    if (!c.success) throw new Error("setup failed")
    const r = deleteEmoji(c.data.id)
    expect(r.success).toBe(true)
    expect(emojis).toHaveLength(0)
  })

  it("404s on missing id", () => {
    const r = deleteEmoji("emj_missing")
    expect(r.success).toBe(false)
  })
})
