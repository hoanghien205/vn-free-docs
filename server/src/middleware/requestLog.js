/** Log gọn cho từng request: method, đường dẫn, mã trạng thái, thời gian xử lý. */
export default function requestLog(req, res, next) {
  const startedAt = process.hrtime.bigint()

  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - startedAt) / 1e6
    const line = `${req.method} ${req.originalUrl} → ${res.statusCode} (${ms.toFixed(1)}ms) ip=${req.ip}`
    if (res.statusCode >= 500) console.error(`[api] ${line}`)
    else if (res.statusCode >= 400) console.warn(`[api] ${line}`)
    else console.log(`[api] ${line}`)
  })

  next()
}
