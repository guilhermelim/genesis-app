import { render, screen } from '@testing-library/react'
import Copyright from './Copyright'

it('shows the current year and home link', () => {
  render(<Copyright />)
  expect(screen.getByText(new RegExp(String(new Date().getFullYear())))).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Genesis Servir' })).toHaveAttribute('href', '/home')
})
