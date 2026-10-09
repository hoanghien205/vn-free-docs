/**
 * Cổng vào API khi deploy trên Vercel.
 *
 * Vercel biến file này thành một serverless function; `vercel.json` rewrite mọi
 * request `/api/*` về đây, còn Express trong `server/src` lo phần còn lại.
 * Nhờ vậy web tĩnh (Vite) và API nằm chung một domain, không cần cấu hình CORS.
 */
import { createApp } from '../server/src/app.js'

const app = createApp()

export default app
