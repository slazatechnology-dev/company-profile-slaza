<template>
  <section class="hero-section" id="hero">
    <div class="container hero-grid" :class="{ 'no-shot': !heroImage }">
      <div class="hero-copy">
        <h1 class="hero-title"><AccentText :text="t.hero.headline" :accent="t.hero.headlineAccent" /></h1>

        <p class="hero-subtext">
          {{ t.hero.subtext }}
        </p>

        <div class="hero-actions">
          <a href="#contact" class="btn btn-primary hero-btn">{{ t.hero.ctaPrimary }}</a>
          <a href="#portfolio" class="btn btn-secondary hero-btn">{{ t.hero.ctaSecondary }}</a>
        </div>
      </div>

      <!-- Visual hero = produk asli yang sudah berjalan, bukan ilustrasi. Bayangan hanya di sini:
           satu-satunya elemen yang "diangkat" di atas halaman sebagai titik fokus layar pertama. -->
      <figure v-if="heroImage" class="hero-shot">
        <a href="#portfolio" class="hero-shot-link">
          <img :src="heroImage" :alt="t.hero.shotAlt" width="1280" height="800" fetchpriority="high" />
        </a>
        <figcaption>{{ t.hero.shotCaption }}</figcaption>
      </figure>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from '../composables/useI18n';
import { siteImageSrc } from '../composables/useSiteImage';
import AccentText from './AccentText.vue';

const { t } = useI18n();
// Visual hero = gambar proyek pertama di Portofolio (urutan diatur di menu Konten website)
const heroImage = computed(() => siteImageSrc(t.value.portfolio.projects[0]?.imageId));
</script>

<style scoped>
.hero-section {
  padding-top: calc(var(--header-height) + 88px);
  padding-bottom: 104px;
  background-color: #ffffff;
}

/* Teks sedikit lebih lebar dari visual: judul tetap fokus utama, screenshot sebagai bukti */
.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  align-items: center;
  gap: 48px 64px;
}

.hero-title {
  font-size: clamp(2.4rem, 4.6vw, 4.1rem);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.04em;
  margin-bottom: 28px;
  text-wrap: balance;
}

.hero-subtext {
  font-size: 1.2rem;
  line-height: 1.6;
  max-width: 560px;
  margin-bottom: 36px;
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

.hero-shot-link {
  display: block;
  border-radius: var(--radius-md);
}

.hero-shot-link:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 4px;
}

.hero-shot img {
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid var(--card-border);
  border-radius: var(--radius-md);
  box-shadow: 0 24px 48px -24px rgba(15, 23, 42, 0.35);
  transition: transform var(--transition-fast);
}

.hero-shot-link:hover img {
  transform: translateY(-2px);
}

.hero-shot figcaption {
  margin-top: 12px;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.hero-grid.no-shot {
  grid-template-columns: minmax(0, 1fr);
}

@media (max-width: 960px) {
  .hero-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding-top: calc(var(--header-height) + 48px);
    padding-bottom: 64px;
  }
  .hero-subtext {
    font-size: 1.1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-shot img {
    transition: none;
  }
}
</style>
