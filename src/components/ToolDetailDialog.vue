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

// Nội dung mở rộng: chỉ công cụ nào có dữ liệu mới hiện thêm các mục này.
const features = computed(() => details.value.features ?? [])
const gallery = computed(() => props.tool?.gallery ?? [])
const formats = computed(() => details.value.formats ?? null)
const formatItems = computed(() => formats.value?.items ?? [])
const shortcuts = computed(() => details.value.shortcuts ?? [])
const note = computed(() => details.value.note ?? '')

const hasRichContent = computed(
  () =>
    features.value.length > 0 ||
    gallery.value.length > 0 ||
    formatItems.value.length > 0 ||
    shortcuts.value.length > 0,
)

// Hộp thoại rộng hơn khi có ảnh chụp và lưới tính năng để nội dung thở hơn.
const dialogWidth = computed(() => (hasRichContent.value ? 980 : 840))

// Link tải là dữ liệu mẫu (`#`) → hiện ghi chú demo thay vì điều hướng đi đâu đó.
const link = computed(() => props.tool?.link ?? '#')
const isDemo = computed(() => isDemoLink(link.value))

// Chỉ hiện ô thông tin nào có dữ liệu, để công cụ đang làm không bị trống trải.
const metaFields = computed(() =>
  [
    // Công cụ chạy trên nhiều hệ điều hành thì hiện “Nền tảng” thay cho “Định dạng”.
    details.value.platform
      ? { key: 'platform', icon: 'mdi-monitor-multiple', value: details.value.platform }
      : { key: 'format', icon: 'mdi-file-outline', value: details.value.format },
    { key: 'version', icon: 'mdi-tag-outline', value: details.value.version },
    { key: 'updated', icon: 'mdi-clock-outline', value: details.value.updated },
    { key: 'license', icon: 'mdi-scale-balance', value: details.value.license },
  ].filter((field) => Boolean(field.value)),
)

const highlights = computed(() => details.value.highlights ?? [])

// Trình xem ảnh lớn: mở từ thư viện ảnh, đi vòng khi tới ảnh đầu/cuối.
const viewerOpen = ref(false)
const viewerIndex = ref(0)
const viewerItem = computed(() => gallery.value[viewerIndex.value] ?? null)

function captionOf(item) {
  const text = item ? lp(item.caption) : ''
  return typeof text === 'string' ? text : ''
}

function openViewer(index) {
  viewerIndex.value = index
  viewerOpen.value = true
}

function stepImage(delta) {
  const total = gallery.value.length
  if (!total) return
  viewerIndex.value = (viewerIndex.value + delta + total) % total
}

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
    :max-width="dialogWidth"
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
        <!-- Ảnh giao diện đặt lên đầu: người xem thấy sản phẩm trước khi đọc mô tả. -->
        <section v-if="gallery.length" class="mb-8">
          <div class="tool-dialog__heading-row">
            <h3 class="tool-dialog__heading mb-0">{{ t('tools.detail.galleryTitle') }}</h3>
            <span class="tool-dialog__heading-hint">
              <v-icon icon="mdi-cursor-default-click-outline" size="14" />
              {{ t('tools.detail.galleryHint') }}
            </span>
          </div>
          <div class="gallery-grid">
            <button
              v-for="(item, index) in gallery"
              :key="item.src"
              type="button"
              class="gallery-item"
              :class="{ 'gallery-item--full': item.span === 'full' }"
              :aria-label="t('tools.detail.galleryLabel', { caption: captionOf(item) })"
              @click="openViewer(index)"
            >
              <span class="gallery-item__media">
                <img :src="item.src" :alt="captionOf(item)" loading="lazy" decoding="async" />
              </span>
              <span class="gallery-item__caption">{{ captionOf(item) }}</span>
            </button>
          </div>
        </section>

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

        <v-row v-if="metaFields.length" class="gy-3 mb-2">
          <v-col v-for="field in metaFields" :key="field.key" cols="12" sm="6" md="3">
            <div class="tool-dialog__meta">
              <v-icon :icon="field.icon" size="18" class="tool-dialog__meta-icon" />
              <span class="tool-dialog__meta-label">{{ t(`tools.detail.meta.${field.key}`) }}</span>
              <span class="tool-dialog__meta-value">{{ field.value }}</span>
            </div>
          </v-col>
        </v-row>

        <section v-if="features.length" class="mb-8">
          <h3 class="tool-dialog__heading">{{ t('tools.detail.featuresTitle') }}</h3>
          <div class="feature-grid">
            <article v-for="feature in features" :key="feature.title" class="feature-card">
              <span class="feature-card__icon">
                <v-icon :icon="feature.icon" size="18" />
              </span>
              <h4 class="feature-card__title">{{ feature.title }}</h4>
              <p class="feature-card__text mb-0">{{ feature.text }}</p>
            </article>
          </div>
        </section>

        <section v-if="formatItems.length" class="mb-8">
          <h3 class="tool-dialog__heading">{{ t('tools.detail.formatsTitle') }}</h3>
          <p v-if="formats.note" class="tool-dialog__paragraph mb-4">{{ formats.note }}</p>
          <ul class="format-list">
            <li v-for="item in formatItems" :key="item.label" class="format-item">
              <v-icon :icon="item.icon" size="20" class="format-item__icon" />
              <span class="format-item__label">{{ item.label }}</span>
              <span class="format-item__text">{{ item.text }}</span>
            </li>
          </ul>
          <p v-if="formats.importNote" class="format-import mb-0">
            <v-icon icon="mdi-import" size="16" />
            <span>{{ formats.importNote }}</span>
          </p>
        </section>

        <section v-if="shortcuts.length" class="mb-8">
          <h3 class="tool-dialog__heading">{{ t('tools.detail.shortcutsTitle') }}</h3>
          <ul class="shortcut-list">
            <li v-for="item in shortcuts" :key="item.keys" class="shortcut-item">
              <kbd class="shortcut-item__keys">{{ item.keys }}</kbd>
              <span class="shortcut-item__action">{{ item.action }}</span>
            </li>
          </ul>
        </section>

        <v-alert
          v-if="note"
          color="info"
          variant="tonal"
          rounded="lg"
          density="comfortable"
          icon="mdi-information-outline"
        >
          {{ note }}
        </v-alert>

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

  <!-- Xem ảnh giao diện ở kích thước lớn, có nút chuyển ảnh trước/sau. -->
  <v-dialog
    v-model="viewerOpen"
    max-width="1180"
    :fullscreen="$vuetify.display.smAndDown"
    transition="fade-transition"
  >
    <v-card class="image-viewer" :rounded="$vuetify.display.smAndDown ? 0 : 'xl'" elevation="0">
      <div class="image-viewer__stage">
        <img
          v-if="viewerItem"
          :src="viewerItem.src"
          :alt="captionOf(viewerItem)"
          class="image-viewer__img"
        />
      </div>
      <div class="image-viewer__bar">
        <v-btn
          icon
          variant="text"
          size="small"
          :aria-label="t('tools.detail.viewerPrev')"
          @click="stepImage(-1)"
        >
          <v-icon icon="mdi-chevron-left" />
        </v-btn>

        <div class="image-viewer__meta">
          <p class="image-viewer__caption mb-0">{{ captionOf(viewerItem) }}</p>
          <span class="image-viewer__counter">{{ viewerIndex + 1 }} / {{ gallery.length }}</span>
        </div>

        <v-btn
          icon
          variant="text"
          size="small"
          :aria-label="t('tools.detail.viewerNext')"
          @click="stepImage(1)"
        >
          <v-icon icon="mdi-chevron-right" />
        </v-btn>

        <v-btn
          icon
          variant="text"
          size="small"
          :aria-label="t('tools.detail.viewerClose')"
          @click="viewerOpen = false"
        >
          <v-icon icon="mdi-close" />
        </v-btn>
      </div>
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

.tool-dialog__heading-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 6px 12px;
  margin-bottom: 14px;
}

.tool-dialog__heading-hint {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.6;
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

/* ---------- Lưới tính năng chi tiết ---------- */
.feature-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
}

.feature-card {
  display: grid;
  gap: 6px;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid color-mix(in srgb, rgb(var(--v-theme-on-surface)) 9%, transparent);
  background: color-mix(in srgb, rgb(var(--v-theme-primary)) 4%, transparent);
  transition: border-color 0.25s ease;
}

.feature-card:hover {
  border-color: color-mix(in srgb, rgb(var(--v-theme-primary)) 38%, transparent);
}

.feature-card__icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 11px;
  color: rgb(var(--v-theme-primary));
  background: color-mix(in srgb, rgb(var(--v-theme-primary)) 14%, transparent);
}

.feature-card__title {
  font-size: 0.9375rem;
  font-weight: 700;
  line-height: 1.4;
  margin: 0;
}

.feature-card__text {
  font-size: 0.8438rem;
  line-height: 1.65;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.76;
}

/* ---------- Thư viện ảnh giao diện ---------- */
.gallery-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.gallery-item {
  display: grid;
  gap: 8px;
  padding: 0;
  border: 0;
  background: none;
  text-align: left;
  cursor: zoom-in;
  border-radius: 16px;
}

.gallery-item--full {
  grid-column: 1 / -1;
}

.gallery-item__media {
  display: block;
  overflow: hidden;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, rgb(var(--v-theme-on-surface)) 10%, transparent);
  background: color-mix(in srgb, rgb(var(--v-theme-on-surface)) 5%, transparent);
  transition:
    border-color 0.25s ease,
    box-shadow 0.3s ease,
    transform 0.3s ease;
}

.gallery-item__media img {
  display: block;
  width: 100%;
  aspect-ratio: 19 / 10;
  object-fit: cover;
  object-position: top center;
}

.gallery-item--full .gallery-item__media img {
  aspect-ratio: auto;
  height: auto;
}

.gallery-item:hover .gallery-item__media,
.gallery-item:focus-visible .gallery-item__media {
  border-color: color-mix(in srgb, rgb(var(--v-theme-primary)) 55%, transparent);
  box-shadow: var(--vnf-shadow-soft);
  transform: translateY(-3px);
}

.gallery-item__caption {
  font-size: 0.8125rem;
  line-height: 1.55;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.75;
}

/* ---------- Định dạng xuất & nhập ---------- */
.format-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}

.format-item {
  display: grid;
  grid-template-columns: auto minmax(120px, max-content) 1fr;
  align-items: baseline;
  gap: 6px 12px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, rgb(var(--v-theme-on-surface)) 9%, transparent);
  background: color-mix(in srgb, rgb(var(--v-theme-surface)) 70%, transparent);
}

.format-item__icon {
  color: rgb(var(--v-theme-primary));
  align-self: center;
}

.format-item__label {
  font-size: 0.875rem;
  font-weight: 700;
  white-space: nowrap;
}

.format-item__text {
  font-size: 0.8438rem;
  line-height: 1.6;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.76;
}

.format-import {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  font-size: 0.8438rem;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.7;
}

/* ---------- Phím tắt ---------- */
.shortcut-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, rgb(var(--v-theme-on-surface)) 9%, transparent);
}

.shortcut-item__keys {
  flex-shrink: 0;
  font-family: 'SFMono-Regular', ui-monospace, Menlo, Consolas, monospace;
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: 8px;
  background: color-mix(in srgb, rgb(var(--v-theme-primary)) 12%, transparent);
  color: rgb(var(--v-theme-primary));
}

.shortcut-item__action {
  font-size: 0.8125rem;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.8;
}

/* ---------- Ô thông tin nhanh ---------- */
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

/* ---------- Trình xem ảnh lớn ---------- */
.image-viewer {
  background: #0b1020 !important;
  overflow: hidden;
}

.image-viewer__stage {
  display: grid;
  place-items: center;
  max-height: 76vh;
  overflow: auto;
  background: #0b1020;
}

.image-viewer__img {
  display: block;
  max-width: 100%;
  height: auto;
}

.image-viewer__bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgb(11 16 32 / 96%);
  color: #fff;
  border-top: 1px solid rgb(255 255 255 / 12%);
}

.image-viewer__bar :deep(.v-btn) {
  color: #fff;
}

.image-viewer__meta {
  flex: 1;
  min-width: 0;
  text-align: center;
}

.image-viewer__caption {
  font-size: 0.8438rem;
  line-height: 1.45;
  color: rgb(255 255 255 / 88%);
}

.image-viewer__counter {
  font-size: 0.6875rem;
  letter-spacing: 0.08em;
  color: rgb(255 255 255 / 55%);
}

@media (max-width: 600px) {
  .format-item {
    grid-template-columns: auto 1fr;
  }

  .format-item__text {
    grid-column: 1 / -1;
  }

  .image-viewer__stage {
    max-height: none;
    flex: 1;
  }

  .image-viewer {
    display: flex;
    flex-direction: column;
  }
}
</style>
