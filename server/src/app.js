import cors from 'cors'
import express from 'express'
import { config } from './config.js'
import { ApiError, fail } from './lib/http.js'
import requestLog from './middleware/requestLog.js'
import healthRoutes from './routes/health.js'
import messageRoutes from './routes/messages.js'

/** Vài header bảo vệ cơ bản, không cần thêm thư viện. */
function securityHeaders(_req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'no-referrer')
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  // Dữ liệu hộp thư là thông tin riêng: cấm mọi lớp cache.
  res.setHeader('Cache-Control', 'no-store')
  next()
}

const corsOptions = {
  origin(origin, callback) {
    // Không có Origin = gọi từ server/curl/Postman: cho phép.
    if (!origin) return callback(null, true)
    if (config.corsOrigins.includes('*') || config.corsOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(new ApiError(403, 'cors_blocked', `Nguồn ${origin} không được phép gọi API.`))
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-admin-token', 'Authorization'],
  maxAge: 600,
}

export function createApp() {
  const app = express()

  // Chạy sau reverse proxy (Nginx, Render, Fly, Railway…) để req.ip là IP thật.
  app.set('trust proxy', 1)
  app.disable('x-powered-by')

  app.use(securityHeaders)
  app.use(cors(corsOptions))

  // Trên một số nền tảng serverless (Vercel), body có thể đã được parse sẵn.
  // Đánh dấu để express.json() không đọc lại stream đã cạn.
  app.use((req, _res, next) => {
    if (req.body !== undefined && req.body !== null) req._body = true
    next()
  })

  app.use(express.json({ limit: '32kb' }))
  if (config.logRequests) app.use(requestLog)

  app.get('/', (_req, res) => {
    res.json({
      ok: true,
      data: {
        service: 'VN Free Docs API',
        endpoints: {
          health: 'GET /api/health',
          create: 'POST /api/messages',
          list: 'GET /api/messages',
          update: 'PATCH /api/messages/:id',
          remove: 'DELETE /api/messages/:id',
        },
      },
    })
  })

  app.use('/api/health', healthRoutes)
  app.use('/api/messages', messageRoutes)

  app.use((req, res) =>
    fail(res, ApiError.notFound(`Không có endpoint ${req.method} ${req.path}.`)),
  )

  app.use((error, _req, res, _next) => {
    if (error?.type === 'entity.parse.failed') {
      return fail(res, ApiError.badRequest('Body không phải JSON hợp lệ.'))
    }
    if (error?.type === 'entity.too.large') {
      return fail(res, new ApiError(413, 'payload_too_large', 'Dữ liệu gửi lên quá lớn.'))
    }
    if (!(error instanceof ApiError)) {
      console.error('[api] Lỗi không mong đợi:', error)
    }
    return fail(res, error)
  })

  return app
}
