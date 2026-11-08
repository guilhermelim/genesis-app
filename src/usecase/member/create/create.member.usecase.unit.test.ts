import MemberRepositoryInterface from '@/domain/member/repository/member-repository.interface'
import CreateMemberUseCase from './create.member.usecase'

describe('CreateMemberUseCase', () => {
  it('creates and persists a member', async () => {
    const repository: MemberRepositoryInterface = {
      create: jest.fn(),
      find: jest.fn(),
      findAll: jest.fn(),
      findPage: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    const usecase = new CreateMemberUseCase(repository)

    const output = await usecase.execute({ name: 'Guilherme' })

    expect(output).toMatchObject({ name: 'Guilherme' })
    expect(output.id).toEqual(expect.any(String))
    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ id: output.id, name: 'Guilherme' }))
  })
})
