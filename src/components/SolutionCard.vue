<script setup>
import { computed } from 'vue'
import { accentGradient } from '@/data/accents'
import { useLocale } from '@/composables/useLocale'

const props = defineProps({
  solution: { type: Object, required: true },
  index: { type: Number, default: 0 },
})

const { t, lp } = useLocale()

const content = computed(() => lp(props.solution))
const gradient = computed(() => accentGradient(props.solution.accent))
const step = computed(() => String(props.index + 1).padStart(2, '0'))
</script>

<template>
  <v-row class="align-center gy-8 solution" :class="{ 'solution--reverse': index % 2 === 1 }">
    <v-col cols="12" lg="5">
      <div v-reveal class="solution__panel-wrap">
        <v-card class="glass-card solution__panel" elevation="0" rounded="xl">
          <span class="solution__panel-glow" :style="{ background: gradient }" />
          <span class="icon-tile solution__icon" :style="{ background: gradient }">
            <v-icon :icon="solution.icon" size="40" />
          </span>
          <span class="solution__number mono">{{ step }}</span>
        </v-card>
      </div>
    </v-col>

    <v-col cols="12" lg="7">
      <div v-reveal="{ delay: 90 }" class="solution__content">
        <h3 class="solution__title">{{ content.title }}</h3>
        <p class="solution__desc text-medium-emphasis">{{ content.description }}</p>

        <div class="text-caption text-uppercase font-weight-bold text-medium-emphasis mb-3">
          {{ t('solutions.benefitsLabel') }}
        </div>

        <ul class="solution__points">
          <li v-for="point in content.points" :key="point">
            <v-icon icon="mdi-check-circle-outline" size="20" color="primary" />
            <span>{{ point }}</span>
          </li>
        </ul>

        <v-btn
          class="mt-6"
          color="primary"
          size="large"
          :href="solution.ctaTarget"
          append-icon="mdi-arrow-right"
        >
          {{ t('solutions.cta') }}
        </v-btn>
      </div>
    </v-col>
  </v-row>
</template>

<style scoped>
.solution + .solution {
  margin-top: clamp(48px, 7vw, 96px);
}

.solution__panel-wrap {
  position: relative;
}

.solution__panel {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 260px;
  overflow: hidden;
}

.solution__panel-glow {
  position: absolute;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  filter: blur(70px);
  opacity: 0.55;
}

.solution__icon {
  position: relative;
  width: 92px;
  height: 92px;
  border-radius: 26px;
}

.solution__number {
  position: absolute;
  right: 26px;
  bottom: 18px;
  font-size: 3rem;
  font-weight: 700;
  color: color-mix(in srgb, rgb(var(--v-theme-on-surface)) 12%, transparent);
}

.solution__title {
  font-size: clamp(1.5rem, 2.6vw, 2rem);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin-bottom: 14px;
}

.solution__desc {
  font-size: 1.02rem;
  line-height: 1.7;
  margin-bottom: 24px;
  max-width: 620px;
}

.solution__points {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 12px;
}

.solution__points li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  line-height: 1.6;
}

@media (min-width: 1280px) {
  .solution--reverse {
    flex-direction: row-reverse;
  }
}
</style>
