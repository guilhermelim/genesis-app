import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import MemberDeleteDialog from './member-delete-dialog.component'

describe('MemberDeleteDialog', () => {
  it('confirms and cancels deletion', async () => {
    const user = userEvent.setup()
    const onConfirm = jest.fn()
    const onOpenChange = jest.fn()
    render(<MemberDeleteDialog memberName="Ana" open onOpenChange={onOpenChange} onConfirm={onConfirm} />)

    expect(screen.getByText('Você está prestes a excluir Ana. Essa ação não pode ser desfeita.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Excluir membro' }))
    expect(onConfirm).toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything())
  })
})
