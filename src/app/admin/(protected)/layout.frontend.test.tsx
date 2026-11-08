import { render, screen } from '@testing-library/react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth'
import ProtectedAdminLayout from './layout'

jest.mock('next/headers', () => ({ headers: jest.fn() }))
jest.mock('next/navigation', () => ({ redirect: jest.fn() }))
jest.mock('@/lib/auth/auth', () => ({ auth: { api: { getSession: jest.fn() } } }))
jest.mock('./_components/admin-shell.client', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="admin-shell">{children}</div>,
}))

describe('ProtectedAdminLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(headers).mockResolvedValue(new Headers())
    jest.mocked(redirect).mockImplementation(() => {
      throw new Error('redirect')
    })
  })

  it('redirects unauthenticated users to login', async () => {
    jest.mocked(auth.api.getSession).mockResolvedValue(null)
    await expect(ProtectedAdminLayout({ children: <span>content</span> })).rejects.toThrow('redirect')
    expect(redirect).toHaveBeenCalledWith('/admin/login')
  })

  it('redirects authenticated non-admin users home', async () => {
    jest.mocked(auth.api.getSession).mockResolvedValue({ user: { role: 'member' } } as never)
    await expect(ProtectedAdminLayout({ children: <span>content</span> })).rejects.toThrow('redirect')
    expect(redirect).toHaveBeenCalledWith('/')
  })

  it('renders the shell for administrators', async () => {
    jest.mocked(auth.api.getSession).mockResolvedValue({ user: { role: 'admin' } } as never)
    render(await ProtectedAdminLayout({ children: <span>content</span> }))
    expect(screen.getByTestId('admin-shell')).toHaveTextContent('content')
    expect(headers).toHaveBeenCalled()
  })
})
