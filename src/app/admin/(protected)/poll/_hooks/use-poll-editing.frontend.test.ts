import { act, renderHook } from '@testing-library/react'
import type { PollViewModel } from '@/app/_shared/poll/types/poll-view-model.types'
import { clearPollVotesCommand, updatePollCommand } from '../_commands/poll-editing.commands'
import { usePollEditing } from './use-poll-editing'

jest.mock('../_commands/poll-editing.commands', () => ({
  clearPollVotesCommand: jest.fn(),
  updatePollCommand: jest.fn(),
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

describe('usePollEditing', () => {
  it('updates the poll and returns to results', async () => {
    const output = { title: 'Novo título' }
    jest.mocked(updatePollCommand).mockResolvedValue(output)
    const replacePoll = jest.fn()
    const setPanel = jest.fn()
    const clearError = jest.fn()
    const { result } = renderHook(() =>
      usePollEditing({ poll, replacePoll, setPanel, setError: jest.fn(), clearError }),
    )

    await act(() =>
      result.current.update({
        name: poll.name,
        title: 'Novo título',
        description: poll.description,
        photos: [],
      }),
    )

    expect(updatePollCommand).toHaveBeenCalledWith('poll-1', expect.objectContaining({ title: 'Novo título' }))
    expect(replacePoll).toHaveBeenCalledWith({ ...poll, ...output })
    expect(setPanel).toHaveBeenCalledWith('results')
    expect(clearError).toHaveBeenCalled()
  })

  it('clears votes and replaces the poll', async () => {
    const output = { votes: [] }
    jest.mocked(clearPollVotesCommand).mockResolvedValue(output)
    const replacePoll = jest.fn()
    const { result } = renderHook(() =>
      usePollEditing({ poll, replacePoll, setPanel: jest.fn(), setError: jest.fn(), clearError: jest.fn() }),
    )

    await act(() => result.current.clear())

    expect(clearPollVotesCommand).toHaveBeenCalledWith('poll-1')
    expect(replacePoll).toHaveBeenCalledWith({ ...poll, ...output })
  })

  it('does nothing when no poll is selected', async () => {
    const { result } = renderHook(() =>
      usePollEditing({ replacePoll: jest.fn(), setPanel: jest.fn(), setError: jest.fn(), clearError: jest.fn() }),
    )

    await act(() => result.current.clear())
    await act(() => result.current.update({ name: 'x', title: 'x', description: 'x', photos: [] }))
    expect(clearPollVotesCommand).not.toHaveBeenCalled()
  })

  it('sets errors and rethrows update and clear failures', async () => {
    jest.mocked(updatePollCommand).mockRejectedValueOnce(new Error('Falha ao atualizar'))
    jest.mocked(clearPollVotesCommand).mockRejectedValueOnce('Falha ao limpar')
    const setError = jest.fn()
    const { result } = renderHook(() =>
      usePollEditing({ poll, replacePoll: jest.fn(), setPanel: jest.fn(), setError, clearError: jest.fn() }),
    )

    await expect(
      result.current.update({ name: poll.name, title: poll.title, description: poll.description, photos: [] }),
    ).rejects.toThrow('Falha ao atualizar')
    await expect(result.current.clear()).rejects.toBe('Falha ao limpar')
    expect(setError).toHaveBeenNthCalledWith(1, 'Falha ao atualizar')
    expect(setError).toHaveBeenLastCalledWith('Não foi possível concluir a operação')
  })

  it('uses fallback toast text for non-Error update failures', async () => {
    jest.mocked(updatePollCommand).mockRejectedValue('Falha')
    const { result } = renderHook(() =>
      usePollEditing({ poll, replacePoll: jest.fn(), setPanel: jest.fn(), setError: jest.fn(), clearError: jest.fn() }),
    )
    await expect(
      result.current.update({ name: poll.name, title: poll.title, description: poll.description, photos: [] }),
    ).rejects.toBe('Falha')
  })
})
