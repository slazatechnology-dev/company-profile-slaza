<template>
  <section class="section-wrapper about-section" id="about">
    <div class="container">
      <div class="about-intro">
        <h2 class="section-title">{{ t.about.title }}</h2>

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

      <h3 class="pillars-heading">{{ t.about.pillarsTitle }}</h3>
      <dl class="pillars-grid">
        <div v-for="pillar in t.about.pillars" :key="pillar.title" class="pillar">
          <dt>{{ pillar.title }}</dt>
          <dd>{{ pillar.desc }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<script setup>
import { useI18n } from '../composables/useI18n';

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
  margin-bottom: 80px;
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

/* Pillars */
.pillars-heading {
  font-size: 1.25rem;
  font-weight: 800;
  margin-bottom: 24px;
}

.pillars-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 32px;
}

.pillar {
  padding-top: 20px;
  border-top: 1px solid var(--text-primary);
}

.pillar dt {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.pillar dd {
  font-size: 0.92rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

@media (max-width: 960px) {
  .about-intro {
    grid-template-columns: minmax(0, 1fr);
    margin-bottom: 56px;
  }
  .pillars-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .about-lead {
    font-size: 1.15rem;
  }
  .pillars-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
