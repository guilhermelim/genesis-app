import mongoose from 'mongoose'
import Database from './database'

describe('Database', () => {
  afterEach(async () => {
    jest.restoreAllMocks()
    await Database.close()
  })

  it('is a singleton and reuses an open connection', async () => {
    const connection = mongoose
    const connect = jest.spyOn(mongoose, 'connect').mockResolvedValue(connection)

    await expect(Database.connect()).resolves.toBe(connection)
    await expect(Database.connect()).resolves.toBe(connection)
    expect(connect).toHaveBeenCalledTimes(1)
  })

  it('shares an in-flight connection between concurrent callers', async () => {
    const connection = mongoose
    let resolveConnection: (value: typeof mongoose) => void = () => undefined
    const pendingConnection = new Promise<typeof mongoose>(resolve => {
      resolveConnection = resolve
    })
    const connect = jest.spyOn(mongoose, 'connect').mockReturnValue(pendingConnection)

    const firstConnection = Database.connect()
    const secondConnection = Database.connect()
    resolveConnection(connection)

    await expect(Promise.all([firstConnection, secondConnection])).resolves.toEqual([connection, connection])
    expect(connect).toHaveBeenCalledTimes(1)
  })

  it('clears the connection when connecting fails', async () => {
    const error = new Error('connection failed')
    jest.spyOn(mongoose, 'connect').mockRejectedValue(error)

    await expect(Database.connect()).rejects.toThrow('connection failed')
    await expect(Database.connect()).rejects.toThrow('connection failed')
  })

  it('closes an open connection and exposes the ready state', async () => {
    jest.spyOn(mongoose, 'connect').mockResolvedValue(mongoose)
    const close = jest.spyOn(mongoose.connection, 'close').mockResolvedValue()

    await Database.connect()
    expect(Database.getConnectionStatus()).toBe(mongoose.connection.readyState)
    await Database.close()

    expect(close).toHaveBeenCalled()
  })

  it('loads the default URI when no environment URI is configured', () => {
    const configuredUri = process.env.DATABASE_URL
    delete process.env.DATABASE_URL

    try {
      jest.resetModules()
      jest.isolateModules(() => {
        expect(jest.requireActual('./database').default).toBeDefined()
      })
    } finally {
      process.env.DATABASE_URL = configuredUri
    }
  })
})
