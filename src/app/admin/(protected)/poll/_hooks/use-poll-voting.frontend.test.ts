import { renderHook, act } from '@testing-library/react'
import type { PollViewModel } from '@/app/_shared/poll/types/poll-view-model.types'
import { addPollVoteCommand } from '../_commands/poll-voting.commands'
import { usePollVoting } from './use-poll-voting'

jest.mock('../_commands/poll-voting.commands', () => ({
  addPollVoteCommand: jest.fn(),
}))

const poll: PollViewModel = {
  id: 'poll-1',
  name: 'Enquete',
  title: 'Título',
  description: 'Descrição',
  votes: [],
  photos: [],
  expiresAt: new Date(),
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('usePollVoting', () => {
  it('adds a vote and replaces the poll', async () => {
    const output = {
      ...poll,
      votes: [{ id: 'vote-1', memberId: 'member-1', activityId: 'activity-1', votedAt: new Date() }],
    }
    jest.mocked(addPollVoteCommand).mockResolvedValue(output)
    const replacePoll = jest.fn()
    const clearError = jest.fn()
    const setError = jest.fn()
    const { result } = renderHook(() => usePollVoting({ poll, replacePoll, clearError, setError }))

    await act(() => result.current.vote('member-1', 'activity-1'))

    expect(addPollVoteCommand).toHaveBeenCalledWith('poll-1', 'member-1', 'activity-1')
    expect(clearError).toHaveBeenCalled()
    expect(replacePoll).toHaveBeenCalledWith(output)
  })

  it('reports command errors and rethrows them', async () => {
    const error = new Error('Falha ao votar')
    jest.mocked(addPollVoteCommand).mockRejectedValue(error)
    const setError = jest.fn()
    const { result } = renderHook(() =>
      usePollVoting({ poll, replacePoll: jest.fn(), clearError: jest.fn(), setError }),
    )

    await expect(act(() => result.current.vote('member-1', 'activity-1'))).rejects.toThrow('Falha ao votar')
    expect(setError).toHaveBeenCalledWith('Falha ao votar')
  })

  it('uses a fallback message for non-Error command failures', async () => {
    jest.mocked(addPollVoteCommand).mockRejectedValue('falha desconhecida')
    const setError = jest.fn()
    const { result } = renderHook(() =>
      usePollVoting({ poll, replacePoll: jest.fn(), clearError: jest.fn(), setError }),
    )

    await expect(act(() => result.current.vote('member-1', 'activity-1'))).rejects.toBe('falha desconhecida')
    expect(setError).toHaveBeenCalledWith('Não foi possível concluir a votação')
  })

  it('uses a fallback message for non-Error failures', async () => {
    jest.mocked(addPollVoteCommand).mockRejectedValue('Falha')
    const setError = jest.fn()
    const { result } = renderHook(() =>
      usePollVoting({ poll, replacePoll: jest.fn(), clearError: jest.fn(), setError }),
    )
    await expect(result.current.vote('member-1', 'activity-1')).rejects.toBe('Falha')
    expect(setError).toHaveBeenCalledWith('Não foi possível concluir a votação')
  })

  it('does nothing when no poll is selected', async () => {
    const { result } = renderHook(() =>
      usePollVoting({ poll: undefined, replacePoll: jest.fn(), clearError: jest.fn(), setError: jest.fn() }),
    )

    await act(() => result.current.vote('member-1', 'activity-1'))

    expect(addPollVoteCommand).not.toHaveBeenCalled()
  })
})
