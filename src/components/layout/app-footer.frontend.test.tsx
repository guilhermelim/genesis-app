import { render, screen } from '@testing-library/react'
import AppFooter from './app-footer'

it('renders the footer separator and copyright link', () => {
  render(<AppFooter />)
  expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Genesis Servir' })).toHaveAttribute('href', '/home')
  expect(screen.getByRole('separator')).toBeInTheDocument()
})
