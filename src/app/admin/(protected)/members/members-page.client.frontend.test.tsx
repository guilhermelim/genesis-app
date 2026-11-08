import { render, screen } from '@testing-library/react'
import MembersPageClient from './members-page.client'

jest.mock('../_components/admin-page-card', () => ({
  __esModule: true,
  default: ({ title, description, children }: { title: string; description: string; children: React.ReactNode }) => (
    <section>
      <h1>{title}</h1>
      <p>{description}</p>
      {children}
    </section>
  ),
}))
jest.mock('./_sections/member-management.section', () => ({
  __esModule: true,
  default: ({ initialPage }: { initialPage: { items: { name: string }[] } }) => (
    <div data-testid="member-section">{initialPage.items.map(item => item.name).join(',')}</div>
  ),
}))

it('renders the member page card with a copied view model', () => {
  render(
    <MembersPageClient
      initialPage={{
        items: [{ id: '1', name: 'Ana', active: true }],
        page: 1,
        pageSize: 10,
        totalItems: 1,
        totalPages: 1,
      }}
    />,
  )

  expect(screen.getByRole('heading', { name: 'Membros' })).toBeInTheDocument()
  expect(screen.getByText('Cadastre e mantenha os participantes atualizados.')).toBeInTheDocument()
  expect(screen.getByTestId('member-section')).toHaveTextContent('Ana')
})
