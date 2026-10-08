/** Lỗi có mã HTTP + mã lỗi riêng để trả về JSON thống nhất. */
export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }

  static badRequest(message, details) {
    return new ApiError(400, 'bad_request', message, details)
  }

  static unauthorized(message = 'Thiếu hoặc sai khoá quản trị') {
    return new ApiError(401, 'unauthorized', message)
  }

  static notFound(message = 'Không tìm thấy dữ liệu') {
    return new ApiError(404, 'not_found', message)
  }

  static tooManyRequests(message = 'Bạn gửi hơi nhanh, vui lòng thử lại sau') {
    return new ApiError(429, 'rate_limited', message)
  }
}

export function ok(res, data, status = 200) {
  return res.status(status).json({ ok: true, data })
}

export function fail(res, error) {
  const status = error instanceof ApiError ? error.status : 500
  const body = {
    ok: false,
    error: {
      code: error instanceof ApiError ? error.code : 'internal_error',
      message:
        error instanceof ApiError
          ? error.message
          : 'Máy chủ gặp lỗi không mong đợi. Vui lòng thử lại sau.',
    },
  }
  if (error instanceof ApiError && error.details) body.error.details = error.details
  return res.status(status).json(body)
}
