import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import AdminShell from './admin-shell.client'
import { authClient } from '@/lib/auth/auth-client'
import { usePathname, useRouter } from 'next/navigation'

jest.mock('next/navigation', () => ({ usePathname: jest.fn(), useRouter: jest.fn() }))
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))
jest.mock('@/lib/auth/auth-client', () => ({ authClient: { signOut: jest.fn() } }))

describe('AdminShell', () => {
  const replace = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(usePathname).mockReturnValue('/admin/members')
    jest.mocked(useRouter).mockReturnValue({ replace } as never)
    jest.mocked(authClient.signOut).mockResolvedValue(undefined)
  })

  it('renders navigation and marks the active section', () => {
    render(<AdminShell>content</AdminShell>)

    expect(screen.getByRole('heading', { name: 'Painel de Administração' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Seções da administração' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Membros' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Atividades' })).not.toHaveAttribute('aria-current')
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('signs out and redirects to login', async () => {
    const user = userEvent.setup()
    render(<AdminShell>content</AdminShell>)

    await user.click(screen.getByRole('button', { name: /Sair/ }))

    expect(authClient.signOut).toHaveBeenCalled()
    expect(replace).toHaveBeenCalledWith('/admin/login')
  })
})
