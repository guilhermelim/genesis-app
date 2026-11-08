import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import MemberSection from './member-management.section'

jest.mock('../_components/member-list.component', () => ({
  __esModule: true,
  default: () => <div data-testid="member-list">member list</div>,
}))

jest.mock('../_forms/member.form/member.form', () => ({
  __esModule: true,
  default: ({ onSubmit }: { onSubmit: () => void }) => (
    <button type="button" data-testid="member-form" onClick={onSubmit}>
      member form
    </button>
  ),
}))
jest.mock('../_hooks/use-member-list', () => ({
  useMemberList: () => ({ changePage: jest.fn(), changePageSize: jest.fn() }),
}))
jest.mock('../_hooks/use-member-actions', () => ({
  useMemberActions: ({ closeCreate }: { closeCreate: () => void }) => ({
    create: closeCreate,
    update: jest.fn(),
    remove: jest.fn(),
  }),
}))

describe('MemberSection', () => {
  it('renders metrics and opens the create-member flow', async () => {
    const user = userEvent.setup()
    render(
      <MemberSection
        initialPage={{
          items: [
            { id: '1', name: 'Ana', image: 'ana.jpg', active: true },
            { id: '2', name: 'Bia', image: undefined, active: false },
          ],
          page: 1,
          pageSize: 10,
          totalItems: 2,
          totalPages: 1,
        }}
      />,
    )

    expect(screen.getByText('Membros cadastrados')).toBeInTheDocument()
    expect(screen.getByText('Com foto')).toBeInTheDocument()
    expect(screen.getByTestId('member-list')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Adicionar membro' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Adicionar novo membro')).toBeInTheDocument()
    expect(screen.getByTestId('member-form')).toBeInTheDocument()
    await user.click(screen.getByTestId('member-form'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Adicionar membro' }))
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
