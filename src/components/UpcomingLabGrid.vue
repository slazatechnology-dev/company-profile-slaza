<template>
  <div class="upcoming-section">
    <div class="upcoming-header">
      <h3 class="upcoming-title">{{ t.portfolio.upcomingTitle }}</h3>
      <p class="upcoming-subtitle">{{ t.portfolio.upcomingDesc }}</p>
    </div>

    <div class="upcoming-grid">
      <article
        v-for="item in t.portfolio.upcomingItems"
        :key="item.title"
        class="upcoming-item"
      >
        <p class="upcoming-tag">{{ item.tag }}</p>
        <h4 class="upcoming-item-title">{{ item.title }}</h4>
        <p class="upcoming-item-desc">{{ item.desc }}</p>
        <p class="mono">{{ item.specs }}</p>
      </article>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from '../composables/useI18n';

const { t } = useI18n();
</script>

<style scoped>
.upcoming-header {
  margin-bottom: 28px;
}

.upcoming-title {
  font-size: 1.25rem;
  font-weight: 800;
  margin-bottom: 6px;
}

.upcoming-subtitle {
  font-size: 0.95rem;
}

.upcoming-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 40px 64px;
}

.upcoming-item {
  padding-top: 20px;
  border-top: 1px solid var(--text-primary);
}

.upcoming-tag {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.upcoming-item-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 10px;
}

.upcoming-item-desc {
  font-size: 0.95rem;
  margin-bottom: 16px;
}

@media (max-width: 960px) {
  .upcoming-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
