<script setup>
import { computed, reactive, ref } from 'vue'
import { useLocale } from '@/composables/useLocale'
import { useMessages } from '@/composables/useMessages'
import { MESSAGE_TYPES, messageTypeMeta, submitMessage } from '@/data/inbox'

const emit = defineEmits(['submitted'])

const { t } = useLocale()
const { addMessage, markMessageSynced } = useMessages()

const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  type: 'feedback',
  name: '',
  email: '',
  phone: '',
  message: '',
})

// Dùng computed để nhãn đổi theo khi người dùng chuyển VI/EN.
const typeOptions = computed(() =>
  MESSAGE_TYPES.map((value) => {
    const meta = messageTypeMeta(value)
    return { value, title: t(`inbox.types.${value}`), props: { prependIcon: meta.icon } }
  }),
)

const rules = {
  name: [
    (value) => !!value || t('contact.validation.nameRequired'),
    (value) => (value?.length ?? 0) >= 2 || t('contact.validation.nameMin'),
  ],
  email: [
    (value) => !!value || t('contact.validation.emailRequired'),
    (value) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value ?? '') || t('contact.validation.emailInvalid'),
  ],
  message: [
    (value) => !!value || t('contact.validation.messageRequired'),
    (value) => (value?.length ?? 0) >= 10 || t('contact.validation.messageMin'),
  ],
}

async function submit() {
  const result = await formRef.value?.validate()
  if (!result?.valid) return

  loading.value = true

  const payload = { ...form }
  // 1) Luôn lưu vào hộp thư nội bộ để không mất tin nhắn.
  const saved = addMessage({ ...payload, source: 'website' })
  // 2) Gửi ra kênh thật (nếu có cấu hình trong src/data/inbox.js).
  const delivery = await submitMessage(payload)
  // 3) Backend đã tạo bản ghi riêng → đồng bộ id để không bị trùng khi tải lại.
  if (delivery.ok && delivery.via === 'api' && delivery.id) {
    markMessageSynced(saved.id, delivery)
  }

  loading.value = false
  emit('submitted', { ...payload, id: saved.id, delivery })
  formRef.value?.reset()
}
</script>

<template>
  <v-form ref="formRef" class="contact-form d-flex flex-column h-100" @submit.prevent="submit">
    <v-row class="gy-1">
      <v-col cols="12">
        <v-select
          v-model="form.type"
          :items="typeOptions"
          :label="t('contact.fields.type')"
          prepend-inner-icon="mdi-tag-outline"
          class="contact-form__type"
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="form.name"
          :label="t('contact.fields.name')"
          :placeholder="t('contact.fields.namePlaceholder')"
          :rules="rules.name"
          prepend-inner-icon="mdi-account-outline"
          autocomplete="name"
          required
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="form.email"
          :label="t('contact.fields.email')"
          :placeholder="t('contact.fields.emailPlaceholder')"
          :rules="rules.email"
          prepend-inner-icon="mdi-email-outline"
          type="email"
          autocomplete="email"
          required
        />
      </v-col>

      <v-col cols="12">
        <v-text-field
          v-model="form.phone"
          :label="t('contact.fields.phone')"
          :placeholder="t('contact.fields.phonePlaceholder')"
          :hint="t('contact.fields.phoneOptional')"
          prepend-inner-icon="mdi-phone-outline"
          type="tel"
          autocomplete="tel"
          persistent-hint
        />
      </v-col>

      <v-col cols="12">
        <v-textarea
          v-model="form.message"
          :label="t('contact.fields.message')"
          :placeholder="t('contact.fields.messagePlaceholder')"
          :rules="rules.message"
          rows="4"
          auto-grow
          required
        />
      </v-col>
    </v-row>

    <div class="d-flex flex-column flex-sm-row align-sm-center ga-4 mt-auto pt-4">
      <v-btn
        type="submit"
        color="primary"
        size="large"
        class="flex-grow-0 flex-shrink-0"
        :loading="loading"
        prepend-icon="mdi-send-outline"
      >
        {{ loading ? t('actions.sending') : t('contact.submit') }}
      </v-btn>
      <span class="text-caption text-medium-emphasis">{{ t('contact.privacyNote') }}</span>
    </div>
  </v-form>
</template>

<style scoped>
.contact-form :deep(.v-field) {
  border-radius: 14px;
}
</style>
