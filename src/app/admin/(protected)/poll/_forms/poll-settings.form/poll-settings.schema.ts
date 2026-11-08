import { z } from 'zod'

export const pollSettingsSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  hour: z.number().int().min(0).max(23),
  minute: z.number().int().min(0).max(59),
})

export type PollSettingsFormValues = z.infer<typeof pollSettingsSchema>
