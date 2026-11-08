import { createActivity, deleteActivity, updateActivity } from '@/infrastructure/activity/activity.actions'
import { createActivityCommand, deleteActivityCommand, updateActivityCommand } from './activity-actions.commands'

jest.mock('@/infrastructure/activity/activity.actions', () => ({
  createActivity: jest.fn(),
  deleteActivity: jest.fn(),
  updateActivity: jest.fn(),
}))
jest.mock('@/infrastructure/action-result', () => ({ unwrapActionResult: (result: unknown) => result }))

it('delegates activity creation, updates, and deletion', async () => {
  const activity = {
    id: 'activity-1',
    name: 'Ação',
    label: '09h',
    description: 'Descrição',
    iconName: 'default' as const,
  }
  const createInput = {
    name: activity.name,
    label: activity.label,
    description: activity.description,
    iconName: activity.iconName,
  }
  jest.mocked(createActivity).mockResolvedValue(activity as never)
  jest.mocked(updateActivity).mockResolvedValue(activity as never)
  jest.mocked(deleteActivity).mockResolvedValue({ id: activity.id } as never)

  await expect(createActivityCommand(createInput)).resolves.toBe(activity)
  await expect(updateActivityCommand(activity)).resolves.toBe(activity)
  await expect(deleteActivityCommand(activity.id)).resolves.toEqual({ id: activity.id })
  expect(createActivity).toHaveBeenCalledWith(createInput)
  expect(updateActivity).toHaveBeenCalledWith(activity)
  expect(deleteActivity).toHaveBeenCalledWith(activity.id)
})
