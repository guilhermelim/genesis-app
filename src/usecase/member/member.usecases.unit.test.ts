import MemberFactory from '@/domain/member/factory/member.factory'
import MemberRepositoryInterface from '@/domain/member/repository/member-repository.interface'
import DeleteMemberUseCase from './delete/delete.member.usecase'
import FindMemberUseCase from './find/find.member.usecase'
import ListMemberUseCase from './list/list.member.usecase'
import UpdateMemberUseCase from './update/update.member.usecase'

function createRepository(): jest.Mocked<MemberRepositoryInterface> {
  return {
    create: jest.fn(),
    find: jest.fn(),
    findAll: jest.fn(),
    findPage: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }
}

describe('Member use cases', () => {
  it('finds and lists members as DTOs', async () => {
    const repository = createRepository()
    const member = MemberFactory.create('Guilherme', 'member-1')
    repository.find.mockResolvedValue(member)
    repository.findAll.mockResolvedValue([member])

    await expect(new FindMemberUseCase(repository).execute({ id: 'member-1' })).resolves.toEqual({
      id: 'member-1',
      name: 'Guilherme',
      active: true,
    })
    await expect(new ListMemberUseCase(repository).execute()).resolves.toEqual([
      { id: 'member-1', name: 'Guilherme', active: true },
    ])
  })

  it('updates and deletes a member', async () => {
    const repository = createRepository()

    await expect(
      new UpdateMemberUseCase(repository).execute({ id: 'member-1', name: 'Novo nome', active: true }),
    ).resolves.toEqual({
      id: 'member-1',
      name: 'Novo nome',
      active: true,
    })
    await expect(new DeleteMemberUseCase(repository).execute({ id: 'member-1' })).resolves.toEqual({
      id: 'member-1',
    })
    expect(repository.update).toHaveBeenCalledWith(expect.objectContaining({ id: 'member-1', name: 'Novo nome' }))
    expect(repository.delete).toHaveBeenCalledWith('member-1')
  })

  it('normalizes a page beyond the available range', async () => {
    const repository = createRepository()
    const members = Array.from({ length: 3 }, (_, index) =>
      MemberFactory.create(`Membro ${index + 1}`, `member-${index + 1}`),
    )
    repository.findPage
      .mockResolvedValueOnce({ items: [], totalItems: members.length })
      .mockResolvedValueOnce({ items: [members[2]], totalItems: members.length })

    await expect(new ListMemberUseCase(repository).executePage({ page: 99, pageSize: 2 })).resolves.toMatchObject({
      page: 2,
      pageSize: 2,
      totalItems: 3,
      totalPages: 2,
      items: [{ id: 'member-3' }],
    })
    expect(repository.findPage).toHaveBeenNthCalledWith(2, 2, 2)
  })
})
