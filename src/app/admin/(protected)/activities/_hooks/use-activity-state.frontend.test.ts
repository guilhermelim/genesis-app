import { act, renderHook } from '@testing-library/react'
import { useActivityState } from './use-activity-state'

const initialPage = {
  items: [
    { id: 'activity-1', label: 'A', name: 'Corrida', description: 'Descrição', iconName: 'Bike' },
    { id: 'activity-2', label: 'B', name: 'Natação', description: 'Descrição', iconName: 'Waves' },
  ],
  page: 1,
  pageSize: 2,
  totalItems: 2,
  totalPages: 1,
}

describe('useActivityState', () => {
  it('replaces pages and individual activities', () => {
    const { result } = renderHook(() => useActivityState({ initialPage }))
    const replacement = { ...initialPage.items[0], name: 'Ciclismo' }

    act(() => result.current.replaceActivity(replacement))
    expect(result.current.activities[0]).toEqual(replacement)

    const nextPage = { ...initialPage, page: 2, items: [{ ...initialPage.items[0], id: 'activity-3' }] }
    act(() => result.current.replacePage(nextPage))
    expect(result.current.activities).toEqual(nextPage.items)
  })

  it('removes an activity and recalculates pagination', () => {
    const { result } = renderHook(() =>
      useActivityState({ initialPage: { ...initialPage, totalItems: 3, totalPages: 2 } }),
    )

    act(() => result.current.removeActivity('activity-1'))

    expect(result.current.activities).toHaveLength(1)
    expect(result.current.pagination.totalItems).toBe(2)
    expect(result.current.pagination.totalPages).toBe(1)
  })
})
