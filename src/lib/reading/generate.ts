import 'server-only'
import Anthropic from '@anthropic-ai/sdk'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import type { BaziChart, DailySnapshot, Locale } from '@/lib/bazi'
import { SYSTEM_PROMPT, buildUserPrompt } from './prompt'
import { readingSchema, type ReadingBody } from './schema'
import { renderTemplate } from './template'

const MODEL = 'claude-opus-5'

export interface GeneratedReading {
  body: ReadingBody
  /** Which path produced this text, so the UI and the DB can say so honestly. */
  source: 'model' | 'template'
  model?: string
}

let client: Anthropic | null = null
function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null
  client ??= new Anthropic()
  return client
}

/**
 * Writes one day's reading.
 *
 * The rules engine has already decided what is true; this only decides how it
 * is said. When the model is unavailable, declines, or returns something that
 * does not validate, the deterministic renderer takes over — a reading is never
 * fabricated to cover a failure, and the caller is always told which path ran.
 */
export async function generateReading(
  chart: BaziChart,
  snapshot: DailySnapshot,
  locale: Locale,
): Promise<GeneratedReading> {
  const anthropic = getClient()
  if (!anthropic) return { body: renderTemplate(snapshot, locale), source: 'template' }

  try {
    const response = await anthropic.messages.parse({
      model: MODEL,
      // Deliberately short output: a reading is a few paragraphs, and the schema
      // caps its shape. This is a bounded deliverable, not a truncation risk.
      max_tokens: 4000,
      // The analysis is already done, so there is little for the model to reason
      // about — low effort keeps latency and cost down without touching quality.
      output_config: {
        effort: 'low',
        format: zodOutputFormat(readingSchema),
      },
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          // Stable across every user and every day, so it caches once and is
          // read back at roughly a tenth of the price on every later request.
          cache_control: { type: 'ephemeral', ttl: '1h' },
        },
      ],
      messages: [{ role: 'user', content: buildUserPrompt(chart, snapshot, locale) }],
    })

    // Opus 5 can decline a request; content is empty or partial when it does.
    if (response.stop_reason === 'refusal') {
      return { body: renderTemplate(snapshot, locale), source: 'template' }
    }

    const parsed = response.parsed_output
    if (!parsed) return { body: renderTemplate(snapshot, locale), source: 'template' }

    return { body: parsed, source: 'model', model: response.model }
  } catch {
    // Network failure, rate limit, or a malformed response — the reading still
    // gets written, just plainly.
    return { body: renderTemplate(snapshot, locale), source: 'template' }
  }
}
