import { getDb } from '../db.js'

export const COLLECTION = 'tool_downloads'

export const toolDownloadsCollection = () => getDb().collection(COLLECTION)

const toIso = (value) => (value ? new Date(value).toISOString() : null)

/** Nhãn bản tải (Windows, macOS…) chỉ để tham khảo nên lọc ký tự lạ trước khi lưu. */
const cleanLabel = (value) =>
  String(value ?? '')
    .replace(/[^\p{L}\p{N} ._+-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 40)

/** Chuyển document Mongo thành JSON mà frontend đang dùng. */
export function serializeToolDownload(doc) {
  if (!doc) return null
  return {
    toolId: doc._id,
    count: doc.count ?? 0,
    firstAt: toIso(doc.firstAt),
    lastAt: toIso(doc.lastAt),
    lastLabel: doc.lastLabel ?? '',
  }
}

/**
 * Cộng thêm một lượt bấm nút tải cho công cụ.
 * Dùng `_id = toolId` + `$inc` để nhiều người bấm cùng lúc vẫn không mất lượt.
 */
export async function incrementToolDownload(toolId, { label } = {}) {
  const now = new Date()
  const update = {
    $inc: { count: 1 },
    $set: { lastAt: now },
    $setOnInsert: { firstAt: now },
  }

  const cleaned = cleanLabel(label)
  if (cleaned) update.$set.lastLabel = cleaned

  const doc = await toolDownloadsCollection().findOneAndUpdate({ _id: toolId }, update, {
    upsert: true,
    returnDocument: 'after',
  })
  return serializeToolDownload(doc)
}

/** Bảng đếm lượt tải: { counts: { toolId: sốLượt }, total, tools }. */
export async function toolDownloadOverview() {
  const rows = await toolDownloadsCollection()
    .find({}, { projection: { count: 1 } })
    .toArray()

  const counts = {}
  let total = 0
  for (const row of rows) {
    const count = row.count ?? 0
    counts[row._id] = count
    total += count
  }
  return { counts, total, tools: rows.length }
}
