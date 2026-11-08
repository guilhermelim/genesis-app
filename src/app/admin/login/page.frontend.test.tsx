import { render, screen } from '@testing-library/react'
import AdminLoginPage from './page'

jest.mock('./login.form/login.form', () => ({ __esModule: true, default: () => <form data-testid="login-form" /> }))

it('renders the administrative login content and home link', () => {
  render(<AdminLoginPage />)

  expect(screen.getByText('Acesso administrativo')).toBeInTheDocument()
  expect(screen.getByText('Entre para gerenciar o Genesis Servir.')).toBeInTheDocument()
  expect(screen.getByTestId('login-form')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'página inicial' })).toHaveAttribute('href', '/home')
  expect(screen.getByText('Organize sua comunidade com simplicidade.')).toBeInTheDocument()
})
