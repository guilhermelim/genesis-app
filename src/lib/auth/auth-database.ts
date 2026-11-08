import { MongoClient } from 'mongodb'

const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://root:secret@localhost:27017/genesis?authSource=admin'

const client = new MongoClient(DATABASE_URL)
const database = client.db()

export { client as authMongoClient, database as authDatabase }
