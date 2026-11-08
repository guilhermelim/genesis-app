import Activity from '@/domain/activity/entity/activity'
import Database from '@/lib/database'
import ActivityRepository from './activity.repository'
import { ActivityModel } from './model/activity.model'

jest.mock('./model/activity.model', () => ({
  ActivityModel: {
    create: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
  },
}))

const query = <T>(value: T) => ({
  exec: jest.fn().mockResolvedValue(value),
})

describe('ActivityRepository', () => {
  beforeEach(() => {
    jest.spyOn(Database, 'connect').mockResolvedValue({} as never)
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  it('creates an activity through the model', async () => {
    const activity = new Activity('Trilha', 'Ao ar livre', 'TR', 'activity-1')

    await expect(new ActivityRepository().create(activity)).resolves.toBeUndefined()
    expect(ActivityModel.create).toHaveBeenCalledWith({
      _id: 'activity-1',
      name: 'Trilha',
      label: 'TR',
      description: 'Ao ar livre',
      iconName: 'default',
    })
  })

  it('finds and maps an activity document', async () => {
    const document = { _id: 'activity-1', name: 'Trilha', label: 'TR', description: 'Ao ar livre' }
    jest.mocked(ActivityModel.findById).mockReturnValue(query(document) as never)

    await expect(new ActivityRepository().find('activity-1')).resolves.toEqual(
      new Activity('Trilha', 'Ao ar livre', 'TR', 'activity-1'),
    )
  })

  it('lists activity documents', async () => {
    const documents = [
      { _id: 'activity-1', name: 'Trilha', label: 'TR', description: 'Ao ar livre' },
      { _id: 'activity-2', name: 'Jogo', label: 'JG', description: 'Em grupo' },
    ]
    jest.mocked(ActivityModel.find).mockReturnValue(query(documents) as never)

    await expect(new ActivityRepository().findAll()).resolves.toEqual([
      new Activity('Trilha', 'Ao ar livre', 'TR', 'activity-1'),
      new Activity('Jogo', 'Em grupo', 'JG', 'activity-2'),
    ])
  })

  it('lists a page of activities with the total count', async () => {
    const document = { _id: 'activity-1', name: 'Trilha', label: 'TR', description: 'Ao ar livre' }
    jest.mocked(ActivityModel.find).mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue(query([document])),
        }),
      }),
    } as never)
    jest.mocked(ActivityModel.countDocuments).mockReturnValue(query(3) as never)

    await expect(new ActivityRepository().findPage(2, 1)).resolves.toEqual({
      items: [new Activity('Trilha', 'Ao ar livre', 'TR', 'activity-1')],
      totalItems: 3,
    })
  })

  it('updates and deletes an activity', async () => {
    const activity = new Activity('Trilha', 'Descrição', 'TR', 'activity-1')
    jest.mocked(ActivityModel.updateOne).mockReturnValue(query({ matchedCount: 1 }) as never)
    jest.mocked(ActivityModel.deleteOne).mockReturnValue(query({ deletedCount: 1 }) as never)

    await expect(new ActivityRepository().update(activity)).resolves.toBeUndefined()
    await expect(new ActivityRepository().delete('activity-1')).resolves.toBeUndefined()
    expect(ActivityModel.updateOne).toHaveBeenCalledWith(
      { _id: 'activity-1' },
      { label: 'TR', name: 'Trilha', description: 'Descrição', iconName: 'default' },
    )
    expect(ActivityModel.deleteOne).toHaveBeenCalledWith({ _id: 'activity-1' })
  })

  it('reports missing activities', async () => {
    const activity = new Activity('Trilha', 'Descrição', 'TR', 'activity-1')
    jest.mocked(ActivityModel.findById).mockReturnValue(query(null) as never)
    jest.mocked(ActivityModel.updateOne).mockReturnValue(query({ matchedCount: 0 }) as never)
    jest.mocked(ActivityModel.deleteOne).mockReturnValue(query({ deletedCount: 0 }) as never)

    await expect(new ActivityRepository().find('activity-1')).rejects.toThrow('Activity not found')
    await expect(new ActivityRepository().update(activity)).rejects.toThrow('Activity not found to update')
    await expect(new ActivityRepository().delete('activity-1')).rejects.toThrow('Activity not found to delete')
  })
})
