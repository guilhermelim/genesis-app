import { createMember, deleteMember, updateMember } from '@/infrastructure/member/member.actions'
import type { ActionResult } from '@/infrastructure/action-result'
import { createMemberCommand, deleteMemberCommand, updateMemberCommand } from './member-actions.commands'

jest.mock('@/infrastructure/member/member.actions', () => ({
  createMember: jest.fn(),
  deleteMember: jest.fn(),
  updateMember: jest.fn(),
}))

describe('member action commands', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('unwraps member creation results', async () => {
    const member = { id: 'member-1', name: 'Ana', active: true }
    jest.mocked(createMember).mockResolvedValue({ success: true, data: member })

    await expect(createMemberCommand({ name: 'Ana', active: true })).resolves.toEqual(member)
  })

  it('unwraps member update results', async () => {
    const member = { id: 'member-1', name: 'Ana', active: true }
    jest.mocked(updateMember).mockResolvedValue({ success: true, data: member })

    await expect(updateMemberCommand(member)).resolves.toEqual(member)
  })

  it('unwraps member deletion results', async () => {
    const result = { id: 'member-1' }
    jest.mocked(deleteMember).mockResolvedValue({ success: true, data: result })

    await expect(deleteMemberCommand('member-1')).resolves.toEqual(result)
  })

  it('throws the normalized action error', async () => {
    const failure: ActionResult<never> = {
      success: false,
      error: { code: 'NOT_FOUND', message: 'Membro não encontrado.' },
    }
    jest.mocked(deleteMember).mockResolvedValue(failure)

    await expect(deleteMemberCommand('missing')).rejects.toThrow('Membro não encontrado.')
  })
})
