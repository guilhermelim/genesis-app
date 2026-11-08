import { fireEvent, render, screen } from '@testing-library/react'
import LoginForm from './login.form'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn(), refresh: jest.fn() }),
}))

jest.mock('@/lib/auth/auth-client', () => ({
  authClient: {
    signIn: {
      email: jest.fn(),
    },
  },
}))

describe('LoginForm', () => {
  it('shows validation messages for an empty submission', async () => {
    render(<LoginForm />)

    fireEvent.submit(screen.getByRole('button', { name: 'Entrar' }).closest('form')!)

    expect(await screen.findByText('Informe sua senha.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeEnabled()
  })
})
