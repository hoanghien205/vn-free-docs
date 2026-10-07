<script setup>
import { computed } from 'vue'
import { useLocale } from '@/composables/useLocale'

const { t, locale } = useLocale()

const metrics = computed(() => t('hero.visualMetrics') ?? [])
const stats = computed(() => t('hero.stats') ?? [])
</script>

<template>
  <section id="top" class="hero section-block">
    <div class="hero__bg" aria-hidden="true">
      <span class="blob blob--1" />
      <span class="blob blob--2" />
      <span class="blob blob--3" />
      <span class="hero__grid" />
    </div>

    <v-container class="section-shell position-relative">
      <v-row align="center" class="gy-10">
        <v-col cols="12" lg="6">
          <v-chip
            v-reveal
            class="hero__badge mb-6"
            color="primary"
            variant="outlined"
            size="small"
            prepend-icon="mdi-gift-outline"
          >
            {{ t('hero.badge') }}
          </v-chip>

          <h1
            v-reveal="{ delay: 60 }"
            class="hero__title"
            :class="{ 'hero__title--compact': locale === 'en' }"
          >
            <span class="hero__title-line">{{ t('hero.title1') }}</span>
            <span class="hero__title-line gradient-text">{{ t('hero.titleAccent') }}</span>
            <span class="hero__title-line">{{ t('hero.title2') }}</span>
          </h1>

          <p v-reveal="{ delay: 120 }" class="hero__lead">
            {{ t('hero.lead') }}
          </p>

          <p v-reveal="{ delay: 160 }" class="hero__description text-medium-emphasis">
            {{ t('hero.description') }}
          </p>

          <div v-reveal="{ delay: 200 }" class="d-flex flex-wrap ga-3 mt-8">
            <v-btn color="primary" size="large" href="#cong-cu" append-icon="mdi-arrow-down">
              {{ t('actions.explore') }}
            </v-btn>
            <v-btn size="large" variant="outlined" href="#lien-he" prepend-icon="mdi-handshake-outline">
              {{ t('actions.contact') }}
            </v-btn>
          </div>

          <div v-reveal="{ delay: 260 }" class="hero__stats mt-10">
            <div v-for="item in stats" :key="item.label" class="hero__stat">
              <div class="hero__stat-value gradient-text">{{ item.value }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.label }}</div>
            </div>
          </div>
        </v-col>

        <v-col cols="12" lg="6">
          <div v-reveal="{ delay: 180 }" class="hero__visual" aria-hidden="true">
            <div class="hero__visual-glow" />

            <v-card class="glass-card hero__panel" elevation="0" rounded="xl">
              <div class="hero__panel-head">
                <span class="dot dot--red" />
                <span class="dot dot--amber" />
                <span class="dot dot--green" />
                <span class="hero__panel-title mono">{{ t('hero.visualTitle') }}</span>
              </div>

              <div class="hero__panel-body">
                <div v-for="metric in metrics" :key="metric.label" class="hero__metric">
                  <v-icon :icon="metric.icon" size="18" class="hero__metric-icon" />
                  <div class="flex-grow-1">
                    <div class="d-flex justify-space-between align-center mb-1">
                      <span class="text-caption font-weight-medium">{{ metric.label }}</span>
                      <span class="text-caption text-medium-emphasis mono">{{ metric.value }}%</span>
                    </div>
                    <div class="hero__bar">
                      <span class="hero__bar-fill" :style="{ width: `${metric.value}%` }" />
                    </div>
                  </div>
                </div>

                <v-chip
                  color="success"
                  variant="tonal"
                  size="small"
                  class="flex-grow-0 flex-shrink-0"
                  prepend-icon="mdi-shield-check-outline"
                >
                  {{ t('hero.visualNote') }}
                </v-chip>
              </div>
            </v-card>

            <div class="hero__tile hero__tile--a"><v-icon icon="mdi-file-excel" /></div>
            <div class="hero__tile hero__tile--b"><v-icon icon="mdi-file-document-outline" /></div>
            <div class="hero__tile hero__tile--c"><v-icon icon="mdi-brain" /></div>
          </div>
        </v-col>
      </v-row>

      <div v-reveal="{ delay: 320 }" class="hero__scroll d-none d-md-flex">
        <v-icon icon="mdi-chevron-down" size="18" class="hero__scroll-icon" />
        <span class="text-caption text-medium-emphasis">{{ t('hero.scroll') }}</span>
      </div>
    </v-container>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  padding-top: clamp(48px, 8vw, 96px);
  overflow: hidden;
}

.hero__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.hero__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(color-mix(in srgb, rgb(var(--v-theme-on-surface)) 7%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, rgb(var(--v-theme-on-surface)) 7%, transparent) 1px, transparent 1px);
  background-size: 68px 68px;
  mask-image: radial-gradient(circle at 50% 20%, #000 0%, transparent 72%);
  opacity: 0.7;
}

.hero__badge {
  font-weight: 600;
  letter-spacing: 0.02em;
}

.hero__title {
  display: flex;
  flex-direction: column;
  font-size: clamp(2.3rem, 4.1vw, 3.4rem);
  font-weight: 800;
  line-height: 1.03;
  letter-spacing: -0.04em;
  margin-bottom: 24px;
}

.hero__title-line {
  text-wrap: balance;
}

/* Tiếng Anh có câu dài hơn nên dùng cỡ chữ nhỏ hơn một chút để tiêu đề vẫn gọn trong 3 dòng. */
.hero__title--compact {
  font-size: clamp(2.1rem, 3.7vw, 3rem);
}

.hero__lead {
  font-size: clamp(1.05rem, 1.9vw, 1.3rem);
  font-weight: 500;
  line-height: 1.6;
  margin-bottom: 14px;
}

.hero__description {
  max-width: 540px;
  font-size: 1rem;
  line-height: 1.75;
}

.hero__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
}

.hero__stat-value {
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.hero__visual {
  position: relative;
  padding: 28px 12px;
}

.hero__visual-glow {
  position: absolute;
  inset: 10%;
  background: var(--vnf-gradient-soft);
  filter: blur(60px);
  border-radius: 50%;
}

.hero__panel {
  position: relative;
  max-width: 460px;
  margin-inline: auto;
  padding: 22px 24px 26px;
}

.hero__panel-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 16px;
  border-bottom: 1px solid color-mix(in srgb, rgb(var(--v-theme-on-surface)) 8%, transparent);
}

.hero__panel-title {
  margin-left: 8px;
  font-size: 0.8rem;
  color: rgb(var(--v-theme-on-surface-variant));
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.dot--red {
  background: #fb7185;
}

.dot--amber {
  background: #fbbf24;
}

.dot--green {
  background: #34d399;
}

.hero__panel-body {
  padding-top: 22px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: flex-start;
}

.hero__metric {
  display: flex;
  gap: 12px;
  width: 100%;
  align-items: flex-start;
}

.hero__metric-icon {
  color: rgb(var(--v-theme-primary));
  margin-top: 2px;
}

.hero__bar {
  height: 7px;
  border-radius: 999px;
  background: color-mix(in srgb, rgb(var(--v-theme-primary)) 14%, transparent);
  overflow: hidden;
}

.hero__bar-fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--vnf-gradient);
  animation: bar-grow 1.4s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes bar-grow {
  from {
    transform: scaleX(0.1);
    transform-origin: left;
  }
  to {
    transform: scaleX(1);
    transform-origin: left;
  }
}

.hero__tile {
  position: absolute;
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 18px;
  color: #fff;
  background: var(--vnf-gradient);
  box-shadow: var(--vnf-shadow-soft);
  animation: tile-float 7s ease-in-out infinite;
}

.hero__tile--a {
  top: 6%;
  left: -2%;
}

.hero__tile--b {
  bottom: 12%;
  left: 2%;
  animation-delay: -2.4s;
}

.hero__tile--c {
  top: 16%;
  right: -1%;
  animation-delay: -4.8s;
}

@keyframes tile-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-14px);
  }
}

.hero__scroll {
  align-items: center;
  gap: 8px;
  justify-content: center;
  margin-top: 56px;
}

.hero__scroll-icon {
  animation: tile-float 2.6s ease-in-out infinite;
}

@media (max-width: 599px) {
  .hero__stats {
    gap: 22px;
  }
}
</style>
