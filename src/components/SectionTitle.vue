<script setup>
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  align: { type: String, default: 'center' },
  icon: { type: String, default: 'mdi-sparkles' },
})
</script>

<template>
  <div
    v-reveal
    class="section-title mb-12"
    :class="align === 'center' ? 'text-center mx-auto' : 'text-left'"
  >
    <v-chip
      v-if="eyebrow"
      class="section-title__eyebrow mb-5"
      color="primary"
      variant="tonal"
      size="small"
      :prepend-icon="icon"
    >
      {{ eyebrow }}
    </v-chip>

    <h2 class="section-title__heading text-balance">
      {{ title }}
    </h2>

    <p v-if="subtitle" class="section-title__subtitle text-medium-emphasis">
      {{ subtitle }}
    </p>
  </div>
</template>

<style scoped>
.section-title {
  max-width: 760px;
}

.section-title__eyebrow {
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.section-title__heading {
  font-size: clamp(2rem, 4.2vw, 3.1rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin-bottom: 18px;
}

.section-title__subtitle {
  font-size: clamp(1rem, 1.6vw, 1.125rem);
  line-height: 1.7;
}

.text-balance {
  text-wrap: balance;
}
</style>
