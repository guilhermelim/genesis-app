import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import MemberListComponent from './member-list.component'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn() }),
  usePathname: () => '/admin/members',
  useSearchParams: () => new URLSearchParams(),
}))

jest.mock('../_forms/member.form/member.form', () => ({
  __esModule: true,
  default: ({ onSubmit }: { onSubmit: (data: { name: string; active: boolean }) => void }) => (
    <>
      <div data-testid="member-form" />
      <button type="button" onClick={() => onSubmit({ name: 'Carlos', active: false })}>
        mock submit
      </button>
    </>
  ),
}))

const props = {
  page: 1,
  pageSize: 10,
  totalItems: 2,
  onPageChange: jest.fn().mockResolvedValue(undefined),
  onPageSizeChange: jest.fn().mockResolvedValue(undefined),
  onUpdate: jest.fn(),
  onDelete: jest.fn(),
}

describe('MemberListComponent', () => {
  it('sorts members and exposes status and actions', async () => {
    const user = userEvent.setup()
    render(
      <MemberListComponent
        {...props}
        members={[
          { id: 'member-2', name: 'Bruno', active: false },
          { id: 'member-1', name: 'Ana', active: true },
        ]}
      />,
    )

    expect(screen.getAllByText('Ana').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Bruno').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Ativo').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Inativo').length).toBeGreaterThan(0)

    await user.click(screen.getAllByRole('button', { name: /Excluir/ })[0])
    await user.click(screen.getByRole('button', { name: 'Excluir membro' }))
    expect(props.onDelete).toHaveBeenCalled()
  })

  it('shows an empty state', () => {
    render(<MemberListComponent {...props} members={[]} totalItems={0} />)

    expect(screen.getAllByText('Nenhum membro cadastrado.').length).toBeGreaterThan(0)
  })

  it('uses ids as a tiebreaker when names match', () => {
    render(
      <MemberListComponent
        {...props}
        members={[
          { id: 'member-2', name: 'Ana', active: true },
          { id: 'member-1', name: 'Ana', active: true },
        ]}
      />,
    )

    expect(screen.getAllByText('Ana').length).toBeGreaterThan(0)
  })

  it('edits a member and confirms the update', async () => {
    const user = userEvent.setup()
    render(<MemberListComponent {...props} members={[{ id: 'member-1', name: 'Ana', active: true }]} />)

    await user.click(screen.getAllByRole('button', { name: /Editar/ })[0])
    await user.click(screen.getByRole('button', { name: 'mock submit' }))
    await user.click(screen.getByRole('alertdialog').querySelector('[data-slot="alert-dialog-action"]') as HTMLElement)

    expect(props.onUpdate).toHaveBeenCalledWith({ id: 'member-1', name: 'Carlos', active: false })
  })

  it('covers desktop actions and dialog cancellation', async () => {
    const user = userEvent.setup()
    render(<MemberListComponent {...props} totalItems={25} members={[{ id: 'member-1', name: 'Ana', active: true }]} />)

    await user.click(screen.getAllByRole('button', { name: /Excluir/ })[1])
    await user.click(screen.getByRole('alertdialog').getElementsByTagName('button')[0])
    await user.click(screen.getAllByRole('button', { name: /Editar/ })[1])
    await user.keyboard('{Escape}')
    await user.click(screen.getAllByRole('button', { name: /Editar/ })[1])
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    await user.click(screen.getAllByRole('button', { name: /Editar/ })[1])
    await user.click(screen.getByRole('button', { name: 'mock submit' }))
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })
})
