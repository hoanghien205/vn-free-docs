import { timingSafeEqual } from 'node:crypto'
import { config } from '../config.js'
import { ApiError } from '../lib/http.js'

/** So sánh chuỗi theo thời gian hằng định để hạn chế dò khoá qua thời gian phản hồi. */
function safeEqual(a, b) {
  const bufA = Buffer.from(String(a))
  const bufB = Buffer.from(String(b))
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

export function readAdminToken(req) {
  const header = req.get('x-admin-token')
  if (header) return header.trim()
  const authorization = req.get('authorization') ?? ''
  if (authorization.toLowerCase().startsWith('bearer ')) return authorization.slice(7).trim()
  return ''
}

/** Mọi API đọc/sửa/xoá tin nhắn đều phải kèm khoá quản trị. */
export function adminAuth(req, _res, next) {
  const token = readAdminToken(req)
  if (!token || !safeEqual(token, config.adminToken)) {
    return next(ApiError.unauthorized())
  }
  return next()
}
