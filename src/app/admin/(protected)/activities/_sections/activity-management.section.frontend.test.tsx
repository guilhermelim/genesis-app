import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import ActivitySection from './activity-management.section'

jest.mock('../_forms/activity.form/activity.form', () => ({
  __esModule: true,
  default: ({ onSubmit }: { onSubmit?: () => void }) => (
    <button type="button" data-testid="activity-form" onClick={() => onSubmit?.()}>
      activity form
    </button>
  ),
}))
jest.mock('../_components/activity-list.component', () => ({
  __esModule: true,
  default: () => <div data-testid="activity-list" />,
}))
jest.mock('../_hooks/use-activity-list', () => ({
  useActivityList: () => ({ changePage: jest.fn(), changePageSize: jest.fn() }),
}))
jest.mock('../_hooks/use-activity-actions', () => ({
  useActivityActions: ({ closeCreate }: { closeCreate: () => void }) => ({
    create: jest.fn(closeCreate),
    update: jest.fn(),
    remove: jest.fn(),
  }),
}))

describe('ActivitySection', () => {
  it('renders activity metrics and the list composition', () => {
    render(
      <ActivitySection
        initialPage={{
          items: [
            { id: '1', name: 'Acolhimento', label: '09h', description: 'Descrição', iconName: 'default' },
            { id: '2', name: 'Corrida', label: '10h', description: '', iconName: 'default' },
          ],
          page: 1,
          pageSize: 10,
          totalItems: 2,
          totalPages: 1,
        }}
      />,
    )

    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Atividades cadastradas')).toBeInTheDocument()
    expect(screen.getByText('Com descrição')).toBeInTheDocument()
    expect(screen.getByTestId('activity-list')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Adicionar atividade/ })).toBeInTheDocument()
  })

  it('opens and closes the create dialog', async () => {
    const user = userEvent.setup()
    render(<ActivitySection initialPage={{ items: [], page: 1, pageSize: 10, totalItems: 0, totalPages: 1 }} />)

    await user.click(screen.getByRole('button', { name: /Adicionar atividade/ }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByTestId('activity-form')).toBeInTheDocument()
    await user.click(screen.getByTestId('activity-form'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Adicionar atividade/ }))
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
