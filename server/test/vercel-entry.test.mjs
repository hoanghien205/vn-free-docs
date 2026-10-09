/**
 * Kiểm tra entrypoint dùng khi deploy Vercel: `api/index.js`.
 *
 * Vercel biến file đó thành serverless function và rewrite `/api/*` về đây,
 * nên test này chạy đúng handler đó qua một HTTP server thật để chắc chắn
 * bản deploy không vỡ vì import/khởi tạo.
 */
import assert from 'node:assert/strict'
import { once } from 'node:events'
import { createServer } from 'node:http'
import test from 'node:test'
import { MongoMemoryServer } from 'mongodb-memory-server'

const ADMIN_TOKEN = 'vercel-entry-token-0123456789'

const mongod = await MongoMemoryServer.create()
process.env.MONGODB_URI = mongod.getUri('vnfreedocs_vercel')
process.env.MONGODB_DB = 'vnfreedocs_vercel'
process.env.ADMIN_TOKEN = ADMIN_TOKEN
process.env.CORS_ORIGINS = '*'
process.env.LOG_REQUESTS = 'false'

// Đây chính là handler mà Vercel gọi.
const { default: handler } = await import('../../api/index.js')
const { closeDb } = await import('../src/db.js')

const server = createServer(handler)
server.listen(0)
await once(server, 'listening')
const baseUrl = `http://127.0.0.1:${server.address().port}`

const api = (path, { method = 'GET', token, body } = {}) =>
  fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { 'x-admin-token': token } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

test('entrypoint /api/index.js của Vercel', async (t) => {
  await t.test('GET /api/health trả JSON, kết nối database', async () => {
    const res = await api('/api/health')
    assert.equal(res.status, 200)
    const payload = await res.json()
    assert.equal(payload.ok, true)
    assert.equal(payload.data.db, 'connected')
  })

  await t.test('POST /api/messages lưu tin nhắn qua handler serverless', async () => {
    const res = await api('/api/messages', {
      method: 'POST',
      body: {
        name: 'Khách Vercel',
        email: 'vercel@vnfreedocs.vn',
        message: 'Tin nhắn gửi qua serverless function trên Vercel.',
      },
    })
    assert.equal(res.status, 201)
    const payload = await res.json()
    assert.ok(payload.data.id)
  })

  await t.test('Khoá quản trị vẫn được thực thi', async () => {
    const noToken = await api('/api/messages')
    assert.equal(noToken.status, 401)

    const withToken = await api('/api/messages', { token: ADMIN_TOKEN })
    assert.equal(withToken.status, 200)
    const payload = await withToken.json()
    assert.equal(payload.data.total, 1)
  })
})

test.after(async () => {
  await new Promise((resolve) => server.close(resolve))
  await closeDb()
  await mongod.stop()
})
