import { act, renderHook } from '@testing-library/react'
import { listMembersCommand } from '../_commands/member-list.commands'
import { useMemberList } from './use-member-list'

jest.mock('../_commands/member-list.commands', () => ({ listMembersCommand: jest.fn() }))
jest.mock('sonner', () => ({ toast: { error: jest.fn() } }))

const pagination = { items: [], page: 2, pageSize: 10, totalItems: 0, totalPages: 1 }

describe('useMemberList', () => {
  it('loads a page and changes page size from page one', async () => {
    const page = { ...pagination, page: 3 }
    jest.mocked(listMembersCommand).mockResolvedValue(page)
    const replacePage = jest.fn()
    const { result } = renderHook(() => useMemberList({ pagination, replacePage }))

    await act(() => result.current.changePage(3))
    await act(() => result.current.changePageSize(25))

    expect(listMembersCommand).toHaveBeenNthCalledWith(1, 3, 10)
    expect(listMembersCommand).toHaveBeenLastCalledWith(1, 25)
    expect(replacePage).toHaveBeenCalledWith(page)
  })

  it('rethrows page loading failures', async () => {
    const error = new Error('Falha')
    jest.mocked(listMembersCommand).mockRejectedValue(error)
    const { result } = renderHook(() => useMemberList({ pagination, replacePage: jest.fn() }))

    await expect(result.current.changePage(3)).rejects.toThrow('Falha')
  })

  it('handles page and page-size failures with both error shapes', async () => {
    jest.mocked(listMembersCommand).mockRejectedValueOnce('Falha').mockRejectedValueOnce(new Error('Falha'))
    const { result } = renderHook(() => useMemberList({ pagination, replacePage: jest.fn() }))
    await expect(result.current.changePage(3)).rejects.toBe('Falha')
    await expect(result.current.changePageSize(25)).rejects.toThrow('Falha')
  })

  it('handles a non-Error page-size failure', async () => {
    jest.mocked(listMembersCommand).mockRejectedValue('Falha')
    const { result } = renderHook(() => useMemberList({ pagination, replacePage: jest.fn() }))
    await expect(result.current.changePageSize(25)).rejects.toBe('Falha')
  })
})
