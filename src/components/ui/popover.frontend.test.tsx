import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from './popover'

it('opens content with title and description', async () => {
  const user = userEvent.setup()
  render(
    <Popover>
      <PopoverTrigger>Help</PopoverTrigger>
      <PopoverContent side="top" align="start" alignOffset={2} sideOffset={8}>
        <PopoverHeader>
          <PopoverTitle>Help</PopoverTitle>
          <PopoverDescription>More information</PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>,
  )
  await user.click(screen.getByRole('button', { name: 'Help' }))
  expect(screen.getByRole('button', { name: 'Help' })).toHaveAttribute('aria-expanded', 'true')
  expect(screen.getAllByText('Help')).toHaveLength(2)
  expect(screen.getByText('More information')).toHaveAttribute('data-slot', 'popover-description')
})
