<template>
  <section class="hero-section" id="hero">
    <div class="container">
      <h1 class="hero-title">{{ t.hero.headline }}</h1>

      <p class="hero-subtext">
        {{ t.hero.subtext }}
      </p>

      <div class="hero-actions">
        <a href="#contact" class="btn btn-primary hero-btn">{{ t.hero.ctaPrimary }}</a>
        <a href="#portfolio" class="btn btn-secondary hero-btn">{{ t.hero.ctaSecondary }}</a>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useI18n } from '../composables/useI18n';

const { t } = useI18n();
</script>

<style scoped>
.hero-section {
  padding-top: calc(var(--header-height) + 112px);
  padding-bottom: 120px;
  background-color: #ffffff;
}

.hero-title {
  font-size: clamp(2.5rem, 6.4vw, 5rem);
  font-weight: 800;
  line-height: 1.04;
  letter-spacing: -0.04em;
  max-width: 1000px;
  margin-bottom: 32px;
  text-wrap: balance;
}

.hero-subtext {
  font-size: 1.25rem;
  line-height: 1.6;
  max-width: 640px;
  margin-bottom: 40px;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.hero-btn {
  padding: 14px 28px;
  font-size: 0.98rem;
}

@media (max-width: 768px) {
  .hero-section {
    padding-top: calc(var(--header-height) + 56px);
    padding-bottom: 72px;
  }
  .hero-subtext {
    font-size: 1.1rem;
  }
}
</style>
