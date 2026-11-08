import { listMembersPage } from '@/infrastructure/member/member.actions'
import { listMembersCommand } from './member-list.commands'

jest.mock('@/infrastructure/member/member.actions', () => ({ listMembersPage: jest.fn() }))

it('passes pagination to the member action', async () => {
  const page = { items: [], page: 2, pageSize: 20, totalItems: 0, totalPages: 0 }
  jest.mocked(listMembersPage).mockResolvedValue(page)

  await expect(listMembersCommand(2, 20)).resolves.toBe(page)
  expect(listMembersPage).toHaveBeenCalledWith({ page: 2, pageSize: 20 })
})
