/**
 * Cấu hình hộp thư nhận tin nhắn & góp ý của khách hàng.
 *
 * `transport: 'api'` (mặc định) gửi tin nhắn về backend Express + MongoDB trong
 * thư mục `server/`. Chưa cấu hình địa chỉ backend thì tin nhắn tự động được lưu
 * ở localStorage, nên website vẫn chạy được ngay mà không báo lỗi cho khách.
 * Trang quản trị: `#/hop-thu`.
 *
 * ⚠️ Lưu ý: `local` chỉ thấy được tin nhắn gửi từ chính trình duyệt đó — hữu ích
 * để thử nghiệm. Muốn nhận tin từ mọi thiết bị, hãy chọn một kênh khác bên dưới
 * (khuyến nghị: Google Apps Script + Google Sheet, xem README mục 8).
 *
 * transport:
 *   'api'       — gửi về backend Express + MongoDB trong thư mục `server/` (mặc định)
 *   'local'     — chỉ lưu trong trình duyệt, không cần cấu hình gì
 *   'custom'    — POST JSON tới endpoint của bạn (Google Apps Script, API riêng…)
 *   'web3forms' — dịch vụ form miễn phí, chỉ cần access key gửi vào email
 *   'formspree' — dịch vụ form miễn phí, cần form id / endpoint
 *   'telegram'  — nhắn thẳng vào Telegram qua bot (nhận thông báo tức thì)
 */
export const inboxConfig = {
  transport: 'api',

  /**
   * Backend Express + MongoDB (thư mục `server/`).
   * Địa chỉ có thể đặt cứng ở đây, qua biến môi trường VITE_API_BASE_URL khi build,
   * hoặc nhập trực tiếp trong trang quản trị (lưu ở trình duyệt, không cần build lại).
   */
  api: {
    // Ví dụ: 'https://api.vnfreedocs.vn' hoặc 'http://localhost:4000'
    baseUrl: '',
  },

  // Chỉ dùng khi transport = 'web3forms'. Lấy key miễn phí tại https://web3forms.com
  web3forms: {
    accessKey: '',
    // Tiêu đề email nhận được, ví dụ: 'VN Free Docs — tin nhắn mới'
    subject: 'Tin nhắn mới từ website',
  },

  // Chỉ dùng khi transport = 'formspree', ví dụ: 'https://formspree.io/f/xxxxxxxx'
  formspree: {
    endpoint: '',
  },

  // Chỉ dùng khi transport = 'custom' — endpoint nhận POST JSON (thường là Apps Script)
  custom: {
    endpoint: '',
  },

  // Chỉ dùng khi transport = 'telegram'.
  // ⚠️ Bot token nằm trong mã nguồn phía trình duyệt nên ai cũng đọc được.
  // Chỉ dùng bot riêng, không cấp quyền gì khác, và đổi token nếu bị lạm dụng.
  telegram: {
    botToken: '',
    chatId: '',
  },

  /**
   * Đọc & cập nhật danh sách tin nhắn từ xa.
   * Bật lên thì trang quản trị tải dữ liệu thật thay vì chỉ dữ liệu local.
   */
  remote: {
    enabled: false,
    // 'api'    = backend Express trong thư mục server/
    // 'script' = Google Apps Script Web App
    provider: 'api',
    // URL backend hoặc URL Web App của Apps Script
    endpoint: '',
    // Khoá quản trị của backend Express (khớp ADMIN_TOKEN trong server/.env)
    adminToken: '',
    // Chuỗi bí mật bạn tự đặt trong Apps Script để chặn người lạ đọc dữ liệu
    token: '',
    // true: ẩn các nút sửa trạng thái (chỉ xem) — dùng khi chưa bật ghi từ xa.
    readOnly: false,
  },

  /** Cổng vào trang quản trị. Để trống = không hỏi mật khẩu. */
  admin: {
    // ⚠️ Chỉ là lớp chắn cho vui, KHÔNG phải bảo mật thật (mã chạy ở trình duyệt).
    passcode: '',
  },

  /** Hiện vài tin nhắn mẫu khi hộp thư còn trống, giúp xem trước giao diện. */
  seedDemo: true,

  /** Số tin nhắn tối đa giữ trong localStorage (tin cũ nhất bị bỏ trước). */
  maxMessages: 500,

  /** Khoá localStorage. Đổi nếu muốn tách dữ liệu giữa các môi trường. */
  storageKey: 'vnfreedocs:messages',
}

/** Loại nội dung khách gửi tới — dùng chung cho form liên hệ và bộ lọc quản trị. */
export const MESSAGE_TYPES = ['feedback', 'request', 'collab', 'support', 'other']

export const MESSAGE_TYPE_META = {
  feedback: { icon: 'mdi-comment-quote-outline', accent: 'blue', color: 'primary' },
  request: { icon: 'mdi-file-plus-outline', accent: 'cyan', color: 'info' },
  collab: { icon: 'mdi-handshake-outline', accent: 'violet', color: 'secondary' },
  support: { icon: 'mdi-lifebuoy', accent: 'emerald', color: 'success' },
  other: { icon: 'mdi-message-text-outline', accent: 'amber', color: 'warning' },
}

/** Trạng thái xử lý một tin nhắn. */
export const MESSAGE_STATUSES = ['new', 'read', 'replied', 'archived']

export const MESSAGE_STATUS_META = {
  new: { icon: 'mdi-email-outline', color: 'primary' },
  read: { icon: 'mdi-email-open-outline', color: 'info' },
  replied: { icon: 'mdi-reply-outline', color: 'success' },
  archived: { icon: 'mdi-archive-outline', color: 'grey' },
}

/** Sắp xếp danh sách trong trang quản trị. */
export const MESSAGE_SORTS = ['newest', 'oldest', 'name', 'unreadFirst']

export const messageTypeMeta = (type) => MESSAGE_TYPE_META[type] ?? MESSAGE_TYPE_META.other
export const messageStatusMeta = (status) => MESSAGE_STATUS_META[status] ?? MESSAGE_STATUS_META.new

/* ---------------- Cấu hình backend (nhập từ trang quản trị) ---------------- */

const API_SETTINGS_KEY = 'vnfreedocs:inbox-api'

/** Địa chỉ backend mặc định: biến môi trường lúc build → cấu hình trong file này. */
const DEFAULT_API_BASE_URL = String(
  import.meta.env?.VITE_API_BASE_URL ?? inboxConfig.api.baseUrl ?? '',
)
  .trim()
  .replace(/\/+$/, '')

const stripSlash = (value) =>
  String(value ?? '')
    .trim()
    .replace(/\/+$/, '')

/**
 * Header HTTP chỉ nhận ký tự ISO-8859-1. Người dùng hay dán kèm ký tự lạ
 * (dấu tiếng Việt, ký tự ẩn, dấu nháy “smart quote”…) nên lọc sẵn cho an toàn.
 */
const sanitizeToken = (value) =>
  String(value ?? '')
    .replace(/[^\x20-\x7E]/g, '')
    .trim()

export function readApiSettings() {
  const stored = (() => {
    if (typeof localStorage === 'undefined') return null
    try {
      return JSON.parse(localStorage.getItem(API_SETTINGS_KEY) ?? 'null')
    } catch {
      return null
    }
  })()

  return {
    baseUrl: stripSlash(stored?.baseUrl || DEFAULT_API_BASE_URL || inboxConfig.remote.endpoint),
    adminToken: sanitizeToken(stored?.adminToken ?? inboxConfig.remote.adminToken),
  }
}

export function saveApiSettings({ baseUrl, adminToken }) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(
    API_SETTINGS_KEY,
    JSON.stringify({ baseUrl: stripSlash(baseUrl), adminToken: sanitizeToken(adminToken) }),
  )
}

export const defaultApiBaseUrl = DEFAULT_API_BASE_URL
export const remoteProvider = () => inboxConfig.remote.provider ?? 'script'

export const isRemoteInboxEnabled = () => {
  // Với backend Express: chỉ cần có địa chỉ API là bật — nhập trong trang quản trị
  // hoặc đặt sẵn ở `api.baseUrl` / biến môi trường VITE_API_BASE_URL.
  if (remoteProvider() === 'api') return Boolean(readApiSettings().baseUrl)
  return Boolean(inboxConfig.remote.endpoint)
}

/** Ghép nội dung tin nhắn thành văn bản thuần để gửi qua các kênh. */
function toPlainText(payload) {
  return [
    `Họ tên: ${payload.name || '—'}`,
    `Email: ${payload.email || '—'}`,
    `Điện thoại/Zalo: ${payload.phone || '—'}`,
    `Loại: ${payload.type || 'other'}`,
    '',
    payload.message || '',
  ].join('\n')
}

/**
 * Gửi tin nhắn tới kênh đang cấu hình.
 * @returns {Promise<{ ok: boolean, via: string, error?: unknown }>}
 */
export async function submitMessage(payload) {
  const via = inboxConfig.transport
  if (via === 'local' || !via) return { ok: true, via: 'local' }

  try {
    if (via === 'api') {
      const { baseUrl } = readApiSettings()
      // Chưa cấu hình backend → lùi về lưu tại trình duyệt để khách không thấy lỗi.
      if (!baseUrl) return { ok: true, via: 'local', reason: 'api-not-configured' }
      const res = await fetch(`${baseUrl}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...payload, botcheck: false }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data.ok === false) {
        throw new Error(data?.error?.message || `Backend trả về lỗi ${res.status}`)
      }
      // Trả kèm id do server tạo để frontend không lưu trùng hai bản ghi.
      return { ok: true, via, id: data?.data?.id ?? null, createdAt: data?.data?.createdAt ?? null }
    }

    if (via === 'web3forms') {
      if (!inboxConfig.web3forms.accessKey) throw new Error('Thiếu Web3Forms access key')
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: inboxConfig.web3forms.accessKey,
          subject: inboxConfig.web3forms.subject,
          from_name: payload.name,
          name: payload.name,
          email: payload.email,
          phone: payload.phone || '',
          message: payload.message,
          type: payload.type || 'other',
          botcheck: false,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data.success === false) throw new Error(data.message || 'Web3Forms từ chối')
      return { ok: true, via }
    }

    if (via === 'formspree') {
      if (!inboxConfig.formspree.endpoint) throw new Error('Thiếu Formspree endpoint')
      const res = await fetch(inboxConfig.formspree.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`Formspree lỗi ${res.status}`)
      return { ok: true, via }
    }

    if (via === 'telegram') {
      const { botToken, chatId } = inboxConfig.telegram
      if (!botToken || !chatId) throw new Error('Thiếu Telegram bot token / chat id')
      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: toPlainText(payload) }),
      })
      if (!res.ok) throw new Error(`Telegram lỗi ${res.status}`)
      return { ok: true, via }
    }

    if (via === 'custom') {
      if (!inboxConfig.custom.endpoint) throw new Error('Thiếu custom endpoint')
      const body = JSON.stringify({ action: 'create', ...payload })
      try {
        // Content-Type text/plain giúp tránh preflight CORS với Google Apps Script.
        const res = await fetch(inboxConfig.custom.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body,
        })
        if (!res.ok) throw new Error(`Endpoint lỗi ${res.status}`)
      } catch (error) {
        // Apps Script đôi khi chặn đọc phản hồi; gửi lại ở chế độ mờ (chỉ cần tới nơi).
        if (error instanceof TypeError) {
          await fetch(inboxConfig.custom.endpoint, { method: 'POST', mode: 'no-cors', body })
        } else {
          throw error
        }
      }
      return { ok: true, via }
    }

    return { ok: true, via: 'local' }
  } catch (error) {
    return { ok: false, via, error }
  }
}

/**
 * Tải danh sách tin nhắn từ xa (backend Express hoặc Google Apps Script).
 * Trả về mảng tin nhắn đã chuẩn hoá, hoặc ném lỗi để nơi gọi tự xử lý.
 */
export async function fetchRemoteMessages({ baseUrl, adminToken } = {}) {
  if (remoteProvider() === 'api') {
    const settings = readApiSettings()
    const apiBase = stripSlash(baseUrl || settings.baseUrl)
    const token = adminToken ?? settings.adminToken
    if (!apiBase) throw new Error('Chưa cấu hình địa chỉ backend.')

    const res = await fetch(`${apiBase}/api/messages?limit=500`, {
      method: 'GET',
      headers: token ? { 'x-admin-token': token } : {},
    })
    if (res.status === 401) throw new Error('Khoá quản trị không đúng hoặc còn thiếu.')
    if (!res.ok) throw new Error(`Không tải được hộp thư (${res.status})`)
    const data = await res.json()
    return data?.data?.messages ?? data?.messages ?? []
  }

  const { endpoint, token } = inboxConfig.remote
  if (!isRemoteInboxEnabled()) return []

  const url = `${endpoint}${endpoint.includes('?') ? '&' : '?'}action=list&token=${encodeURIComponent(token)}`
  const res = await fetch(url, { method: 'GET' })
  if (!res.ok) throw new Error(`Không tải được hộp thư (${res.status})`)
  const data = await res.json()
  const list = Array.isArray(data) ? data : (data.messages ?? [])
  return list
}

/** Đẩy thay đổi trạng thái của một tin nhắn lên nơi lưu trữ từ xa. */
export async function pushRemoteMessage(id, patch) {
  if (!isRemoteInboxEnabled() || inboxConfig.remote.readOnly) return { ok: false }

  if (remoteProvider() === 'api') {
    const { baseUrl, adminToken } = readApiSettings()
    try {
      const res = await fetch(`${baseUrl}/api/messages/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
        body: JSON.stringify(patch),
      })
      return { ok: res.ok, status: res.status }
    } catch {
      return { ok: false }
    }
  }

  const { endpoint, token } = inboxConfig.remote
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'update', token, id, patch }),
    })
    return { ok: res.ok }
  } catch {
    return { ok: false }
  }
}

/** Xoá một tin nhắn ở nơi lưu trữ từ xa. */
export async function deleteRemoteMessage(id) {
  if (!isRemoteInboxEnabled() || inboxConfig.remote.readOnly) return { ok: false }

  if (remoteProvider() === 'api') {
    const { baseUrl, adminToken } = readApiSettings()
    try {
      const res = await fetch(`${baseUrl}/api/messages/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': adminToken },
      })
      return { ok: res.ok, status: res.status }
    } catch {
      return { ok: false }
    }
  }

  const { endpoint, token } = inboxConfig.remote
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'delete', token, id }),
    })
    return { ok: res.ok }
  } catch {
    return { ok: false }
  }
}

/** Kiểm tra nhanh địa chỉ backend + khoá quản trị (dùng cho nút "Kiểm tra kết nối"). */
export async function testApiConnection({ baseUrl, adminToken } = {}) {
  const settings = readApiSettings()
  const apiBase = stripSlash(baseUrl || settings.baseUrl)
  const token = adminToken ?? settings.adminToken
  if (!apiBase) return { ok: false, message: 'Chưa nhập địa chỉ backend.' }

  try {
    const health = await fetch(`${apiBase}/api/health`, { method: 'GET' })
    const healthData = await health.json().catch(() => ({}))
    if (!health.ok) {
      return {
        ok: false,
        message: `Backend phản hồi ${health.status} (database: ${healthData?.data?.db ?? 'không rõ'}).`,
      }
    }

    const list = await fetch(`${apiBase}/api/messages?limit=1`, {
      method: 'GET',
      headers: token ? { 'x-admin-token': token } : {},
    })
    if (list.status === 401) {
      return { ok: false, message: 'Kết nối được backend nhưng khoá quản trị chưa đúng.' }
    }
    if (!list.ok) return { ok: false, message: `Danh sách tin nhắn trả về ${list.status}.` }

    const data = await list.json().catch(() => ({}))
    return { ok: true, message: 'Kết nối thành công.', total: data?.data?.total ?? 0 }
  } catch (error) {
    return {
      ok: false,
      message: `Không gọi được backend (${error?.message ?? 'lỗi mạng'}). Kiểm tra lại địa chỉ và CORS.`,
    }
  }
}
