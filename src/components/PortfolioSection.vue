<template>
  <section class="section-wrapper portfolio-section" id="portfolio">
    <div class="container">
      <!-- Section Header -->
      <div class="section-header">
        <h2 class="section-title"><AccentText :text="t.portfolio.title" :accent="t.portfolio.titleAccent" /></h2>
        <p class="section-subtitle">
          {{ t.portfolio.subtitle }}
        </p>
      </div>

      <!-- Featured Live Product Subcomponent -->
      <FeaturedProjectCard v-for="project in t.portfolio.projects" :key="project.key" :project="project" />
    </div>
  </section>
</template>

<script setup>
import FeaturedProjectCard from './FeaturedProjectCard.vue';
import { useI18n } from '../composables/useI18n';
import AccentText from './AccentText.vue';

const { t } = useI18n();
</script>

<style scoped>
.portfolio-section {
  position: relative;
}
</style>
