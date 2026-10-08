import { ApiError } from './http.js'

export const MESSAGE_TYPES = ['feedback', 'request', 'collab', 'support', 'other']
export const MESSAGE_STATUSES = ['new', 'read', 'replied', 'archived']

const LIMITS = {
  name: { min: 2, max: 120 },
  email: { max: 160 },
  phone: { max: 40 },
  message: { min: 10, max: 5000 },
  note: { max: 2000 },
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const clean = (value, max) => String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max)

/**
 * Kiểm tra dữ liệu tin nhắn do khách gửi lên.
 * Trả về object đã chuẩn hoá (không chứa field lạ).
 */
export function parseNewMessage(body = {}) {
  const details = {}
  const name = clean(body.name, LIMITS.name.max)
  const email = clean(body.email, LIMITS.email.max).toLowerCase()
  const phone = clean(body.phone, LIMITS.phone.max)
  const message = String(body.message ?? '').trim().slice(0, LIMITS.message.max)
  const type = MESSAGE_TYPES.includes(body.type) ? body.type : 'other'

  if (name.length < LIMITS.name.min) details.name = 'Vui lòng nhập họ tên (ít nhất 2 ký tự).'
  if (!email) details.email = 'Vui lòng nhập email.'
  else if (!EMAIL_RE.test(email)) details.email = 'Email chưa đúng định dạng.'
  if (message.length < LIMITS.message.min) {
    details.message = `Nội dung cần ít nhất ${LIMITS.message.min} ký tự.`
  }

  if (Object.keys(details).length) {
    throw ApiError.badRequest('Dữ liệu gửi lên chưa hợp lệ.', details)
  }

  return { name, email, phone, message, type }
}

/** Bộ lọc trạng thái / ghi chú cho API quản trị (whitelist từng field). */
export function parseMessagePatch(body = {}) {
  const patch = {}
  const details = {}

  if (body.status !== undefined) {
    if (!MESSAGE_STATUSES.includes(body.status)) {
      details.status = `Trạng thái phải là một trong: ${MESSAGE_STATUSES.join(', ')}.`
    } else {
      patch.status = body.status
    }
  }

  if (body.starred !== undefined) {
    if (typeof body.starred !== 'boolean') details.starred = 'starred phải là true/false.'
    else patch.starred = body.starred
  }

  if (body.note !== undefined) {
    patch.note = String(body.note ?? '').trim().slice(0, LIMITS.note.max)
  }

  if (body.type !== undefined) {
    if (!MESSAGE_TYPES.includes(body.type)) {
      details.type = `Loại nội dung phải là một trong: ${MESSAGE_TYPES.join(', ')}.`
    } else {
      patch.type = body.type
    }
  }

  if (!Object.keys(patch).length) {
    throw ApiError.badRequest('Không có field hợp lệ nào để cập nhật.', details)
  }
  if (Object.keys(details).length) throw ApiError.badRequest('Dữ liệu cập nhật chưa hợp lệ.', details)

  return patch
}

/** Tham số truy vấn danh sách (lọc, tìm kiếm, phân trang). */
export function parseListQuery(query = {}) {
  const limit = Math.min(Math.max(Number.parseInt(query.limit ?? '100', 10) || 100, 1), 500)
  const skip = Math.max(Number.parseInt(query.skip ?? '0', 10) || 0, 0)
  const status = MESSAGE_STATUSES.includes(query.status) ? query.status : null
  const type = MESSAGE_TYPES.includes(query.type) ? query.type : null
  const starred = query.starred === undefined ? null : ['1', 'true', 'yes'].includes(String(query.starred))
  const sort = ['newest', 'oldest'].includes(query.sort) ? query.sort : 'newest'
  const q = String(query.q ?? '').trim().slice(0, 120)
  return { limit, skip, status, type, starred, sort, q }
}

export { LIMITS }
