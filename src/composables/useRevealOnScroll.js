/**
 * Hiệu ứng fade + slide khi phần tử vào viewport.
 *
 * Cách dùng phổ biến nhất là directive toàn cục `v-reveal` (đã đăng ký trong main.js):
 *   <div v-reveal>…</div>
 *   <div v-reveal="{ delay: 120 }">…</div>
 *
 * Composable bên dưới là phần lõi, cũng có thể dùng trực tiếp khi cần.
 */

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true

/**
 * @param {HTMLElement} el phần tử cần theo dõi
 * @param {{ delay?: number, threshold?: number }} options
 * @returns {{ stop: () => void }}
 */
export function useRevealOnScroll(el, options = {}) {
  if (!el) return { stop: () => {} }

  if (prefersReducedMotion()) {
    el.classList.add('reveal', 'reveal--visible')
    return { stop: () => {} }
  }

  const delay = Number(options.delay ?? 0)
  el.classList.add('reveal')
  if (delay) el.style.transitionDelay = `${delay}ms`

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('reveal--visible')
        observer.unobserve(entry.target)
      })
    },
    {
      threshold: options.threshold ?? 0.15,
      rootMargin: '0px 0px -60px 0px',
    },
  )

  observer.observe(el)

  return {
    stop: () => {
      observer.disconnect()
      el.style.transitionDelay = ''
    },
  }
}

/** Directive: v-reveal (nhận số mili-giây hoặc object { delay, threshold }). */
export const vReveal = {
  mounted(el, binding) {
    const value = binding.value
    const options = typeof value === 'number' ? { delay: value } : (value ?? {})
    el.__reveal = useRevealOnScroll(el, options)
  },
  unmounted(el) {
    el.__reveal?.stop?.()
    delete el.__reveal
  },
}
