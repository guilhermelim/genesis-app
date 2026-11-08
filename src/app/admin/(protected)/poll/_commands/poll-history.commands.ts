import { activatePoll, createPoll, deletePoll, listPollsPage } from '@/infrastructure/poll/poll.actions'
import { updatePollSettings } from '@/infrastructure/poll-settings/poll-settings.actions'
import { unwrapActionResult } from '@/infrastructure/action-result'
import type { PollSettings, PollViewModel } from '@/app/_shared/poll/types/poll-view-model.types'
import type { PollFormValues } from '../_forms/poll.form/poll.schema'

export function listPollsCommand(page: number, pageSize: number): ReturnType<typeof listPollsPage> {
  return listPollsPage({ page, pageSize })
}

export function createPollCommand(
  input: Omit<PollFormValues, 'expiresAt'> & { expiresAt: Date },
): Promise<PollViewModel> {
  return unwrapActionResult(createPoll(input))
}

export function activatePollCommand(id: string): Promise<PollViewModel> {
  return unwrapActionResult(activatePoll(id))
}

export function deletePollCommand(id: string): Promise<{ id: string }> {
  return unwrapActionResult(deletePoll(id))
}

export function updatePollSettingsCommand(input: PollSettings): Promise<PollSettings> {
  return unwrapActionResult(updatePollSettings(input))
}
