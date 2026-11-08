import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import MemberForm from './member.form'

jest.mock('../../_components/member-image-input.component', () => ({
  __esModule: true,
  default: ({ onChange }: { onChange: (value?: string) => void }) => (
    <>
      <button type="button" onClick={() => onChange('image-data')}>
        set image
      </button>
      <button type="button" onClick={() => onChange(undefined)}>
        clear image
      </button>
    </>
  ),
}))

describe('MemberForm', () => {
  it('requires a member name before submitting', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<MemberForm onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: 'Adicionar membro' }))

    expect(await screen.findByText('O nome do membro é obrigatório')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits the member fields and supports the inactive state', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<MemberForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Nome do membro'), 'Ana Souza')
    await user.click(screen.getByRole('switch'))
    await user.click(screen.getByRole('button', { name: 'Adicionar membro' }))

    expect(onSubmit).toHaveBeenCalledWith({
      id: '',
      name: 'Ana Souza',
      image: undefined,
      active: false,
    })
  })

  it('does not render a submit button when embedded', () => {
    render(<MemberForm onSubmit={jest.fn()} embedded />)

    expect(screen.queryByRole('button', { name: 'Adicionar membro' })).not.toBeInTheDocument()
  })

  it('normalizes the selected image value', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<MemberForm onSubmit={onSubmit} />)
    await user.click(screen.getByRole('button', { name: 'set image' }))
    await user.type(screen.getByLabelText('Nome do membro'), 'Ana Souza')
    await user.click(screen.getByRole('button', { name: 'Adicionar membro' }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ image: 'image-data' }))
  })

  it('normalizes a cleared image to an empty value', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<MemberForm onSubmit={onSubmit} />)
    await user.click(screen.getByRole('button', { name: 'clear image' }))
    await user.type(screen.getByLabelText('Nome do membro'), 'Ana Souza')
    await user.click(screen.getByRole('button', { name: 'Adicionar membro' }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ image: undefined }))
  })
})
