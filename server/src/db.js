import { MongoClient } from 'mongodb'
import { config } from './config.js'

let client = null
let database = null

/** Kết nối MongoDB (có retry), tạo index cần thiết cho collection messages. */
export async function connectDb({ uri = config.mongoUri, dbName = config.mongoDb, retries = 3 } = {}) {
  if (database) return database
  if (!uri) throw new Error('Chưa cấu hình MONGODB_URI')

  let lastError
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 10_000,
        appName: 'vn-free-docs-api',
      })
      await client.connect()
      database = client.db(dbName)
      await ensureIndexes(database)
      return database
    } catch (error) {
      lastError = error
      await client?.close().catch(() => {})
      client = null
      database = null
      if (attempt < retries) {
        const waitMs = attempt * 1500
        console.warn(`[db] Kết nối thất bại (lần ${attempt}/${retries}): ${error.message} — thử lại sau ${waitMs}ms`)
        await new Promise((resolve) => setTimeout(resolve, waitMs))
      }
    }
  }
  throw lastError
}

async function ensureIndexes(db) {
  const messages = db.collection('messages')
  await Promise.all([
    messages.createIndex({ createdAt: -1 }),
    messages.createIndex({ status: 1, createdAt: -1 }),
    messages.createIndex({ type: 1, createdAt: -1 }),
    messages.createIndex({ name: 'text', email: 'text', message: 'text' }),
  ])
}

export function getDb() {
  if (!database) throw new Error('Chưa kết nối database — gọi connectDb() trước.')
  return database
}

/** Dùng cho endpoint /api/health. */
export async function pingDb() {
  if (!database) return false
  try {
    await database.command({ ping: 1 })
    return true
  } catch {
    return false
  }
}

export async function closeDb() {
  await client?.close()
  client = null
  database = null
}
