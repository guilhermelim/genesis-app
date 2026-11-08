const mongoClientMock = jest.fn((uri: string) => {
  void uri
  return {
    db: jest.fn(() => ({ databaseName: 'genesis' })),
  }
})

jest.mock('mongodb', () => ({ MongoClient: mongoClientMock }))

describe('Better Auth database connection', () => {
  const originalEnvironment = { ...process.env }

  afterEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    process.env = { ...originalEnvironment }
  })

  it('creates a MongoDB client using DATABASE_URL', async () => {
    process.env.DATABASE_URL = 'mongodb://example.test/genesis'

    const database = await import('./auth-database')

    expect(mongoClientMock).toHaveBeenCalledWith('mongodb://example.test/genesis')
    expect(database.authDatabase).toEqual({ databaseName: 'genesis' })
  })

  it('uses the local MongoDB fallback when DATABASE_URL is absent', async () => {
    delete process.env.DATABASE_URL

    await import('./auth-database')

    expect(mongoClientMock).toHaveBeenCalledTimes(1)
    expect(mongoClientMock.mock.calls[0]?.[0]).toMatch(/localhost:27017\/genesis\?authSource=admin$/)
  })
})
