<script setup>
import { computed } from 'vue'
import { accentGradient } from '@/data/accents'
import { useLocale } from '@/composables/useLocale'

const props = defineProps({
  tool: { type: Object, required: true },
})

const { t, lp } = useLocale()

const content = computed(() => lp(props.tool))
// Công cụ có logo riêng thì hiển thị ảnh glyph trắng trên ô gradient, thay cho icon MDI.
const logo = computed(() => props.tool.logo ?? null)
const tileStyle = computed(() => ({ background: accentGradient(props.tool.accent) }))

const TAG_META = {
  free: { color: 'primary', icon: 'mdi-gift-outline' },
  openSource: { color: 'accent', icon: 'mdi-source-branch' },
  updated: { color: 'secondary', icon: 'mdi-clock-fast' },
}

const STATUS_META = {
  available: { color: 'success', icon: 'mdi-check-circle-outline' },
  inProgress: { color: 'warning', icon: 'mdi-progress-wrench' },
  planned: { color: 'info', icon: 'mdi-calendar-clock-outline' },
}

const tag = computed(() => TAG_META[props.tool.tag] ?? TAG_META.free)
const status = computed(() => props.tool.status ?? 'available')
const statusMeta = computed(() => STATUS_META[status.value] ?? STATUS_META.available)
const isAvailable = computed(() => status.value === 'available')

// Mục chưa ra mắt thì không dẫn tới link tải nữa mà mời người dùng để lại liên hệ.
const cta = computed(() =>
  isAvailable.value
    ? { href: props.tool.link, label: t('tools.cta'), icon: 'mdi-arrow-right', external: true }
    : { href: '#lien-he', label: t('tools.ctaNotify'), icon: 'mdi-bell-outline', external: false },
)
</script>

<template>
  <v-card
    class="tool-card surface-card hover-lift h-100"
    :class="{ 'tool-card--soon': !isAvailable }"
    elevation="0"
    rounded="xl"
    tag="article"
  >
    <div class="d-flex flex-column h-100 pa-6 pa-md-7">
      <div class="d-flex align-start justify-space-between ga-3 mb-5">
        <span
          class="icon-tile"
          :style="tileStyle"
          style="width: 54px; height: 54px"
        >
          <img v-if="logo" :src="logo" :alt="content.name" class="icon-tile__logo" />
          <v-icon v-else :icon="tool.icon" size="26" />
        </span>
        <v-chip :color="statusMeta.color" variant="tonal" size="small" :prepend-icon="statusMeta.icon" label>
          {{ t(`tools.status.${status}`) }}
        </v-chip>
      </div>

      <h3 class="text-h6 font-weight-bold mb-2">{{ content.name }}</h3>
      <p class="text-body-2 text-medium-emphasis flex-grow-1 tool-card__desc">{{ content.description }}</p>

      <div class="mt-4">
        <v-chip :color="tag.color" variant="outlined" size="small" :prepend-icon="tag.icon" label>
          {{ t(`tools.tags.${tool.tag}`) }}
        </v-chip>
      </div>

      <v-divider class="my-5" />

      <v-btn
        :href="cta.href"
        :target="cta.external ? '_blank' : undefined"
        :rel="cta.external ? 'noopener' : undefined"
        variant="text"
        color="primary"
        :append-icon="cta.icon"
        class="px-0 align-self-start"
      >
        {{ cta.label }}
      </v-btn>
    </div>
  </v-card>
</template>

<style scoped>
.tool-card__desc {
  line-height: 1.65;
}

/* Logo là glyph trắng khoét lỗ, đặt giữa ô gradient giống icon MDI. */
.icon-tile__logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

/* Mục chưa có thì làm icon dịu lại để thị giác tách khỏi các mục đã tải được. */
.tool-card--soon .icon-tile {
  filter: grayscale(35%);
  opacity: 0.85;
}
</style>
