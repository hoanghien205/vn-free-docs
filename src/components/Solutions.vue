<script setup>
import SectionTitle from '@/components/SectionTitle.vue'
import SolutionCard from '@/components/SolutionCard.vue'
import { solutions } from '@/data/solutions'
import { useLocale } from '@/composables/useLocale'

const { t } = useLocale()
</script>

<template>
  <section id="giai-phap" class="section-block solutions">
    <div class="solutions__bg" aria-hidden="true">
      <span class="blob blob--2" />
    </div>

    <v-container class="section-shell position-relative">
      <SectionTitle
        :eyebrow="t('solutions.eyebrow')"
        :title="t('solutions.title')"
        :subtitle="t('solutions.subtitle')"
        icon="mdi-lightning-bolt-outline"
      />

      <SolutionCard
        v-for="(solution, index) in solutions"
        :key="solution.id"
        :solution="solution"
        :index="index"
      />

      <v-alert
        v-reveal
        class="mt-14"
        color="secondary"
        variant="tonal"
        rounded="xl"
        icon="mdi-forum-outline"
      >
        <div class="d-flex flex-column flex-md-row align-md-center ga-4">
          <span class="flex-grow-1">{{ t('solutions.note') }}</span>
          <v-btn
            color="secondary"
            variant="flat"
            size="small"
            class="flex-grow-0 flex-shrink-0"
            href="#lien-he"
            append-icon="mdi-arrow-right"
          >
            {{ t('solutions.cta') }}
          </v-btn>
        </div>
      </v-alert>
    </v-container>
  </section>
</template>

<style scoped>
.solutions {
  position: relative;
  overflow: hidden;
}

.solutions__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.6;
}
</style>
