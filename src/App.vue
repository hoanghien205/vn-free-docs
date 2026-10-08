<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useLocale } from '@/composables/useLocale'
import AppBar from '@/components/AppBar.vue'
import HeroSection from '@/components/HeroSection.vue'
import FreeTools from '@/components/FreeTools.vue'
import Solutions from '@/components/Solutions.vue'
import Process from '@/components/Process.vue'
import ContactDonate from '@/components/ContactDonate.vue'
import InboxAdmin from '@/components/InboxAdmin.vue'
import AppFooter from '@/components/AppFooter.vue'

const { t } = useLocale()

// Trang quản trị hộp thư dùng "định tuyến" nhẹ bằng hash để không cần vue-router.
// Mở bằng: /#/hop-thu (hoặc #/inbox, #/admin, #/tin-nhan)
// Có thể mở thẳng một tin nhắn: /#/hop-thu/<id>
const INBOX_PREFIXES = ['#/hop-thu', '#/inbox', '#/admin', '#/tin-nhan']

function resolveRoute() {
  if (typeof window === 'undefined') return 'home'
  const hash = (window.location.hash || '').toLowerCase()
  const isInbox = INBOX_PREFIXES.some((prefix) => hash === prefix || hash.startsWith(`${prefix}/`))
  return isInbox ? 'inbox' : 'home'
}

const route = ref(resolveRoute())

function onHashChange() {
  const next = resolveRoute()
  if (next === route.value) return
  route.value = next
  if (next === 'inbox') window.scrollTo({ top: 0 })
}

onMounted(() => window.addEventListener('hashchange', onHashChange))
onBeforeUnmount(() => window.removeEventListener('hashchange', onHashChange))
</script>

<template>
  <v-app>
    <AppBar />

    <v-main>
      <a v-if="route === 'home'" class="skip-link" href="#cong-cu">{{ t('a11y.skipLink') }}</a>

      <template v-if="route === 'home'">
        <HeroSection />
        <FreeTools />
        <Solutions />
        <Process />
        <ContactDonate />
      </template>

      <InboxAdmin v-else />
    </v-main>

    <AppFooter />
  </v-app>
</template>

<style scoped>
.skip-link {
  position: absolute;
  left: -9999px;
  top: 0;
  z-index: 3000;
  padding: 10px 16px;
  border-radius: 0 0 12px 0;
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  text-decoration: none;
}

.skip-link:focus {
  left: 0;
}
</style>
