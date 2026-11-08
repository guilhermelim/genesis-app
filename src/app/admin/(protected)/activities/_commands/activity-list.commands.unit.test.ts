import { listActivitiesPage } from '@/infrastructure/activity/activity.actions'
import { listActivitiesCommand } from './activity-list.commands'

jest.mock('@/infrastructure/activity/activity.actions', () => ({
  listActivitiesPage: jest.fn(),
}))

describe('listActivitiesCommand', () => {
  it('delegates pagination to the activity action', async () => {
    const page = { page: 1, pageSize: 10, totalItems: 1, totalPages: 1, items: [] }
    jest.mocked(listActivitiesPage).mockResolvedValue(page)

    await expect(listActivitiesCommand(1, 10)).resolves.toBe(page)
    expect(listActivitiesPage).toHaveBeenCalledWith({ page: 1, pageSize: 10 })
  })
})
