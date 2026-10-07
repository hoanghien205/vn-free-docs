<script setup>
import { computed, ref } from 'vue'
import { accentGradient } from '@/data/accents'
import { TOOL_STATUS_META, TOOL_TAG_META, isDemoLink } from '@/data/tools'
import { useLocale } from '@/composables/useLocale'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  tool: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'afterLeave'])

const { t, lp } = useLocale()

const demoNotice = ref(false)

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const content = computed(() => (props.tool ? lp(props.tool) : {}))
const details = computed(() => (props.tool ? lp(props.tool.details) : {}))

const status = computed(() => props.tool?.status ?? 'available')
const isAvailable = computed(() => status.value === 'available')
const statusMeta = computed(() => TOOL_STATUS_META[status.value] ?? TOOL_STATUS_META.available)
const tagMeta = computed(() => TOOL_TAG_META[props.tool?.tag] ?? TOOL_TAG_META.free)

const tileStyle = computed(() => ({ background: accentGradient(props.tool?.accent) }))

// Link tải là dữ liệu mẫu (`#`) → hiện ghi chú demo thay vì điều hướng đi đâu đó.
const link = computed(() => props.tool?.link ?? '#')
const isDemo = computed(() => isDemoLink(link.value))

// Chỉ hiện ô thông tin nào có dữ liệu, để công cụ đang làm không bị trống trải.
const metaFields = computed(() =>
  [
    { key: 'format', icon: 'mdi-file-outline', value: details.value.format },
    { key: 'version', icon: 'mdi-tag-outline', value: details.value.version },
    { key: 'updated', icon: 'mdi-clock-outline', value: details.value.updated },
    { key: 'license', icon: 'mdi-scale-balance', value: details.value.license },
  ].filter((field) => Boolean(field.value)),
)

const highlights = computed(() => details.value.highlights ?? [])

function close() {
  show.value = false
}

function onDownload(event) {
  if (!isDemo.value) return
  // Link mẫu: chặn điều hướng để trang không nhảy lên đầu, rồi báo cho người dùng biết.
  event.preventDefault()
  demoNotice.value = true
}
</script>

<template>
  <v-dialog
    v-model="show"
    :max-width="840"
    :fullscreen="$vuetify.display.smAndDown"
    :aria-label="t('tools.detail.dialogLabel')"
    scrollable
    transition="dialog-bottom-transition"
    @after-leave="emit('afterLeave')"
  >
    <v-card
      v-if="tool"
      class="tool-dialog surface-card"
      :rounded="$vuetify.display.smAndDown ? 0 : 'xl'"
      elevation="0"
    >
      <div class="tool-dialog__hero" :style="{ '--tool-accent': tileStyle.background }">
        <div class="tool-dialog__hero-inner pa-6 pa-md-8">
          <div class="d-flex align-start ga-4">
            <span class="icon-tile" :style="[tileStyle, { width: '60px', height: '60px' }]">
              <img v-if="tool.logo" :src="tool.logo" :alt="content.name" class="icon-tile__logo" />
              <v-icon v-else :icon="tool.icon" size="28" />
            </span>

            <div class="flex-grow-1 min-w-0">
              <div class="d-flex flex-wrap align-center ga-2 mb-2">
                <v-chip
                  :color="statusMeta.color"
                  variant="tonal"
                  size="small"
                  :prepend-icon="statusMeta.icon"
                  label
                >
                  {{ t(`tools.status.${status}`) }}
                </v-chip>
                <v-chip
                  :color="tagMeta.color"
                  variant="outlined"
                  size="small"
                  :prepend-icon="tagMeta.icon"
                  label
                >
                  {{ t(`tools.tags.${tool.tag}`) }}
                </v-chip>
              </div>

              <h2 class="text-h5 text-md-h4 font-weight-bold mb-2">{{ content.name }}</h2>
              <p class="text-body-2 text-medium-emphasis mb-0">{{ content.description }}</p>
            </div>

            <v-btn
              icon
              variant="text"
              size="small"
              :aria-label="t('tools.detail.closeLabel')"
              @click="close"
            >
              <v-icon icon="mdi-close" />
            </v-btn>
          </div>
        </div>
      </div>

      <v-card-text class="tool-dialog__body pa-6 pa-md-8">
        <section v-if="details.overview" class="mb-8">
          <h3 class="tool-dialog__heading">{{ t('tools.detail.aboutTitle') }}</h3>
          <p class="text-body-1 tool-dialog__paragraph mb-0">{{ details.overview }}</p>
        </section>

        <section v-if="highlights.length" class="mb-8">
          <h3 class="tool-dialog__heading">{{ t('tools.detail.highlightsTitle') }}</h3>
          <ul class="tool-dialog__list">
            <li v-for="item in highlights" :key="item">
              <v-icon icon="mdi-check-circle-outline" size="18" class="tool-dialog__list-icon" />
              <span>{{ item }}</span>
            </li>
          </ul>
        </section>

        <v-row v-if="metaFields.length" class="gy-3">
          <v-col v-for="field in metaFields" :key="field.key" cols="12" sm="6" md="3">
            <div class="tool-dialog__meta">
              <v-icon :icon="field.icon" size="18" class="tool-dialog__meta-icon" />
              <span class="tool-dialog__meta-label">{{ t(`tools.detail.meta.${field.key}`) }}</span>
              <span class="tool-dialog__meta-value">{{ field.value }}</span>
            </div>
          </v-col>
        </v-row>

        <v-alert
          v-if="!isAvailable"
          color="warning"
          variant="tonal"
          rounded="lg"
          density="comfortable"
          icon="mdi-progress-wrench"
          class="mt-6"
        >
          {{ t(`tools.detail.statusNote.${status}`) }}
        </v-alert>

        <v-alert
          v-else-if="isDemo"
          color="primary"
          variant="tonal"
          rounded="lg"
          density="comfortable"
          icon="mdi-link-variant"
          class="mt-6"
        >
          {{ t('tools.detail.demoNote') }}
        </v-alert>
      </v-card-text>

      <v-divider />

      <v-card-actions class="tool-dialog__actions pa-6 pa-md-8 flex-wrap ga-3">
        <div class="tool-dialog__link flex-grow-1">
          <template v-if="isAvailable">
            <span class="tool-dialog__link-label">
              {{ isDemo ? t('tools.detail.demoBadge') : t('tools.detail.downloadReady') }}
            </span>
            <code class="mono tool-dialog__link-value">{{ link }}</code>
          </template>
          <span v-else class="tool-dialog__link-label">{{ t('tools.detail.notReady') }}</span>
        </div>

        <v-btn variant="text" color="primary" @click="close">
          {{ t('tools.detail.close') }}
        </v-btn>

        <v-btn
          v-if="isAvailable"
          color="primary"
          variant="flat"
          size="large"
          rounded="lg"
          prepend-icon="mdi-download"
          :href="link"
          target="_blank"
          rel="noopener"
          @click="onDownload"
        >
          {{ t('tools.detail.download') }}
        </v-btn>

        <v-btn
          v-else
          color="primary"
          variant="flat"
          size="large"
          rounded="lg"
          prepend-icon="mdi-bell-outline"
          href="#lien-he"
          @click="close"
        >
          {{ t('tools.detail.notify') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-snackbar v-model="demoNotice" color="primary" rounded="lg" location="bottom" timeout="4500">
    {{ t('tools.detail.demoClick') }}
  </v-snackbar>
</template>

<style scoped>
.tool-dialog__hero {
  position: relative;
  isolation: isolate;
  border-bottom: 1px solid color-mix(in srgb, rgb(var(--v-theme-on-surface)) 8%, transparent);
}

/* Dải màu của công cụ phủ mờ phía sau tiêu đề để mỗi dự án có sắc thái riêng. */
.tool-dialog__hero::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: var(--tool-accent);
  opacity: 0.16;
}

.icon-tile__logo {
  width: 34px;
  height: 34px;
  object-fit: contain;
}

.tool-dialog__heading {
  font-size: 1.0625rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  margin-bottom: 10px;
}

.tool-dialog__paragraph {
  line-height: 1.75;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.86;
}

.tool-dialog__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}

.tool-dialog__list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  line-height: 1.6;
}

.tool-dialog__list-icon {
  margin-top: 2px;
  color: rgb(var(--v-theme-primary));
  flex-shrink: 0;
}

.tool-dialog__meta {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, rgb(var(--v-theme-on-surface)) 10%, transparent);
  background: color-mix(in srgb, rgb(var(--v-theme-surface)) 70%, transparent);
}

.tool-dialog__meta-icon {
  color: rgb(var(--v-theme-primary));
  margin-bottom: 2px;
}

.tool-dialog__meta-label {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.6;
}

.tool-dialog__meta-value {
  font-size: 0.9375rem;
  font-weight: 600;
}

.tool-dialog__actions {
  position: sticky;
  bottom: 0;
  background: rgb(var(--v-theme-surface));
}

.tool-dialog__link {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  min-width: 0;
}

.tool-dialog__link-label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.55;
}

.tool-dialog__link-value {
  font-size: 0.8125rem;
  padding: 2px 8px;
  border-radius: 8px;
  background: color-mix(in srgb, rgb(var(--v-theme-primary)) 12%, transparent);
  color: rgb(var(--v-theme-primary));
}
</style>
