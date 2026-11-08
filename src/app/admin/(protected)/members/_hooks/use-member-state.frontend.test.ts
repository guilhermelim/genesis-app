import { act, renderHook } from '@testing-library/react'
import { useMemberState } from './use-member-state'

const initialPage = {
  items: [
    { id: 'member-1', name: 'Ana', active: true },
    { id: 'member-2', name: 'Bruno', active: false },
  ],
  page: 1,
  pageSize: 2,
  totalItems: 2,
  totalPages: 1,
}

describe('useMemberState', () => {
  it('replaces pages and individual members', () => {
    const { result } = renderHook(() => useMemberState({ initialPage }))
    const replacement = { id: 'member-1', name: 'Ana Atualizada', active: true }

    act(() => result.current.replaceMember(replacement))
    expect(result.current.members[0]).toEqual(replacement)

    const nextPage = { ...initialPage, page: 2, items: [{ id: 'member-3', name: 'Caio', active: true }] }
    act(() => result.current.replacePage(nextPage))
    expect(result.current.members).toEqual(nextPage.items)
    expect(result.current.pagination).toEqual(nextPage)
  })

  it('removes a member and recalculates pagination', () => {
    const { result } = renderHook(() =>
      useMemberState({ initialPage: { ...initialPage, totalItems: 3, totalPages: 2 } }),
    )

    act(() => result.current.removeMember('member-1'))

    expect(result.current.members).toHaveLength(1)
    expect(result.current.pagination.totalItems).toBe(2)
    expect(result.current.pagination.totalPages).toBe(1)
  })

  it('controls the create dialog state', () => {
    const { result } = renderHook(() => useMemberState({ initialPage }))

    act(() => result.current.setIsCreateOpen(true))

    expect(result.current.isCreateOpen).toBe(true)
  })
})
