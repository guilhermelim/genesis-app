import { render, screen } from '@testing-library/react'
import { listActivities } from '@/infrastructure/activity/activity.actions'
import { listMembers } from '@/infrastructure/member/member.actions'
import { listPollsPage } from '@/infrastructure/poll/poll.actions'
import { getPollSettings } from '@/infrastructure/poll-settings/poll-settings.actions'
import PollPage from './page'

jest.mock('@/infrastructure/activity/activity.actions', () => ({ listActivities: jest.fn() }))
jest.mock('@/infrastructure/member/member.actions', () => ({ listMembers: jest.fn() }))
jest.mock('@/infrastructure/poll/poll.actions', () => ({ listPollsPage: jest.fn() }))
jest.mock('@/infrastructure/poll-settings/poll-settings.actions', () => ({ getPollSettings: jest.fn() }))
jest.mock('./poll-page.client', () => ({
  __esModule: true,
  default: ({
    initialPage,
    settings,
    activities,
    members,
  }: {
    initialPage: { page: number; pageSize: number }
    settings: { hour: number }
    activities: unknown[]
    members: unknown[]
  }) => (
    <output data-testid="poll-page-values">
      {initialPage.page}:{initialPage.pageSize}:{settings.hour}:{activities.length}:{members.length}
    </output>
  ),
}))

describe('PollPage', () => {
  beforeEach(() => {
    jest.mocked(listPollsPage).mockResolvedValue({ items: [], page: 1, pageSize: 10, totalItems: 0, totalPages: 1 })
    jest.mocked(getPollSettings).mockResolvedValue({ weekday: 1, hour: 8, minute: 0 })
    jest.mocked(listActivities).mockResolvedValue([])
    jest.mocked(listMembers).mockResolvedValue([])
  })

  it('loads all poll dependencies with defaults', async () => {
    render(await PollPage({ searchParams: Promise.resolve({}) }))

    expect(screen.getByTestId('poll-page-values')).toHaveTextContent('1:10:8:0:0')
    expect(listPollsPage).toHaveBeenCalledWith({ page: 1, pageSize: 10 })
    expect(getPollSettings).toHaveBeenCalled()
    expect(listActivities).toHaveBeenCalled()
    expect(listMembers).toHaveBeenCalled()
  })

  it('normalizes valid parameters and caps page size', async () => {
    jest.mocked(listPollsPage).mockResolvedValue({ items: [], page: 3, pageSize: 100, totalItems: 0, totalPages: 1 })
    render(await PollPage({ searchParams: Promise.resolve({ page: ['3'], pageSize: '999' }) }))

    expect(screen.getByTestId('poll-page-values')).toHaveTextContent('3:100:8:0:0')
  })

  it.each(['0', '-1', 'invalid', '2.5'])('uses fallback for invalid page %s', async pageValue => {
    render(await PollPage({ searchParams: Promise.resolve({ page: pageValue, pageSize: ['10'] }) }))
    expect(screen.getByTestId('poll-page-values')).toHaveTextContent('1:10:8:0:0')
  })
})
