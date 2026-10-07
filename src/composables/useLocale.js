import { computed, ref, watch } from 'vue'
import { defaultLocale, locales, messages } from '@/data/i18n'

const STORAGE_KEY = 'vnfreedocs:locale'

function readStoredLocale() {
  if (typeof localStorage === 'undefined') return defaultLocale
  const stored = localStorage.getItem(STORAGE_KEY)
  return locales.some((item) => item.code === stored) ? stored : defaultLocale
}

// State dùng chung cho toàn app (module-level singleton).
const locale = ref(readStoredLocale())

if (typeof document !== 'undefined') {
  document.documentElement.lang = locale.value
}

watch(locale, (value) => {
  if (typeof document !== 'undefined') document.documentElement.lang = value
  if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, value)
})

function resolve(source, path) {
  return path
    .split('.')
    .reduce((acc, key) => (acc && typeof acc === 'object' ? acc[key] : undefined), source)
}

export function useLocale() {
  const currentLocale = computed(() => locales.find((item) => item.code === locale.value))

  /** Lấy chuỗi giao diện theo đường dẫn, ví dụ: t('hero.title1') */
  function t(path, params) {
    const raw = resolve(messages[locale.value], path) ?? resolve(messages[defaultLocale], path) ?? path
    if (typeof raw !== 'string') return raw
    if (!params) return raw
    return raw.replace(/\{(\w+)\}/g, (match, key) => (key in params ? params[key] : match))
  }

  /**
   * Lấy nội dung đa ngôn ngữ từ src/data, ví dụ: lp(tool) với tool = { vi: {...}, en: {...} }
   */
  function lp(localized) {
    if (!localized) return {}
    return localized[locale.value] ?? localized[defaultLocale] ?? {}
  }

  function setLocale(code) {
    if (locales.some((item) => item.code === code)) locale.value = code
  }

  function toggleLocale() {
    locale.value = locale.value === 'vi' ? 'en' : 'vi'
  }

  return {
    locale,
    locales,
    currentLocale,
    t,
    lp,
    setLocale,
    toggleLocale,
    isVietnamese: computed(() => locale.value === 'vi'),
  }
}
