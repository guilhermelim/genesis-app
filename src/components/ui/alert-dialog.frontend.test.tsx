import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog'

it('requires an explicit action or cancellation', async () => {
  const user = userEvent.setup()
  render(
    <AlertDialog>
      <AlertDialogTrigger>Delete</AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogTitle>Delete item?</AlertDialogTitle>
        <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction>Delete</AlertDialogAction>
      </AlertDialogContent>
    </AlertDialog>,
  )
  await user.click(screen.getByRole('button', { name: 'Delete' }))
  expect(screen.getByRole('alertdialog')).toHaveAccessibleName('Delete item?')
  await user.click(screen.getByRole('button', { name: 'Cancel' }))
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
})

it('renders the remaining composition primitives and forwards custom classes', () => {
  render(
    <AlertDialog open>
      <AlertDialogPortal>
        <AlertDialogOverlay className="overlay" />
      </AlertDialogPortal>
      <AlertDialogContent className="content">
        <AlertDialogHeader className="header">
          <AlertDialogMedia className="media">!</AlertDialogMedia>
          <AlertDialogTitle>Warning</AlertDialogTitle>
          <AlertDialogDescription>Description</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="footer">
          <AlertDialogAction className="action">Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>,
  )
  expect(screen.getByRole('alertdialog')).toHaveAttribute('data-size', 'default')
  expect(screen.getByText('!')).toHaveAttribute('data-slot', 'alert-dialog-media')
  expect(screen.getByText('Description')).toHaveAttribute('data-slot', 'alert-dialog-description')
  expect(screen.getByText('Continue')).toHaveAttribute('data-slot', 'alert-dialog-action')
})
