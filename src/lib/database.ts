import mongoose from 'mongoose'
const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://root:secret@localhost:27017/genesis?authSource=admin'

class Database {
  private static instance: Database
  private connection: typeof mongoose | null = null
  private connectionPromise: Promise<typeof mongoose> | null = null

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database()
    }
    return Database.instance
  }

  public async connect() {
    if (this.connection) {
      return this.connection
    }

    if (!this.connectionPromise) {
      this.connectionPromise = mongoose
        .connect(DATABASE_URL, {
          bufferCommands: false,
        })
        .then(connection => {
          this.connection = connection
          console.log('Connected to database!')
          return connection
        })
        .catch(error => {
          this.connectionPromise = null
          this.connection = null
          throw error
        })
    }

    return this.connectionPromise
  }

  public async close() {
    if (this.connectionPromise) {
      await this.connectionPromise
    }

    if (this.connection) {
      await mongoose.connection.close()
      this.connection = null
      this.connectionPromise = null
    }
  }

  public getConnectionStatus() {
    return mongoose.connection.readyState
  }
}

export default Database.getInstance()
