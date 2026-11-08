import { loginDefaultValues } from './login.default-values'
import { loginSchema } from './login.schema'

describe('login form contract', () => {
  it('uses the configured default email', () => {
    expect(loginDefaultValues).toEqual({ email: 'admin@email.com', password: '' })
  })

  it('accepts valid credentials and rejects malformed input', () => {
    expect(loginSchema.safeParse({ email: 'admin@example.com', password: 'secret' }).success).toBe(true)
    expect(loginSchema.safeParse({ email: 'invalid', password: '' }).success).toBe(false)
  })
})
