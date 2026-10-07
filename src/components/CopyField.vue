<script setup>
import { useCopy } from '@/composables/useCopy'
import { useLocale } from '@/composables/useLocale'

defineProps({
  label: { type: String, default: '' },
  value: { type: String, required: true },
  icon: { type: String, default: 'mdi-content-copy' },
})

const { t } = useLocale()
const { copied, failed, copy } = useCopy()
</script>

<template>
  <div class="copy-field">
    <div v-if="label" class="text-caption text-medium-emphasis mb-1">{{ label }}</div>

    <div class="copy-field__box">
      <span class="copy-field__value mono">{{ value }}</span>
      <v-btn
        icon
        size="small"
        variant="tonal"
        :color="copied ? 'success' : 'primary'"
        :aria-label="`${t('actions.copy')}: ${label || value}`"
        @click="copy(value)"
      >
        <v-icon :icon="copied ? 'mdi-check' : icon" size="16" />
        <v-tooltip activator="parent" :text="copied ? t('actions.copied') : t('actions.copy')" />
      </v-btn>
    </div>

    <div v-if="failed" class="text-caption text-error mt-1">{{ t('actions.copyFailed') }}</div>
  </div>
</template>

<style scoped>
.copy-field__box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 8px 8px 14px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, rgb(var(--v-theme-on-surface)) 12%, transparent);
  background: color-mix(in srgb, rgb(var(--v-theme-primary)) 6%, transparent);
}

.copy-field__value {
  flex: 1 1 auto;
  font-size: 0.86rem;
  word-break: break-all;
  line-height: 1.5;
}
</style>
