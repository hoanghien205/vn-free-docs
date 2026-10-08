import { ObjectId } from 'mongodb'
import { getDb } from '../db.js'
import { ApiError } from '../lib/http.js'

export const COLLECTION = 'messages'

export const messagesCollection = () => getDb().collection(COLLECTION)

const toIso = (value) => (value ? new Date(value).toISOString() : null)

/** Chuyển document Mongo thành JSON mà frontend đang dùng. */
export function serializeMessage(doc) {
  if (!doc) return null
  return {
    id: String(doc._id),
    name: doc.name ?? '',
    email: doc.email ?? '',
    phone: doc.phone ?? '',
    message: doc.message ?? '',
    type: doc.type ?? 'other',
    status: doc.status ?? 'new',
    starred: Boolean(doc.starred),
    note: doc.note ?? '',
    source: doc.source ?? 'website',
    createdAt: toIso(doc.createdAt),
    updatedAt: toIso(doc.updatedAt ?? doc.createdAt),
    readAt: toIso(doc.readAt),
    repliedAt: toIso(doc.repliedAt),
  }
}

function toObjectId(id) {
  if (!ObjectId.isValid(id)) throw ApiError.badRequest('ID tin nhắn không hợp lệ.')
  return new ObjectId(id)
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export async function createMessage(payload, context = {}) {
  const now = new Date()
  const doc = {
    name: payload.name,
    email: payload.email,
    phone: payload.phone ?? '',
    message: payload.message,
    type: payload.type ?? 'other',
    status: 'new',
    starred: false,
    note: '',
    source: payload.source ?? 'website',
    ip: context.ip ?? '',
    userAgent: context.userAgent ?? '',
    createdAt: now,
    updatedAt: now,
    readAt: null,
    repliedAt: null,
  }
  const result = await messagesCollection().insertOne(doc)
  return serializeMessage({ ...doc, _id: result.insertedId })
}

export async function listMessages({ limit, skip, status, type, starred, sort, q }) {
  const filter = {}
  if (status) filter.status = status
  if (type) filter.type = type
  if (starred !== null) filter.starred = starred
  if (q) {
    const regex = new RegExp(escapeRegex(q), 'i')
    filter.$or = [{ name: regex }, { email: regex }, { phone: regex }, { message: regex }]
  }

  const collection = messagesCollection()
  const [docs, total] = await Promise.all([
    collection
      .find(filter)
      .sort({ createdAt: sort === 'oldest' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    collection.countDocuments(filter),
  ])

  return { messages: docs.map(serializeMessage), total }
}

export async function getMessage(id) {
  return serializeMessage(await messagesCollection().findOne({ _id: toObjectId(id) }))
}

export async function updateMessage(id, patch) {
  const now = new Date()
  const pipeline = [{ $set: { ...patch, updatedAt: now } }]

  // Mốc thời gian đi kèm trạng thái (giữ readAt cũ nếu đã có).
  if (patch.status === 'read') {
    pipeline.push({ $set: { readAt: now } })
  }
  if (patch.status === 'replied') {
    pipeline.push({ $set: { readAt: { $ifNull: ['$readAt', now] }, repliedAt: now } })
  }
  if (patch.status === 'new') {
    pipeline.push({ $set: { readAt: null, repliedAt: null } })
  }

  const doc = await messagesCollection().findOneAndUpdate({ _id: toObjectId(id) }, pipeline, {
    returnDocument: 'after',
  })
  if (!doc) throw ApiError.notFound('Không tìm thấy tin nhắn.')
  return serializeMessage(doc)
}

export async function deleteMessage(id) {
  const result = await messagesCollection().deleteOne({ _id: toObjectId(id) })
  if (!result.deletedCount) throw ApiError.notFound('Không tìm thấy tin nhắn.')
  return { id }
}

export async function messageStats() {
  const collection = messagesCollection()
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const [byStatus, byType, total, last7d, starred, unread] = await Promise.all([
    collection.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]).toArray(),
    collection.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]).toArray(),
    collection.countDocuments({}),
    collection.countDocuments({ createdAt: { $gte: weekAgo } }),
    collection.countDocuments({ starred: true }),
    collection.countDocuments({ status: 'new' }),
  ])

  const toMap = (rows) => Object.fromEntries(rows.map((row) => [row._id ?? 'other', row.count]))
  return {
    total,
    unread,
    starred,
    last7d,
    byStatus: toMap(byStatus),
    byType: toMap(byType),
  }
}
