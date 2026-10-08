import { Router } from 'express'
import { pingDb } from '../db.js'

const router = Router()

/** GET /api/health — dùng cho uptime monitor và để frontend kiểm tra kết nối. */
router.get('/', async (_req, res) => {
  const dbOk = await pingDb()
  res.status(dbOk ? 200 : 503).json({
    ok: dbOk,
    data: {
      service: 'vn-free-docs-api',
      db: dbOk ? 'connected' : 'unavailable',
      uptimeSeconds: Math.round(process.uptime()),
      time: new Date().toISOString(),
    },
  })
})

export default router
