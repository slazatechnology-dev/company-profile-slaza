<template>
  <section class="section-wrapper services-section" id="services">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title"><AccentText :text="t.services.title" :accent="t.services.titleAccent" /></h2>
        <p class="section-subtitle">
          {{ t.services.subtitle }}
        </p>
      </div>

      <div class="service-list">
        <article
          v-for="(service, index) in t.services.items"
          :key="service.id"
          class="service-row"
          :class="{ 'lead': index === 0 }"
        >
          <div class="service-head">
            <p class="service-category">{{ service.category }}</p>
            <h3 class="service-title">{{ service.title }}</h3>
          </div>

          <div class="service-body">
            <p class="service-desc">{{ service.desc }}</p>
            <ul class="feature-list">
              <li v-for="feat in service.features" :key="feat">{{ feat }}</li>
            </ul>
            <!-- Only the first service has a production case on this page, so only it links to one -->
            <p v-if="index === 0 && t.portfolio.projects[0]" class="service-proof">
              {{ t.services.proofLabel }} <a href="#portfolio">{{ t.portfolio.projects[0].title }}</a>
            </p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useI18n } from '../composables/useI18n';
import AccentText from './AccentText.vue';

const { t } = useI18n();
</script>

<style scoped>
.services-section {
  background-color: #ffffff;
}

.service-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
  gap: 16px 72px;
  padding: 40px 0;
  border-top: 1px solid var(--text-primary);
}

.service-category {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.service-title {
  font-size: 1.35rem;
  font-weight: 800;
}

.service-row.lead .service-title {
  font-size: clamp(1.6rem, 2.6vw, 2rem);
}

.service-desc {
  font-size: 1.02rem;
  margin-bottom: 20px;
}

.feature-list {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 32px;
  font-size: 0.92rem;
  color: var(--text-secondary);
}

.feature-list li {
  padding: 10px 0;
  border-top: 1px solid var(--card-border);
}

.service-proof {
  margin-top: 20px;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* Padding widens the tap area to 44px; the negative margin keeps the line spacing */
.service-proof a {
  display: inline-block;
  padding: 12px 0;
  margin: -12px 0;
  color: var(--accent-primary);
}

.service-proof a:hover {
  color: var(--accent-primary-hover);
}

@media (max-width: 900px) {
  .service-row {
    grid-template-columns: minmax(0, 1fr);
    padding: 32px 0;
  }
}

@media (max-width: 480px) {
  .feature-list {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
