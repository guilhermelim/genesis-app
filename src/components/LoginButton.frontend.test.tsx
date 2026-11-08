import { render, screen } from '@testing-library/react'
import LoginButton from './LoginButton'

const useSession = jest.fn()
jest.mock('@/lib/auth/auth-client', () => ({ authClient: { useSession: () => useSession() } }))

describe('LoginButton', () => {
  it('does not render while the session is pending', () => {
    useSession.mockReturnValue({ data: null, isPending: true })
    const { container } = render(<LoginButton />)
    expect(container).toBeEmptyDOMElement()
  })

  it.each([
    [{ data: null, isPending: false }, 'Entrar', '/admin/login'],
    [{ data: { user: { id: '1' } }, isPending: false }, 'Painel', '/admin'],
  ])('links users based on session state', (session, label, href) => {
    useSession.mockReturnValue(session)
    render(<LoginButton />)
    expect(screen.getByRole('link', { name: label })).toHaveAttribute('href', href)
  })
})
