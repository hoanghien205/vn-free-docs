import { MongoClient } from 'mongodb'
import { config } from './config.js'

let client = null
let database = null
let connectPromise = null

/**
 * Kết nối MongoDB (có retry) và tạo index cần thiết.
 *
 * Trên serverless (Vercel) hàm này được gọi lại ở mỗi request nhưng chỉ tạo
 * kết nối mới khi container "nguội" — client được giữ ở phạm vi module nên
 * các request sau tái sử dụng connection pool.
 */
export async function connectDb({
  uri = config.mongoUri,
  dbName = config.mongoDb,
  retries = 3,
} = {}) {
  if (database) return database

  // Nhiều request cùng lúc trong một container chỉ nên mở một kết nối.
  if (!connectPromise) {
    connectPromise = openWithRetry(uri, dbName, retries).finally(() => {
      connectPromise = null
    })
  }
  return connectPromise
}

async function openWithRetry(uri, dbName, retries) {
  if (!uri) throw new Error('Chưa cấu hình MONGODB_URI')
  let lastError
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 10_000,
        appName: 'vn-free-docs-api',
        // Serverless: pool nhỏ để không làm cạn connection của Atlas.
        maxPoolSize: Number(process.env.MONGODB_MAX_POOL ?? 10),
        minPoolSize: 0,
      })
      await client.connect()
      database = client.db(dbName)
      await ensureIndexes(database)
      console.log(`[db] Đã kết nối MongoDB — database "${dbName}"`)
      return database
    } catch (error) {
      lastError = error
      await client?.close().catch(() => {})
      client = null
      database = null
      if (attempt < retries) {
        const waitMs = attempt * 1500
        console.warn(
          `[db] Kết nối thất bại (lần ${attempt}/${retries}): ${error.message} — thử lại sau ${waitMs}ms`,
        )
        await new Promise((resolve) => setTimeout(resolve, waitMs))
      }
    }
  }
  throw lastError
}

async function ensureIndexes(db) {
  const messages = db.collection('messages')
  const toolDownloads = db.collection('tool_downloads')
  await Promise.all([
    messages.createIndex({ createdAt: -1 }),
    messages.createIndex({ status: 1, createdAt: -1 }),
    messages.createIndex({ type: 1, createdAt: -1 }),
    messages.createIndex({ name: 'text', email: 'text', message: 'text' }),
    toolDownloads.createIndex({ count: -1 }),
  ])
}

export function getDb() {
  if (!database) throw new Error('Chưa kết nối database — gọi connectDb() trước.')
  return database
}

/** Bảo đảm đã có kết nối rồi mới xử lý request (dùng cho middleware). */
export async function ensureDb() {
  return database ?? connectDb()
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
