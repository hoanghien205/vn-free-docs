import { Router } from 'express'
import { config } from '../config.js'
import { ApiError, ok } from '../lib/http.js'
import { createRateLimiter } from '../lib/rateLimit.js'
import { parseListQuery, parseMessagePatch, parseNewMessage } from '../lib/validate.js'
import { adminAuth } from '../middleware/adminAuth.js'
import {
  createMessage,
  deleteMessage,
  getMessage,
  listMessages,
  messageStats,
  updateMessage,
} from '../models/message.js'

const router = Router()

const publicLimiter = createRateLimiter({
  windowMs: config.publicRateLimit.windowMs,
  max: config.publicRateLimit.max,
  name: 'public-messages',
})

/**
 * POST /api/messages — khách gửi tin nhắn/góp ý (công khai).
 * Chỉ trả về id + thời điểm tạo để tránh rò rỉ dữ liệu.
 */
router.post('/', publicLimiter, async (req, res) => {
  const body = req.body ?? {}

  // Honeypot: field ẩn mà chỉ bot điền. Trả "thành công" nhưng không lưu gì.
  if (body.botcheck) return ok(res, { id: null, skipped: true }, 202)

  const payload = parseNewMessage(body)
  const message = await createMessage(payload, {
    ip: req.ip,
    userAgent: req.get('user-agent') ?? '',
  })
  return ok(res, { id: message.id, createdAt: message.createdAt }, 201)
})

// ---------------------------------------------------------------
// Từ đây trở xuống đều là API quản trị: bắt buộc khoá x-admin-token
// ---------------------------------------------------------------
router.use(adminAuth)

/** GET /api/messages — danh sách có lọc/tìm kiếm/phân trang. */
router.get('/', async (req, res) => {
  const query = parseListQuery(req.query)
  const { messages, total } = await listMessages(query)
  return ok(res, { messages, total, limit: query.limit, skip: query.skip })
})

/** GET /api/messages/stats — số liệu tổng quan cho trang quản trị. */
router.get('/stats', async (_req, res) => ok(res, await messageStats()))

/** GET /api/messages/:id — chi tiết một tin nhắn. */
router.get('/:id', async (req, res) => {
  const message = await getMessage(req.params.id)
  if (!message) throw ApiError.notFound('Không tìm thấy tin nhắn.')
  return ok(res, message)
})

/** PATCH /api/messages/:id — đổi trạng thái, ghim sao, ghi chú nội bộ. */
router.patch('/:id', async (req, res) => {
  const patch = parseMessagePatch(req.body ?? {})
  return ok(res, await updateMessage(req.params.id, patch))
})

/** DELETE /api/messages/:id — xoá vĩnh viễn một tin nhắn. */
router.delete('/:id', async (req, res) => ok(res, await deleteMessage(req.params.id)))

export default router
