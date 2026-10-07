import { onBeforeUnmount, ref } from 'vue'

/**
 * Sao chép văn bản vào clipboard, có fallback cho trình duyệt cũ / http.
 * Trả về { copied, copy(text) }.
 */
export function useCopy({ resetDelay = 2000 } = {}) {
  const copied = ref(false)
  const failed = ref(false)
  let timer = null

  function fallbackCopy(text) {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    let ok = false
    try {
      ok = document.execCommand('copy')
    } catch {
      ok = false
    }
    document.body.removeChild(area)
    return ok
  }

  async function copy(text) {
    if (timer) clearTimeout(timer)
    let ok = false
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        ok = true
      } else {
        ok = fallbackCopy(text)
      }
    } catch {
      ok = fallbackCopy(text)
    }

    copied.value = ok
    failed.value = !ok
    timer = setTimeout(() => {
      copied.value = false
      failed.value = false
    }, resetDelay)
    return ok
  }

  onBeforeUnmount(() => {
    if (timer) clearTimeout(timer)
  })

  return { copied, failed, copy }
}
