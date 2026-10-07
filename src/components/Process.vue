<script setup>
import SectionTitle from '@/components/SectionTitle.vue'
import { processSteps } from '@/data/process'
import { useLocale } from '@/composables/useLocale'

const { t, lp } = useLocale()
</script>

<template>
  <section id="quy-trinh" class="section-block">
    <v-container class="section-shell">
      <SectionTitle
        :eyebrow="t('process.eyebrow')"
        :title="t('process.title')"
        :subtitle="t('process.subtitle')"
        icon="mdi-format-list-numbered"
      />

      <v-timeline
        side="end"
        align="start"
        truncate-line="both"
        class="process__timeline"
        density="comfortable"
      >
        <v-timeline-item
          v-for="(step, index) in processSteps"
          :key="step.id"
          dot-color="primary"
          :icon="step.icon"
          fill-dot
          size="large"
        >
          <v-card v-reveal="{ delay: index * 70 }" class="surface-card hover-lift" elevation="0" rounded="xl">
            <div class="pa-6 pa-md-7">
              <v-chip color="primary" variant="tonal" size="small" class="mb-4 font-weight-bold">
                {{ t('process.stepLabel', { number: index + 1 }) }}
              </v-chip>
              <h3 class="text-h6 font-weight-bold mb-2">{{ lp(step).title }}</h3>
              <p class="text-body-2 text-medium-emphasis mb-0 process__desc">{{ lp(step).description }}</p>
            </div>
          </v-card>
        </v-timeline-item>
      </v-timeline>
    </v-container>
  </section>
</template>

<style scoped>
.process__timeline {
  padding-inline-start: 0;
}

.process__desc {
  line-height: 1.7;
  max-width: 620px;
}

.process__timeline :deep(.v-timeline-item__body) {
  padding-bottom: 8px;
}
</style>
