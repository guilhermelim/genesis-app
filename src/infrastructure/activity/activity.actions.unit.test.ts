import Activity from '@/domain/activity/entity/activity'
import { revalidatePath } from 'next/cache'
import ActivityRepository from './repository/mongodb/activity.repository'
import {
  createActivity,
  deleteActivity,
  findActivity,
  listActivities,
  listActivitiesPage,
  updateActivity,
} from './activity.actions'

jest.mock('next/cache', () => ({ revalidatePath: jest.fn(), unstable_noStore: jest.fn() }))

describe('activity Server Actions', () => {
  afterEach(() => jest.restoreAllMocks())

  it('executes reads and mutations through the repository', async () => {
    const activity = new Activity('Trilha', 'Descrição', 'TR', 'activity-1')
    jest.spyOn(ActivityRepository.prototype, 'findAll').mockResolvedValue([activity])
    jest.spyOn(ActivityRepository.prototype, 'findPage').mockResolvedValue({ items: [activity], totalItems: 1 })
    jest.spyOn(ActivityRepository.prototype, 'find').mockResolvedValue(activity)
    jest.spyOn(ActivityRepository.prototype, 'create').mockResolvedValue()
    jest.spyOn(ActivityRepository.prototype, 'update').mockResolvedValue()
    jest.spyOn(ActivityRepository.prototype, 'delete').mockResolvedValue()

    await expect(listActivities()).resolves.toEqual([
      { id: 'activity-1', name: 'Trilha', label: 'TR', description: 'Descrição', iconName: 'default' },
    ])
    await expect(listActivitiesPage({ page: 1, pageSize: 10 })).resolves.toMatchObject({
      page: 1,
      pageSize: 10,
      totalItems: 1,
      items: [{ id: 'activity-1' }],
    })
    await expect(findActivity('activity-1')).resolves.toMatchObject({ id: 'activity-1' })
    await expect(createActivity({ name: 'Nova', label: 'N', description: 'Descrição' })).resolves.toMatchObject({
      success: true,
      data: { name: 'Nova', label: 'N' },
    })
    await expect(
      updateActivity({
        id: 'activity-1',
        name: 'Atualizada',
        label: 'A',
        description: 'Descrição',
        iconName: 'Music2',
      }),
    ).resolves.toMatchObject({ success: true, data: { id: 'activity-1' } })
    await expect(deleteActivity('activity-1')).resolves.toEqual({ success: true, data: { id: 'activity-1' } })
  })

  it.each([
    ['createActivity', () => createActivity({ name: '', label: 'A', description: '' })],
    ['updateActivity', () => updateActivity({ id: '', name: 'N', label: 'A', description: '' })],
    ['deleteActivity', () => deleteActivity('')],
  ])('%s returns a validation error', async (_, action) => {
    await expect(action()).resolves.toMatchObject({
      success: false,
      error: { code: 'VALIDATION_ERROR' },
    })
  })

  it('rejects invalid pagination input', async () => {
    await expect(listActivitiesPage({ page: 0, pageSize: 10 })).rejects.toThrow()
    await expect(listActivitiesPage({ page: 1, pageSize: 101 })).rejects.toThrow()
  })

  it('revalidates activity paths after mutations', async () => {
    jest.spyOn(ActivityRepository.prototype, 'create').mockResolvedValue()

    await createActivity({ name: 'Nova', label: 'N', description: 'Descrição' })

    expect(revalidatePath).toHaveBeenCalledWith('/')
    expect(revalidatePath).toHaveBeenCalledWith('/admin')
  })
})
