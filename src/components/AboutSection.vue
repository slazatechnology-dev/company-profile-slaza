<template>
  <section class="section-wrapper about-section" id="about">
    <div class="container">
      <div class="about-intro">
        <h2 class="section-title"><AccentText :text="t.about.title" :accent="t.about.titleAccent" /></h2>

        <div class="about-body">
          <p class="about-lead">{{ t.about.description }}</p>

          <h3 class="about-subhead">{{ t.about.visionTitle }}</h3>
          <p>{{ t.about.visionText }}</p>

          <h3 class="about-subhead">{{ t.about.missionTitle }}</h3>
          <ul class="mission-list">
            <li v-for="mission in t.about.missions" :key="mission">{{ mission }}</li>
          </ul>
        </div>
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
.about-section {
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--card-border);
  border-bottom: 1px solid var(--card-border);
}

.about-intro {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr);
  gap: 32px 72px;
}

.about-lead {
  font-size: 1.3rem;
  line-height: 1.55;
  color: var(--text-primary);
}

.about-subhead {
  font-size: 1rem;
  font-weight: 700;
  margin: 36px 0 8px;
}

.mission-list {
  list-style: none;
}

.mission-list li {
  padding: 12px 0;
  color: var(--text-secondary);
  border-top: 1px solid var(--card-border);
}

.mission-list li:first-child {
  border-top: none;
  padding-top: 0;
}

@media (max-width: 960px) {
  .about-intro {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 600px) {
  .about-lead {
    font-size: 1.15rem;
  }
}
</style>
