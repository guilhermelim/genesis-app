const betterAuthMock = jest.fn((options: Record<string, unknown>) => ({ options }))
const mongodbAdapterMock = jest.fn(() => 'mongodb-adapter')
const adminMock = jest.fn(() => ({ id: 'admin' }))
const nextCookiesMock = jest.fn(() => ({ id: 'next-cookies' }))

jest.mock('better-auth', () => ({ betterAuth: betterAuthMock }))
jest.mock('better-auth/adapters/mongodb', () => ({ mongodbAdapter: mongodbAdapterMock }))
jest.mock('better-auth/plugins', () => ({ admin: adminMock }))
jest.mock('better-auth/next-js', () => ({ nextCookies: nextCookiesMock }))
jest.mock('./auth-database', () => ({
  authDatabase: { databaseName: 'genesis' },
  authMongoClient: { client: true },
}))

describe('Better Auth configuration', () => {
  const originalEnvironment = { ...process.env }

  afterEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    process.env = { ...originalEnvironment }
  })

  it('configures email/password authentication and the admin plugin', async () => {
    process.env.BASE_URL = 'https://genesis.example.com'
    process.env.BETTER_AUTH_SECRET = 'test-secret-with-at-least-32-characters'

    await import('./auth')

    expect(mongodbAdapterMock).toHaveBeenCalledWith(
      { databaseName: 'genesis' },
      { client: { client: true }, transaction: false },
    )
    expect(betterAuthMock).toHaveBeenCalledWith({
      appName: 'Genesis Servir',
      baseURL: 'https://genesis.example.com',
      secret: 'test-secret-with-at-least-32-characters',
      database: 'mongodb-adapter',
      emailAndPassword: {
        enabled: true,
        disableSignUp: true,
      },
      trustedOrigins: ['https://genesis.example.com'],
      plugins: [{ id: 'admin' }, { id: 'next-cookies' }],
    })
  })

  it('rejects configuration without a Better Auth secret', async () => {
    delete process.env.BETTER_AUTH_SECRET

    await expect(import('./auth')).rejects.toThrow('BETTER_AUTH_SECRET must be configured')
    expect(betterAuthMock).not.toHaveBeenCalled()
  })

  it('uses the Vercel production URL when BASE_URL is not configured', async () => {
    delete process.env.BASE_URL
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'genesis.genap.com.br'
    process.env.BETTER_AUTH_SECRET = 'test-secret-with-at-least-32-characters'

    await import('./auth')

    expect(betterAuthMock).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: 'https://genesis.genap.com.br',
        trustedOrigins: ['https://genesis.genap.com.br'],
      }),
    )
  })
})
