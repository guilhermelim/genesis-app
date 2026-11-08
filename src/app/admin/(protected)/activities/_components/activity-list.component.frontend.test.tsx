import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen, within } from '@testing-library/react'
import ActivityListComponent from './activity-list.component'

type RootProps = { open?: boolean; onOpenChange?: (open: boolean) => void; children: ReactNode }

jest.mock('@/components/ui/dialog', () => {
  return {
    DialogContent: ({ children }: { children: ReactNode }) => (
      <div role="dialog" aria-label="Editar atividade">
        {children}
      </div>
    ),
    DialogHeader: ({ children }: HTMLAttributes<HTMLDivElement>) => <div>{children}</div>,
    DialogTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
    DialogDescription: ({ children }: { children: ReactNode }) => <p>{children}</p>,
    DialogFooter: ({ children }: HTMLAttributes<HTMLDivElement>) => <div>{children}</div>,
    Dialog: ({ open, onOpenChange, children }: RootProps) => (
      <>
        {open && children}
        {open && (
          <button type="button" data-testid="dialog-root-close" onClick={() => onOpenChange?.(false)}>
            close dialog root
          </button>
        )}
      </>
    ),
  }
})

jest.mock('@/components/ui/alert-dialog', () => {
  return {
    AlertDialogContent: ({ children }: { children: ReactNode }) => <div role="alertdialog">{children}</div>,
    AlertDialogHeader: ({ children }: HTMLAttributes<HTMLDivElement>) => <div>{children}</div>,
    AlertDialogTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
    AlertDialogDescription: ({ children }: { children: ReactNode }) => <p>{children}</p>,
    AlertDialogFooter: ({ children }: HTMLAttributes<HTMLDivElement>) => <div>{children}</div>,
    AlertDialogCancel: ({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
      <button type="button" {...props}>
        {children}
      </button>
    ),
    AlertDialogAction: ({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
      <button type="button" {...props}>
        {children}
      </button>
    ),
    AlertDialog: ({ open, onOpenChange, children }: RootProps) => (
      <>
        {open && children}
        {open && (
          <button type="button" data-testid="alert-dialog-root-close" onClick={() => onOpenChange?.(false)}>
            close alert dialog root
          </button>
        )}
      </>
    ),
  }
})

jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}))

jest.mock('../_forms/activity.form/activity.form', () => ({
  __esModule: true,
  default: ({ onSubmit }: { onSubmit: (value: unknown) => void }) => (
    <button type="button" onClick={() => onSubmit({ id: 'activity-1', name: 'Atualizada' })}>
      mock submit
    </button>
  ),
}))
jest.mock('@/components/ui/pagination-controls', () => ({
  PaginationControls: () => <div data-testid="pagination">pagination</div>,
}))

describe('ActivityListComponent', () => {
  const props = {
    page: 1,
    pageSize: 10,
    totalItems: 2,
    onPageChange: jest.fn(),
    onPageSizeChange: jest.fn(),
    onUpdate: jest.fn(),
    onDelete: jest.fn(),
  }

  it('sorts activities and confirms deletion', async () => {
    const user = userEvent.setup()
    render(
      <ActivityListComponent
        {...props}
        activities={[
          { id: '2', name: 'Zeladoria', label: '10h', description: 'Z', iconName: 'default' },
          { id: '1', name: 'Acolhimento', label: '09h', description: 'A', iconName: 'default' },
        ]}
      />,
    )

    expect(screen.getAllByText('Acolhimento')[0]).toBeInTheDocument()
    await user.click(screen.getAllByRole('button', { name: /Excluir/ })[0])
    await user.click(screen.getByRole('button', { name: 'Excluir atividade' }))
    expect(props.onDelete).toHaveBeenCalledWith(expect.any(String))
  })

  it('shows the empty state', () => {
    render(<ActivityListComponent {...props} activities={[]} totalItems={0} />)
    expect(screen.getAllByText('Nenhuma atividade cadastrada.')).toHaveLength(2)
  })

  it('edits an activity after confirming the submitted changes', async () => {
    const user = userEvent.setup()
    render(
      <ActivityListComponent
        {...props}
        activities={[{ id: '1', name: 'Acolhimento', label: '09h', description: 'A', iconName: 'default' }]}
      />,
    )

    await user.click(screen.getAllByRole('button', { name: /Editar/ })[0])
    expect(screen.getByRole('dialog', { name: 'Editar atividade' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'mock submit' }))
    await user.click(screen.getByTestId('alert-dialog-root-close'))
    await user.click(screen.getByRole('button', { name: 'mock submit' }))
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Salvar alterações' }))
    expect(props.onUpdate).toHaveBeenCalledWith(expect.objectContaining({ id: '1', name: 'Atualizada' }))
  })

  it('orders equal activity names by id', () => {
    render(
      <ActivityListComponent
        {...props}
        activities={[
          { id: '2', name: 'Ação', label: '10h', description: 'B', iconName: 'default' },
          { id: '1', name: 'Ação', label: '09h', description: 'A', iconName: 'default' },
        ]}
      />,
    )

    const labels = screen.getAllByText('Ação')
    expect(labels[0]).toBeInTheDocument()
    expect(labels[1]).toBeInTheDocument()
  })

  it('supports desktop actions and dismissing both confirmation dialogs', async () => {
    const user = userEvent.setup()
    render(
      <ActivityListComponent
        {...props}
        activities={[{ id: '1', name: 'Acolhimento', label: '09h', description: 'A', iconName: 'default' }]}
      />,
    )

    await user.click(screen.getAllByRole('button', { name: /Editar/ })[1])
    await user.click(screen.getByTestId('dialog-root-close'))
    await user.click(screen.getAllByRole('button', { name: /Editar/ })[1])
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    await user.click(screen.getAllByRole('button', { name: /Excluir/ })[1])
    await user.click(screen.getByTestId('alert-dialog-root-close'))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
