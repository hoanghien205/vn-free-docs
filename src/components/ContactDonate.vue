<script setup>
import { ref } from 'vue'
import SectionTitle from '@/components/SectionTitle.vue'
import ContactForm from '@/components/ContactForm.vue'
import CopyField from '@/components/CopyField.vue'
import { accentGradient } from '@/data/accents'
import { contactChannels, contactLabels, donate } from '@/data/contact'
import { useLocale } from '@/composables/useLocale'

const { t, lp } = useLocale()

const donateTab = ref('bank')
const snackbar = ref(false)

function onSubmitted() {
  snackbar.value = true
}
</script>

<template>
  <section id="lien-he" class="section-block">
    <v-container class="section-shell">
      <SectionTitle
        :eyebrow="t('contact.eyebrow')"
        :title="t('contact.title')"
        :subtitle="t('contact.subtitle')"
        icon="mdi-send-outline"
      />

      <v-row class="gy-8">
        <v-col cols="12" lg="7" class="d-flex flex-column">
          <v-card v-reveal class="surface-card mb-6" elevation="0" rounded="xl">
            <div class="pa-6 pa-md-7">
              <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-5">
                <h3 class="text-h6 font-weight-bold mb-0">{{ t('contact.infoTitle') }}</h3>
                <span class="text-caption text-medium-emphasis">{{ t('contact.infoHint') }}</span>
              </div>

              <div class="d-flex flex-wrap ga-3">
                <div v-for="channel in contactChannels" :key="channel.id" class="channel">
                  <v-btn
                    icon
                    size="large"
                    variant="tonal"
                    :href="channel.href"
                    target="_blank"
                    rel="noopener"
                    :aria-label="`${lp(contactLabels[channel.id])}: ${channel.value}`"
                    class="channel__btn"
                    :style="{ '--channel-gradient': accentGradient(channel.accent) }"
                  >
                    <v-icon :icon="channel.icon" size="22" />
                    <v-tooltip
                      activator="parent"
                      :text="`${lp(contactLabels[channel.id])} · ${channel.value}`"
                    />
                  </v-btn>
                  <span class="channel__label">{{ lp(contactLabels[channel.id]) }}</span>
                </div>
              </div>
            </div>
          </v-card>

          <v-card v-reveal="{ delay: 80 }" class="surface-card flex-grow-1" elevation="0" rounded="xl">
            <div class="pa-6 pa-md-7 d-flex flex-column h-100">
              <h3 class="text-h6 font-weight-bold mb-1">{{ t('contact.formTitle') }}</h3>
              <p class="text-body-2 text-medium-emphasis mb-6">{{ t('contact.formSubtitle') }}</p>
              <ContactForm @submitted="onSubmitted" />
            </div>
          </v-card>
        </v-col>

        <!-- Cột phải: ủng hộ -->
        <v-col cols="12" lg="5">
          <v-card v-reveal="{ delay: 120 }" class="donate-card glass-card h-100" elevation="0" rounded="xl">
            <div class="pa-6 pa-md-7 d-flex flex-column h-100">
              <v-chip color="accent" variant="tonal" size="small" prepend-icon="mdi-heart-outline" class="mb-4">
                {{ t('donate.eyebrow') }}
              </v-chip>
              <h3 class="text-h5 font-weight-bold mb-2">{{ t('donate.title') }}</h3>
              <p class="text-body-2 text-medium-emphasis mb-6">{{ t('donate.subtitle') }}</p>

              <v-tabs v-model="donateTab" color="primary" density="comfortable" class="mb-5">
                <v-tab value="bank" prepend-icon="mdi-bank-outline">{{ t('donate.tabs.bank') }}</v-tab>
              </v-tabs>

              <v-window v-model="donateTab" class="flex-grow-1">
                <v-window-item value="bank">
                  <div class="d-flex flex-column ga-4">
                    <CopyField :label="t('donate.fields.bankName')" :value="donate.bank.bankName" />
                    <CopyField :label="t('donate.fields.accountNumber')" :value="donate.bank.accountNumber" />
                    <CopyField :label="t('donate.fields.accountHolder')" :value="donate.bank.accountHolder" />
                    <CopyField :label="t('donate.fields.branch')" :value="donate.bank.branch" />

                    <v-divider class="my-1" />

                    <div class="text-center">
                      <div class="text-body-2 font-weight-medium mb-3">{{ t('donate.qrTitle') }}</div>
                      <v-sheet class="donate-card__qr" rounded="xl" elevation="0">
                        <img :src="donate.bank.qr" :alt="t('donate.qrTitle')" width="200" height="200" loading="lazy" />
                      </v-sheet>
                    </div>
                  </div>
                </v-window-item>

                <v-window-item value="crypto">
                  <div class="d-flex flex-column ga-5">
                    <div v-for="wallet in donate.crypto" :key="wallet.id">
                      <div class="d-flex align-center ga-2 mb-1">
                        <v-icon :icon="wallet.icon" size="18" color="primary" />
                        <span class="text-body-2 font-weight-medium">{{ wallet.network }}</span>
                      </div>
                      <CopyField :label="t('donate.addressLabel')" :value="wallet.address" />
                    </div>
                    <v-alert
                      color="warning"
                      variant="tonal"
                      rounded="lg"
                      density="comfortable"
                      icon="mdi-alert-outline"
                    >
                      {{ t('donate.cryptoWarning') }}
                    </v-alert>
                  </div>
                </v-window-item>
              </v-window>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-snackbar v-model="snackbar" color="success" rounded="lg" :timeout="5000" location="bottom">
      <div class="font-weight-medium">{{ t('contact.success') }}</div>
      <div class="text-caption">{{ t('contact.successHint') }}</div>
      <template #actions>
        <v-btn variant="text" @click="snackbar = false">OK</v-btn>
      </template>
    </v-snackbar>
  </section>
</template>

<style scoped>
.channel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 76px;
}

.channel__btn {
  background: color-mix(in srgb, rgb(var(--v-theme-primary)) 12%, transparent);
  color: rgb(var(--v-theme-primary));
  border: 1px solid color-mix(in srgb, rgb(var(--v-theme-primary)) 18%, transparent);
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.channel__btn:hover {
  transform: translateY(-4px);
  background: var(--channel-gradient);
  color: #fff;
}

.channel__label {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-on-surface-variant));
}

.donate-card__qr {
  display: inline-grid;
  place-items: center;
  padding: 14px;
  background: #fff !important;
  border: 1px solid rgba(10, 16, 36, 0.08);
}

.donate-card__qr img {
  display: block;
  border-radius: 12px;
}
</style>
