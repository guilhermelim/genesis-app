import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from './dialog'

it('opens, exposes dialog semantics and closes from footer', async () => {
  const user = userEvent.setup()
  render(
    <Dialog>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent>
        <DialogTitle>Confirm</DialogTitle>
        <DialogDescription>Details</DialogDescription>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>,
  )
  await user.click(screen.getByRole('button', { name: 'Open' }))
  expect(screen.getByRole('dialog')).toHaveAccessibleName('Confirm')
  expect(screen.getByText('Details')).toBeInTheDocument()
  const closeButtons = screen.getAllByRole('button', { name: 'Close' })
  await user.click(closeButtons[closeButtons.length - 1])
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

it('renders composition primitives and supports hidden close controls', () => {
  render(
    <Dialog open>
      <DialogPortal>
        <DialogOverlay />
      </DialogPortal>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Header</DialogTitle>
        </DialogHeader>
        <DialogDescription>Body</DialogDescription>
        <DialogFooter>
          <DialogClose>Dismiss</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>,
  )
  expect(screen.getByRole('dialog')).toHaveAccessibleName('Header')
  expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument()
})
