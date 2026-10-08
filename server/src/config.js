import { randomBytes } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const ROOT_DIR = path.resolve(__dirname, '..')

/**
 * Nạp file .env bằng API có sẵn của Node (>= 20.12), không cần thư viện ngoài.
 * Thiếu file .env không phải lỗi: khi deploy thật thường set biến môi trường trực tiếp.
 */
try {
  process.loadEnvFile(path.join(ROOT_DIR, '.env'))
} catch {
  // Không có .env — dùng biến môi trường của hệ thống.
}

function toInt(value, fallback) {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

function toBool(value, fallback) {
  if (value == null || value === '') return fallback
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase())
}

const adminTokenFromEnv = (process.env.ADMIN_TOKEN ?? '').trim()

export const config = {
  env: process.env.NODE_ENV ?? 'development',
  port: toInt(process.env.PORT, 4000),
  host: process.env.HOST ?? '0.0.0.0',
  mongoUri: (process.env.MONGODB_URI ?? '').trim(),
  mongoDb: (process.env.MONGODB_DB ?? 'vnfreedocs').trim(),
  // Không có khoá trong .env thì sinh tạm một khoá và in ra console lúc khởi động.
  adminToken: adminTokenFromEnv || randomBytes(24).toString('hex'),
  adminTokenGenerated: !adminTokenFromEnv,
  corsOrigins: (process.env.CORS_ORIGINS ?? '*')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean),
  publicRateLimit: {
    max: toInt(process.env.PUBLIC_RATE_LIMIT_MAX, 8),
    windowMs: toInt(process.env.PUBLIC_RATE_LIMIT_WINDOW_MINUTES, 10) * 60 * 1000,
  },
  logRequests: toBool(process.env.LOG_REQUESTS, true),
}

/** Kiểm tra cấu hình bắt buộc; trả về danh sách lỗi để index.js báo rõ ràng. */
export function validateConfig() {
  const problems = []
  if (!config.mongoUri) {
    problems.push(
      'Thiếu MONGODB_URI. Hãy copy server/.env.example thành server/.env rồi điền chuỗi kết nối MongoDB Atlas.',
    )
  }
  if (config.mongoUri.includes('<PASSWORD>')) {
    problems.push('MONGODB_URI vẫn còn <PASSWORD> — hãy thay bằng mật khẩu thật của user MongoDB.')
  }
  if (config.publicRateLimit.max < 1) config.publicRateLimit.max = 8
  return problems
}
