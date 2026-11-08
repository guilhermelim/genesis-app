import { render, screen } from '@testing-library/react'
import AdminPageCard from './admin-page-card'

describe('AdminPageCard', () => {
  it('renders the page heading, description, error, and content', () => {
    render(
      <AdminPageCard title="Atividades" description="Gerencie atividades." error={<p>Falha ao carregar</p>}>
        <button>Adicionar</button>
      </AdminPageCard>,
    )

    expect(screen.getByText('Atividades')).toBeInTheDocument()
    expect(screen.getByText('Gerencie atividades.')).toBeInTheDocument()
    expect(screen.getByText('Falha ao carregar')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Adicionar' })).toBeInTheDocument()
  })
})
