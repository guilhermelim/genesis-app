'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import PollSettings from '@/domain/poll-settings/entity/poll-settings'
import PollSettingsRepository from './repository/mongodb/poll-settings.repository'
import { ActionResult, runAction } from '@/infrastructure/action-result'

const schema = z.object({
  weekday: z.number().int().min(0).max(6),
  hour: z.number().int().min(0).max(23),
  minute: z.number().int().min(0).max(59),
})

export async function getPollSettings() {
  const settings = await new PollSettingsRepository().find()
  return { weekday: settings.weekday, hour: settings.hour, minute: settings.minute }
}

export async function updatePollSettings(input: {
  weekday: number
  hour: number
  minute: number
}): Promise<ActionResult<{ weekday: number; hour: number; minute: number }>> {
  return runAction(async () => {
    const parsed = schema.parse(input)
    await new PollSettingsRepository().save(new PollSettings('default', parsed.weekday, parsed.hour, parsed.minute))
    revalidatePath('/admin/poll')
    return parsed
  })
}
