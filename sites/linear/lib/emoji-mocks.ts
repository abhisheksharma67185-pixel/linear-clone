// In-memory mock store for the Emojis settings page.
// State now lives on the per-session LinearStoreState; this is a thin facade.

import { _state } from "@/app/lib/session"
import type { Emoji, EmojiMime } from "@/app/lib/state"

export type { Emoji, EmojiMime }

export const EMOJI_MAX_BYTES = 1_048_576 // 1 MB
export const EMOJI_ALLOWED_MIME = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
] as const

export const SHORTCODE_PATTERN = /^[a-z0-9_]{2,32}$/

const now = () => new Date().toISOString()

function arrayProxy<T>(getArr: () => T[]): T[] {
  return new Proxy([] as T[], {
    get(_t, prop) {
      const arr = getArr()
      const value = (arr as unknown as Record<string | symbol, unknown>)[prop]
      return typeof value === "function"
        ? (value as (...a: unknown[]) => unknown).bind(arr)
        : value
    },
    set(_t, prop, value) {
      const arr = getArr() as unknown as Record<string | symbol, unknown>
      arr[prop] = value
      return true
    },
    has: (_t, prop) => prop in getArr(),
    ownKeys: () => Object.keys(getArr()),
    getOwnPropertyDescriptor: (_t, prop) =>
      Object.getOwnPropertyDescriptor(getArr(), prop),
  })
}

export const emojis: Emoji[] = arrayProxy(() => _state().emojis)

type CreateInput = {
  shortcode?: string
  dataUrl?: string
  mimeType?: string
  sizeBytes?: number
  uploaderId?: string
}

type Result<T> = { success: true; data: T } | { success: false; error: string }

export function validateShortcode(raw: unknown): Result<string> {
  if (typeof raw !== "string") {
    return { success: false, error: "Shortcode is required" }
  }
  const s = raw.trim()
  if (!SHORTCODE_PATTERN.test(s)) {
    return {
      success: false,
      error:
        "Shortcode must be 2–32 lowercase letters, numbers, or underscores",
    }
  }
  return { success: true, data: s }
}

function validateMime(raw: unknown): Result<EmojiMime> {
  if (
    typeof raw !== "string" ||
    !(EMOJI_ALLOWED_MIME as readonly string[]).includes(raw)
  ) {
    return {
      success: false,
      error: "File must be a PNG, JPEG, GIF, or WEBP image",
    }
  }
  return { success: true, data: raw as EmojiMime }
}

function validateSize(raw: unknown): Result<number> {
  if (typeof raw !== "number" || !Number.isFinite(raw) || raw <= 0) {
    return { success: false, error: "Invalid file size" }
  }
  if (raw > EMOJI_MAX_BYTES) {
    return { success: false, error: "File must be 1 MB or smaller" }
  }
  return { success: true, data: raw }
}

export function createEmoji(input: CreateInput): Result<Emoji> {
  const sc = validateShortcode(input.shortcode)
  if (!sc.success) return sc
  const mime = validateMime(input.mimeType)
  if (!mime.success) return mime
  const size = validateSize(input.sizeBytes)
  if (!size.success) return size

  if (_state().emojis.some((e) => e.shortcode === sc.data)) {
    return { success: false, error: "Shortcode already in use" }
  }

  if (typeof input.dataUrl !== "string" || !input.dataUrl.startsWith("data:")) {
    return { success: false, error: "Image data is required" }
  }

  const emoji: Emoji = {
    id: `emj_${Math.random().toString(36).slice(2, 10)}`,
    shortcode: sc.data,
    dataUrl: input.dataUrl,
    mimeType: mime.data,
    sizeBytes: size.data,
    uploaderId: input.uploaderId?.trim() || "usr-1",
    createdAt: now(),
  }
  _state().emojis.push(emoji)
  return { success: true, data: emoji }
}

export function renameEmoji(id: string, shortcode: unknown): Result<Emoji> {
  const arr = _state().emojis
  const e = arr.find((x) => x.id === id)
  if (!e) return { success: false, error: "Emoji not found" }
  const sc = validateShortcode(shortcode)
  if (!sc.success) return sc
  if (arr.some((x) => x.id !== id && x.shortcode === sc.data)) {
    return { success: false, error: "Shortcode already in use" }
  }
  e.shortcode = sc.data
  return { success: true, data: e }
}

export function deleteEmoji(id: string): Result<{ id: string }> {
  const arr = _state().emojis
  const idx = arr.findIndex((e) => e.id === id)
  if (idx === -1) return { success: false, error: "Emoji not found" }
  arr.splice(idx, 1)
  return { success: true, data: { id } }
}
