<script setup>
import { computed } from 'vue'
import { site } from '@/data/site'
import { contactChannels, contactLabels } from '@/data/contact'
import { useLocale } from '@/composables/useLocale'

const { t, lp } = useLocale()

const year = new Date().getFullYear()
const copyright = computed(() => t('footer.copyright', { year }))

const footerLinks = [
  { id: 'cong-cu', key: 'nav.tools' },
  { id: 'giai-phap', key: 'nav.solutions' },
  { id: 'quy-trinh', key: 'nav.process' },
  { id: 'lien-he', key: 'nav.contact' },
]

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <footer class="app-footer">
    <v-container class="section-shell">
      <v-row class="gy-8">
        <v-col cols="12" md="5">
          <div class="d-flex align-center ga-3 mb-4">
            <span class="footer__mark">
              <v-icon icon="mdi-file-document-multiple-outline" size="18" />
            </span>
            <span class="text-h6 font-weight-bold">
              VN <span class="gradient-text">Free</span> Docs
            </span>
          </div>
          <p class="text-body-2 text-medium-emphasis footer__tagline">{{ t('footer.tagline') }}</p>
          <p class="text-caption text-medium-emphasis">{{ t('footer.disclaimer') }}</p>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <h4 class="footer__heading">{{ t('footer.exploreTitle') }}</h4>
          <ul class="footer__list">
            <li v-for="link in footerLinks" :key="link.id">
              <a :href="`#${link.id}`" class="footer__link">{{ t(link.key) }}</a>
            </li>
          </ul>
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <h4 class="footer__heading">{{ t('footer.connectTitle') }}</h4>
          <div class="d-flex flex-wrap ga-2 mb-5">
            <v-btn
              v-for="channel in contactChannels"
              :key="channel.id"
              icon
              variant="tonal"
              size="small"
              :href="channel.href"
              target="_blank"
              rel="noopener"
              :aria-label="`${lp(contactLabels[channel.id])} — ${site.brand.fullName}`"
            >
              <v-icon :icon="channel.icon" size="18" />
              <v-tooltip activator="parent" :text="lp(contactLabels[channel.id])" />
            </v-btn>
          </div>
          <v-btn variant="outlined" size="small" prepend-icon="mdi-arrow-up" @click="scrollToTop">
            {{ t('actions.backToTop') }}
          </v-btn>
        </v-col>
      </v-row>

      <v-divider class="my-8" />

      <div class="d-flex flex-column flex-sm-row align-sm-center justify-space-between ga-3">
        <span class="text-caption text-medium-emphasis">{{ copyright }}</span>
        <span class="text-caption text-medium-emphasis">{{ t('footer.madeWith') }}</span>
      </div>
    </v-container>
  </footer>
</template>

<style scoped>
.app-footer {
  padding-block: clamp(48px, 6vw, 72px) 32px;
  border-top: 1px solid color-mix(in srgb, rgb(var(--v-theme-on-surface)) 8%, transparent);
  background: color-mix(in srgb, rgb(var(--v-theme-surface)) 70%, transparent);
}

.footer__mark {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  color: #fff;
  background: var(--vnf-gradient);
}

.footer__tagline {
  max-width: 380px;
  line-height: 1.7;
}

.footer__heading {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgb(var(--v-theme-on-surface-variant));
  margin-bottom: 14px;
}

.footer__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}

.footer__link {
  color: rgb(var(--v-theme-on-surface));
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.25s ease;
}

.footer__link:hover {
  color: rgb(var(--v-theme-primary));
}
</style>
