import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

// Ghi nhớ lựa chọn sáng/tối của người dùng giữa các lần truy cập.
function readStoredTheme() {
  if (typeof localStorage === 'undefined') return 'light'
  return localStorage.getItem('vnfreedocs:theme') === 'dark' ? 'dark' : 'light'
}

/**
 * Theme màu: sửa trực tiếp các mã màu bên dưới để đổi nhận diện thương hiệu.
 * `light` và `dark` dùng chung tên biến nên component không cần biết theme nào đang bật.
 */
export default createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  theme: {
    defaultTheme: readStoredTheme(),
    themes: {
      light: {
        dark: false,
        colors: {
          background: '#F4F7FF',
          surface: '#FFFFFF',
          'surface-bright': '#FFFFFF',
          'surface-light': '#EEF3FF',
          'surface-variant': '#E4EBFF',
          'on-surface-variant': '#4A5573',
          'on-surface': '#0A1024',
          'on-background': '#0A1024',
          primary: '#2B5CFF',
          'primary-darken-1': '#1B44D6',
          secondary: '#7B5CFF',
          'secondary-darken-1': '#6144E0',
          accent: '#12C8C0',
          success: '#14A05A',
          info: '#0EA5E9',
          warning: '#E9A100',
          error: '#E11D48',
          outline: '#C6D0EC',
        },
      },
      dark: {
        dark: true,
        colors: {
          background: '#05070F',
          surface: '#0C1120',
          'surface-bright': '#131A2C',
          'surface-light': '#101728',
          'surface-variant': '#18213A',
          'on-surface-variant': '#98A5C6',
          'on-surface': '#E9EEFF',
          'on-background': '#E9EEFF',
          primary: '#7C9BFF',
          'primary-darken-1': '#5C7BFF',
          secondary: '#A98BFF',
          'secondary-darken-1': '#8E6BFF',
          accent: '#2BE3D5',
          success: '#34D399',
          info: '#38BDF8',
          warning: '#FBBF24',
          error: '#FB7185',
          outline: '#2A3552',
        },
      },
    },
  },
  defaults: {
    VBtn: { rounded: 'pill', class: 'text-none' },
    VCard: { rounded: 'xl' },
    VChip: { rounded: 'pill' },
    VTextField: { variant: 'outlined', density: 'comfortable', hideDetails: 'auto' },
    VTextarea: { variant: 'outlined', density: 'comfortable', hideDetails: 'auto' },
    VSelect: { variant: 'outlined', density: 'comfortable' },
    VAvatar: { rounded: 'lg' },
    VAlert: { rounded: 'lg' },
    VTooltip: { location: 'top' },
  },
})
