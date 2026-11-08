import { clearVotes, updatePoll } from '@/infrastructure/poll/poll.actions'
import { clearPollVotesCommand, updatePollCommand } from './poll-editing.commands'

jest.mock('@/infrastructure/poll/poll.actions', () => ({ clearVotes: jest.fn(), updatePoll: jest.fn() }))
jest.mock('@/infrastructure/action-result', () => ({ unwrapActionResult: (result: unknown) => result }))

it('delegates poll updates and vote clearing', async () => {
  const input = { name: 'Nova', title: 'Título', description: 'Descrição', photos: [], expiresAt: new Date() }
  const result = { id: 'poll-1' }
  jest.mocked(updatePoll).mockResolvedValue(result as never)
  jest.mocked(clearVotes).mockResolvedValue(result as never)

  await expect(updatePollCommand('poll-1', input)).resolves.toBe(result)
  await expect(clearPollVotesCommand('poll-1')).resolves.toBe(result)
  expect(updatePoll).toHaveBeenCalledWith({ ...input, id: 'poll-1' })
  expect(clearVotes).toHaveBeenCalledWith('poll-1')
})
