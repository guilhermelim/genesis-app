import { render, screen } from '@testing-library/react'
import { Separator } from './separator'

it('renders horizontal and vertical semantic separators', () => {
  const { rerender } = render(<Separator />)
  expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'horizontal')
  rerender(<Separator orientation="vertical" />)
  expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical')
})
