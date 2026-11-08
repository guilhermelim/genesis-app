import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/react'
import MemberCombobox, { type MemberComboboxMember } from './member-combobox'

const members: MemberComboboxMember[] = [
  { id: 'member-1', name: 'Ana Silva', active: true },
  { id: 'member-2', name: 'Bruno Lima', active: true },
]

describe('MemberCombobox', () => {
  it('filters members and notifies when one is selected', async () => {
    const user = userEvent.setup()
    const onValueChange = jest.fn()
    const onSelected = jest.fn()

    render(<MemberCombobox members={members} value="" onValueChange={onValueChange} onSelected={onSelected} />)

    await user.click(screen.getByRole('combobox'))
    await user.type(screen.getByRole('combobox'), 'bruno')

    expect(screen.getByRole('option', { name: /Bruno Lima/ })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: /Ana Silva/ })).not.toBeInTheDocument()

    await user.click(screen.getByRole('option', { name: /Bruno Lima/ }))

    expect(onValueChange).toHaveBeenLastCalledWith('member-2')
    expect(onSelected).toHaveBeenLastCalledWith(members[1])
  })

  it('selects the highlighted member with Enter', async () => {
    const user = userEvent.setup()
    const onValueChange = jest.fn()
    const onSelected = jest.fn()

    render(<MemberCombobox members={members} value="" onValueChange={onValueChange} onSelected={onSelected} />)

    const input = screen.getByRole('combobox')
    await user.click(input)
    await user.keyboard('{Enter}')

    expect(onValueChange).toHaveBeenCalledWith('member-1')
    expect(onSelected).toHaveBeenCalledWith(members[0])
  })

  it('shows an empty state for unmatched searches', async () => {
    const user = userEvent.setup()

    render(<MemberCombobox members={members} value="" onValueChange={jest.fn()} onSelected={jest.fn()} />)

    await user.type(screen.getByRole('combobox'), 'unknown')

    expect(screen.getByText('Nenhum membro encontrado.')).toBeInTheDocument()
  })

  it('restores a selected member on escape and closes on outside interaction', async () => {
    const user = userEvent.setup()
    render(
      <MemberCombobox
        members={[...members, { id: 'member-3', name: 'Carla', active: true, image: '/carla.png' }]}
        value="member-3"
        onValueChange={jest.fn()}
        onSelected={jest.fn()}
      />,
    )

    const input = screen.getByRole('combobox')
    expect(input).toHaveValue('Carla')
    await user.click(input)
    await user.clear(input)
    await user.keyboard('{ArrowDown}{ArrowUp}{Escape}')
    expect(input).toHaveValue('Carla')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    fireEvent.pointerDown(document.body)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('clears an empty query when escape is pressed without a selection', async () => {
    const user = userEvent.setup()
    render(<MemberCombobox members={members} value="" onValueChange={jest.fn()} onSelected={jest.fn()} />)
    const input = screen.getByRole('combobox')
    await user.click(input)
    await user.keyboard('{Escape}')
    expect(input).toHaveValue('')
  })
})
