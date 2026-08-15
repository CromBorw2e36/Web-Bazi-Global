import { z } from 'zod'

/** The shape a daily reading takes, whether written by the model or the template. */
export const readingSchema = z.object({
  headline: z.string().describe('One clause naming the day’s character. No trailing punctuation.'),
  summary: z.string().describe('Two or three sentences: what meets what, and what that tends to mean.'),
  focus: z.string().describe('What the day supports. One or two concrete sentences.'),
  caution: z.string().describe('What to hold lightly today. One or two sentences.'),
  practical: z
    .array(z.string())
    .min(2)
    .max(4)
    .describe('Two to four short imperative suggestions that can be acted on today.'),
})

export type ReadingBody = z.infer<typeof readingSchema>

export const isReadingBody = (v: unknown): v is ReadingBody => readingSchema.safeParse(v).success
