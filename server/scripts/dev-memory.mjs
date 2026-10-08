/**
 * Chạy backend với MongoDB in-memory — không cần Atlas, tiện thử nhanh ở máy.
 *
 *   npm run dev:memory
 *
 * Script sẽ in ra địa chỉ API và ADMIN_TOKEN để dán vào trang quản trị (#/hop-thu).
 * Dữ liệu mất khi tắt tiến trình — chỉ dùng để thử.
 */
import { spawn } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { MongoMemoryServer } from 'mongodb-memory-server'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const port = process.env.PORT ?? '4000'

const mongod = await MongoMemoryServer.create()
const uri = mongod.getUri('vnfreedocs')
const adminToken = (process.env.ADMIN_TOKEN ?? '').trim() || randomBytes(16).toString('hex')

console.log('\n[dev] MongoDB in-memory đang chạy:', uri)
console.log(`[dev] API sẽ ở http://localhost:${port}`)
console.log(`[dev] ADMIN_TOKEN: ${adminToken}`)
console.log('[dev] Dán địa chỉ API và token này vào #/hop-thu → Cấu hình backend.\n')

const child = spawn(process.execPath, ['src/index.js'], {
  cwd: rootDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: port,
    HOST: '127.0.0.1',
    MONGODB_URI: uri,
    MONGODB_DB: 'vnfreedocs',
    ADMIN_TOKEN: adminToken,
  },
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal))
}

child.on('exit', async (code) => {
  await mongod.stop()
  process.exit(code ?? 0)
})
