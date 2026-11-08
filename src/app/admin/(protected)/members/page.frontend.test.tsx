import { render, screen } from '@testing-library/react'
import { listMembersPage } from '@/infrastructure/member/member.actions'
import MembersPage from './page'

jest.mock('@/infrastructure/member/member.actions', () => ({ listMembersPage: jest.fn() }))
jest.mock('./members-page.client', () => ({
  __esModule: true,
  default: ({ initialPage }: { initialPage: { page: number; pageSize: number } }) => (
    <output data-testid="page-values">
      {initialPage.page}:{initialPage.pageSize}
    </output>
  ),
}))

const page = { items: [], page: 1, pageSize: 10, totalItems: 0, totalPages: 1 }

describe('MembersPage', () => {
  beforeEach(() => {
    jest.mocked(listMembersPage).mockImplementation(async input => ({ ...page, ...input }))
  })

  it('uses defaults', async () => {
    render(await MembersPage({ searchParams: Promise.resolve({}) }))
    expect(screen.getByTestId('page-values')).toHaveTextContent('1:10')
  })

  it('normalizes valid arrays and caps page size', async () => {
    render(await MembersPage({ searchParams: Promise.resolve({ page: ['2'], pageSize: '999' }) }))
    expect(screen.getByTestId('page-values')).toHaveTextContent('2:100')
    expect(listMembersPage).toHaveBeenCalledWith({ page: 2, pageSize: 100 })
  })

  it.each(['0', '-1', 'invalid', '2.5'])('uses fallback for invalid page %s', async pageValue => {
    render(await MembersPage({ searchParams: Promise.resolve({ page: pageValue }) }))
    expect(screen.getByTestId('page-values')).toHaveTextContent('1:10')
  })
})
