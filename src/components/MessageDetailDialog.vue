<script setup>
import { computed, ref, watch } from 'vue'
import { useCopy } from '@/composables/useCopy'
import { useDateFormat } from '@/composables/useDateFormat'
import { useLocale } from '@/composables/useLocale'
import { useMessages } from '@/composables/useMessages'
import { accentGradient } from '@/data/accents'
import { messageStatusMeta, messageTypeMeta } from '@/data/inbox'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  message: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'afterLeave', 'removed'])

const { t } = useLocale()
const { formatDateTime, formatRelative } = useDateFormat()
const { setStatus, toggleStar, setNote, removeMessage, updateMessage } = useMessages()
const { copied, copy } = useCopy()

const note = ref('')
const noteSaved = ref(false)
const confirmDelete = ref(false)

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const typeMeta = computed(() => messageTypeMeta(props.message?.type))
const statusMeta = computed(() => messageStatusMeta(props.message?.status))
const tileStyle = computed(() => ({ background: accentGradient(typeMeta.value.accent) }))

const sourceLabel = computed(() => t(`inbox.detail.sources.${props.message?.source ?? 'website'}`))

const statusOptions = computed(() =>
  ['new', 'read', 'replied', 'archived'].map((value) => ({
    value,
    title: t(`inbox.statuses.${value}`),
    icon: messageStatusMeta(value).icon,
  })),
)

const mailtoHref = computed(() => {
  const message = props.message
  if (!message?.email) return ''
  const subject = t('inbox.detail.replySubject')
  const body = t('inbox.detail.replyTemplate', {
    name: message.name || t('inbox.detail.friend'),
    message: message.message,
  })
  return `mailto:${message.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
})

// Đồng bộ ghi chú mỗi khi mở tin nhắn khác.
watch(
  () => [props.modelValue, props.message?.id],
  ([open]) => {
    if (!open) return
    note.value = props.message?.note ?? ''
    noteSaved.value = false
    confirmDelete.value = false
  },
  { immediate: true },
)

function close() {
  show.value = false
}

function changeStatus(value) {
  if (!props.message) return
  setStatus(props.message.id, value)
}

function onReply() {
  if (!props.message) return
  if (props.message.status !== 'replied') setStatus(props.message.id, 'replied')
}

function saveNote() {
  if (!props.message) return
  setNote(props.message.id, note.value)
  noteSaved.value = true
  setTimeout(() => (noteSaved.value = false), 2500)
}

function onDelete() {
  if (!props.message) return
  if (!confirmDelete.value) {
    confirmDelete.value = true
    return
  }
  removeMessage(props.message.id)
  confirmDelete.value = false
  emit('removed', props.message.id)
  close()
}

async function copyEmail() {
  if (!props.message?.email) return
  await copy(props.message.email)
}

function markUnread() {
  if (!props.message) return
  updateMessage(props.message.id, { status: 'new', readAt: null, repliedAt: null })
}
</script>

<template>
  <v-dialog
    v-model="show"
    :max-width="880"
    :fullscreen="$vuetify.display.smAndDown"
    :aria-label="t('inbox.detail.dialogLabel')"
    scrollable
    transition="dialog-bottom-transition"
    @after-leave="emit('afterLeave')"
  >
    <v-card
      v-if="message"
      class="message-dialog surface-card"
      :rounded="$vuetify.display.smAndDown ? 0 : 'xl'"
      elevation="0"
    >
      <div class="message-dialog__hero" :style="{ '--message-accent': tileStyle.background }">
        <div class="pa-6 pa-md-7">
          <div class="d-flex align-start ga-4">
            <span class="icon-tile" :style="[tileStyle, { width: '54px', height: '54px' }]">
              <v-icon :icon="typeMeta.icon" size="26" />
            </span>

            <div class="flex-grow-1 min-w-0">
              <div class="d-flex flex-wrap align-center ga-2 mb-2">
                <v-chip
                  :color="typeMeta.color"
                  variant="tonal"
                  size="small"
                  :prepend-icon="typeMeta.icon"
                  label
                >
                  {{ t(`inbox.types.${message.type}`) }}
                </v-chip>
                <v-chip
                  :color="statusMeta.color"
                  variant="tonal"
                  size="small"
                  :prepend-icon="statusMeta.icon"
                  label
                >
                  {{ t(`inbox.statuses.${message.status}`) }}
                </v-chip>
                <v-chip v-if="message.starred" color="warning" variant="tonal" size="small" label>
                  <v-icon icon="mdi-star" size="14" start />
                  {{ t('inbox.stats.starred') }}
                </v-chip>
              </div>

              <h2 class="text-h6 text-md-h5 font-weight-bold mb-1">{{ message.name || '—' }}</h2>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ message.email || t('inbox.detail.noContact') }} ·
                {{ formatRelative(message.createdAt) }}
              </p>
            </div>

            <v-btn
              icon
              variant="text"
              size="small"
              :aria-label="message.starred ? t('inbox.actions.unstar') : t('inbox.actions.star')"
              @click="toggleStar(message.id)"
            >
              <v-icon :icon="message.starred ? 'mdi-star' : 'mdi-star-outline'" />
            </v-btn>

            <v-btn
              icon
              variant="text"
              size="small"
              :aria-label="t('inbox.detail.close')"
              @click="close"
            >
              <v-icon icon="mdi-close" />
            </v-btn>
          </div>
        </div>
      </div>

      <v-card-text class="pa-6 pa-md-7">
        <div class="message-dialog__meta mb-6">
          <div class="message-dialog__meta-item">
            <span class="message-dialog__meta-label">{{ t('inbox.detail.receivedAt') }}</span>
            <span class="message-dialog__meta-value">{{ formatDateTime(message.createdAt) }}</span>
          </div>
          <div class="message-dialog__meta-item">
            <span class="message-dialog__meta-label">{{ t('inbox.detail.updatedAt') }}</span>
            <span class="message-dialog__meta-value">{{
              formatDateTime(message.repliedAt || message.readAt || message.updatedAt)
            }}</span>
          </div>
          <div class="message-dialog__meta-item">
            <span class="message-dialog__meta-label">{{ t('inbox.detail.phone') }}</span>
            <span class="message-dialog__meta-value">{{ message.phone || '—' }}</span>
          </div>
          <div class="message-dialog__meta-item">
            <span class="message-dialog__meta-label">{{ t('inbox.detail.source') }}</span>
            <span class="message-dialog__meta-value">{{ sourceLabel }}</span>
          </div>
        </div>

        <h3 class="message-dialog__heading">{{ t('inbox.detail.contentTitle') }}</h3>
        <p class="message-dialog__message">{{ message.message }}</p>

        <h3 class="message-dialog__heading mt-7">{{ t('inbox.detail.noteTitle') }}</h3>
        <v-textarea
          v-model="note"
          :placeholder="t('inbox.detail.notePlaceholder')"
          :hint="t('inbox.detail.noteHint')"
          rows="2"
          auto-grow
          persistent-hint
        />
        <div class="d-flex align-center ga-3 mt-3">
          <v-btn
            variant="tonal"
            color="primary"
            size="small"
            prepend-icon="mdi-content-save-outline"
            @click="saveNote"
          >
            {{ t('inbox.actions.saveNote') }}
          </v-btn>
          <span v-if="noteSaved" class="text-caption text-success">
            {{ t('inbox.actions.noteSaved') }}
          </span>
        </div>

        <h3 class="message-dialog__heading mt-7">{{ t('inbox.detail.statusLabel') }}</h3>
        <div class="d-flex flex-wrap ga-2">
          <v-btn
            v-for="option in statusOptions"
            :key="option.value"
            :variant="message.status === option.value ? 'flat' : 'outlined'"
            :color="message.status === option.value ? 'primary' : undefined"
            size="small"
            :prepend-icon="option.icon"
            @click="changeStatus(option.value)"
          >
            {{ option.title }}
          </v-btn>
          <v-btn
            v-if="message.status !== 'new'"
            variant="text"
            size="small"
            prepend-icon="mdi-email-outline"
            @click="markUnread"
          >
            {{ t('inbox.actions.markUnread') }}
          </v-btn>
        </div>

        <v-alert
          v-if="confirmDelete"
          color="error"
          variant="tonal"
          rounded="lg"
          density="comfortable"
          icon="mdi-alert-outline"
          class="mt-6"
        >
          <div class="d-flex flex-column flex-sm-row align-sm-center ga-3">
            <span class="flex-grow-1">{{ t('inbox.actions.deleteConfirm') }}</span>
            <v-btn color="error" variant="flat" size="small" @click="onDelete">
              {{ t('inbox.actions.deleteYes') }}
            </v-btn>
            <v-btn variant="text" size="small" @click="confirmDelete = false">
              {{ t('inbox.actions.cancel') }}
            </v-btn>
          </div>
        </v-alert>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-6 pa-md-7 flex-wrap ga-3">
        <v-btn variant="text" color="error" prepend-icon="mdi-trash-can-outline" @click="onDelete">
          {{ t('inbox.actions.delete') }}
        </v-btn>

        <v-spacer />

        <v-btn
          variant="tonal"
          color="primary"
          prepend-icon="mdi-content-copy"
          :disabled="!message.email"
          @click="copyEmail"
        >
          {{ copied ? t('actions.copied') : t('inbox.actions.copyEmail') }}
        </v-btn>

        <v-btn
          color="primary"
          variant="flat"
          size="large"
          rounded="lg"
          prepend-icon="mdi-reply-outline"
          :href="mailtoHref || undefined"
          :disabled="!mailtoHref"
          @click="onReply"
        >
          {{ t('inbox.actions.reply') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.message-dialog__hero {
  position: relative;
  isolation: isolate;
  border-bottom: 1px solid color-mix(in srgb, rgb(var(--v-theme-on-surface)) 8%, transparent);
}

.message-dialog__hero::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: var(--message-accent);
  opacity: 0.14;
}

.message-dialog__meta {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
}

.message-dialog__meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, rgb(var(--v-theme-on-surface)) 10%, transparent);
  background: color-mix(in srgb, rgb(var(--v-theme-surface)) 70%, transparent);
}

.message-dialog__meta-label {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.6;
}

.message-dialog__meta-value {
  font-size: 0.9375rem;
  font-weight: 600;
  word-break: break-word;
}

.message-dialog__heading {
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-on-surface-variant));
  margin-bottom: 10px;
}

.message-dialog__message {
  margin: 0;
  padding: 18px 20px;
  border-radius: 16px;
  border-left: 4px solid rgb(var(--v-theme-primary));
  background: color-mix(in srgb, rgb(var(--v-theme-primary)) 7%, transparent);
  font-size: 1rem;
  line-height: 1.75;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
