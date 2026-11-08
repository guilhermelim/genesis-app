import { render, screen } from '@testing-library/react'
import ActivitiesPageClient from './activities-page.client'

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
jest.mock('./_sections/activity-management.section', () => ({
  __esModule: true,
  default: ({ initialPage }: { initialPage: { items: { name: string }[] } }) => (
    <div data-testid="activity-section">{initialPage.items.map(item => item.name).join(',')}</div>
  ),
}))

it('renders the activity page card with a view-model copy', () => {
  const initialPage = {
    items: [{ id: '1', name: 'Acolhimento', label: '09h', description: 'Descrição', iconName: 'default' }],
    page: 1,
    pageSize: 10,
    totalItems: 1,
    totalPages: 1,
  }

  render(<ActivitiesPageClient initialPage={initialPage} />)

  expect(screen.getByRole('heading', { name: 'Atividades' })).toBeInTheDocument()
  expect(screen.getByText('Organize as opções disponíveis para voluntariado.')).toBeInTheDocument()
  expect(screen.getByTestId('activity-section')).toHaveTextContent('Acolhimento')
})
