import { act, renderHook } from '@testing-library/react'
import { useLoginForm } from './login.hook'
import { authClient } from '@/lib/auth/auth-client'

const replace = jest.fn()
const refresh = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ replace, refresh }) }))
jest.mock('@/lib/auth/auth-client', () => ({ authClient: { signIn: { email: jest.fn() } } }))
jest.mock('react-hook-form', () => ({
  useForm: () => ({
    handleSubmit: (callback: (data: { email: string; password: string }) => Promise<void>) => () =>
      callback({ email: 'a@b.com', password: 'secret' }),
    formState: { errors: {}, isSubmitting: false },
  }),
}))

describe('useLoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(authClient.signIn.email).mockResolvedValue({ error: undefined })
  })

  it('redirects and refreshes after successful login', async () => {
    const { result } = renderHook(() => useLoginForm())
    await act(() => result.current.handleSubmit())
    expect(authClient.signIn.email).toHaveBeenCalledWith({ email: 'a@b.com', password: 'secret' })
    expect(replace).toHaveBeenCalledWith('/admin')
    expect(refresh).toHaveBeenCalled()
    expect(result.current.error).toBeUndefined()
  })

  it('exposes the provider error and fallback message', async () => {
    jest.mocked(authClient.signIn.email).mockResolvedValueOnce({ error: { message: 'Credenciais inválidas' } })
    const { result } = renderHook(() => useLoginForm())
    await act(() => result.current.handleSubmit())
    expect(result.current.error).toBe('Credenciais inválidas')

    jest.mocked(authClient.signIn.email).mockResolvedValueOnce({ error: { message: '' } })
    await act(() => result.current.handleSubmit())
    expect(result.current.error).toBe('Não foi possível iniciar sessão')
  })
})
