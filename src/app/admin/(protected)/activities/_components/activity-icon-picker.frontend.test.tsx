import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import ActivityIconPicker from './activity-icon-picker.component'
import { activityIconOptions } from '@/lib/activity-icons'

describe('ActivityIconPicker', () => {
  it('renders all available icons and marks the selected option', () => {
    render(<ActivityIconPicker value={activityIconOptions[0].name} onChange={jest.fn()} />)

    expect(screen.getAllByRole('button')).toHaveLength(activityIconOptions.length)
    expect(screen.getByRole('button', { name: activityIconOptions[0].label })).toHaveAttribute('aria-pressed', 'true')
  })

  it('notifies the selected icon', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(<ActivityIconPicker value="" onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: activityIconOptions[1].label }))

    expect(onChange).toHaveBeenCalledWith(activityIconOptions[1].name)
  })
})
