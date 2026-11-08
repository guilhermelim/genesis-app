import { render, screen } from '@testing-library/react'
import { Label } from './label'

it('associates a label with its control', () => {
  render(
    <>
      <Label htmlFor="name">Name</Label>
      <input id="name" />
    </>,
  )
  expect(screen.getByLabelText('Name')).toHaveAttribute('id', 'name')
  expect(screen.getByText('Name')).toHaveAttribute('data-slot', 'label')
})
