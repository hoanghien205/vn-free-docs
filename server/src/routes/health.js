import { Router } from 'express'
import { ensureDb, pingDb } from '../db.js'

const router = Router()

/** GET /api/health — dùng cho uptime monitor và để frontend kiểm tra kết nối. */
router.get('/', async (_req, res) => {
  // Trên serverless, request đầu tiên có thể là "cold start": chủ động kết nối
  // trước khi trả lời để không báo sai là database không khả dụng.
  let dbOk = false
  let reason = ''
  try {
    await ensureDb()
    dbOk = await pingDb()
    if (!dbOk) reason = 'ping_failed'
  } catch (error) {
    reason = error?.message ?? 'connect_failed'
  }

  res.status(dbOk ? 200 : 503).json({
    ok: dbOk,
    data: {
      service: 'vn-free-docs-api',
      db: dbOk ? 'connected' : 'unavailable',
      ...(dbOk ? {} : { reason }),
      uptimeSeconds: Math.round(process.uptime()),
      time: new Date().toISOString(),
    },
  })
})

export default router
