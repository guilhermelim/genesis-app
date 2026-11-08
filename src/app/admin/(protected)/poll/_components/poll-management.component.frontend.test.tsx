import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import PollManagementComponent from './poll-management.component'

jest.mock('../_forms/poll.form/poll.form', () => ({
  __esModule: true,
  default: ({ onSubmit }: { onSubmit: (value: unknown) => void }) => (
    <button type="button" onClick={() => onSubmit({ title: 'Atualizada' })}>
      mock poll submit
    </button>
  ),
}))

const poll = {
  id: 'poll-1',
  name: 'Enquete',
  title: 'Título',
  description: 'Descrição',
  photos: [],
  active: true,
  expiresAt: new Date(Date.now() + 60_000),
  createdAt: new Date(),
  updatedAt: new Date(),
  votes: [{ id: 'vote-1', memberId: 'm', activityId: 'a', votedAt: new Date() }],
}

describe('PollManagementComponent', () => {
  it('submits edits and confirms clearing votes', async () => {
    const user = userEvent.setup()
    const onUpdate = jest.fn()
    const onClearVotes = jest.fn()
    render(<PollManagementComponent poll={poll} onUpdate={onUpdate} onClearVotes={onClearVotes} />)

    expect(screen.getByText('Editar voluntariado')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'mock poll submit' }))
    expect(onUpdate).toHaveBeenCalledWith({ title: 'Atualizada' })
    await user.click(screen.getByRole('button', { name: /Limpar inscrições/ }))
    expect(screen.getByText('Confirmar limpeza')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Limpar inscrições' }))
    expect(onClearVotes).toHaveBeenCalled()
  })

  it('does not render the edit dialog when closed', () => {
    render(<PollManagementComponent poll={poll} onUpdate={jest.fn()} onClearVotes={jest.fn()} open={false} />)
    expect(screen.queryByText('Editar voluntariado')).not.toBeInTheDocument()
  })

  it('closes the dialog from the footer and escape interaction', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    render(<PollManagementComponent poll={poll} onUpdate={jest.fn()} onClearVotes={jest.fn()} onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalled()
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })

  it('uses the default close handler when no close callback is supplied', async () => {
    const user = userEvent.setup()
    render(<PollManagementComponent poll={poll} onUpdate={jest.fn()} onClearVotes={jest.fn()} />)
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.getByText('Editar voluntariado')).toBeInTheDocument()
  })
})
