import { render, screen } from '@testing-library/react'
import AppHeader from './app-header'

jest.mock('@/lib/auth/auth-client', () => ({ authClient: { useSession: () => ({ data: null, isPending: false }) } }))
jest.mock('next-themes', () => ({ useTheme: () => ({ theme: 'light', setTheme: jest.fn() }) }))

it('renders brand navigation and account controls', () => {
  render(<AppHeader />)
  expect(screen.getByRole('banner')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Ir para o início' })).toHaveAttribute('href', '/home')
  expect(screen.getByText('Genesis Servir')).toBeInTheDocument()
  expect(screen.getByRole('img', { name: 'Logo Genesis' })).toHaveAttribute('src', '/genesis-logo.svg')
  expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute('href', '/admin/login')
})
