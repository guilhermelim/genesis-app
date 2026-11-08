import { listActivitiesPage } from '@/infrastructure/activity/activity.actions'
import { listActivitiesCommand } from './activity-list.commands'

jest.mock('@/infrastructure/activity/activity.actions', () => ({ listActivitiesPage: jest.fn() }))

it('passes pagination to the activity action', async () => {
  const page = { items: [], page: 2, pageSize: 20, totalItems: 0, totalPages: 0 }
  jest.mocked(listActivitiesPage).mockResolvedValue(page)

  await expect(listActivitiesCommand(2, 20)).resolves.toBe(page)
  expect(listActivitiesPage).toHaveBeenCalledWith({ page: 2, pageSize: 20 })
})
