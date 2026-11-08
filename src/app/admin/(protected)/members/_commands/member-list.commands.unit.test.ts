import { listMembersPage } from '@/infrastructure/member/member.actions'
import { listMembersCommand } from './member-list.commands'

jest.mock('@/infrastructure/member/member.actions', () => ({
  listMembersPage: jest.fn(),
}))

describe('listMembersCommand', () => {
  it('delegates pagination to the member action', async () => {
    const page = { page: 2, pageSize: 10, totalItems: 11, totalPages: 2, items: [] }
    jest.mocked(listMembersPage).mockResolvedValue(page)

    await expect(listMembersCommand(2, 10)).resolves.toBe(page)
    expect(listMembersPage).toHaveBeenCalledWith({ page: 2, pageSize: 10 })
  })
})
