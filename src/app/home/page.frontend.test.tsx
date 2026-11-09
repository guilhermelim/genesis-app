import { render, screen } from '@testing-library/react'
import { getActivePoll } from '@/infrastructure/poll/poll.actions'
import { listActivities } from '@/infrastructure/activity/activity.actions'
import { listMembers } from '@/infrastructure/member/member.actions'
import HomePage from './page'

jest.mock('@/infrastructure/poll/poll.actions', () => ({ getActivePoll: jest.fn() }))
jest.mock('@/infrastructure/activity/activity.actions', () => ({ listActivities: jest.fn() }))
jest.mock('@/infrastructure/member/member.actions', () => ({ listMembers: jest.fn() }))
jest.mock('@/components/layout/page-container', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}))
jest.mock('./_components/home-hero', () => ({
  __esModule: true,
  default: ({ memberCount, photos, pollTitle }: { memberCount: number; photos?: unknown[]; pollTitle?: string }) => (
    <div data-testid="hero">
      {memberCount}|{pollTitle}|{photos?.length ?? 0}
    </div>
  ),
}))
jest.mock('./_sections/home/poll-client', () => ({
  __esModule: true,
  default: ({ poll, members, activities }: { poll: unknown; members: unknown[]; activities: unknown[] }) => (
    <div data-testid="poll-client">{JSON.stringify({ poll, members, activities })}</div>
  ),
}))

it('loads the home data and passes only active members to the client', async () => {
  const poll = {
    id: 'poll-1',
    title: 'Mutirão comunitário',
    photos: [{ id: 'photo-1', dataUrl: 'data:image/png;base64,image', isPrimary: true }],
  }
  const activities = [{ id: 'activity-1' }]
  jest.mocked(getActivePoll).mockResolvedValue(poll as never)
  jest.mocked(listActivities).mockResolvedValue(activities as never)
  jest.mocked(listMembers).mockResolvedValue([
    { id: '1', name: 'Ana', active: true },
    { id: '2', name: 'Bruno', active: false },
  ] as never)

  render(await HomePage())

  expect(screen.getByTestId('hero')).toHaveTextContent('1|Mutirão comunitário|1')
  expect(screen.getByTestId('poll-client')).toHaveTextContent('"id":"poll-1"')
  expect(screen.getByTestId('poll-client')).toHaveTextContent('Ana')
  expect(screen.getByTestId('poll-client')).not.toHaveTextContent('Bruno')
  expect(getActivePoll).toHaveBeenCalled()
  expect(listActivities).toHaveBeenCalled()
  expect(listMembers).toHaveBeenCalled()
})
