<script setup>
import { reactive, ref } from 'vue'
import { useLocale } from '@/composables/useLocale'

const emit = defineEmits(['submitted'])

const { t } = useLocale()

const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  name: '',
  email: '',
  phone: '',
  message: '',
})

const rules = {
  name: [
    (value) => !!value || t('contact.validation.nameRequired'),
    (value) => (value?.length ?? 0) >= 2 || t('contact.validation.nameMin'),
  ],
  email: [
    (value) => !!value || t('contact.validation.emailRequired'),
    (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value ?? '') || t('contact.validation.emailInvalid'),
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
  // Demo frontend-only: chưa gửi dữ liệu đi đâu cả.
  // TODO: nối tới API/Formspree/Telegram bot nếu muốn nhận tin thật.
  await new Promise((resolve) => setTimeout(resolve, 700))
  loading.value = false

  emit('submitted', { ...form })
  formRef.value?.reset()
}
</script>

<template>
  <v-form ref="formRef" class="contact-form d-flex flex-column h-100" @submit.prevent="submit">
    <v-row class="gy-1">
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
