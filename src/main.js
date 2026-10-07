import { createApp } from 'vue'

// Font hỗ trợ đầy đủ dấu tiếng Việt + bộ icon Material Design
import '@fontsource/be-vietnam-pro/400.css'
import '@fontsource/be-vietnam-pro/500.css'
import '@fontsource/be-vietnam-pro/600.css'
import '@fontsource/be-vietnam-pro/700.css'
import '@fontsource/be-vietnam-pro/800.css'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import '@/assets/styles/main.css'

import App from '@/App.vue'
import vuetify from '@/plugins/vuetify'
import { vReveal } from '@/composables/useRevealOnScroll'

createApp(App).use(vuetify).directive('reveal', vReveal).mount('#app')
