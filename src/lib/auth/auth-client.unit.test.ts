const createAuthClientMock = jest.fn(() => ({ signIn: { email: jest.fn() } }))
const adminClientMock = jest.fn(() => ({ id: 'admin-client' }))

jest.mock('better-auth/react', () => ({ createAuthClient: createAuthClientMock }))
jest.mock('better-auth/client/plugins', () => ({ adminClient: adminClientMock }))

describe('Better Auth client', () => {
  it('enables the admin client plugin', async () => {
    await import('./auth-client')

    expect(adminClientMock).toHaveBeenCalledTimes(1)
    expect(createAuthClientMock).toHaveBeenCalledWith({
      plugins: [{ id: 'admin-client' }],
    })
  })
})
