import { ApiError } from './http.js'

/**
 * Chặn spam rất nhẹ: đếm theo IP trong cửa sổ thời gian cố định, lưu trong RAM.
 * Phù hợp cho một tiến trình đơn; nếu chạy nhiều instance hãy thay bằng Redis.
 */
export function createRateLimiter({ windowMs, max, name = 'limiter' }) {
  const hits = new Map()

  const timer = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key)
    }
  }, Math.min(windowMs, 60_000))
  timer.unref?.()

  return function rateLimiter(req, _res, next) {
    const key = `${name}:${req.ip ?? 'unknown'}`
    const now = Date.now()
    const entry = hits.get(key)

    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs })
      return next()
    }

    entry.count += 1
    if (entry.count > max) {
      const seconds = Math.ceil((entry.resetAt - now) / 1000)
      return next(
        ApiError.tooManyRequests(
          `Bạn đã gửi quá ${max} lần. Vui lòng thử lại sau ${Math.ceil(seconds / 60)} phút.`,
        ),
      )
    }
    return next()
  }
}
