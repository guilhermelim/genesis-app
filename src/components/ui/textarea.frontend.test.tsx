import { render, screen } from '@testing-library/react'
import { Textarea } from './textarea'

it('renders a labelled textarea and supports disabled state', () => {
  render(<Textarea aria-label="Description" disabled defaultValue="details" />)
  expect(screen.getByRole('textbox', { name: 'Description' })).toBeDisabled()
  expect(screen.getByDisplayValue('details')).toHaveAttribute('data-slot', 'textarea')
})
