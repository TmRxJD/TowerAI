import { z } from 'zod'

export type TowerAiPlannerMode = 'execute' | 'clarify' | 'none'

export type TowerAiStructuredReply = {
  answer: string
  sources: string[]
}

export type TowerAiPlannerStep = {
  action: string
  args: Record<string, unknown>
}

export type TowerAiPlannerPlan = {
  mode: TowerAiPlannerMode
  clarification?: string
  answer?: string
  steps: TowerAiPlannerStep[]
}

export type TowerAiSchemaIssue = {
  stage: 'json-extract' | 'json-parse' | 'schema' | 'policy'
  message: string
}

export type TowerAiPlanValidationResult = {
  plan: TowerAiPlannerPlan | null
  issue: TowerAiSchemaIssue | null
}

export type TowerAiStructuredReplyValidationResult = {
  reply: TowerAiStructuredReply | null
  issue: TowerAiSchemaIssue | null
}

export const towerAiPlannerModeSchema = z.enum(['execute', 'clarify', 'none'])

export const towerAiPlannerStepSchema = z.object({
  action: z.string().trim().min(1),
  args: z.record(z.string(), z.unknown()).default({}),
  confidence: z.number().min(0).max(1).optional(),
}).strict()

export const towerAiPlannerPlanSchema = z.object({
  mode: towerAiPlannerModeSchema,
  clarification: z.string().trim().optional(),
  answer: z.string().trim().optional(),
  steps: z.array(towerAiPlannerStepSchema).default([]),
}).strict()

export const towerAiStructuredReplySchema = z.object({
  answer: z.string().trim().min(1),
  sources: z.array(z.string().trim().min(1)).default([]),
}).strict()

function extractJsonObject(raw: string): string | null {
  const trimmed = String(raw || '').trim()
  if (!trimmed) return null

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fencedMatch?.[1]?.trim() || trimmed
  const firstBrace = candidate.indexOf('{')
  const lastBrace = candidate.lastIndexOf('}')
  if (firstBrace < 0 || lastBrace <= firstBrace) return null
  return candidate.slice(firstBrace, lastBrace + 1)
}

export function parseTowerAiStructuredReply(raw: string): TowerAiStructuredReply | null {
  const validated = validateTowerAiStructuredReply(raw)
  return validated.reply
}

export function validateTowerAiStructuredReply(raw: string): TowerAiStructuredReplyValidationResult {
  const text = String(raw || '').trim()
  if (!text) {
    return {
      reply: null,
      issue: {
        stage: 'json-extract',
        message: 'Empty model output.',
      },
    }
  }

  const fenceMatch = text.match(/```json\s*([\s\S]*?)```/i)
  const candidate = fenceMatch?.[1]?.trim() || text

  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  if (start < 0 || end <= start) {
    return {
      reply: null,
      issue: {
        stage: 'json-extract',
        message: 'Unable to find a JSON object in model output.',
      },
    }
  }

  const jsonSlice = candidate.slice(start, end + 1)

  try {
    const parsedJson = JSON.parse(jsonSlice)
    const parsed = towerAiStructuredReplySchema.safeParse(parsedJson)
    if (!parsed.success) {
      return {
        reply: null,
        issue: {
          stage: 'schema',
          message: parsed.error.issues.map(issue => issue.message).join('; '),
        },
      }
    }

    const answer = parsed.data.answer
    const sources = parsed.data.sources
    if (!answer) {
      return {
        reply: null,
        issue: {
          stage: 'policy',
          message: 'Answer cannot be empty.',
        },
      }
    }

    if (/\n\s*(user|assistant|system)\s*:/i.test(answer)) {
      return {
        reply: null,
        issue: {
          stage: 'policy',
          message: 'Answer contains role-prefixed dialogue content.',
        },
      }
    }

    return {
      reply: {
        answer,
        sources,
      },
      issue: null,
    }
  } catch {
    return {
      reply: null,
      issue: {
        stage: 'json-parse',
        message: 'Model output is not valid JSON.',
      },
    }
  }
}

export function parseTowerAiActionPlan(raw: string, maxSteps = 12): TowerAiPlannerPlan | null {
  const validated = validateTowerAiActionPlan(raw, maxSteps)
  return validated.plan
}

export function validateTowerAiActionPlan(raw: string, maxSteps = 12): TowerAiPlanValidationResult {
  const jsonText = extractJsonObject(raw)
  if (!jsonText) {
    return {
      plan: null,
      issue: {
        stage: 'json-extract',
        message: 'Unable to find a JSON object in planner output.',
      },
    }
  }

  try {
    const parsedJson = JSON.parse(jsonText)
    const parsed = towerAiPlannerPlanSchema.safeParse(parsedJson)
    if (!parsed.success) {
      return {
        plan: null,
        issue: {
          stage: 'schema',
          message: parsed.error.issues.map(issue => issue.message).join('; '),
        },
      }
    }

    const modeRaw = parsed.data.mode
    const steps = parsed.data.steps.slice(0, Math.max(1, maxSteps))
    const clarification = parsed.data.clarification
    const answer = parsed.data.answer

    if (modeRaw === 'execute' && steps.length === 0) {
      return {
        plan: null,
        issue: {
          stage: 'policy',
          message: 'Execute mode requires at least one valid step.',
        },
      }
    }

    if (modeRaw === 'clarify' && !clarification) {
      return {
        plan: null,
        issue: {
          stage: 'policy',
          message: 'Clarify mode requires a clarification string.',
        },
      }
    }

    return {
      plan: {
        mode: modeRaw,
        clarification,
        answer,
        steps,
      },
      issue: null,
    }
  } catch {
    return {
      plan: null,
      issue: {
        stage: 'json-parse',
        message: 'Planner output is not valid JSON.',
      },
    }
  }
}
