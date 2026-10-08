import { createApp } from './app.js'
import { config, validateConfig } from './config.js'
import { closeDb, connectDb } from './db.js'

const problems = validateConfig()
if (problems.length) {
  console.error('\n✗ Chưa cấu hình xong backend:\n')
  problems.forEach((problem) => console.error(`  • ${problem}`))
  console.error('\nGợi ý: cp server/.env.example server/.env rồi điền MONGODB_URI.\n')
  process.exit(1)
}

const app = createApp()
let server

async function start() {
  try {
    await connectDb()
    console.log(`[db] Đã kết nối MongoDB — database "${config.mongoDb}"`)
  } catch (error) {
    console.error('[db] Không kết nối được MongoDB:', error.message)
    console.error('[db] Kiểm tra MONGODB_URI, mật khẩu user và IP Access List trên Atlas.')
    process.exit(1)
  }

  server = app.listen(config.port, config.host, () => {
    console.log(`\n✓ VN Free Docs API đang chạy tại http://${config.host}:${config.port}`)
    console.log(`  Health check : GET /api/health`)
    console.log(`  Gửi tin nhắn : POST /api/messages`)
    if (config.adminTokenGenerated) {
      console.log(`\n  ⚠ ADMIN_TOKEN chưa đặt trong .env — dùng tạm khoá sinh tự động này:`)
      console.log(`    ${config.adminToken}`)
      console.log('    Hãy dán khoá này vào trang quản trị (#/hop-thu → Cấu hình backend).')
    }
    console.log('')
  })
}

async function shutdown(signal) {
  console.log(`\n[api] Nhận ${signal}, đang dừng…`)
  await new Promise((resolve) => (server ? server.close(resolve) : resolve()))
  await closeDb()
  process.exit(0)
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    shutdown(signal).catch((error) => {
      console.error('[api] Lỗi khi dừng:', error)
      process.exit(1)
    })
  })
}

start()
