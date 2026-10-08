import { computed } from 'vue'
import { useLocale } from '@/composables/useLocale'
import { locales } from '@/data/i18n'

const DATE_LOCALES = {
  vi: 'vi-VN',
  en: 'en-GB',
}

const UNITS = [
  ['year', 365 * 24 * 60 * 60 * 1000],
  ['month', 30 * 24 * 60 * 60 * 1000],
  ['day', 24 * 60 * 60 * 1000],
  ['hour', 60 * 60 * 1000],
  ['minute', 60 * 1000],
]

/**
 * Định dạng ngày giờ theo ngôn ngữ đang chọn.
 * Dùng cho hộp thư: hiển thị "3 giờ trước" kèm ngày giờ đầy đủ.
 */
export function useDateFormat() {
  const { locale } = useLocale()

  const dateLocale = computed(() => {
    const code = locales.some((item) => item.code === locale.value) ? locale.value : 'vi'
    return DATE_LOCALES[code] ?? 'vi-VN'
  })

  function toDate(value) {
    const date = value instanceof Date ? value : new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }

  function formatDateTime(value) {
    const date = toDate(value)
    if (!date) return ''
    return new Intl.DateTimeFormat(dateLocale.value, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  function formatDate(value) {
    const date = toDate(value)
    if (!date) return ''
    return new Intl.DateTimeFormat(dateLocale.value, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date)
  }

  function formatRelative(value) {
    const date = toDate(value)
    if (!date) return ''
    const diff = date.getTime() - Date.now()
    const abs = Math.abs(diff)
    const relative = new Intl.RelativeTimeFormat(dateLocale.value, { numeric: 'auto' })
    if (abs < 60 * 1000) return relative.format(0, 'minute')
    for (const [unit, ms] of UNITS) {
      if (abs >= ms) return relative.format(Math.round(diff / ms), unit)
    }
    return formatDate(date)
  }

  return { formatDate, formatDateTime, formatRelative }
}
