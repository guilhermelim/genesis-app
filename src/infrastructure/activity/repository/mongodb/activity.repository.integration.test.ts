import Activity from '@/domain/activity/entity/activity'
import Database from '@/lib/database'
import ActivityRepository from './activity.repository'
import { ActivityModel } from './model/activity.model'

describe('ActivityRepository integration', () => {
  beforeEach(async () => {
    await Database.connect()
    await ActivityModel.deleteMany({})
  })

  afterEach(async () => {
    await ActivityModel.deleteMany({})
  })

  afterAll(async () => {
    await Database.close()
  })

  it('persists and reconstitutes activities through the model', async () => {
    const repository = new ActivityRepository()
    const activity = new Activity('Trilha', 'Ao ar livre', 'TR', 'activity-1')

    await repository.create(activity)

    await expect(repository.find('activity-1')).resolves.toEqual(activity)
    await expect(ActivityModel.findById('activity-1').lean()).resolves.toMatchObject({
      _id: 'activity-1',
      name: 'Trilha',
      label: 'TR',
      description: 'Ao ar livre',
    })
  })

  it('lists, updates, and deletes activities', async () => {
    const repository = new ActivityRepository()
    const activity = new Activity('Trilha', 'Descrição', 'TR', 'activity-1')

    await repository.create(activity)
    await expect(repository.findAll()).resolves.toHaveLength(1)

    const updatedActivity = activity.changeName('Nova trilha').changeIconName('Music2')
    await repository.update(updatedActivity)

    await expect(repository.find('activity-1')).resolves.toMatchObject({ name: 'Nova trilha', iconName: 'Music2' })
    await repository.delete('activity-1')
    await expect(repository.find('activity-1')).rejects.toThrow('Activity not found')
  })

  it('reports missing activities on find, update, and delete', async () => {
    const repository = new ActivityRepository()
    const activity = new Activity('Trilha', 'Descrição', 'TR', 'activity-1')

    await expect(repository.find('activity-1')).rejects.toThrow('Activity not found')
    await expect(repository.update(activity)).rejects.toThrow('Activity not found to update')
    await expect(repository.delete('activity-1')).rejects.toThrow('Activity not found to delete')
  })
})
