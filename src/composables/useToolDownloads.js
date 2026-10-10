import { ref } from 'vue'
import { fetchToolDownloads, trackToolDownload } from '@/data/toolDownloads'

/**
 * Bảng đếm lượt tải dùng chung cho toàn app (module-level singleton).
 * Tải một lần khi trang mở; mỗi lần khách bấm nút tải thì cộng ngay trên giao diện
 * rồi gửi lên server, số server trả về sẽ ghi đè cho khớp.
 */
const counts = ref({})
const loaded = ref(false)
let pending = null

async function load() {
  if (loaded.value || pending) return pending

  pending = fetchToolDownloads()
    .then((data) => {
      if (data) {
        counts.value = { ...data }
        loaded.value = true
      }
      return data
    })
    .finally(() => {
      pending = null
    })

  return pending
}

function countOf(toolId) {
  return counts.value[toolId] ?? 0
}

function record(toolId, label = '') {
  const id = String(toolId ?? '').trim()
  if (!id) return

  counts.value = { ...counts.value, [id]: (counts.value[id] ?? 0) + 1 }
  trackToolDownload(id, label).then((result) => {
    if (result?.ok && result.count != null) {
      counts.value = { ...counts.value, [id]: result.count }
    }
  })
}

export function useToolDownloads() {
  return { counts, loaded, load, countOf, record }
}
