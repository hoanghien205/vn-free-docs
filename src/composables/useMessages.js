import { computed, ref } from 'vue'
import {
  inboxConfig,
  deleteRemoteMessage,
  fetchRemoteMessages,
  isRemoteInboxEnabled,
  pushRemoteMessage,
} from '@/data/inbox'

/**
 * Hộp thư tin nhắn & góp ý khách hàng.
 *
 * Dữ liệu được lưu trong localStorage và chia sẻ cho toàn app theo dạng
 * module-level singleton — giống cách `useLocale` đang làm.
 */

const REMOTE_KEY = '__remote'

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function normalize(record) {
  const createdAt = record.createdAt ?? record.created_at ?? new Date().toISOString()
  return {
    id: String(record.id ?? createId()),
    name: String(record.name ?? '').trim(),
    email: String(record.email ?? '').trim(),
    phone: String(record.phone ?? '').trim(),
    message: String(record.message ?? '').trim(),
    type: record.type ?? 'other',
    status: record.status ?? 'new',
    starred: Boolean(record.starred),
    note: String(record.note ?? ''),
    source: record.source ?? 'website',
    createdAt,
    updatedAt: record.updatedAt ?? createdAt,
    readAt: record.readAt ?? null,
    repliedAt: record.repliedAt ?? null,
  }
}

const messages = ref([])

function readStorage() {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(inboxConfig.storageKey)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.map(normalize) : []
  } catch {
    return []
  }
}

function writeStorage() {
  if (typeof localStorage === 'undefined') return
  try {
    const limit = Math.max(1, Number(inboxConfig.maxMessages) || 500)
    const payload = messages.value.slice(0, limit)
    localStorage.setItem(inboxConfig.storageKey, JSON.stringify(payload))
  } catch {
    // Hết dung lượng hoặc chế độ riêng tư: bỏ qua, dữ liệu vẫn nằm trong bộ nhớ.
  }
}

function seedDemoMessages() {
  if (!inboxConfig.seedDemo) return []
  const now = Date.now()
  const iso = (minutesAgo) => new Date(now - minutesAgo * 60 * 1000).toISOString()
  return [
    normalize({
      id: 'demo-1',
      name: 'Trần Thu Hà',
      email: 'thuha.ketoan@congty.vn',
      phone: '0912 345 678',
      type: 'request',
      status: 'new',
      message:
        'Anh ơi, bên em cần mẫu bảng chấm công cho 40 nhân sự có tăng ca và ngày phép. Anh làm giúp em một bản Excel được không ạ? Em cảm ơn anh nhiều.',
      createdAt: iso(35),
      source: 'demo',
    }),
    normalize({
      id: 'demo-2',
      name: 'Nguyễn Minh Quân',
      email: 'quan@dailyshop.vn',
      phone: '0987 654 321',
      type: 'support',
      status: 'read',
      starred: true,
      note: 'Cần báo giá gói lưu trữ nội bộ cho 15 máy.',
      message:
        'Chào anh, em muốn hỏi về giải pháp lưu trữ nội bộ (NAS) cho 15 nhân sự, dữ liệu chủ yếu là ảnh sản phẩm và hoá đơn. Chi phí triển khai khoảng bao nhiêu và mất bao lâu ạ?',
      createdAt: iso(60 * 5),
      readAt: iso(60 * 4),
      source: 'demo',
    }),
    normalize({
      id: 'demo-3',
      name: 'Phạm Văn Dũng',
      email: 'dung.pv@gmail.com',
      type: 'feedback',
      status: 'replied',
      message:
        'Mẫu hợp đồng lao động dùng rất ổn, nhưng phần phụ lục hơi khó tìm. Anh thêm mục lục ở đầu file thì tiện hơn. Cảm ơn anh đã chia sẻ miễn phí!',
      createdAt: iso(60 * 30),
      readAt: iso(60 * 28),
      repliedAt: iso(60 * 26),
      source: 'demo',
    }),
  ]
}

// Nạp dữ liệu lần đầu khi module được import.
messages.value = readStorage()
if (!messages.value.length) {
  messages.value = seedDemoMessages()
  if (messages.value.length) writeStorage()
}

function persist() {
  writeStorage()
}

function findIndex(id) {
  return messages.value.findIndex((item) => item.id === id)
}

const stats = computed(() => {
  const list = messages.value
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  return {
    total: list.length,
    unread: list.filter((item) => item.status === 'new').length,
    replied: list.filter((item) => item.status === 'replied').length,
    starred: list.filter((item) => item.starred).length,
    last24h: list.filter((item) => new Date(item.createdAt).getTime() >= dayAgo).length,
    last7d: list.filter((item) => new Date(item.createdAt).getTime() >= weekAgo).length,
  }
})

const unreadCount = computed(() => stats.value.unread)

/** Thêm tin nhắn mới (từ form liên hệ hoặc nhập thủ công). */
function addMessage(input) {
  const record = normalize({
    ...input,
    id: input.id ?? createId(),
    status: input.status ?? 'new',
    createdAt: input.createdAt ?? new Date().toISOString(),
  })
  messages.value = [record, ...messages.value]
  persist()
  return record
}

function updateMessage(id, patch) {
  const index = findIndex(id)
  if (index < 0) return null
  const current = messages.value[index]
  const next = normalize({
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  })
  messages.value[index] = next
  persist()
  return next
}

function removeMessage(id, options = {}) {
  const target = messages.value.find((item) => item.id === id)
  const before = messages.value.length
  messages.value = messages.value.filter((item) => item.id !== id)
  if (messages.value.length !== before) persist()
  // Tin nhắn đến từ backend thì xoá luôn trên server, tránh lần sau đồng bộ lại hiện về.
  if (target?.source === REMOTE_KEY && options.sync !== false) {
    deleteRemoteMessage(id)
  }
}

function clearAll() {
  messages.value = []
  persist()
}

/** Nạp lại bộ tin nhắn mẫu (dùng khi người dùng đã xoá sạch và muốn xem trước). */
function loadDemoMessages() {
  const demo = seedDemoMessages()
  messages.value = [...demo, ...messages.value]
  persist()
  return demo.length
}

/** Xoá các tin nhắn mẫu, giữ lại tin nhắn thật. */
function clearDemoMessages() {
  messages.value = messages.value.filter((item) => item.source !== 'demo')
  persist()
}

/**
 * Sau khi backend lưu thành công: gắn id của server vào đúng bản ghi local
 * để lần đồng bộ sau không sinh ra hai bản trùng nhau.
 */
function markMessageSynced(localId, remote = {}) {
  const index = findIndex(localId)
  if (index < 0) return null
  const current = messages.value[index]
  messages.value[index] = normalize({
    ...current,
    id: String(remote.id ?? current.id),
    createdAt: remote.createdAt ?? current.createdAt,
    source: REMOTE_KEY,
  })
  persist()
  return messages.value[index]
}

function markRead(id) {
  const current = messages.value[findIndex(id)]
  if (!current || current.status !== 'new') return
  updateMessage(id, { status: 'read', readAt: new Date().toISOString() })
}

function markReplied(id) {
  const now = new Date().toISOString()
  updateMessage(id, {
    status: 'replied',
    readAt: messages.value[findIndex(id)]?.readAt ?? now,
    repliedAt: now,
  })
}

function markUnread(id) {
  updateMessage(id, { status: 'new', readAt: null })
}

function setStatus(id, status, options = {}) {
  const now = new Date().toISOString()
  const patch = { status }
  if (status === 'read') patch.readAt = now
  if (status === 'replied') {
    patch.readAt = messages.value[findIndex(id)]?.readAt ?? now
    patch.repliedAt = now
  }
  if (status === 'new') {
    patch.readAt = null
    patch.repliedAt = null
  }
  const updated = updateMessage(id, patch)
  if (updated && options.sync !== false) pushRemoteMessage(id, patch)
  return updated
}

function toggleStar(id) {
  const current = messages.value[findIndex(id)]
  if (!current) return
  updateMessage(id, { starred: !current.starred })
}

function setNote(id, note) {
  updateMessage(id, { note })
}

/* ---------------- Nhập / xuất dữ liệu ---------------- */

function download(filename, content, mime) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function exportJson() {
  download(
    `hop-thu-${new Date().toISOString().slice(0, 10)}.json`,
    JSON.stringify({ exportedAt: new Date().toISOString(), messages: messages.value }, null, 2),
    'application/json',
  )
}

function csvCell(value) {
  const text = value == null ? '' : String(value)
  return `"${text.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`
}

function exportCsv() {
  const header = [
    'id',
    'createdAt',
    'type',
    'status',
    'starred',
    'name',
    'email',
    'phone',
    'message',
    'note',
  ]
  const rows = messages.value.map((item) => header.map((key) => csvCell(item[key])).join(','))
  // BOM giúp Excel mở đúng tiếng Việt.
  download(
    `hop-thu-${new Date().toISOString().slice(0, 10)}.csv`,
    `\uFEFF${[header.join(','), ...rows].join('\r\n')}`,
    'text/csv;charset=utf-8',
  )
}

function importJson(text) {
  const parsed = JSON.parse(text)
  const list = Array.isArray(parsed) ? parsed : (parsed.messages ?? [])
  const existing = new Set(messages.value.map((item) => item.id))
  const incoming = list.map(normalize).filter((item) => !existing.has(item.id))
  if (!incoming.length) return 0
  messages.value = [...incoming, ...messages.value]
  persist()
  return incoming.length
}

/* ---------------- Đồng bộ hộp thư từ xa ---------------- */

const remoteState = ref({ loaded: false, loading: false, error: '' })

async function syncFromRemote() {
  if (!isRemoteInboxEnabled()) return { ok: false, skipped: true }
  remoteState.value = { loaded: false, loading: true, error: '' }
  try {
    const list = (await fetchRemoteMessages()).map(normalize)
    const localOnly = messages.value.filter((item) => item.source !== REMOTE_KEY)
    const remoteIds = new Set(list.map((item) => item.id))
    messages.value = [
      ...list.map((item) => ({ ...item, source: REMOTE_KEY })),
      ...localOnly.filter((item) => !remoteIds.has(item.id)),
    ]
    persist()
    remoteState.value = { loaded: true, loading: false, error: '' }
    return { ok: true }
  } catch (error) {
    remoteState.value = {
      loaded: false,
      loading: false,
      error: error?.message ?? 'Lỗi không xác định',
    }
    return { ok: false, error }
  }
}

export function useMessages() {
  return {
    messages,
    stats,
    unreadCount,
    remoteState,
    isRemoteInboxEnabled,
    addMessage,
    updateMessage,
    removeMessage,
    clearAll,
    loadDemoMessages,
    clearDemoMessages,
    markMessageSynced,
    markRead,
    markReplied,
    markUnread,
    setStatus,
    toggleStar,
    setNote,
    exportJson,
    exportCsv,
    importJson,
    syncFromRemote,
  }
}
