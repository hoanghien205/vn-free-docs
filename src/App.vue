<script setup>
import { useLocale } from '@/composables/useLocale'
import AppBar from '@/components/AppBar.vue'
import HeroSection from '@/components/HeroSection.vue'
import FreeTools from '@/components/FreeTools.vue'
import Solutions from '@/components/Solutions.vue'
import Process from '@/components/Process.vue'
import ContactDonate from '@/components/ContactDonate.vue'
import AppFooter from '@/components/AppFooter.vue'

const { t } = useLocale()
</script>

<template>
  <v-app>
    <AppBar />

    <v-main>
      <a class="skip-link" href="#cong-cu">{{ t('a11y.skipLink') }}</a>
      <HeroSection />
      <FreeTools />
      <Solutions />
      <Process />
      <ContactDonate />
    </v-main>

    <AppFooter />
  </v-app>
</template>

<style scoped>
.skip-link {
  position: absolute;
  left: -9999px;
  top: 0;
  z-index: 3000;
  padding: 10px 16px;
  border-radius: 0 0 12px 0;
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  text-decoration: none;
}

.skip-link:focus {
  left: 0;
}
</style>
