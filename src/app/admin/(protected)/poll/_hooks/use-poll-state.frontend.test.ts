import { act, renderHook } from '@testing-library/react'
import { usePollState, type PollPageData } from './use-poll-state'
import type { PollViewModel } from '@/app/_shared/poll/types/poll-view-model.types'

const poll = (id: string, active = false): PollViewModel => ({
  id,
  name: id,
  title: `Título ${id}`,
  description: 'Descrição',
  votes: [],
  photos: [],
  expiresAt: new Date(),
  active,
  createdAt: new Date(),
  updatedAt: new Date(),
})

const initialPage: PollPageData = {
  items: [poll('poll-1'), poll('poll-2', true)],
  page: 1,
  pageSize: 10,
  totalItems: 2,
  totalPages: 1,
}

describe('usePollState', () => {
  it('selects the active poll initially and changes panels when selecting', () => {
    const { result } = renderHook(() => usePollState({ initialPage }))

    expect(result.current.selectedPollId).toBe('poll-2')
    expect(result.current.poll?.id).toBe('poll-2')

    act(() => result.current.selectPoll('poll-1'))

    expect(result.current.selectedPollId).toBe('poll-1')
    expect(result.current.panel).toBe('results')
  })

  it('prepends a poll and deactivates previous polls', () => {
    const { result } = renderHook(() => usePollState({ initialPage }))
    const created = poll('poll-3', true)

    act(() => result.current.prependPoll(created))

    expect(result.current.polls[0]).toEqual(created)
    expect(result.current.polls.slice(1).every(item => !item.active)).toBe(true)
    expect(result.current.pagination.totalItems).toBe(3)
    expect(result.current.selectedPollId).toBe('poll-3')
  })

  it('activates a poll and removes a poll while keeping valid pagination', () => {
    const { result } = renderHook(() => usePollState({ initialPage: { ...initialPage, totalItems: 3, totalPages: 1 } }))

    act(() => result.current.activatePoll(poll('poll-1', true)))
    expect(result.current.polls.find(item => item.id === 'poll-1')?.active).toBe(true)
    expect(result.current.polls.find(item => item.id === 'poll-2')?.active).toBe(false)

    act(() => result.current.removePoll('poll-1'))
    expect(result.current.polls).toHaveLength(1)
    expect(result.current.pagination.totalItems).toBe(2)
    expect(result.current.selectedPollId).toBe('')
  })

  it('uses the first poll when none is active and supports page replacement', () => {
    const { result } = renderHook(() =>
      usePollState({ initialPage: { ...initialPage, items: [poll('first')], totalItems: 1 } }),
    )
    expect(result.current.selectedPollId).toBe('first')
    const replacement = { ...initialPage, items: [poll('replacement')], page: 2 }
    act(() => result.current.replacePage(replacement))
    expect(result.current.polls[0].id).toBe('replacement')
    expect(result.current.pagination.page).toBe(2)
  })

  it('supports replacing and clearing state, including removing a non-selected poll', () => {
    const { result } = renderHook(() => usePollState({ initialPage }))
    const changed = poll('poll-1', true)
    act(() => result.current.replacePoll(changed))
    expect(result.current.polls[0]).toEqual(changed)
    act(() => result.current.setError('Falha'))
    act(() => result.current.clearError())
    expect(result.current.error).toBeUndefined()
    act(() => result.current.removePoll('poll-1'))
    expect(result.current.selectedPollId).toBe('poll-2')
  })
})
