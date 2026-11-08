import ActivityFactory from '@/domain/activity/factory/activity.factory'
import ActivityRepositoryInterface from '@/domain/activity/repository/activity-repository.interface'
import DeleteActivityUseCase from './delete/delete.activity.usecase'
import FindActivityUseCase from './find/find.activity.usecase'
import ListActivityUseCase from './list/list.activity.usecase'
import UpdateActivityUseCase from './update/update.activity.usecase'

function createRepository(): jest.Mocked<ActivityRepositoryInterface> {
  return {
    create: jest.fn(),
    find: jest.fn(),
    findAll: jest.fn(),
    findPage: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }
}

describe('Activity use cases', () => {
  it('finds and lists activities as DTOs', async () => {
    const repository = createRepository()
    const activity = ActivityFactory.create('Trilha', 'Ao ar livre', 'TR', 'activity-1')
    repository.find.mockResolvedValue(activity)
    repository.findAll.mockResolvedValue([activity])
    repository.findPage.mockResolvedValue({ items: [activity], totalItems: 3 })

    await expect(new FindActivityUseCase(repository).execute({ id: 'activity-1' })).resolves.toEqual({
      id: 'activity-1',
      name: 'Trilha',
      label: 'TR',
      description: 'Ao ar livre',
      iconName: 'default',
    })
    await expect(new ListActivityUseCase(repository).execute()).resolves.toEqual([
      { id: 'activity-1', name: 'Trilha', label: 'TR', description: 'Ao ar livre', iconName: 'default' },
    ])
    await expect(new ListActivityUseCase(repository).executePage({ page: 1, pageSize: 2 })).resolves.toMatchObject({
      page: 1,
      pageSize: 2,
      totalItems: 3,
      totalPages: 2,
      items: [{ id: 'activity-1' }],
    })
  })

  it('updates and deletes an activity', async () => {
    const repository = createRepository()

    await expect(
      new UpdateActivityUseCase(repository).execute({
        id: 'activity-1',
        name: 'Trilha',
        label: 'TR',
        description: 'Nova descrição',
      }),
    ).resolves.toMatchObject({ id: 'activity-1', description: 'Nova descrição' })
    await expect(new DeleteActivityUseCase(repository).execute({ id: 'activity-1' })).resolves.toEqual({
      id: 'activity-1',
    })
    expect(repository.update).toHaveBeenCalled()
    expect(repository.delete).toHaveBeenCalledWith('activity-1')
  })

  it('normalizes a page beyond the available range', async () => {
    const repository = createRepository()
    const activity = ActivityFactory.create('Trilha', 'Ao ar livre', 'TR', 'activity-1')
    repository.findPage
      .mockResolvedValueOnce({ items: [], totalItems: 1 })
      .mockResolvedValueOnce({ items: [activity], totalItems: 1 })

    await expect(new ListActivityUseCase(repository).executePage({ page: 99, pageSize: 10 })).resolves.toMatchObject({
      page: 1,
      items: [{ id: 'activity-1' }],
    })
  })
})
