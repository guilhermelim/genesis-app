import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import PollDateTimePicker from './poll-date-time-picker.component'

jest.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PopoverTrigger: ({ render }: { render: React.ReactElement }) => render,
  PopoverContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

jest.mock('@/components/ui/calendar', () => ({
  Calendar: ({ onSelect }: { onSelect: (date?: Date) => void }) => (
    <>
      <button type="button" onClick={() => onSelect(undefined)}>
        no date
      </button>
      <button type="button" onClick={() => onSelect(new Date('2026-02-20T00:00:00'))}>
        choose date
      </button>
    </>
  ),
}))

describe('PollDateTimePicker', () => {
  it('disables time selection until a date exists', () => {
    render(<PollDateTimePicker value={undefined} onChange={jest.fn()} />)

    expect(screen.getByRole('button', { name: /Selecionar horário/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Selecionar data/ })).toBeEnabled()
  })

  it('updates the selected hour and minute', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    const value = new Date('2026-01-15T10:20:00')
    render(<PollDateTimePicker value={value} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: /10:20/ }))
    await user.click(screen.getAllByRole('button', { name: '12' })[0])
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ getHours: expect.any(Function), getMinutes: expect.any(Function) }),
    )
    await user.click(screen.getAllByRole('button', { name: '30' })[0])
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ getMinutes: expect.any(Function) }))
  })

  it('selects a date and ignores an empty calendar selection', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(<PollDateTimePicker value={undefined} onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: /Selecionar data/ }))
    await user.click(screen.getByRole('button', { name: 'no date' }))
    expect(onChange).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'choose date' }))
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ getDate: expect.any(Function) }))
  })

  it('does nothing when a time is selected without a date', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(<PollDateTimePicker value={undefined} onChange={onChange} />)

    await user.click(screen.getAllByRole('button', { name: '00' })[0])
    await user.click(screen.getAllByRole('button', { name: '00' })[1])

    expect(onChange).not.toHaveBeenCalled()
  })

  it('keeps the existing time when selecting a new date', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(<PollDateTimePicker value={new Date('2026-01-15T10:20:00')} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: /15\/01\/2026/ }))
    await user.click(screen.getByRole('button', { name: 'choose date' }))

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ getHours: expect.any(Function), getMinutes: expect.any(Function) }),
    )
  })
})
