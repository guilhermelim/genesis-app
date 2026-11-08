import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import ActivityDeleteDialog from './activity-delete-dialog.component'

describe('ActivityDeleteDialog', () => {
  it('confirms and cancels deletion', async () => {
    const user = userEvent.setup()
    const onConfirm = jest.fn()
    const onOpenChange = jest.fn()
    render(<ActivityDeleteDialog activityName="Corrida" open onOpenChange={onOpenChange} onConfirm={onConfirm} />)

    expect(
      screen.getByText('Você está prestes a excluir Corrida. Essa ação não pode ser desfeita.'),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Excluir atividade' }))
    expect(onConfirm).toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything())
  })
})
