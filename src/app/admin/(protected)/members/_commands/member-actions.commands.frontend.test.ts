import { createMember, deleteMember, updateMember } from '@/infrastructure/member/member.actions'
import { createMemberCommand, deleteMemberCommand, updateMemberCommand } from './member-actions.commands'

jest.mock('@/infrastructure/member/member.actions', () => ({
  createMember: jest.fn(),
  deleteMember: jest.fn(),
  updateMember: jest.fn(),
}))
jest.mock('@/infrastructure/action-result', () => ({ unwrapActionResult: (result: unknown) => result }))

it('delegates member creation, updates, and deletion', async () => {
  const member = { id: 'member-1', name: 'Ana', active: true }
  jest.mocked(createMember).mockResolvedValue(member as never)
  jest.mocked(updateMember).mockResolvedValue(member as never)
  jest.mocked(deleteMember).mockResolvedValue({ id: member.id } as never)

  await expect(createMemberCommand({ name: 'Ana', active: true })).resolves.toBe(member)
  await expect(updateMemberCommand(member)).resolves.toBe(member)
  await expect(deleteMemberCommand(member.id)).resolves.toEqual({ id: member.id })
  expect(createMember).toHaveBeenCalledWith({ name: 'Ana', active: true })
  expect(updateMember).toHaveBeenCalledWith(member)
  expect(deleteMember).toHaveBeenCalledWith(member.id)
})
