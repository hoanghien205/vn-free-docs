import { Router } from 'express'
import { config } from '../config.js'
import { ensureDb } from '../db.js'
import { ApiError, ok } from '../lib/http.js'
import { createRateLimiter } from '../lib/rateLimit.js'
import { parseDownloadLabel, parseToolId } from '../lib/validate.js'
import { incrementToolDownload, toolDownloadOverview } from '../models/toolDownload.js'

const router = Router()

/** Trên serverless, request đầu tiên có thể chưa có kết nối database. */
router.use(async (_req, _res, next) => {
  try {
    await ensureDb()
    next()
  } catch (error) {
    console.error('[api] Không kết nối được database:', error.message)
    next(
      new ApiError(
        503,
        'db_unavailable',
        'Máy chủ chưa kết nối được database. Vui lòng thử lại sau.',
      ),
    )
  }
})

const downloadLimiter = createRateLimiter({
  windowMs: config.toolDownloadRateLimit.windowMs,
  max: config.toolDownloadRateLimit.max,
  name: 'tool-download',
})

/**
 * POST /api/tools/:id/download — khách bấm nút tải của một công cụ (công khai).
 * Mỗi lần gọi cộng thêm một lượt và trả về tổng số lượt hiện tại.
 */
router.post('/:id/download', downloadLimiter, async (req, res) => {
  const toolId = parseToolId(req.params.id)
  const label = parseDownloadLabel(req.body?.label)
  return ok(res, await incrementToolDownload(toolId, { label }))
})

/** GET /api/tools/downloads — bảng đếm lượt tải của từng công cụ (công khai). */
router.get('/downloads', async (_req, res) => ok(res, await toolDownloadOverview()))

export default router
