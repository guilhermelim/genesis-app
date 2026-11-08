import { act, renderHook } from '@testing-library/react'
import { createMemberCommand, deleteMemberCommand, updateMemberCommand } from '../_commands/member-actions.commands'
import { listMembersCommand } from '../_commands/member-list.commands'
import { useMemberActions } from './use-member-actions'

jest.mock('../_commands/member-actions.commands', () => ({
  createMemberCommand: jest.fn(),
  deleteMemberCommand: jest.fn(),
  updateMemberCommand: jest.fn(),
}))
jest.mock('../_commands/member-list.commands', () => ({ listMembersCommand: jest.fn() }))
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }))

const member = { id: 'member-1', name: 'Ana', image: undefined, active: true }
const page = { items: [member], page: 1, pageSize: 10, totalItems: 1, totalPages: 1 }

function setup() {
  return renderHook(() =>
    useMemberActions({
      members: [member],
      pagination: page,
      replacePage: jest.fn(),
      replaceMember: jest.fn(),
      removeMember: jest.fn(),
      closeCreate: jest.fn(),
    }),
  )
}

describe('useMemberActions', () => {
  it('creates, updates, and removes members', async () => {
    jest.mocked(createMemberCommand).mockResolvedValue({ ...member, id: 'member-2' })
    jest.mocked(listMembersCommand).mockResolvedValue(page)
    jest.mocked(updateMemberCommand).mockResolvedValue(member)
    jest.mocked(deleteMemberCommand).mockResolvedValue({ id: member.id })
    const { result } = setup()

    await act(() => result.current.create({ name: 'Bruno', image: undefined, active: true }))
    await act(() => result.current.update(member))
    await act(() => result.current.remove(member.id))

    expect(createMemberCommand).toHaveBeenCalled()
    expect(updateMemberCommand).toHaveBeenCalledWith(member)
    expect(deleteMemberCommand).toHaveBeenCalledWith('member-1')
  })

  it('swallows action failures after showing the error toast', async () => {
    jest.mocked(createMemberCommand).mockRejectedValue(new Error('Falha'))
    const { result } = setup()

    await act(() => result.current.create({ name: 'Bruno', image: undefined, active: true }))

    expect(createMemberCommand).toHaveBeenCalled()
  })

  it('handles every failure shape and reloads the previous page after the last deletion', async () => {
    jest.mocked(createMemberCommand).mockRejectedValueOnce('Falha ao criar')
    jest.mocked(updateMemberCommand).mockRejectedValueOnce('Falha ao atualizar')
    jest.mocked(deleteMemberCommand).mockResolvedValueOnce({ id: member.id })
    jest.mocked(listMembersCommand).mockResolvedValue(page)
    const replacePage = jest.fn()
    const { result } = renderHook(() =>
      useMemberActions({
        members: [member],
        pagination: { ...page, page: 2 },
        replacePage,
        replaceMember: jest.fn(),
        removeMember: jest.fn(),
        closeCreate: jest.fn(),
      }),
    )

    await act(() => result.current.create({ name: 'Bruno', image: undefined, active: true }))
    await act(() => result.current.update(member))
    await act(() => result.current.remove(member.id))
    expect(listMembersCommand).toHaveBeenCalledWith(1, 10)
    expect(replacePage).toHaveBeenCalled()
  })

  it('handles delete failures with both Error and non-Error causes', async () => {
    jest.mocked(deleteMemberCommand).mockRejectedValueOnce(new Error('Falha')).mockRejectedValueOnce('Falha')
    const { result } = setup()
    await act(() => result.current.remove(member.id))
    await act(() => result.current.remove(member.id))
    expect(deleteMemberCommand).toHaveBeenCalledTimes(2)
  })

  it('uses the Error message when updating fails', async () => {
    jest.mocked(updateMemberCommand).mockRejectedValue(new Error('Falha ao atualizar'))
    const { result } = setup()
    await act(() => result.current.update(member))
    expect(updateMemberCommand).toHaveBeenCalledWith(member)
  })
})
