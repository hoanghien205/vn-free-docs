<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useTheme } from 'vuetify'
import { site } from '@/data/site'
import { useLocale } from '@/composables/useLocale'

const { t, locale, locales, setLocale } = useLocale()
const theme = useTheme()

const drawer = ref(false)
const activeSection = ref('top')

const navLinks = [
  { id: 'cong-cu', key: 'nav.tools', icon: 'mdi-folder-star-outline' },
  { id: 'giai-phap', key: 'nav.solutions', icon: 'mdi-lightning-bolt-outline' },
  { id: 'quy-trinh', key: 'nav.process', icon: 'mdi-format-list-numbered' },
  { id: 'lien-he', key: 'nav.contact', icon: 'mdi-send-outline' },
]

const isDark = computed(() => theme.global.current.value.dark)

function toggleTheme() {
  theme.global.name.value = isDark.value ? 'light' : 'dark'
  localStorage.setItem('vnfreedocs:theme', theme.global.name.value)
}

// Tô sáng mục đang xem trên thanh điều hướng.
let observer
onMounted(() => {
  if (!('IntersectionObserver' in window)) return
  observer = new IntersectionObserver(
    (entries) => {
      entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        .slice(0, 1)
        .forEach((entry) => {
          activeSection.value = entry.target.id
        })
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] },
  )
  navLinks.forEach((link) => {
    const el = document.getElementById(link.id)
    if (el) observer.observe(el)
  })
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <v-app-bar flat :height="76" class="app-bar-glass" scroll-behavior="elevate" scroll-threshold="60">
    <v-container class="section-shell d-flex align-center px-4 px-md-6">
      <a class="brand text-decoration-none" href="#top" :aria-label="site.brand.fullName">
        <span class="brand__mark">
          <v-icon icon="mdi-file-document-multiple-outline" size="20" />
        </span>
        <span class="brand__text">
          VN <span class="gradient-text">Free</span> Docs
        </span>
      </a>

      <v-spacer />

      <nav class="d-none d-lg-flex align-center" :aria-label="t('a11y.mainNav')">
        <v-btn
          v-for="link in navLinks"
          :key="link.id"
          :href="`#${link.id}`"
          variant="text"
          class="nav-link"
          :class="{ 'nav-link--active': activeSection === link.id }"
        >
          {{ t(link.key) }}
        </v-btn>
      </nav>

      <v-divider vertical class="mx-3 d-none d-lg-flex" />

      <v-btn icon variant="text" :aria-label="t('actions.toggleTheme')" @click="toggleTheme">
        <v-icon :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'" />
        <v-tooltip activator="parent" :text="isDark ? t('theme.light') : t('theme.dark')" />
      </v-btn>

      <v-btn-toggle
        :model-value="locale"
        mandatory
        divided
        variant="outlined"
        density="comfortable"
        class="d-none d-sm-inline-flex ml-2"
        :aria-label="t('actions.changeLang')"
        @update:model-value="setLocale"
      >
        <v-btn v-for="item in locales" :key="item.code" :value="item.code" size="small" :aria-label="item.name">
          {{ item.label }}
        </v-btn>
      </v-btn-toggle>

      <v-app-bar-nav-icon
        class="d-lg-none ml-1"
        :aria-label="t('actions.menu')"
        @click="drawer = !drawer"
      />
    </v-container>
  </v-app-bar>

  <v-navigation-drawer v-model="drawer" temporary location="right" width="300">
    <div class="pa-5 d-flex flex-column h-100">
      <div class="d-flex align-center justify-space-between mb-6">
        <span class="brand__text">VN <span class="gradient-text">Free</span> Docs</span>
        <v-btn
          icon
          variant="text"
          :aria-label="t('actions.close')"
          @click="drawer = false"
        >
          <v-icon icon="mdi-close" />
        </v-btn>
      </div>

      <v-list nav density="comfortable" class="pa-0">
        <v-list-item
          v-for="link in navLinks"
          :key="link.id"
          :href="`#${link.id}`"
          :prepend-icon="link.icon"
          :title="t(link.key)"
          rounded="lg"
          @click="drawer = false"
        />
      </v-list>

      <v-divider class="my-5" />

      <div class="d-flex align-center justify-space-between">
        <span class="text-body-2 text-medium-emphasis">{{ t('theme.light') }} / {{ t('theme.dark') }}</span>
        <v-switch
          :model-value="isDark"
          color="primary"
          hide-details
          inset
          density="compact"
          :aria-label="t('actions.toggleTheme')"
          @update:model-value="toggleTheme"
        />
      </div>

      <div class="mt-4">
        <div class="text-caption text-medium-emphasis mb-2">{{ t('actions.changeLang') }}</div>
        <v-btn-toggle
          :model-value="locale"
          mandatory
          divided
          variant="outlined"
          class="w-100"
          @update:model-value="setLocale"
        >
          <v-btn v-for="item in locales" :key="item.code" :value="item.code" class="flex-grow-1">
            {{ item.flag }} {{ item.label }}
          </v-btn>
        </v-btn-toggle>
      </div>

      <v-spacer />

      <v-btn
        block
        color="primary"
        size="large"
        class="flex-grow-0 flex-shrink-0"
        href="#lien-he"
        prepend-icon="mdi-handshake-outline"
        @click="drawer = false"
      >
        {{ t('actions.contact') }}
      </v-btn>
    </div>
  </v-navigation-drawer>
</template>

<style scoped>
.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: rgb(var(--v-theme-on-surface));
}

.brand__mark {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  color: #fff;
  background: var(--vnf-gradient);
  box-shadow: 0 12px 26px -14px rgba(43, 92, 255, 0.9);
}

.brand__text {
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

.nav-link {
  color: rgb(var(--v-theme-on-surface-variant));
  font-weight: 500;
}

.nav-link--active {
  color: rgb(var(--v-theme-primary));
  background: color-mix(in srgb, rgb(var(--v-theme-primary)) 12%, transparent);
}
</style>
