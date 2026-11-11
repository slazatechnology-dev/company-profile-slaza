<template>
  <article class="featured-project">
    <div class="project-content">
      <h3 class="project-name">{{ project.title }}</h3>
      <p class="project-subtitle">{{ project.subtitle }}</p>
      <p class="project-desc">{{ project.desc }}</p>

      <p v-if="project.techStack.length" class="mono project-stack">{{ project.techStack.join(' · ') }}</p>

      <!-- External-link icon stays: it tells the visitor this button leaves the site -->
      <a
        v-if="project.url"
        :href="project.url"
        target="_blank"
        rel="noopener noreferrer"
        class="btn btn-primary"
        :aria-label="`${project.urlText} (${t.common.newTab})`"
      >
        <span>{{ project.urlText }}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
      </a>
    </div>

    <figure v-if="image" class="project-shot">
      <img :src="image" :alt="project.shotAlt" width="1280" height="800" loading="lazy" />
      <figcaption>{{ project.shotCaption }}</figcaption>
    </figure>
  </article>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from '../composables/useI18n';
import { siteImageSrc } from '../composables/useSiteImage';

const props = defineProps({
  project: { type: Object, required: true }
});

const { t } = useI18n();
const image = computed(() => siteImageSrc(props.project.imageId));
</script>

<style scoped>
.featured-project + .featured-project {
  margin-top: 96px;
}

.featured-project {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
  align-items: center;
  gap: 40px 64px;
}

.project-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.project-name {
  font-size: clamp(2rem, 3.5vw, 2.5rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: 8px;
}

.project-subtitle {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.project-desc {
  font-size: 1rem;
  margin-bottom: 24px;
}

.project-stack {
  margin-bottom: 32px;
}

.project-shot img {
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid var(--card-border);
  border-radius: var(--radius-md);
}

.project-shot figcaption {
  margin-top: 10px;
  font-size: 0.82rem;
  color: var(--text-muted);
}

@media (max-width: 960px) {
  .featured-project {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
