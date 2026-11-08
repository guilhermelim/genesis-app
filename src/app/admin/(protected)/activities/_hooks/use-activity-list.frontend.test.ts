import { act, renderHook } from '@testing-library/react'
import { listActivitiesCommand } from '../_commands/activity-list.commands'
import { useActivityList } from './use-activity-list'

jest.mock('../_commands/activity-list.commands', () => ({ listActivitiesCommand: jest.fn() }))
jest.mock('sonner', () => ({ toast: { error: jest.fn() } }))

const pagination = { items: [], page: 2, pageSize: 10, totalItems: 0, totalPages: 1 }

describe('useActivityList', () => {
  it('loads a page and resets the page when changing page size', async () => {
    const page = { ...pagination, page: 1, pageSize: 25 }
    jest.mocked(listActivitiesCommand).mockResolvedValue(page)
    const replacePage = jest.fn()
    const { result } = renderHook(() => useActivityList({ pagination, replacePage }))

    await act(async () => result.current.changePage(3))
    await act(async () => result.current.changePageSize(25))

    expect(listActivitiesCommand).toHaveBeenNthCalledWith(1, 3, 10)
    expect(listActivitiesCommand).toHaveBeenLastCalledWith(1, 25)
    expect(replacePage).toHaveBeenCalledWith(page)
  })

  it('rethrows loading failures', async () => {
    const error = new Error('Falha')
    jest.mocked(listActivitiesCommand).mockRejectedValue(error)
    const { result } = renderHook(() => useActivityList({ pagination, replacePage: jest.fn() }))

    let thrown: unknown
    await act(async () => {
      try {
        await result.current.changePageSize(25)
      } catch (error) {
        thrown = error
      }
    })
    expect(thrown).toEqual(error)
  })

  it('rethrows page navigation failures', async () => {
    jest.mocked(listActivitiesCommand).mockRejectedValue('Falha')
    const { result } = renderHook(() => useActivityList({ pagination, replacePage: jest.fn() }))
    let thrown: unknown
    await act(async () => {
      try {
        await result.current.changePage(3)
      } catch (error) {
        thrown = error
      }
    })
    expect(thrown).toBe('Falha')
  })

  it('handles both error shapes for page and page-size navigation', async () => {
    const error = new Error('Falha')
    jest.mocked(listActivitiesCommand).mockRejectedValueOnce(error).mockRejectedValueOnce('Falha')
    const { result } = renderHook(() => useActivityList({ pagination, replacePage: jest.fn() }))
    let pageError: unknown
    await act(async () => {
      try {
        await result.current.changePage(3)
      } catch (error) {
        pageError = error
      }
    })
    expect(pageError).toEqual(error)
    let pageSizeError: unknown
    await act(async () => {
      try {
        await result.current.changePageSize(25)
      } catch (error) {
        pageSizeError = error
      }
    })
    expect(pageSizeError).toBe('Falha')
  })
})
