import { activatePoll, createPoll, deletePoll, listPollsPage } from '@/infrastructure/poll/poll.actions'
import { updatePollSettings } from '@/infrastructure/poll-settings/poll-settings.actions'
import {
  activatePollCommand,
  createPollCommand,
  deletePollCommand,
  listPollsCommand,
  updatePollSettingsCommand,
} from './poll-history.commands'

jest.mock('@/infrastructure/poll/poll.actions', () => ({
  activatePoll: jest.fn(),
  createPoll: jest.fn(),
  deletePoll: jest.fn(),
  listPollsPage: jest.fn(),
}))
jest.mock('@/infrastructure/poll-settings/poll-settings.actions', () => ({ updatePollSettings: jest.fn() }))
jest.mock('@/infrastructure/action-result', () => ({
  unwrapActionResult: (result: unknown) => result,
}))

describe('poll history commands', () => {
  it('passes pagination and inputs to their server actions', async () => {
    const page = { items: [], page: 2, pageSize: 20, totalItems: 0, totalPages: 0 }
    const poll = { id: 'poll-1' }
    const settings = { weekday: 1, hour: 8, minute: 30 }
    const input = { name: 'Nova', title: 'Título', description: 'Descrição', photos: [], expiresAt: new Date() }
    jest.mocked(listPollsPage).mockResolvedValue(page)
    jest.mocked(createPoll).mockResolvedValue(poll as never)
    jest.mocked(activatePoll).mockResolvedValue(poll as never)
    jest.mocked(deletePoll).mockResolvedValue({ id: 'poll-1' } as never)
    jest.mocked(updatePollSettings).mockResolvedValue(settings as never)

    await expect(listPollsCommand(2, 20)).resolves.toBe(page)
    await expect(createPollCommand(input)).resolves.toBe(poll)
    await expect(activatePollCommand('poll-1')).resolves.toBe(poll)
    await expect(deletePollCommand('poll-1')).resolves.toEqual({ id: 'poll-1' })
    await expect(updatePollSettingsCommand(settings)).resolves.toBe(settings)

    expect(listPollsPage).toHaveBeenCalledWith({ page: 2, pageSize: 20 })
    expect(createPoll).toHaveBeenCalledWith(input)
    expect(activatePoll).toHaveBeenCalledWith('poll-1')
    expect(deletePoll).toHaveBeenCalledWith('poll-1')
    expect(updatePollSettings).toHaveBeenCalledWith(settings)
  })
})
