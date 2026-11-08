import Member from '@/domain/member/entity/member'
import MemberRepository from './repository/mongodb/member.repository'
import { createMember, deleteMember, findMember, listMembers, listMembersPage, updateMember } from './member.actions'

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))

describe('member Server Actions', () => {
  afterEach(() => jest.restoreAllMocks())

  it('executes reads and mutations through the repository', async () => {
    const member = new Member('Guilherme', 'member-1')
    jest.spyOn(MemberRepository.prototype, 'findAll').mockResolvedValue([member])
    jest.spyOn(MemberRepository.prototype, 'findPage').mockResolvedValue({ items: [member], totalItems: 1 })
    jest.spyOn(MemberRepository.prototype, 'find').mockResolvedValue(member)
    jest.spyOn(MemberRepository.prototype, 'create').mockResolvedValue()
    jest.spyOn(MemberRepository.prototype, 'update').mockResolvedValue()
    jest.spyOn(MemberRepository.prototype, 'delete').mockResolvedValue()

    await expect(listMembers()).resolves.toEqual([{ id: 'member-1', name: 'Guilherme', active: true }])
    await expect(listMembersPage({ page: 1, pageSize: 10 })).resolves.toMatchObject({
      page: 1,
      pageSize: 10,
      totalItems: 1,
      items: [{ id: 'member-1' }],
    })
    await expect(findMember('member-1')).resolves.toEqual({ id: 'member-1', name: 'Guilherme', active: true })
    await expect(createMember({ name: 'Novo membro' })).resolves.toMatchObject({
      success: true,
      data: { name: 'Novo membro' },
    })
    await expect(updateMember({ id: 'member-1', name: 'Atualizado', active: true })).resolves.toEqual({
      success: true,
      data: { id: 'member-1', name: 'Atualizado', active: true },
    })
    await expect(deleteMember('member-1')).resolves.toEqual({ success: true, data: { id: 'member-1' } })
  })

  it.each([
    ['createMember', () => createMember({ name: '' })],
    ['updateMember', () => updateMember({ id: '', name: 'N', active: true })],
    ['deleteMember', () => deleteMember('')],
  ])('%s returns a validation error', async (_, action) => {
    await expect(action()).resolves.toMatchObject({
      success: false,
      error: { code: 'VALIDATION_ERROR' },
    })
  })

  it('rejects invalid pagination input', async () => {
    await expect(listMembersPage({ page: 0, pageSize: 10 })).rejects.toThrow()
    await expect(listMembersPage({ page: 1, pageSize: 101 })).rejects.toThrow()
  })
})
