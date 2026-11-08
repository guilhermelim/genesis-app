import { createElement } from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import PollHistory from './poll-history.component'

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ComponentProps<'img'> & { unoptimized?: boolean }) => {
    const { unoptimized, ...imageProps } = props
    void unoptimized
    return createElement('img', { ...imageProps, alt: imageProps.alt ?? '' })
  },
}))
jest.mock('../_forms/poll.form/poll.form', () => ({
  __esModule: true,
  default: ({ onSubmit }: { onSubmit: (value: unknown) => void }) => (
    <div data-testid="poll-form">
      poll form
      <button type="button" onClick={() => onSubmit({ name: 'N', title: 'T', description: 'D', photos: [] })}>
        mock poll submit
      </button>
    </div>
  ),
}))
jest.mock('../_forms/poll-settings.form/poll-settings.form', () => ({
  __esModule: true,
  default: ({ onSubmit, onCancel }: { onSubmit: (value: unknown) => void; onCancel: () => void }) => (
    <>
      <button type="button" onClick={() => onSubmit({ weekday: 2, hour: 9, minute: 0 })}>
        mock settings submit
      </button>
      <button type="button" onClick={onCancel}>
        mock settings cancel
      </button>
    </>
  ),
}))
jest.mock('@/components/ui/pagination-controls', () => ({
  PaginationControls: () => <div data-testid="pagination">pagination</div>,
}))
jest.mock('@/components/poll-expiration-badge', () => ({
  __esModule: true,
  default: () => <span>expiration</span>,
}))

const poll = {
  id: 'poll-1',
  name: 'Enquete semanal',
  title: 'Qual atividade?',
  description: 'Escolha uma opção',
  photos: [],
  active: false,
  expiresAt: new Date(Date.now() + 60_000),
  createdAt: new Date(),
  updatedAt: new Date(),
  votes: [],
}

describe('PollHistory', () => {
  const baseProps = {
    polls: [poll],
    page: 1,
    pageSize: 10,
    totalItems: 1,
    onPageChange: jest.fn(),
    onPageSizeChange: jest.fn(),
    settings: { weekday: 1, hour: 8, minute: 30 },
    selectedPollId: 'poll-1',
    onSelect: jest.fn(),
    onCreate: jest.fn().mockResolvedValue(undefined),
    onActivate: jest.fn().mockResolvedValue(undefined),
    onDelete: jest.fn().mockResolvedValue(undefined),
    onUpdateSettings: jest.fn().mockResolvedValue(undefined),
  }

  it('selects a poll and activates an eligible closed poll', async () => {
    const user = userEvent.setup()
    render(<PollHistory {...baseProps} />)
    await user.click(screen.getByRole('button', { name: /Qual atividade/ }))
    expect(baseProps.onSelect).toHaveBeenCalledWith('poll-1')
    await user.click(screen.getByRole('button', { name: 'Ativar' }))
    expect(baseProps.onActivate).toHaveBeenCalledWith('poll-1')
  })

  it('opens settings and confirms deletion', async () => {
    const user = userEvent.setup()
    render(<PollHistory {...baseProps} />)
    await user.click(screen.getByRole('button', { name: /Definir vencimento padrão/ }))
    await user.click(screen.getByRole('button', { name: 'mock settings cancel' }))
    await user.click(screen.getByRole('button', { name: /Definir vencimento padrão/ }))
    await user.click(screen.getByRole('button', { name: 'mock settings submit' }))
    expect(baseProps.onUpdateSettings).toHaveBeenCalledWith({ weekday: 2, hour: 9, minute: 0 })
    await user.click(screen.getByRole('button', { name: 'Excluir' }))
    expect(screen.getByText('Excluir voluntariado?')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    await user.click(screen.getByRole('button', { name: 'Excluir' }))
    await user.click(screen.getByRole('button', { name: 'Excluir voluntariado' }))
    expect(baseProps.onDelete).toHaveBeenCalledWith('poll-1')
  })

  it('renders active and expired states, supports keyboard selection and opens creation', async () => {
    const user = userEvent.setup()
    const activePoll = {
      ...poll,
      id: 'active',
      active: true,
      votes: [{ id: 'vote-1', memberId: 'm1', activityId: 'a1', votedAt: new Date() }],
      photos: [{ id: 'photo-1', dataUrl: 'data:image/png;base64,test', isPrimary: true }],
    }
    const expiredPoll = { ...poll, id: 'expired', expiresAt: new Date(Date.now() - 60_000) }
    render(<PollHistory {...baseProps} polls={[activePoll, expiredPoll]} selectedPollId="active" />)

    expect(screen.getByText('Inscrições abertas')).toBeInTheDocument()
    expect(screen.getByText('1 inscrição registrada')).toBeInTheDocument()
    expect(screen.getByAltText('')).toBeInTheDocument()
    expect(screen.queryAllByRole('button', { name: 'Ativar' })).toHaveLength(0)
    const cards = screen.getAllByRole('button', { name: /Qual atividade/ })
    cards[1].focus()
    await user.keyboard('{Enter}')
    expect(baseProps.onSelect).toHaveBeenCalledWith('expired')
    await user.keyboard(' ')
    expect(baseProps.onSelect).toHaveBeenCalledWith('expired')

    await user.click(screen.getByRole('button', { name: 'Novo voluntariado' }))
    expect(screen.getByTestId('poll-form')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'mock poll submit' }))
    expect(baseProps.onCreate).toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Novo voluntariado' }))
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByTestId('poll-form')).not.toBeInTheDocument()
  })
})
