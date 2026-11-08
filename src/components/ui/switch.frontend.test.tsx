import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Switch } from './switch'

it('toggles with keyboard and reflects checked and size state', async () => {
  const user = userEvent.setup()
  render(<Switch aria-label="Notifications" size="sm" />)
  const toggle = screen.getByRole('switch', { name: 'Notifications' })
  expect(toggle).toHaveAttribute('data-size', 'sm')
  await user.click(toggle)
  expect(toggle).toHaveAttribute('aria-checked', 'true')
})
