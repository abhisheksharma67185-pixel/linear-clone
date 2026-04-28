// In-memory mock state for the Agent personalization page.

export const GUIDANCE_MAX_CHARS = 10_000

export type Skill = {
  id: string
  name: string
  slashCommand: string
  promptTemplate: string
  autoSelectRules: string
  lastUsedAt: string | null
  createdAt: string
}

export type McpServer = {
  id: string
  name: string
  url: string
  status: "connected" | "error"
  addedAt: string
}

const now = () => new Date().toISOString()

export const agentState: { guidance: string } = {
  guidance: "",
}

export const skills: Skill[] = []

export const mcpServers: McpServer[] = []

export function setGuidance(value: string): string {
  agentState.guidance = value.slice(0, GUIDANCE_MAX_CHARS)
  return agentState.guidance
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
  skills.push(skill)
  return skill
}

export function updateSkill(
  id: string,
  patch: Partial<
    Pick<Skill, "name" | "slashCommand" | "promptTemplate" | "autoSelectRules">
  >
): Skill | null {
  const skill = skills.find((s) => s.id === id)
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
  const idx = skills.findIndex((s) => s.id === id)
  if (idx === -1) return false
  skills.splice(idx, 1)
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
    // Pretend anything that parses as a URL connects successfully, otherwise "error".
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
  mcpServers.push(server)
  return server
}

export function deleteMcpServer(id: string): boolean {
  const idx = mcpServers.findIndex((s) => s.id === id)
  if (idx === -1) return false
  mcpServers.splice(idx, 1)
  return true
}
