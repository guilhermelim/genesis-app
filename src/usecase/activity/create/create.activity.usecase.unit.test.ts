import ActivityRepositoryInterface from '@/domain/activity/repository/activity-repository.interface'
import CreateActivityUseCase from './create.activity.usecase'

describe('CreateActivityUseCase', () => {
  it('creates an activity through the repository', async () => {
    const repository: ActivityRepositoryInterface = {
      create: jest.fn(),
      find: jest.fn(),
      findAll: jest.fn(),
      findPage: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    const usecase = new CreateActivityUseCase(repository)

    const output = await usecase.execute({
      name: 'Louvor',
      description: 'Descrição',
      label: '7:30h',
    })

    expect(repository.create).toHaveBeenCalledTimes(1)
    expect(output).toMatchObject({
      name: 'Louvor',
      description: 'Descrição',
      label: '7:30h',
    })
    expect(output.id).toEqual(expect.any(String))
  })
})
