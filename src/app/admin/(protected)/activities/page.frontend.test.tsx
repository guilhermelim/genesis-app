import { render, screen } from '@testing-library/react'
import { listActivitiesPage } from '@/infrastructure/activity/activity.actions'
import ActivitiesPage from './page'

jest.mock('@/infrastructure/activity/activity.actions', () => ({ listActivitiesPage: jest.fn() }))
jest.mock('./activities-page.client', () => ({
  __esModule: true,
  default: ({ initialPage }: { initialPage: { page: number; pageSize: number } }) => (
    <output data-testid="page-values">
      {initialPage.page}:{initialPage.pageSize}
    </output>
  ),
}))

const page = { items: [], page: 1, pageSize: 10, totalItems: 0, totalPages: 1 }

describe('ActivitiesPage', () => {
  beforeEach(() => {
    jest.mocked(listActivitiesPage).mockImplementation(async input => ({ ...page, ...input }))
  })

  it('uses defaults for absent and invalid search parameters', async () => {
    const element = await ActivitiesPage({ searchParams: Promise.resolve({}) })
    render(element)

    expect(screen.getByTestId('page-values')).toHaveTextContent('1:10')
    expect(listActivitiesPage).toHaveBeenCalledWith({ page: 1, pageSize: 10 })
  })

  it('normalizes arrays, positive values, and the page-size maximum', async () => {
    const element = await ActivitiesPage({
      searchParams: Promise.resolve({ page: ['3', '4'], pageSize: '999' }),
    })
    render(element)

    expect(screen.getByTestId('page-values')).toHaveTextContent('3:100')
    expect(listActivitiesPage).toHaveBeenCalledWith({ page: 3, pageSize: 100 })
  })

  it.each([{ page: '0' }, { page: '-2' }, { page: 'nope' }, { page: '1.5' }])(
    'falls back for invalid page %p',
    async searchParams => {
      const element = await ActivitiesPage({
        searchParams: Promise.resolve({ ...searchParams, pageSize: '10' }),
      })
      render(element)

      expect(screen.getByTestId('page-values')).toHaveTextContent('1:10')
    },
  )
})
