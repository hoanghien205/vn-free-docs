/**
 * Bộ đếm lượt bấm nút tải của từng công cụ.
 *
 * Con số được lưu trong MongoDB qua backend Express (thư mục `server/`):
 *   POST /api/tools/:id/download   → cộng thêm một lượt
 *   GET  /api/tools/downloads      → bảng đếm { toolId: sốLượt }
 *
 * Website vẫn chạy bình thường khi chưa có backend: mọi lỗi mạng được bỏ qua êm,
 * người dùng không thấy thông báo lỗi nào.
 */
import { apiUrl, isApiConfigured } from '@/data/inbox'

const isJsonResponse = (res) => (res.headers.get('content-type') ?? '').includes('application/json')

/** Cộng một lượt bấm nút tải cho công cụ. Trả về số lượt mới do server xác nhận. */
export async function trackToolDownload(toolId, label = '') {
  const id = String(toolId ?? '').trim()
  if (!id || !isApiConfigured()) return { ok: false, skipped: true }

  try {
    const res = await fetch(apiUrl(`/api/tools/${encodeURIComponent(id)}/download`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ label: String(label ?? '') }),
      // Giữ request sống nếu người dùng rời trang ngay sau khi bấm.
      keepalive: true,
    })
    // Chưa có backend ở địa chỉ này (404 hoặc trả về HTML của web tĩnh): bỏ qua.
    if (!isJsonResponse(res)) return { ok: false, skipped: true }

    const data = await res.json().catch(() => ({}))
    if (!res.ok || data.ok === false) return { ok: false }
    return { ok: true, count: data?.data?.count ?? null }
  } catch {
    return { ok: false }
  }
}

/** Đọc bảng đếm lượt tải của mọi công cụ. Không có backend thì trả về null. */
export async function fetchToolDownloads() {
  if (!isApiConfigured()) return null

  try {
    const res = await fetch(apiUrl('/api/tools/downloads'), {
      headers: { Accept: 'application/json' },
    })
    if (!isJsonResponse(res) || !res.ok) return null

    const data = await res.json().catch(() => ({}))
    const counts = data?.data?.counts
    return counts && typeof counts === 'object' ? counts : null
  } catch {
    return null
  }
}
