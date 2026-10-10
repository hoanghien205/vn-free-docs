/**
 * Test bộ đếm lượt tải công cụ: chạy MongoDB in-memory rồi gọi HTTP như frontend vẫn gọi.
 * Chạy bằng: npm test
 */
import assert from 'node:assert/strict'
import { once } from 'node:events'
import test from 'node:test'
import { MongoMemoryServer } from 'mongodb-memory-server'

const DB_NAME = 'vnfreedocs_tools_test'
const DOWNLOAD_RATE_LIMIT_MAX = 4

const mongod = await MongoMemoryServer.create()
process.env.MONGODB_URI = mongod.getUri(DB_NAME)
process.env.MONGODB_DB = DB_NAME
process.env.CORS_ORIGINS = '*'
process.env.LOG_REQUESTS = 'false'
process.env.TOOL_DOWNLOAD_RATE_LIMIT_MAX = String(DOWNLOAD_RATE_LIMIT_MAX)
process.env.TOOL_DOWNLOAD_RATE_LIMIT_WINDOW_MINUTES = '10'

const { createApp } = await import('../src/app.js')
const { closeDb, connectDb } = await import('../src/db.js')

await connectDb()
const server = createApp().listen(0)
await once(server, 'listening')
const baseUrl = `http://127.0.0.1:${server.address().port}`

const api = (path, { method = 'GET', body } = {}) =>
  fetch(`${baseUrl}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  })

const json = async (response) => ({ status: response.status, payload: await response.json() })

test('Bộ đếm lượt tải công cụ', async (t) => {
  await t.test('Chưa có lượt nào → bảng đếm rỗng', async () => {
    const { status, payload } = await json(await api('/api/tools/downloads'))
    assert.equal(status, 200)
    assert.deepEqual(payload.data.counts, {})
    assert.equal(payload.data.total, 0)
  })

  await t.test('POST /api/tools/:id/download cộng dồn theo từng công cụ', async () => {
    const first = await json(
      await api('/api/tools/van-ban-hanh-chinh/download', {
        method: 'POST',
        body: { label: 'Windows' },
      }),
    )
    assert.equal(first.status, 200)
    assert.equal(first.payload.data.toolId, 'van-ban-hanh-chinh')
    assert.equal(first.payload.data.count, 1)
    assert.equal(first.payload.data.lastLabel, 'Windows')
    assert.equal(new Date(first.payload.data.firstAt).toISOString(), first.payload.data.firstAt)

    const second = await json(
      await api('/api/tools/van-ban-hanh-chinh/download', { method: 'POST', body: {} }),
    )
    assert.equal(second.payload.data.count, 2)

    // Công cụ khác có bộ đếm riêng.
    const other = await json(
      await api('/api/tools/excel-ke-toan/download', { method: 'POST', body: { label: 'macOS' } }),
    )
    assert.equal(other.payload.data.count, 1)
  })

  await t.test('Mã công cụ không hợp lệ → 400 và không ghi vào database', async () => {
    const { status, payload } = await json(
      await api('/api/tools/Khong Hop Le!/download', { method: 'POST', body: {} }),
    )
    assert.equal(status, 400)
    assert.equal(payload.error.code, 'bad_request')
  })

  await t.test('Bảng đếm trả đúng số lượt của từng công cụ', async () => {
    const { payload } = await json(await api('/api/tools/downloads'))
    assert.deepEqual(payload.data.counts, {
      'van-ban-hanh-chinh': 2,
      'excel-ke-toan': 1,
    })
    assert.equal(payload.data.total, 3)
    assert.equal(payload.data.tools, 2)
  })

  await t.test('Bấm quá nhanh trong cùng một IP → 429', async () => {
    const { status, payload } = await json(
      await api('/api/tools/excel-ke-toan/download', { method: 'POST', body: {} }),
    )
    assert.equal(status, 429)
    assert.equal(payload.error.code, 'rate_limited')
  })
})

test.after(async () => {
  await new Promise((resolve) => server.close(resolve))
  await closeDb()
  await mongod.stop()
})
