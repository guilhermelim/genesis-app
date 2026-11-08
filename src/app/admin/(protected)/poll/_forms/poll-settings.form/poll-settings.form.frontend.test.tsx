import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import PollSettingsForm from './poll-settings.form'

jest.mock('@/components/ui/select', () => ({
  Select: ({ onValueChange, children }: { onValueChange: (value: string) => void; children: React.ReactNode }) => (
    <div>
      <button
        type="button"
        role="combobox"
        aria-expanded="false"
        aria-controls="weekday-options"
        onClick={() => onValueChange('5')}
      >
        select weekday
      </button>
      {children}
    </div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectValue: () => <span />,
}))

describe('PollSettingsForm', () => {
  it('submits the configured weekday and time', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(
      <PollSettingsForm initialValues={{ weekday: 1, hour: 8, minute: 30 }} onSubmit={onSubmit} onCancel={jest.fn()} />,
    )

    await user.click(screen.getByRole('button', { name: 'Salvar configuração' }))

    expect(onSubmit).toHaveBeenCalledWith({ weekday: 1, hour: 8, minute: 30 }, expect.anything())
  })

  it('calls cancel without submitting', async () => {
    const user = userEvent.setup()
    const onCancel = jest.fn()
    render(
      <PollSettingsForm initialValues={{ weekday: 0, hour: 0, minute: 0 }} onSubmit={jest.fn()} onCancel={onCancel} />,
    )

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('updates weekday and numeric time fields', async () => {
    const user = userEvent.setup()
    render(
      <PollSettingsForm initialValues={{ weekday: 0, hour: 0, minute: 0 }} onSubmit={jest.fn()} onCancel={jest.fn()} />,
    )
    await user.click(screen.getByRole('combobox'))
    const inputs = screen.getAllByRole('spinbutton')
    await user.clear(inputs[0])
    await user.type(inputs[0], '12')
    await user.clear(inputs[1])
    await user.type(inputs[1], '45')
    expect(inputs[0]).toHaveValue(12)
    expect(inputs[1]).toHaveValue(45)
  })
})
