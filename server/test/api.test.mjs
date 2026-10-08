/**
 * Test end-to-end cho API: chạy MongoDB thật (bản in-memory của mongodb-memory-server)
 * rồi gọi HTTP như frontend vẫn gọi. Chạy bằng: npm test
 */
import assert from 'node:assert/strict'
import { once } from 'node:events'
import test from 'node:test'
import { MongoMemoryServer } from 'mongodb-memory-server'

const DB_NAME = 'vnfreedocs_test'
const ADMIN_TOKEN = 'test-token-0123456789abcdef'
const ALLOWED_ORIGIN = 'https://vnfreedocs.vn'
const RATE_LIMIT_MAX = 3

const mongod = await MongoMemoryServer.create()
process.env.MONGODB_URI = mongod.getUri(DB_NAME)
process.env.MONGODB_DB = DB_NAME
process.env.ADMIN_TOKEN = ADMIN_TOKEN
process.env.CORS_ORIGINS = ALLOWED_ORIGIN
process.env.PUBLIC_RATE_LIMIT_MAX = String(RATE_LIMIT_MAX)
process.env.PUBLIC_RATE_LIMIT_WINDOW_MINUTES = '10'
process.env.LOG_REQUESTS = 'false'

const { createApp } = await import('../src/app.js')
const { closeDb, connectDb } = await import('../src/db.js')

await connectDb()
const server = createApp().listen(0)
await once(server, 'listening')
const baseUrl = `http://127.0.0.1:${server.address().port}`

function api(path, { method = 'GET', token, body, origin = ALLOWED_ORIGIN } = {}) {
  return fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      Origin: origin,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { 'x-admin-token': token } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
}

const json = async (response) => ({ status: response.status, payload: await response.json() })

const validMessage = {
  name: 'Nguyễn Văn Test',
  email: 'test@vnfreedocs.vn',
  phone: '0912 345 678',
  type: 'request',
  message: 'Tôi cần mẫu Excel quản lý kho cho cửa hàng nhỏ, khoảng 300 mã hàng.',
}

let createdId = null

test('API hộp thư tin nhắn', async (t) => {
  await t.test('GET /api/health báo database đã kết nối', async () => {
    const { status, payload } = await json(await api('/api/health'))
    assert.equal(status, 200)
    assert.equal(payload.ok, true)
    assert.equal(payload.data.db, 'connected')
  })

  await t.test('POST /api/messages tạo tin nhắn mới (lần 1 — tính vào hạn mức)', async () => {
    const { status, payload } = await json(await api('/api/messages', { method: 'POST', body: validMessage }))
    assert.equal(status, 201)
    assert.equal(payload.ok, true)
    assert.ok(payload.data.id, 'phải trả về id')
    createdId = payload.data.id
  })

  await t.test('POST thiếu nội dung ngắn → 400 kèm chi tiết lỗi (lần 2)', async () => {
    const { status, payload } = await json(
      await api('/api/messages', {
        method: 'POST',
        body: { ...validMessage, message: 'ngắn', email: 'sai-dinh-dang' },
      }),
    )
    assert.equal(status, 400)
    assert.equal(payload.ok, false)
    assert.equal(payload.error.code, 'bad_request')
    assert.ok(payload.error.details.message)
    assert.ok(payload.error.details.email)
  })

  await t.test('Honeypot botcheck → 202 và không lưu (lần 3)', async () => {
    const { status, payload } = await json(
      await api('/api/messages', { method: 'POST', body: { ...validMessage, botcheck: true } }),
    )
    assert.equal(status, 202)
    assert.equal(payload.data.skipped, true)
  })

  await t.test('Vượt hạn mức gửi tin → 429', async () => {
    const { status, payload } = await json(await api('/api/messages', { method: 'POST', body: validMessage }))
    assert.equal(status, 429)
    assert.equal(payload.error.code, 'rate_limited')
  })

  await t.test('GET /api/messages không có khoá quản trị → 401', async () => {
    const { status, payload } = await json(await api('/api/messages'))
    assert.equal(status, 401)
    assert.equal(payload.error.code, 'unauthorized')
  })

  await t.test('GET /api/messages với khoá sai → 401', async () => {
    const { status } = await json(await api('/api/messages', { token: 'sai-khoa' }))
    assert.equal(status, 401)
  })

  await t.test('Nguồn không nằm trong CORS_ORIGINS → 403', async () => {
    const { status, payload } = await json(
      await api('/api/messages', { token: ADMIN_TOKEN, origin: 'https://ke-gian.example' }),
    )
    assert.equal(status, 403)
    assert.equal(payload.error.code, 'cors_blocked')
  })

  await t.test('GET /api/messages trả đúng dữ liệu đã chuẩn hoá', async () => {
    const { status, payload } = await json(await api('/api/messages', { token: ADMIN_TOKEN }))
    assert.equal(status, 200)
    assert.equal(payload.data.total, 1)
    const message = payload.data.messages[0]
    assert.equal(message.id, createdId)
    assert.equal(message.status, 'new')
    assert.equal(message.starred, false)
    assert.equal(message.type, 'request')
    assert.equal(message.name, validMessage.name)
    assert.equal(message.email, 'test@vnfreedocs.vn')
    // createdAt phải là ISO string để frontend hiển thị được ngay.
    assert.equal(new Date(message.createdAt).toISOString(), message.createdAt)
  })

  await t.test('Tìm kiếm và lọc theo trạng thái hoạt động', async () => {
    const found = await json(await api('/api/messages?q=quản lý kho', { token: ADMIN_TOKEN }))
    assert.equal(found.payload.data.total, 1)

    const notFound = await json(await api('/api/messages?q=không-có-gì-đâu', { token: ADMIN_TOKEN }))
    assert.equal(notFound.payload.data.total, 0)

    const replied = await json(await api('/api/messages?status=replied', { token: ADMIN_TOKEN }))
    assert.equal(replied.payload.data.total, 0)
  })

  await t.test('PATCH đổi trạng thái sang Đã trả lời, tự ghi repliedAt', async () => {
    const { status, payload } = await json(
      await api(`/api/messages/${createdId}`, {
        method: 'PATCH',
        token: ADMIN_TOKEN,
        body: { status: 'replied', starred: true, note: 'Đã gọi lại cho khách.' },
      }),
    )
    assert.equal(status, 200)
    assert.equal(payload.data.status, 'replied')
    assert.equal(payload.data.starred, true)
    assert.equal(payload.data.note, 'Đã gọi lại cho khách.')
    assert.ok(payload.data.repliedAt, 'repliedAt phải được set')
    assert.ok(payload.data.readAt, 'readAt phải được set khi trả lời')
  })

  await t.test('PATCH trạng thái không hợp lệ → 400', async () => {
    const { status, payload } = await json(
      await api(`/api/messages/${createdId}`, { method: 'PATCH', token: ADMIN_TOKEN, body: { status: 'xyz' } }),
    )
    assert.equal(status, 400)
    assert.ok(payload.error.details.status)
  })

  await t.test('GET /api/messages/stats đếm đúng', async () => {
    const { payload } = await json(await api('/api/messages/stats', { token: ADMIN_TOKEN }))
    assert.equal(payload.data.total, 1)
    assert.equal(payload.data.unread, 0)
    assert.equal(payload.data.starred, 1)
    assert.equal(payload.data.byStatus.replied, 1)
    assert.equal(payload.data.byType.request, 1)
  })

  await t.test('ID không hợp lệ → 400, không tồn tại → 404', async () => {
    const badId = await json(await api('/api/messages/khong-phai-objectid', { token: ADMIN_TOKEN }))
    assert.equal(badId.status, 400)

    const missing = await json(await api('/api/messages/64b7f0000000000000000000', { token: ADMIN_TOKEN }))
    assert.equal(missing.status, 404)
  })

  await t.test('DELETE xoá tin nhắn, gọi lại lần hai → 404', async () => {
    const first = await json(await api(`/api/messages/${createdId}`, { method: 'DELETE', token: ADMIN_TOKEN }))
    assert.equal(first.status, 200)
    assert.equal(first.payload.data.id, createdId)

    const second = await json(await api(`/api/messages/${createdId}`, { method: 'DELETE', token: ADMIN_TOKEN }))
    assert.equal(second.status, 404)

    const after = await json(await api('/api/messages', { token: ADMIN_TOKEN }))
    assert.equal(after.payload.data.total, 0)
  })

  await t.test('Endpoint lạ → 404 JSON, body JSON hỏng → 400', async () => {
    const unknown = await json(await api('/api/khong-ton-tai'))
    assert.equal(unknown.status, 404)
    assert.equal(unknown.payload.error.code, 'not_found')

    const broken = await fetch(`${baseUrl}/api/messages`, {
      method: 'POST',
      headers: { Origin: ALLOWED_ORIGIN, 'Content-Type': 'application/json' },
      body: '{ not json',
    })
    assert.equal(broken.status, 400)
  })
})

test.after(async () => {
  await new Promise((resolve) => server.close(resolve))
  await closeDb()
  await mongod.stop()
})
