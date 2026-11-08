import { act, renderHook } from '@testing-library/react'
import type { PollViewModel, PollSettings } from '@/app/_shared/poll/types/poll-view-model.types'
import {
  activatePollCommand,
  createPollCommand,
  deletePollCommand,
  listPollsCommand,
  updatePollSettingsCommand,
} from '../_commands/poll-history.commands'
import { usePollHistory } from './use-poll-history'

jest.mock('../_commands/poll-history.commands', () => ({
  activatePollCommand: jest.fn(),
  createPollCommand: jest.fn(),
  deletePollCommand: jest.fn(),
  listPollsCommand: jest.fn(),
  updatePollSettingsCommand: jest.fn(),
}))
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }))

const poll: PollViewModel = {
  id: 'poll-1',
  name: 'Enquete',
  title: 'Título',
  description: 'Descrição',
  votes: [],
  photos: [],
  expiresAt: new Date('2026-01-01T10:00:00Z'),
  active: false,
  createdAt: new Date(),
  updatedAt: new Date(),
}
const settings: PollSettings = { weekday: 1, hour: 8, minute: 30 }
const page = { items: [poll], page: 1, pageSize: 10, totalItems: 1, totalPages: 1 }

function createState() {
  return {
    polls: [poll],
    pagination: page,
    selectedPollId: poll.id,
    replacePage: jest.fn(),
    prependPoll: jest.fn(),
    activatePoll: jest.fn(),
    removePoll: jest.fn(),
    selectPoll: jest.fn(),
    setError: jest.fn(),
    clearError: jest.fn(),
  }
}

describe('usePollHistory', () => {
  it('changes pages and page sizes', async () => {
    jest.mocked(listPollsCommand).mockResolvedValue(page)
    const state = createState()
    const { result } = renderHook(() => usePollHistory({ state, settings }))

    await act(() => result.current.changePage(2))
    await act(() => result.current.changePageSize(25))

    expect(listPollsCommand).toHaveBeenNthCalledWith(1, 2, 10)
    expect(listPollsCommand).toHaveBeenLastCalledWith(1, 25)
    expect(state.replacePage).toHaveBeenCalledWith(page)
    expect(state.clearError).toHaveBeenCalled()
  })

  it('creates, activates, removes polls, and updates settings', async () => {
    const state = createState()
    const created = { ...poll, id: 'poll-2' }
    jest.mocked(createPollCommand).mockResolvedValue(created)
    jest.mocked(activatePollCommand).mockResolvedValue({ ...poll, active: true })
    jest.mocked(deletePollCommand).mockResolvedValue({ id: poll.id })
    jest.mocked(updatePollSettingsCommand).mockResolvedValue(settings)
    const { result } = renderHook(() => usePollHistory({ state, settings }))
    const input = { name: 'Nova', title: 'Título', description: 'Descrição', photos: [] }

    await act(() => result.current.create(input))
    await act(() => result.current.activate(poll.id))
    await act(() => result.current.remove(poll.id))
    await act(() => result.current.updateSettings(settings))

    expect(createPollCommand).toHaveBeenCalledWith(expect.objectContaining({ ...input, expiresAt: expect.any(Date) }))
    expect(state.prependPoll).toHaveBeenCalledWith(created)
    expect(state.activatePoll).toHaveBeenCalled()
    expect(state.removePoll).toHaveBeenCalledWith(poll.id)
    expect(updatePollSettingsCommand).toHaveBeenCalledWith(settings)
  })

  it('reports command errors through state', async () => {
    const error = new Error('Falha')
    jest.mocked(listPollsCommand).mockRejectedValue(error)
    const state = createState()
    const { result } = renderHook(() => usePollHistory({ state, settings }))

    await expect(act(() => result.current.changePage(2))).rejects.toThrow('Falha')
    expect(state.setError).toHaveBeenCalledWith('Falha')
  })

  it('uses supplied expiration and selects the next poll after removal', async () => {
    const state = { ...createState(), polls: [poll, { ...poll, id: 'poll-2' }], selectedPollId: poll.id }
    const { result } = renderHook(() => usePollHistory({ state, settings }))
    jest.mocked(createPollCommand).mockResolvedValue({ ...poll, id: 'created' })
    jest.mocked(deletePollCommand).mockResolvedValue({ id: poll.id })
    const expiresAt = new Date('2027-01-01T10:00:00Z')
    await act(() => result.current.create({ name: 'Nova', title: 'T', description: 'D', photos: [], expiresAt }))
    await act(() => result.current.remove(poll.id))
    expect(createPollCommand).toHaveBeenCalledWith(expect.objectContaining({ expiresAt }))
    expect(state.selectPoll).toHaveBeenCalledWith('poll-2')
  })

  it('reports non-Error failures from every command', async () => {
    const state = createState()
    jest.mocked(listPollsCommand).mockRejectedValueOnce('list')
    jest.mocked(createPollCommand).mockRejectedValueOnce('create')
    jest.mocked(activatePollCommand).mockRejectedValueOnce('activate')
    jest.mocked(deletePollCommand).mockRejectedValueOnce('delete')
    jest.mocked(updatePollSettingsCommand).mockRejectedValueOnce('settings')
    const { result } = renderHook(() => usePollHistory({ state, settings }))
    await expect(result.current.changePage(2)).rejects.toBe('list')
    await expect(result.current.create({ name: 'N', title: 'T', description: 'D', photos: [] })).rejects.toBe('create')
    await expect(result.current.activate(poll.id)).rejects.toBe('activate')
    await expect(result.current.remove(poll.id)).rejects.toBe('delete')
    await expect(result.current.updateSettings(settings)).rejects.toBe('settings')
    expect(state.setError).toHaveBeenCalled()
  })

  it('removes a selected poll without selecting another when it is the last one', async () => {
    const state = createState()
    jest.mocked(deletePollCommand).mockResolvedValue({ id: poll.id })
    const { result } = renderHook(() => usePollHistory({ state, settings }))
    await result.current.remove(poll.id)
    expect(state.selectPoll).not.toHaveBeenCalled()
  })

  it('uses Error messages for create, remove, activate and settings failures', async () => {
    const state = createState()
    jest.mocked(createPollCommand).mockRejectedValueOnce(new Error('create'))
    jest.mocked(activatePollCommand).mockRejectedValueOnce(new Error('activate'))
    jest.mocked(deletePollCommand).mockRejectedValueOnce(new Error('delete'))
    jest.mocked(updatePollSettingsCommand).mockRejectedValueOnce(new Error('settings'))
    const { result } = renderHook(() => usePollHistory({ state, settings }))
    await expect(result.current.create({ name: 'N', title: 'T', description: 'D', photos: [] })).rejects.toThrow(
      'create',
    )
    await expect(result.current.activate(poll.id)).rejects.toThrow('activate')
    await expect(result.current.remove(poll.id)).rejects.toThrow('delete')
    await expect(result.current.updateSettings(settings)).rejects.toThrow('settings')
  })
})
