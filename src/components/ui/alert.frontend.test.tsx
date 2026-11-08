import { render, screen } from '@testing-library/react'
import { Alert, AlertAction, AlertDescription, AlertTitle } from './alert'

it('exposes an alert with title, description and action slots', () => {
  render(
    <Alert variant="destructive">
      <AlertTitle>Problem</AlertTitle>
      <AlertDescription>Try again.</AlertDescription>
      <AlertAction>
        <button>Dismiss</button>
      </AlertAction>
    </Alert>,
  )
  expect(screen.getByRole('alert')).toHaveAttribute('data-slot', 'alert')
  expect(screen.getByText('Problem')).toHaveAttribute('data-slot', 'alert-title')
  expect(screen.getByText('Try again.')).toHaveAttribute('data-slot', 'alert-description')
  expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument()
})
