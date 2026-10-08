<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import MessageDetailDialog from '@/components/MessageDetailDialog.vue'
import { useDateFormat } from '@/composables/useDateFormat'
import { useLocale } from '@/composables/useLocale'
import { useMessages } from '@/composables/useMessages'
import { accentGradient } from '@/data/accents'
import {
  MESSAGE_SORTS,
  MESSAGE_STATUSES,
  MESSAGE_TYPES,
  inboxConfig,
  messageStatusMeta,
  messageTypeMeta,
  readApiSettings,
  remoteProvider,
  saveApiSettings,
  testApiConnection,
} from '@/data/inbox'

const { t } = useLocale()
const { formatDateTime, formatRelative } = useDateFormat()
const {
  messages,
  stats,
  remoteState,
  isRemoteInboxEnabled,
  clearAll,
  loadDemoMessages,
  clearDemoMessages,
  removeMessage,
  toggleStar,
  markRead,
  setStatus,
  exportJson,
  exportCsv,
  importJson,
  syncFromRemote,
} = useMessages()

const search = ref('')
const statusFilter = ref('all')
const typeFilter = ref('all')
const sort = ref('newest')
const selectedId = ref(null)
const dialogOpen = ref(false)
const fileInput = ref(null)
const notice = ref({ show: false, text: '', color: 'success' })

/* ---------------- Cấu hình backend Express + MongoDB ---------------- */

const apiDialog = ref(false)
const apiForm = ref({ baseUrl: '', adminToken: '' })
const apiTest = ref({ testing: false, ok: null, message: '' })
const showToken = ref(false)

// Giữ cấu hình backend trong ref để giao diện tự cập nhật ngay sau khi lưu.
const apiSettings = ref(readApiSettings())

// Trạng thái kết nối hiển thị trên tiêu đề trang.
const backendConnected = computed(() =>
  remoteProvider() === 'api' ? Boolean(apiSettings.value.baseUrl) : isRemoteInboxEnabled(),
)
const backendLabel = computed(() => {
  if (!backendConnected.value) return t('inbox.remote.off')
  return remoteProvider() === 'api' ? t('inbox.remote.onApi') : t('inbox.remote.onScript')
})

function openApiDialog() {
  apiForm.value = readApiSettings()
  apiTest.value = { testing: false, ok: null, message: '' }
  apiDialog.value = true
}

async function runApiTest() {
  apiTest.value = { testing: true, ok: null, message: '' }
  const result = await testApiConnection(apiForm.value)
  apiTest.value = { testing: false, ok: result.ok, message: result.message }
  return result
}

async function saveApi() {
  saveApiSettings(apiForm.value)
  apiSettings.value = readApiSettings()
  apiDialog.value = false
  showNotice(t('inbox.api.saved'))
  await syncFromRemote()
}

async function clearApi() {
  saveApiSettings({ baseUrl: '', adminToken: '' })
  apiSettings.value = readApiSettings()
  apiDialog.value = false
  apiTest.value = { testing: false, ok: null, message: '' }
  showNotice(t('inbox.api.cleared'), 'warning')
}

// Lấy tin nhắn từ store theo id để nội dung trong hộp thoại luôn mới nhất.
const selectedItem = computed(
  () => messages.value.find((item) => item.id === selectedId.value) ?? null,
)

/* ---------------- Cổng mật khẩu (lớp chắn nhẹ) ---------------- */

const GATE_KEY = 'vnfreedocs:inbox-unlocked'
const unlocked = ref(
  typeof sessionStorage !== 'undefined' && sessionStorage.getItem(GATE_KEY) === '1',
)
const gateInput = ref('')
const gateError = ref(false)
const gateRequired = computed(() => Boolean(inboxConfig.admin.passcode) && !unlocked.value)

function submitGate() {
  if (gateInput.value === inboxConfig.admin.passcode) {
    unlocked.value = true
    gateError.value = false
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(GATE_KEY, '1')
    return
  }
  gateError.value = true
}

/* ---------------- Bộ lọc & sắp xếp ---------------- */

const statusOptions = computed(() => [
  { value: 'all', title: t('inbox.filters.allStatuses'), icon: 'mdi-inbox-multiple-outline' },
  ...MESSAGE_STATUSES.map((value) => ({
    value,
    title: t(`inbox.statuses.${value}`),
    icon: messageStatusMeta(value).icon,
  })),
])

const typeOptions = computed(() => [
  { value: 'all', title: t('inbox.filters.allTypes') },
  ...MESSAGE_TYPES.map((value) => ({
    value,
    title: t(`inbox.types.${value}`),
    props: { prependIcon: messageTypeMeta(value).icon },
  })),
])

const sortOptions = MESSAGE_SORTS.map((value) => ({ value, title: t(`inbox.sorts.${value}`) }))

const filteredMessages = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  const list = messages.value.filter((item) => {
    if (statusFilter.value !== 'all' && item.status !== statusFilter.value) return false
    if (typeFilter.value !== 'all' && item.type !== typeFilter.value) return false
    if (!keyword) return true
    return [item.name, item.email, item.phone, item.message, item.note]
      .filter(Boolean)
      .some((text) => String(text).toLowerCase().includes(keyword))
  })

  const bySort = [...list]
  bySort.sort((a, b) => {
    if (sort.value === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
    if (sort.value === 'name') return (a.name || '').localeCompare(b.name || '', 'vi')
    if (sort.value === 'unreadFirst') {
      const unreadDiff = Number(b.status === 'new') - Number(a.status === 'new')
      if (unreadDiff) return unreadDiff
    }
    return new Date(b.createdAt) - new Date(a.createdAt)
  })
  // Tin được đánh dấu sao luôn nổi lên đầu, trừ khi đang sắp xếp theo tên.
  if (sort.value !== 'name') {
    bySort.sort((a, b) => Number(b.starred) - Number(a.starred))
  }
  return bySort
})

const hasFilters = computed(
  () => Boolean(search.value.trim()) || statusFilter.value !== 'all' || typeFilter.value !== 'all',
)

const hasDemo = computed(() => messages.value.some((item) => item.source === 'demo'))

function clearFilters() {
  search.value = ''
  statusFilter.value = 'all'
  typeFilter.value = 'all'
}

/** Nền gradient cho ô icon — trả về object để Vue áp dụng đúng inline style. */
function tileStyle(type) {
  return { background: accentGradient(messageTypeMeta(type).accent) }
}

/* ---------------- Thao tác ---------------- */

// Deep link: #/hop-thu/<id> mở thẳng một tin nhắn (tiện chia sẻ/bookmark).
const INBOX_ROUTE = /^#\/(?:hop-thu|inbox|admin|tin-nhan)(?:\/(.+))?$/i

function messageIdFromHash(hash = typeof window === 'undefined' ? '' : window.location.hash) {
  const match = INBOX_ROUTE.exec(hash || '')
  return match?.[1] ? decodeURIComponent(match[1]).toLowerCase() : ''
}

function syncDialogFromHash() {
  const id = messageIdFromHash()
  if (!id) {
    dialogOpen.value = false
    selectedId.value = null
    return
  }
  const found = messages.value.find((item) => item.id.toLowerCase() === id)
  if (!found) return
  selectedId.value = found.id
  dialogOpen.value = true
  markRead(found.id)
}

function setHashForMessage(id) {
  if (typeof history === 'undefined') return
  history.replaceState(null, '', id ? `#/hop-thu/${encodeURIComponent(id)}` : '#/hop-thu')
}

function openMessage(item) {
  selectedId.value = item.id
  dialogOpen.value = true
  markRead(item.id)
  setHashForMessage(item.id)
}

function onDialogClosed() {
  selectedId.value = null
  setHashForMessage('')
}

function showNotice(text, color = 'success') {
  notice.value = { show: true, text, color }
}

function onClearAll() {
  if (!window.confirm(t('inbox.actions.clearAllConfirm'))) return
  clearAll()
  showNotice(t('inbox.notice.cleared'), 'warning')
}

function onDelete(item) {
  removeMessage(item.id)
  showNotice(t('inbox.notice.deleted'))
}

function openFilePicker() {
  fileInput.value?.click()
}

async function onFileChange(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  try {
    const count = importJson(await file.text())
    showNotice(count ? t('inbox.notice.imported', { count }) : t('inbox.notice.importEmpty'))
  } catch {
    showNotice(t('inbox.notice.importError'), 'error')
  }
}

function onExportJson() {
  exportJson()
  showNotice(t('inbox.notice.exported'))
}

function onExportCsv() {
  exportCsv()
  showNotice(t('inbox.notice.exported'))
}

function onLoadDemo() {
  const count = loadDemoMessages()
  showNotice(t('inbox.notice.demoLoaded', { count }))
}

function onClearDemo() {
  clearDemoMessages()
  showNotice(t('inbox.notice.demoCleared'))
}

onMounted(async () => {
  syncDialogFromHash()
  window.addEventListener('hashchange', syncDialogFromHash)
  if (!isRemoteInboxEnabled()) return
  const result = await syncFromRemote()
  if (!result.ok && !result.skipped) {
    showNotice(t('inbox.remote.error', { message: remoteState.value.error }), 'warning')
  }
})

onBeforeUnmount(() => window.removeEventListener('hashchange', syncDialogFromHash))
</script>

<template>
  <section id="hop-thu" class="section-block inbox">
    <v-container class="section-shell">
      <!-- Cổng mật khẩu -->
      <v-card
        v-if="gateRequired"
        v-reveal
        class="surface-card inbox__gate mx-auto"
        elevation="0"
        rounded="xl"
      >
        <div class="pa-8 pa-md-10 text-center">
          <span
            class="icon-tile mx-auto mb-5"
            :style="{ background: 'var(--vnf-gradient)', width: '56px', height: '56px' }"
          >
            <v-icon icon="mdi-lock-outline" size="26" />
          </span>
          <h1 class="text-h5 font-weight-bold mb-2">{{ t('inbox.gate.title') }}</h1>
          <p class="text-body-2 text-medium-emphasis mb-6">{{ t('inbox.gate.subtitle') }}</p>

          <v-text-field
            v-model="gateInput"
            :label="t('inbox.gate.label')"
            type="password"
            prepend-inner-icon="mdi-key-outline"
            :error="gateError"
            :error-messages="gateError ? [t('inbox.gate.wrong')] : []"
            class="mb-2"
            @keyup.enter="submitGate"
          />

          <v-btn
            block
            color="primary"
            size="large"
            class="mt-3"
            prepend-icon="mdi-login-variant"
            @click="submitGate"
          >
            {{ t('inbox.gate.submit') }}
          </v-btn>

          <p class="text-caption text-medium-emphasis mt-5 mb-0">{{ t('inbox.gate.hint') }}</p>
          <v-btn variant="text" size="small" class="mt-3" href="#top" prepend-icon="mdi-arrow-left">
            {{ t('inbox.backHome') }}
          </v-btn>
        </div>
      </v-card>

      <template v-else>
        <!-- Tiêu đề -->
        <div
          v-reveal
          class="d-flex flex-column flex-md-row align-md-center justify-space-between ga-4 mb-8"
        >
          <div>
            <v-chip
              color="primary"
              variant="tonal"
              size="small"
              prepend-icon="mdi-inbox-arrow-down-outline"
              class="mb-4"
            >
              {{ t('inbox.eyebrow') }}
            </v-chip>
            <h1 class="inbox__heading mb-2">{{ t('inbox.title') }}</h1>
            <p class="text-body-2 text-medium-emphasis mb-0">{{ t('inbox.subtitle') }}</p>
          </div>

          <div class="d-flex flex-column align-md-end ga-2">
            <v-btn variant="tonal" color="primary" prepend-icon="mdi-arrow-left" href="#top">
              {{ t('inbox.backHome') }}
            </v-btn>
            <v-chip
              size="small"
              variant="outlined"
              :color="backendConnected ? 'success' : 'grey'"
              :prepend-icon="backendConnected ? 'mdi-cloud-check-outline' : 'mdi-laptop'"
            >
              {{ backendLabel }}
            </v-chip>
            <v-btn
              variant="text"
              size="small"
              prepend-icon="mdi-server-network"
              @click="openApiDialog"
            >
              {{ t('inbox.api.open') }}
            </v-btn>
          </div>
        </div>

        <!-- Thống kê -->
        <v-row v-reveal class="gy-4 mb-6">
          <v-col
            v-for="tile in ['total', 'unread', 'replied', 'starred']"
            :key="tile"
            cols="6"
            md="3"
          >
            <v-card class="surface-card inbox__stat h-100" elevation="0" rounded="xl">
              <div class="pa-5">
                <div class="d-flex align-center ga-2 mb-2">
                  <v-icon
                    :icon="
                      tile === 'total'
                        ? 'mdi-email-multiple-outline'
                        : tile === 'unread'
                          ? 'mdi-email-outline'
                          : tile === 'replied'
                            ? 'mdi-reply-outline'
                            : 'mdi-star-outline'
                    "
                    size="18"
                    color="primary"
                  />
                  <span class="text-caption text-medium-emphasis">{{
                    t(`inbox.stats.${tile}`)
                  }}</span>
                </div>
                <div class="inbox__stat-value">{{ stats[tile] }}</div>
                <div v-if="tile === 'total'" class="text-caption text-medium-emphasis">
                  {{ t('inbox.stats.last7d', { count: stats.last7d }) }}
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Thanh công cụ -->
        <v-card v-reveal class="glass-card mb-6" elevation="0" rounded="xl">
          <div class="pa-5 pa-md-6 d-flex flex-column ga-4">
            <div class="d-flex flex-column flex-md-row align-md-center ga-3">
              <v-text-field
                v-model="search"
                :placeholder="t('inbox.filters.searchPlaceholder')"
                prepend-inner-icon="mdi-magnify"
                clearable
                hide-details
                class="flex-grow-1"
              />

              <v-select
                v-model="typeFilter"
                :items="typeOptions"
                :label="t('inbox.filters.type')"
                hide-details
                class="inbox__select"
              />

              <v-select
                v-model="sort"
                :items="sortOptions"
                :label="t('inbox.filters.sort')"
                hide-details
                prepend-inner-icon="mdi-sort-variant"
                class="inbox__select"
              />

              <v-btn
                v-if="backendConnected"
                variant="tonal"
                color="primary"
                :loading="remoteState.loading"
                prepend-icon="mdi-refresh"
                @click="syncFromRemote()"
              >
                {{ t('inbox.refresh') }}
              </v-btn>

              <v-menu location="bottom end">
                <template #activator="{ props: menuProps }">
                  <v-btn
                    v-bind="menuProps"
                    variant="tonal"
                    icon="mdi-dots-horizontal"
                    :aria-label="t('inbox.filters.more')"
                  />
                </template>
                <v-list density="comfortable" min-width="240">
                  <v-list-item
                    prepend-icon="mdi-file-delimited-outline"
                    :title="t('inbox.actions.exportCsv')"
                    @click="onExportCsv"
                  />
                  <v-list-item
                    prepend-icon="mdi-code-json"
                    :title="t('inbox.actions.exportJson')"
                    @click="onExportJson"
                  />
                  <v-list-item
                    prepend-icon="mdi-file-import-outline"
                    :title="t('inbox.actions.import')"
                    @click="openFilePicker"
                  />
                  <v-divider class="my-2" />
                  <v-list-item
                    prepend-icon="mdi-trash-can-outline"
                    :title="t('inbox.actions.clearAll')"
                    class="text-error"
                    @click="onClearAll"
                  />
                </v-list>
              </v-menu>
            </div>

            <div class="d-flex flex-column flex-md-row align-md-center justify-space-between ga-3">
              <v-chip-group
                v-model="statusFilter"
                mandatory
                filter
                selected-class="text-primary"
                class="inbox__chips"
              >
                <v-chip
                  v-for="option in statusOptions"
                  :key="option.value"
                  :value="option.value"
                  filter
                  variant="outlined"
                  :prepend-icon="option.icon"
                >
                  {{ option.title }}
                  <span v-if="option.value === 'new' && stats.unread" class="ml-2 font-weight-bold">
                    {{ stats.unread }}
                  </span>
                </v-chip>
              </v-chip-group>

              <div class="d-flex align-center ga-3">
                <span class="text-body-2 text-medium-emphasis">
                  {{ t('inbox.filters.results', { count: filteredMessages.length }) }}
                </span>
                <v-btn
                  v-if="hasFilters"
                  variant="text"
                  size="small"
                  color="primary"
                  prepend-icon="mdi-filter-off-outline"
                  @click="clearFilters"
                >
                  {{ t('inbox.filters.clear') }}
                </v-btn>
              </div>
            </div>
          </div>
        </v-card>

        <input
          ref="fileInput"
          type="file"
          accept="application/json,.json"
          class="d-none"
          @change="onFileChange"
        />

        <v-alert
          v-if="!backendConnected"
          v-reveal
          color="secondary"
          variant="tonal"
          rounded="xl"
          density="comfortable"
          icon="mdi-server-off"
          class="mb-6"
        >
          <div class="d-flex flex-column flex-md-row align-md-center ga-3">
            <span class="flex-grow-1">{{ t('inbox.api.missing') }}</span>
            <v-btn
              variant="tonal"
              color="secondary"
              size="small"
              class="flex-grow-0"
              @click="openApiDialog"
            >
              {{ t('inbox.api.setup') }}
            </v-btn>
          </div>
        </v-alert>

        <v-alert
          v-if="hasDemo"
          v-reveal
          color="info"
          variant="tonal"
          rounded="xl"
          density="comfortable"
          icon="mdi-flask-outline"
          class="mb-6"
        >
          <div class="d-flex flex-column flex-md-row align-md-center ga-3">
            <span class="flex-grow-1">{{ t('inbox.demoBanner') }}</span>
            <v-btn
              variant="tonal"
              color="info"
              size="small"
              class="flex-grow-0"
              @click="onClearDemo"
            >
              {{ t('inbox.clearDemo') }}
            </v-btn>
          </div>
        </v-alert>

        <v-alert
          v-if="remoteState.error"
          v-reveal
          color="warning"
          variant="tonal"
          rounded="xl"
          density="comfortable"
          icon="mdi-cloud-alert-outline"
          class="mb-6"
        >
          {{ t('inbox.remote.error', { message: remoteState.error }) }}
        </v-alert>

        <!-- Danh sách tin nhắn -->
        <div v-if="filteredMessages.length" class="d-flex flex-column ga-4">
          <v-card
            v-for="(item, index) in filteredMessages"
            :key="item.id"
            v-reveal="{ delay: Math.min(index, 6) * 60 }"
            class="surface-card hover-lift inbox-item"
            :class="{ 'inbox-item--unread': item.status === 'new' }"
            elevation="0"
            rounded="xl"
            role="button"
            tabindex="0"
            @click="openMessage(item)"
            @keydown.enter="openMessage(item)"
          >
            <div class="pa-5 d-flex align-start ga-4">
              <span
                class="icon-tile flex-shrink-0"
                :style="[tileStyle(item.type), { width: '46px', height: '46px' }]"
              >
                <v-icon :icon="messageTypeMeta(item.type).icon" size="22" />
              </span>

              <div class="flex-grow-1 min-w-0">
                <div class="d-flex align-center flex-wrap ga-2 mb-1">
                  <span class="inbox-item__name">{{ item.name || '—' }}</span>
                  <v-chip
                    :color="messageStatusMeta(item.status).color"
                    variant="tonal"
                    size="x-small"
                    :prepend-icon="messageStatusMeta(item.status).icon"
                    label
                  >
                    {{ t(`inbox.statuses.${item.status}`) }}
                  </v-chip>
                  <v-chip size="x-small" variant="outlined" label>
                    {{ t(`inbox.types.${item.type}`) }}
                  </v-chip>
                </div>

                <div class="text-caption text-medium-emphasis mb-2">
                  {{ item.email || t('inbox.detail.noContact') }}
                  <template v-if="item.phone"> · {{ item.phone }}</template>
                  · {{ formatRelative(item.createdAt) }}
                </div>

                <p class="inbox-item__snippet mb-0">{{ item.message }}</p>

                <p v-if="item.note" class="inbox-item__note mb-0">
                  <v-icon icon="mdi-note-text-outline" size="14" />
                  {{ item.note }}
                </p>
              </div>

              <div class="d-flex flex-column align-end ga-2 flex-shrink-0">
                <span class="text-caption text-medium-emphasis inbox__nowrap">
                  {{ formatDateTime(item.createdAt) }}
                </span>
                <div class="d-flex ga-1">
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    :aria-label="item.starred ? t('inbox.actions.unstar') : t('inbox.actions.star')"
                    @click.stop="toggleStar(item.id)"
                  >
                    <v-icon
                      :icon="item.starred ? 'mdi-star' : 'mdi-star-outline'"
                      :color="item.starred ? 'warning' : undefined"
                      size="18"
                    />
                  </v-btn>
                  <v-btn
                    v-if="item.status === 'new'"
                    icon
                    size="small"
                    variant="text"
                    :aria-label="t('inbox.actions.markRead')"
                    @click.stop="markRead(item.id)"
                  >
                    <v-icon icon="mdi-email-open-outline" size="18" />
                  </v-btn>
                  <v-btn
                    v-else
                    icon
                    size="small"
                    variant="text"
                    :aria-label="t('inbox.actions.archive')"
                    @click.stop="
                      setStatus(item.id, item.status === 'archived' ? 'read' : 'archived')
                    "
                  >
                    <v-icon
                      :icon="
                        item.status === 'archived'
                          ? 'mdi-archive-arrow-up-outline'
                          : 'mdi-archive-outline'
                      "
                      size="18"
                    />
                  </v-btn>
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    color="error"
                    :aria-label="t('inbox.actions.delete')"
                    @click.stop="onDelete(item)"
                  >
                    <v-icon icon="mdi-trash-can-outline" size="18" />
                  </v-btn>
                </div>
              </div>
            </div>
          </v-card>
        </div>

        <!-- Trạng thái rỗng -->
        <v-sheet v-else v-reveal class="glass-card pa-10 text-center" elevation="0" rounded="xl">
          <v-icon icon="mdi-inbox-outline" size="46" color="primary" class="mb-3" />
          <h3 class="text-h6 font-weight-bold mb-2">
            {{ hasFilters ? t('inbox.empty.filtered') : t('inbox.empty.title') }}
          </h3>
          <p class="text-body-2 text-medium-emphasis mb-0">
            {{ hasFilters ? t('inbox.empty.filteredHint') : t('inbox.empty.subtitle') }}
          </p>
          <div class="d-flex flex-wrap justify-center ga-3 mt-6">
            <v-btn
              v-if="hasFilters"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-filter-off-outline"
              @click="clearFilters"
            >
              {{ t('inbox.filters.clear') }}
            </v-btn>
            <v-btn
              v-else-if="inboxConfig.seedDemo"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-flask-outline"
              @click="onLoadDemo"
            >
              {{ t('inbox.empty.loadDemo') }}
            </v-btn>
            <v-btn variant="text" href="#top" prepend-icon="mdi-arrow-left">
              {{ t('inbox.backHome') }}
            </v-btn>
          </div>
        </v-sheet>
      </template>
    </v-container>

    <MessageDetailDialog
      v-model="dialogOpen"
      :message="selectedItem"
      @after-leave="onDialogClosed"
    />

    <!-- Cấu hình backend Express + MongoDB -->
    <v-dialog
      v-model="apiDialog"
      :max-width="620"
      :fullscreen="$vuetify.display.smAndDown"
      scrollable
    >
      <v-card class="surface-card" :rounded="$vuetify.display.smAndDown ? 0 : 'xl'" elevation="0">
        <div class="pa-6 pa-md-7 d-flex align-start ga-4">
          <span
            class="icon-tile"
            :style="{ background: 'var(--vnf-gradient)', width: '46px', height: '46px' }"
          >
            <v-icon icon="mdi-server-network" size="22" />
          </span>
          <div class="flex-grow-1 min-w-0">
            <h2 class="text-h6 font-weight-bold mb-1">{{ t('inbox.api.title') }}</h2>
            <p class="text-body-2 text-medium-emphasis mb-0">{{ t('inbox.api.subtitle') }}</p>
          </div>
          <v-btn
            icon
            variant="text"
            size="small"
            :aria-label="t('inbox.detail.close')"
            @click="apiDialog = false"
          >
            <v-icon icon="mdi-close" />
          </v-btn>
        </div>

        <v-divider />

        <v-card-text class="pa-6 pa-md-7">
          <v-text-field
            v-model="apiForm.baseUrl"
            :label="t('inbox.api.baseUrl')"
            :placeholder="t('inbox.api.baseUrlPlaceholder')"
            :hint="t('inbox.api.baseUrlHint')"
            prepend-inner-icon="mdi-web"
            persistent-hint
            class="mb-6"
          />

          <v-text-field
            v-model="apiForm.adminToken"
            :label="t('inbox.api.adminToken')"
            :hint="t('inbox.api.adminTokenHint')"
            :type="showToken ? 'text' : 'password'"
            :append-inner-icon="showToken ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
            prepend-inner-icon="mdi-key-outline"
            persistent-hint
            autocomplete="off"
            @click:append-inner="showToken = !showToken"
          />

          <v-alert
            v-if="apiTest.message"
            :color="apiTest.ok ? 'success' : 'warning'"
            variant="tonal"
            rounded="lg"
            density="comfortable"
            :icon="apiTest.ok ? 'mdi-check-circle-outline' : 'mdi-alert-outline'"
            class="mt-6"
          >
            {{ apiTest.message }}
          </v-alert>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-6 pa-md-7 flex-wrap ga-3">
          <v-btn
            variant="text"
            color="error"
            prepend-icon="mdi-link-off"
            :disabled="!backendConnected"
            @click="clearApi"
          >
            {{ t('inbox.api.clear') }}
          </v-btn>
          <v-spacer />
          <v-btn
            variant="tonal"
            color="primary"
            prepend-icon="mdi-connection"
            :loading="apiTest.testing"
            @click="runApiTest"
          >
            {{ apiTest.testing ? t('inbox.api.testing') : t('inbox.api.test') }}
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            size="large"
            rounded="lg"
            prepend-icon="mdi-content-save-outline"
            @click="saveApi"
          >
            {{ t('inbox.api.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="notice.show"
      :color="notice.color"
      rounded="lg"
      :timeout="4000"
      location="bottom"
    >
      {{ notice.text }}
      <template #actions>
        <v-btn variant="text" @click="notice.show = false">OK</v-btn>
      </template>
    </v-snackbar>
  </section>
</template>

<style scoped>
.inbox__gate {
  max-width: 460px;
}

.inbox__heading {
  font-size: clamp(1.7rem, 3.4vw, 2.4rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.inbox__stat-value {
  font-size: 1.9rem;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.inbox__select {
  flex: 0 0 auto;
  width: 100%;
}

.inbox__nowrap {
  white-space: nowrap;
}

.inbox-item {
  cursor: pointer;
}

.inbox-item--unread {
  border-left: 4px solid rgb(var(--v-theme-primary)) !important;
}

.inbox-item__name {
  font-size: 1rem;
  font-weight: 700;
}

.inbox-item__snippet {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 0.9rem;
  line-height: 1.6;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.82;
}

.inbox-item--unread .inbox-item__snippet {
  opacity: 1;
  font-weight: 500;
}

.inbox-item__note {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 0.75rem;
  color: rgb(var(--v-theme-primary));
  background: color-mix(in srgb, rgb(var(--v-theme-primary)) 10%, transparent);
}

@media (min-width: 960px) {
  .inbox__select {
    width: 210px;
  }
}

@media (max-width: 959px) {
  /* Vuetify mặc định cho chip-group cuộn ngang; cho xuống dòng để thấy hết trạng thái. */
  .inbox__chips {
    width: 100%;
    overflow: visible;
  }

  .inbox__chips :deep(.v-slide-group__container) {
    overflow: visible;
  }

  .inbox__chips :deep(.v-slide-group__content) {
    flex-wrap: wrap;
    width: 100%;
    min-width: 0;
  }
}
</style>
