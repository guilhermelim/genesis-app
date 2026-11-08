import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/react'
import ActivityCombobox, { type ActivityComboboxActivity } from './activity-combobox'

const activities: ActivityComboboxActivity[] = [
  { id: 'activity-1', label: '07:30h', name: 'Corrida', iconName: 'Bike' },
  { id: 'activity-2', label: '09:00h', name: 'Natação', iconName: 'Waves' },
]

describe('ActivityCombobox', () => {
  it('filters activities by label or name and selects one', async () => {
    const user = userEvent.setup()
    const onValueChange = jest.fn()
    render(<ActivityCombobox activities={activities} value="" onValueChange={onValueChange} />)

    await user.type(screen.getByRole('combobox'), 'natação')

    expect(screen.getByRole('option', { name: /09:00h - Natação/ })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: /07:30h - Corrida/ })).not.toBeInTheDocument()

    await user.click(screen.getByRole('option', { name: /09:00h - Natação/ }))
    expect(onValueChange).toHaveBeenCalledWith('activity-2')
  })

  it('supports keyboard selection and empty results', async () => {
    const user = userEvent.setup()
    const onValueChange = jest.fn()
    render(<ActivityCombobox activities={activities} value="" onValueChange={onValueChange} />)

    const input = screen.getByRole('combobox')
    await user.click(input)
    await user.keyboard('{ArrowDown}{Enter}')
    expect(onValueChange).toHaveBeenCalledWith('activity-2')

    await user.clear(input)
    await user.type(input, 'unknown')
    expect(screen.getByText('Nenhuma atividade encontrada.')).toBeInTheDocument()
  })

  it('restores the selected label on focus and escape, and closes outside', async () => {
    const user = userEvent.setup()
    render(<ActivityCombobox activities={activities} value="activity-1" onValueChange={jest.fn()} />)

    const input = screen.getByRole('combobox')
    expect(input).toHaveValue('07:30h - Corrida')
    await user.click(input)
    expect(input).toHaveValue('07:30h - Corrida')
    await user.clear(input)
    await user.keyboard('{Escape}')
    expect(input).toHaveValue('07:30h - Corrida')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    fireEvent.pointerDown(document.body)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('moves the highlighted option upward and supports activities without an icon', async () => {
    const user = userEvent.setup()
    const onValueChange = jest.fn()
    render(
      <ActivityCombobox
        activities={[...activities, { id: 'activity-3', label: '10:00h', name: 'Leitura' }]}
        value=""
        onValueChange={onValueChange}
      />,
    )

    const input = screen.getByRole('combobox')
    await user.click(input)
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowUp}{Enter}')
    expect(onValueChange).toHaveBeenCalledWith('activity-2')
  })

  it('clears an empty query when escape is pressed without a selection', async () => {
    const user = userEvent.setup()
    render(<ActivityCombobox activities={activities} value="" onValueChange={jest.fn()} />)
    const input = screen.getByRole('combobox')
    await user.click(input)
    await user.keyboard('{Escape}')
    expect(input).toHaveValue('')
  })
})
