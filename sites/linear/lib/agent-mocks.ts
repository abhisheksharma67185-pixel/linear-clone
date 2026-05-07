// In-memory mock state for the Agent personalization page.
// State now lives on the per-session LinearStoreState (see app/lib/state.ts);
// the exported `agentState`, `skills`, and `mcpServers` are Proxies over the
// current rollout's slot, preserving the original public shape.

import { _state } from "@/app/lib/session"
import type { Skill, McpServer } from "@/app/lib/state"

export type { Skill, McpServer }

export const GUIDANCE_MAX_CHARS = 10_000

const now = () => new Date().toISOString()

// ---------------------------------------------------------------------------
// Proxy facades over the per-session arrays / record. Mutating methods
// (`push`, indexed assignment) target the live session array; reads return
// fresh values per call.
// ---------------------------------------------------------------------------

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
    has(_t, prop) {
      return prop in getArr()
    },
    ownKeys: () => Object.keys(getArr()),
    getOwnPropertyDescriptor: (_t, prop) =>
      Object.getOwnPropertyDescriptor(getArr(), prop),
  })
}

export const agentState: { guidance: string } = new Proxy(
  {} as { guidance: string },
  {
    get: (_t, prop) =>
      (_state().agent as unknown as Record<string | symbol, unknown>)[prop],
    set: (_t, prop, value) => {
      const agent = _state().agent as unknown as Record<
        string | symbol,
        unknown
      >
      agent[prop] = value
      return true
    },
    has: (_t, prop) => prop in _state().agent,
  }
)

export const skills: Skill[] = arrayProxy(() => _state().agent.skills)
export const mcpServers: McpServer[] = arrayProxy(
  () => _state().agent.mcpServers
)

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function setGuidance(value: string): string {
  const agent = _state().agent
  agent.guidance = value.slice(0, GUIDANCE_MAX_CHARS)
  return agent.guidance
}

export function createSkill(input: {
  name: string
  slashCommand: string
  promptTemplate?: string
  autoSelectRules?: string
}): Skill {
  const skill: Skill = {
    id: `sk_${Math.random().toString(36).slice(2, 10)}`,
    name: input.name.trim(),
    slashCommand: input.slashCommand.trim().replace(/^\/?/, "/"),
    promptTemplate: input.promptTemplate?.trim() ?? "",
    autoSelectRules: input.autoSelectRules?.trim() ?? "",
    lastUsedAt: null,
    createdAt: now(),
  }
  _state().agent.skills.push(skill)
  return skill
}

export function updateSkill(
  id: string,
  patch: Partial<
    Pick<Skill, "name" | "slashCommand" | "promptTemplate" | "autoSelectRules">
  >
): Skill | null {
  const skill = _state().agent.skills.find((s) => s.id === id)
  if (!skill) return null
  if (patch.name !== undefined) skill.name = patch.name.trim()
  if (patch.slashCommand !== undefined)
    skill.slashCommand = patch.slashCommand.trim().replace(/^\/?/, "/")
  if (patch.promptTemplate !== undefined)
    skill.promptTemplate = patch.promptTemplate.trim()
  if (patch.autoSelectRules !== undefined)
    skill.autoSelectRules = patch.autoSelectRules.trim()
  return skill
}

export function deleteSkill(id: string): boolean {
  const arr = _state().agent.skills
  const idx = arr.findIndex((s) => s.id === id)
  if (idx === -1) return false
  arr.splice(idx, 1)
  return true
}

export function createMcpServer(input: {
  name: string
  url: string
  authToken?: string
}): McpServer {
  const server: McpServer = {
    id: `mcp_${Math.random().toString(36).slice(2, 10)}`,
    name: input.name.trim(),
    url: input.url.trim(),
    status: (() => {
      try {
        new URL(input.url)
        return "connected" as const
      } catch {
        return "error" as const
      }
    })(),
    addedAt: now(),
  }
  _state().agent.mcpServers.push(server)
  return server
}

export function deleteMcpServer(id: string): boolean {
  const arr = _state().agent.mcpServers
  const idx = arr.findIndex((s) => s.id === id)
  if (idx === -1) return false
  arr.splice(idx, 1)
  return true
}
