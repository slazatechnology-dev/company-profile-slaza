<template>
  <section class="section-wrapper portfolio-section" id="portfolio">
    <div class="container">
      <!-- Section Header -->
      <div class="section-header">
        <h2 class="section-title">{{ t.portfolio.title }}</h2>
        <p class="section-subtitle">
          {{ t.portfolio.subtitle }}
        </p>
      </div>

      <!-- Featured Live Product Subcomponent -->
      <FeaturedProjectCard />

      <!-- Upcoming IoT Lab Concepts / R&D Pipelines Subcomponent -->
      <UpcomingLabGrid />
    </div>
  </section>
</template>

<script setup>
import FeaturedProjectCard from './FeaturedProjectCard.vue';
import UpcomingLabGrid from './UpcomingLabGrid.vue';
import { useI18n } from '../composables/useI18n';

const { t } = useI18n();
</script>

<style scoped>
.portfolio-section {
  position: relative;
}
</style>
